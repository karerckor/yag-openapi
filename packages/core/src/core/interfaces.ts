import type { WriterFunction } from 'ts-morph';

// Domain Models
export interface ParameterModel {
  name: string;
  type: string;
  location: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  description?: string;
}

export interface RequestBodyModel {
  contentType: string;
  schema: any;
  required: boolean;
}

export interface ResponseModel {
  statusCode: string;
  description: string;
  contentType?: string;
  schema?: any;
  headers?: Record<string, any>;
}

export interface MethodModel {
  method: string;
  parameters: ParameterModel[];
  requestBody?: RequestBodyModel;
  responses: ResponseModel[];
  operationId?: string;
  summary?: string;
  description?: string;
}

export interface RouteModel {
  path: string;
  methods: MethodModel[];
}

export interface APIModel {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  routes: RouteModel[];
  schemas?: Record<string, any>;
}

// Core Abstractions
export interface OpenAPIParser {
  parse(schemaContent: string): Promise<APIModel>;
}

export interface TypeScriptWriter {
  createObjectType(properties: Record<string, WriterFunction | string>): WriterFunction;
  createGenericType(typeName: string, typeParameters: (string | WriterFunction)[]): WriterFunction;
  createUnionType(types: (string | WriterFunction)[]): WriterFunction;
  createIntersectionType(types: (string | WriterFunction)[]): WriterFunction;
  schemaToTypeString(schema: any): string;
}

export interface FrameworkTypeBuilder {
  buildInputType(method: MethodModel): WriterFunction;
  buildOutputType(method: MethodModel): WriterFunction;
  buildMethodType(method: MethodModel): WriterFunction;
  buildRouteType(route: RouteModel): WriterFunction;
  buildAppType(api: APIModel): WriterFunction;
}

export interface CodeGenerator {
  generate(api: APIModel): string;
}

// Use Cases
export interface GenerateTypesUseCase {
  execute(sourceName: string, schemaContent: string): Promise<string>;
}

// Factories
export interface FrameworkTypeBuilderFactory {
  create(writer: TypeScriptWriter): FrameworkTypeBuilder;
}

export interface CodeGeneratorFactory {
  create(typeBuilder: FrameworkTypeBuilder): CodeGenerator;
}


export abstract class AbstractCodeGeneratorFactory implements CodeGeneratorFactory {
  constructor(protected sourceName: string) {}
  abstract create(typeBuilder: FrameworkTypeBuilder): CodeGenerator;
}