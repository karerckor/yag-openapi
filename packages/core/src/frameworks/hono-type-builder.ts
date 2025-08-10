import type { WriterFunction } from 'ts-morph';
import type { 
  FrameworkTypeBuilder,
  TypeScriptWriter,
  APIModel,
  RouteModel,
  MethodModel
} from '../core/interfaces';

export class HonoTypeBuilder implements FrameworkTypeBuilder {
  constructor(private writer: TypeScriptWriter) {}

  buildInputType(method: MethodModel): WriterFunction {
    const inputProperties: Record<string, WriterFunction | string> = {};

    // Path parameters
    const pathParams = method.parameters.filter(p => p.location === 'path');
    if (pathParams.length > 0) {
      inputProperties.param = this.writer.createObjectType(
        Object.fromEntries(pathParams.map(p => [p.name, p.type]))
      );
    }

    // Query parameters
    const queryParams = method.parameters.filter(p => p.location === 'query');
    if (queryParams.length > 0) {
      inputProperties.query = this.writer.createObjectType(
        Object.fromEntries(queryParams.map(p => [`${p.name}?`, p.type]))
      );
    }

    // Request body
    if (method.requestBody && method.requestBody.contentType === 'application/json') {
      const bodyType = this.writer.schemaToTypeString(method.requestBody.schema);
      inputProperties.json = bodyType;
    }

    // Header parameters
    const headerParams = method.parameters.filter(p => p.location === 'header');
    if (headerParams.length > 0) {
      inputProperties.header = this.writer.createObjectType(
        Object.fromEntries(headerParams.map(p => [`${p.name}?`, p.type]))
      );
    }

    return Object.keys(inputProperties).length > 0
      ? this.writer.createObjectType(inputProperties)
      : (writer) => writer.write('{}');
  }

  buildOutputType(method: MethodModel): WriterFunction {
    const successResponse = method.responses.find(r => /^2\d\d$/.test(r.statusCode));
    
    if (!successResponse) {
      return (writer) => writer.write('{}');
    }

    if (successResponse.schema) {
      const typeString = this.writer.schemaToTypeString(successResponse.schema);
      return (writer) => writer.write(typeString);
    }

    return (writer) => writer.write('{}');
  }

  buildMethodType(method: MethodModel): WriterFunction {
    const inputType = this.buildInputType(method);
    const outputType = this.buildOutputType(method);

    return this.writer.createObjectType({
      input: inputType,
      output: outputType,
      outputFormat: '"json"',
      status: 'ContentfulStatusCode'
    });
  }

  buildRouteType(route: RouteModel): WriterFunction {
    const methodStructure: Record<string, WriterFunction> = {};

    for (const method of route.methods) {
      const methodKey = `$${method.method.toLowerCase()}`;
      methodStructure[methodKey] = this.buildMethodType(method);
    }

    return this.writer.createObjectType(methodStructure);
  }

  buildAppType(api: APIModel): WriterFunction {
    const routeStructure: Record<string, WriterFunction> = {};

    for (const route of api.routes) {
      // Convert OpenAPI path format to Hono path format
      const honoPath = route.path.replace(/\{([^}]+)\}/g, ':$1');
      routeStructure[`"${honoPath}"`] = this.buildRouteType(route);
    }

    const routesType = this.writer.createObjectType(routeStructure);
    const intersectionType = this.writer.createIntersectionType([routesType, '{ }']);

    return this.writer.createGenericType('Hono', [
      'BlankEnv',
      intersectionType,
      '"/"'
    ]);
  }
}
