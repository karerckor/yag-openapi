/**
 * Integration tests for the complete generation pipeline.
 * Tests the interaction between parser, type builders, and code generators.
 */

import { describe, it, expect } from 'vitest';
import { GenerateTypesUseCase } from '../../src/core/use-cases';
import { OpenAPIParser } from '../../src/core/parser';
import { 
  HonoTypeBuilderFactory, 
  HonoCodeGeneratorFactory,
  ElysiaTypeBuilderFactory,
  ElysiaCodeGeneratorFactory 
} from '../../src/core/factories';
import { simpleOpenAPISchema, complexOpenAPISchema } from '../fixtures/schemas';

const DEFAULT_SOURCE = 'AppType';

describe('Generation Pipeline Integration', () => {
  describe('Hono Generator', () => {
    const parser = new OpenAPIParser();
    const typeBuilderFactory = new HonoTypeBuilderFactory();
    const codeGeneratorFactory = new HonoCodeGeneratorFactory(DEFAULT_SOURCE);
    const useCase = new GenerateTypesUseCase(parser, typeBuilderFactory, codeGeneratorFactory);

    it('should generate Hono types for simple schema', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await useCase.execute(schemaContent);

      expect(result).toContain('export type AppType');
      expect(result).toContain('import { type Hono } from "hono"');
      expect(result).toContain('import { type BlankEnv } from "hono/types"');
      expect(result).toContain('import { type ContentfulStatusCode } from "hono/utils/http-status"');
      
      // Check Hono-specific structure
      expect(result).toContain('$get:');
      expect(result).toContain('$post:');
      expect(result).toContain('input:');
      expect(result).toContain('output:');
      expect(result).toContain('outputFormat: "json"');
      expect(result).toContain('status: ContentfulStatusCode');
    });

    it('should generate correct path formats for Hono', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await useCase.execute(schemaContent);

      // Hono uses :param format
      expect(result).toContain('"/users"');
      expect(result).toContain('"/users/:id"');
    });

    it('should handle parameters correctly', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await useCase.execute(schemaContent);

      expect(result).toContain('param: {');
      expect(result).toContain('id: string');
    });

    it('should handle request body correctly', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await useCase.execute(schemaContent);

      expect(result).toContain('json: { name: string; email: string; }');
    });

    it('should handle complex schemas', async () => {
      const schemaContent = JSON.stringify(complexOpenAPISchema);
      const result = await useCase.execute(schemaContent);

      expect(result).toContain('export type AppType');
      expect(result).toContain('"/posts"');
      expect(result).toContain('"/posts/:postId/comments"');
      expect(result).toContain('query: {');
    });
  });

  describe('Elysia Generator', () => {
    const parser = new OpenAPIParser();
    const typeBuilderFactory = new ElysiaTypeBuilderFactory();
    const codeGeneratorFactory = new ElysiaCodeGeneratorFactory(DEFAULT_SOURCE);
    const useCase = new GenerateTypesUseCase(parser, typeBuilderFactory, codeGeneratorFactory);

    it('should generate Elysia types for simple schema', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await useCase.execute(schemaContent);

      expect(result).toContain('export type AppType');
      expect(result).toContain('import { type DefinitionBase, type Elysia, type MetadataBase, type SingletonBase } from "elysia"');
      
      // Check Elysia-specific structure
      expect(result).toContain('"get": {');
      expect(result).toContain('"post": {');
      expect(result).toContain('body:');
      expect(result).toContain('params:');
      expect(result).toContain('query:');
      expect(result).toContain('headers:');
      expect(result).toContain('response: {');
    });

    it('should generate correct path formats for Elysia', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await useCase.execute(schemaContent);

      // Elysia uses nested structure with :param format
      expect(result).toContain('"users": {');
      expect(result).toContain('":id": {');
    });

    it('should handle parameters correctly', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await useCase.execute(schemaContent);

      expect(result).toContain('params: {');
      expect(result).toContain('id: string');
    });

    it('should handle request body correctly', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await useCase.execute(schemaContent);

      expect(result).toContain('body: { name: string; email: string; }');
    });

    it('should handle response status codes correctly', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await useCase.execute(schemaContent);

      expect(result).toContain('response: {');
      expect(result).toContain('200: { id: string; name: string; email: string; }[]');
      expect(result).toContain('201: { id: string; name: string; email: string; }');
    });

    it('should handle complex nested paths', async () => {
      const schemaContent = JSON.stringify(complexOpenAPISchema);
      const result = await useCase.execute(schemaContent);

      expect(result).toContain('"posts": {');
      expect(result).toContain('":postId": {');
      expect(result).toContain('"comments": {');
    });
  });

  describe('Error Handling', () => {
    const parser = new OpenAPIParser();
    const typeBuilderFactory = new HonoTypeBuilderFactory();
    const codeGeneratorFactory = new HonoCodeGeneratorFactory(DEFAULT_SOURCE);
    const useCase = new GenerateTypesUseCase(parser, typeBuilderFactory, codeGeneratorFactory);

    it('should handle invalid JSON gracefully', async () => {
      const invalidJson = '{ invalid json }';
      
      await expect(useCase.execute(invalidJson)).rejects.toThrow('Failed to parse OpenAPI schema');
    });

    it('should handle invalid OpenAPI schema', async () => {
      const invalidSchema = JSON.stringify({
        openapi: '3.0.0',
        // Missing required info field
        paths: {}
      });
      
      await expect(useCase.execute(invalidSchema)).rejects.toThrow();
    });
  });

  describe('Generated Code Quality', () => {
    const parser = new OpenAPIParser();
    const honoTypeBuilderFactory = new HonoTypeBuilderFactory();
    const honoCodeGeneratorFactory = new HonoCodeGeneratorFactory(DEFAULT_SOURCE);
    const honoUseCase = new GenerateTypesUseCase(parser, honoTypeBuilderFactory, honoCodeGeneratorFactory);

    it('should generate valid TypeScript code', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await honoUseCase.execute(schemaContent);

      // Basic syntax checks
      expect(result).toMatch(/^import.*from.*$/m); // Has imports
      expect(result).toMatch(/export type AppType = /); // Has main export
      expect(result).not.toContain('undefined'); // No undefined values
      expect(result).not.toContain('null'); // No null values (should use proper types)
      
      // Proper formatting
      expect(result).toContain('{\n'); // Proper indentation
      expect(result).toContain('}\n'); // Proper closing
    });

    it('should have consistent formatting between frameworks', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      
      const honoResult = await honoUseCase.execute(schemaContent);
      
      const elysiaTypeBuilderFactory = new ElysiaTypeBuilderFactory();
      const elysiaCodeGeneratorFactory = new ElysiaCodeGeneratorFactory(DEFAULT_SOURCE);
      const elysiaUseCase = new GenerateTypesUseCase(parser, elysiaTypeBuilderFactory, elysiaCodeGeneratorFactory);
      const elysiaResult = await elysiaUseCase.execute(schemaContent);

      // Both should have proper exports
      expect(honoResult).toMatch(/export type AppType = /);
      expect(elysiaResult).toMatch(/export type AppType = /);
      
      // Both should have imports
      expect(honoResult).toMatch(/^import.*from.*$/m);
      expect(elysiaResult).toMatch(/^import.*from.*$/m);
      
      // Both should handle the same routes
      expect(honoResult).toContain('users');
      expect(elysiaResult).toContain('users');
    });
  });
});
