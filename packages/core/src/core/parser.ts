import * as yaml from 'js-yaml';
import { OpenAPIV3 } from 'openapi-types';
import SwaggerParser from '@apidevtools/swagger-parser';
import type { 
  OpenAPIParser as IOpenAPIParser,
  APIModel,
  RouteModel,
  MethodModel,
  ParameterModel,
  RequestBodyModel,
  ResponseModel
} from './interfaces';

export class OpenAPIParser implements IOpenAPIParser {
  async parse(schemaContent: string): Promise<APIModel> {
    try {
      const parsedContent = this.parseContent(schemaContent);
      const validatedApi = await SwaggerParser.validate(parsedContent) as OpenAPIV3.Document;
      
      return this.transformToAPIModel(validatedApi);
    } catch (error) {
      throw new Error(`Failed to parse OpenAPI schema: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private parseContent(content: string): any {
    try {
      return yaml.load(content);
    } catch (yamlError) {
      try {
        return JSON.parse(content);
      } catch (jsonError) {
        throw new Error(`Failed to parse schema as YAML or JSON: ${yamlError instanceof Error ? yamlError.message : String(yamlError)}`);
      }
    }
  }

  private transformToAPIModel(api: OpenAPIV3.Document): APIModel {
    const routes = this.extractRoutes(api);
    
    return {
      info: {
        title: api.info.title,
        version: api.info.version,
        description: api.info.description
      },
      routes,
      schemas: api.components?.schemas as Record<string, any>
    };
  }

  private extractRoutes(api: OpenAPIV3.Document): RouteModel[] {
    const routes: RouteModel[] = [];

    if (!api.paths) return routes;

    for (const [pathKey, pathItem] of Object.entries(api.paths)) {
      if (!pathItem || typeof pathItem !== 'object') continue;

      const pathObj = pathItem as OpenAPIV3.PathItemObject;
      const methods = this.extractMethods(pathKey, pathObj);

      if (methods.length > 0) {
        routes.push({
          path: pathKey,
          methods
        });
      }
    }

    return routes;
  }

  private extractMethods(path: string, pathItem: OpenAPIV3.PathItemObject): MethodModel[] {
    const methods: MethodModel[] = [];
    const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'] as const;

    for (const method of httpMethods) {
      const operation = pathItem[method] as OpenAPIV3.OperationObject;
      if (!operation) continue;

      const parameters = this.extractParameters(pathItem, operation);
      const requestBody = this.extractRequestBody(operation);
      const responses = this.extractResponses(operation);

      methods.push({
        method: method.toUpperCase(),
        parameters,
        requestBody,
        responses,
        operationId: operation.operationId,
        summary: operation.summary,
        description: operation.description
      });
    }

    return methods;
  }

  private extractParameters(
    pathItem: OpenAPIV3.PathItemObject,
    operation: OpenAPIV3.OperationObject
  ): ParameterModel[] {
    const allParameters = [
      ...(pathItem.parameters || []),
      ...(operation.parameters || [])
    ];

    const parameters: ParameterModel[] = [];

    for (const param of allParameters) {
      if ('$ref' in param) continue;

      const paramObj = param as OpenAPIV3.ParameterObject;
      if (!['query', 'path', 'header', 'cookie'].includes(paramObj.in)) continue;

      parameters.push({
        name: paramObj.name,
        type: this.schemaToTypeString(paramObj.schema),
        location: paramObj.in as 'path' | 'query' | 'header' | 'cookie',
        required: paramObj.required || false,
        description: paramObj.description
      });
    }

    return parameters;
  }

  private extractRequestBody(operation: OpenAPIV3.OperationObject): RequestBodyModel | undefined {
    if (!operation.requestBody || '$ref' in operation.requestBody) {
      return undefined;
    }

    const requestBody = operation.requestBody;
    const contentTypes = Object.keys(requestBody.content || {});
    
    if (contentTypes.length === 0) return undefined;

    const contentType = contentTypes[0];
    if (!contentType) return undefined;
    
    const mediaType = requestBody.content[contentType];

    if (!mediaType?.schema) return undefined;

    return {
      contentType,
      schema: mediaType.schema,
      required: requestBody.required || false
    };
  }

  private extractResponses(operation: OpenAPIV3.OperationObject): ResponseModel[] {
    const responses: ResponseModel[] = [];

    if (!operation.responses) return responses;

    for (const [statusCode, response] of Object.entries(operation.responses)) {
      if ('$ref' in response) continue;

      const responseObj = response as OpenAPIV3.ResponseObject;
      const responseModel: ResponseModel = {
        statusCode,
        description: responseObj.description,
        headers: responseObj.headers as Record<string, any>
      };

      if (responseObj.content) {
        const contentTypes = Object.keys(responseObj.content);
        if (contentTypes.length > 0) {
          const contentType = contentTypes[0];
          if (contentType) {
            const mediaType = responseObj.content[contentType];

            responseModel.contentType = contentType;
            responseModel.schema = mediaType?.schema;
          }
        }
      }

      responses.push(responseModel);
    }

    return responses;
  }

  private schemaToTypeString(schema: any): string {
    if (!schema) return 'unknown';

    if (schema.$ref) {
      return schema.$ref.split('/').pop() || 'unknown';
    }

    if (schema.type === 'string') {
      if (schema.enum) {
        return schema.enum.map((v: string) => `"${v}"`).join(' | ');
      }
      return 'string';
    }

    if (schema.type === 'number' || schema.type === 'integer') {
      return 'number';
    }

    if (schema.type === 'boolean') {
      return 'boolean';
    }

    if (schema.type === 'array') {
      const itemType = this.schemaToTypeString(schema.items);
      return `Array<${itemType}>`;
    }

    if (schema.type === 'object' || schema.properties) {
      const properties = schema.properties || {};
      const required = schema.required || [];
      
      const propStrings = Object.entries(properties).map(([key, prop]) => {
        const optional = !required.includes(key) ? '?' : '';
        const propType = this.schemaToTypeString(prop);
        return `${key}${optional}: ${propType}`;
      });

      return `{ ${propStrings.join('; ')} }`;
    }

    return 'unknown';
  }
}
