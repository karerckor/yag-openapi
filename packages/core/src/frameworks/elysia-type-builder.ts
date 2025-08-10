import type { WriterFunction } from 'ts-morph';
import type { 
  FrameworkTypeBuilder,
  TypeScriptWriter,
  APIModel,
  RouteModel,
  MethodModel
} from '../core/interfaces';

export class ElysiaTypeBuilder implements FrameworkTypeBuilder {
  constructor(private writer: TypeScriptWriter) {}

  buildInputType(method: MethodModel): WriterFunction {
    return (writer) => writer.write('never');
  }

  buildOutputType(method: MethodModel): WriterFunction {
    return (writer) => writer.write('unknown');
  }

  buildMethodType(method: MethodModel): WriterFunction {
    const methodProperties: Record<string, WriterFunction | string> = {};

    // Body
    if (method.requestBody && method.requestBody.contentType === 'application/json') {
      const bodyType = this.writer.schemaToTypeString(method.requestBody.schema);
      methodProperties.body = bodyType;
    } else {
      methodProperties.body = 'unknown';
    }

    // Params
    const pathParams = method.parameters.filter(p => p.location === 'path');
    if (pathParams.length > 0) {
      methodProperties.params = this.writer.createObjectType(
        Object.fromEntries(pathParams.map(p => [p.name, p.type]))
      );
    } else {
      methodProperties.params = '{}';
    }

    // Query
    const queryParams = method.parameters.filter(p => p.location === 'query');
    if (queryParams.length > 0) {
      methodProperties.query = this.writer.createObjectType(
        Object.fromEntries(queryParams.map(p => [`${p.name}?`, p.type]))
      );
    } else {
      methodProperties.query = 'unknown';
    }

    // Headers
    const headerParams = method.parameters.filter(p => p.location === 'header');
    if (headerParams.length > 0) {
      methodProperties.headers = this.writer.createObjectType(
        Object.fromEntries(headerParams.map(p => [`${p.name}?`, p.type]))
      );
    } else {
      methodProperties.headers = 'unknown';
    }

    // Response - group by status code
    const responsesByStatus: Record<string, any> = {};
    for (const response of method.responses) {
      if (response.schema) {
        const responseType = this.writer.schemaToTypeString(response.schema);
        responsesByStatus[response.statusCode] = responseType;
      } else {
        responsesByStatus[response.statusCode] = 'unknown';
      }
    }

    methodProperties.response = this.writer.createObjectType(responsesByStatus);

    return this.writer.createObjectType(methodProperties);
  }

  buildRouteType(route: RouteModel): WriterFunction {
    const methodStructure: Record<string, WriterFunction> = {};

    for (const method of route.methods) {
      const methodKey = method.method.toLowerCase();
      methodStructure[methodKey] = this.buildMethodType(method);
    }

    return this.writer.createObjectType(methodStructure);
  }

  private convertPathToElysiaFormat(path: string): string {
    // Convert OpenAPI path format to Elysia format
    // /todos/{id} -> todos/:id (remove leading slash, convert {param} to :param)
    return path
      .replace(/^\//, '')
      .replace(/\{([^}]+)\}/g, ':$1');
  }

  private buildNestedRouteStructure(routes: RouteModel[]): Record<string, any> {
    const structure: Record<string, any> = {};

    for (const route of routes) {
      const elysiaPath = this.convertPathToElysiaFormat(route.path);
      const pathParts = elysiaPath.split('/').filter(part => part.length > 0);
      
      let current = structure;
      
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (!part) continue;
        
        if (i === pathParts.length - 1) {
          if (!current[part]) {
            current[part] = {};
          }
          
          for (const method of route.methods) {
            const methodKey = method.method.toLowerCase();
            if (current[part] && typeof current[part] === 'object') {
              (current[part] as Record<string, any>)[methodKey] = this.buildMethodType(method);
            }
          }
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          const nextLevel = current[part];
          if (nextLevel && typeof nextLevel === 'object') {
            current = nextLevel as Record<string, any>;
          }
        }
      }
    }

    return structure;
  }

  buildAppType(api: APIModel): WriterFunction {
    const nestedStructure = this.buildNestedRouteStructure(api.routes);

    return this.writer.createGenericType('Elysia', [
      '""',
      'SingletonBase', 
      'DefinitionBase',
      'MetadataBase',
      (writer) => this.writeNestedStructure(writer, nestedStructure)
    ]);
  }

  private writeNestedStructure(writer: any, obj: any): void {
    if (typeof obj === 'string') {
      writer.write(obj);
      return;
    }

    if (typeof obj === 'function') {
      obj(writer);
      return;
    }

    writer.write('{');
    writer.newLine();

    const entries = Object.entries(obj);
    entries.forEach(([key, value], index) => {
      writer.indent(() => {
        writer.write(`"${key}": `);
        this.writeNestedStructure(writer, value);
        if (index < entries.length - 1) {
          writer.write(';');
        }
        writer.newLine();
      });
    });

    writer.write('}');
  }
}
