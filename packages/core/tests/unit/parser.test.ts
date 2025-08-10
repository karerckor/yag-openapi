/**
 * Unit tests for OpenAPIParser.
 * Tests the core parsing logic without external dependencies.
 */

import { describe, it, expect } from 'vitest';
import { OpenAPIParser } from '../../src/core/parser';
import { simpleOpenAPISchema, complexOpenAPISchema } from '../fixtures/schemas';

describe('OpenAPIParser', () => {
  const parser = new OpenAPIParser();

  describe('parse', () => {
    it('should parse a simple OpenAPI schema', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await parser.parse(schemaContent);

      expect(result).toBeDefined();
      expect(result.info.title).toBe('Simple API');
      expect(result.info.version).toBe('1.0.0');
      expect(result.routes).toHaveLength(2);
    });

    it('should parse routes correctly', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await parser.parse(schemaContent);

      const usersRoute = result.routes.find(r => r.path === '/users');
      const userByIdRoute = result.routes.find(r => r.path === '/users/{id}');

      expect(usersRoute).toBeDefined();
      expect(usersRoute?.methods).toHaveLength(2);
      expect(usersRoute?.methods.map(m => m.method)).toContain('GET');
      expect(usersRoute?.methods.map(m => m.method)).toContain('POST');

      expect(userByIdRoute).toBeDefined();
      expect(userByIdRoute?.methods).toHaveLength(1);
      expect(userByIdRoute?.methods[0]?.method).toBe('GET');
    });

    it('should parse parameters correctly', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await parser.parse(schemaContent);

      const userByIdRoute = result.routes.find(r => r.path === '/users/{id}');
      const getMethod = userByIdRoute?.methods.find(m => m.method === 'GET');

      expect(getMethod?.parameters).toHaveLength(1);
      expect(getMethod?.parameters[0]?.name).toBe('id');
      expect(getMethod?.parameters[0]?.location).toBe('path');
      expect(getMethod?.parameters[0]?.required).toBe(true);
      expect(getMethod?.parameters[0]?.type).toBe('string');
    });

    it('should parse request body correctly', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await parser.parse(schemaContent);

      const usersRoute = result.routes.find(r => r.path === '/users');
      const postMethod = usersRoute?.methods.find(m => m.method === 'POST');

      expect(postMethod?.requestBody).toBeDefined();
      expect(postMethod?.requestBody?.contentType).toBe('application/json');
      expect(postMethod?.requestBody?.required).toBe(false);
    });

    it('should parse responses correctly', async () => {
      const schemaContent = JSON.stringify(simpleOpenAPISchema);
      const result = await parser.parse(schemaContent);

      const usersRoute = result.routes.find(r => r.path === '/users');
      const getMethod = usersRoute?.methods.find(m => m.method === 'GET');

      expect(getMethod?.responses).toHaveLength(1);
      expect(getMethod?.responses[0]?.statusCode).toBe('200');
      expect(getMethod?.responses[0]?.description).toBe('List of users');
    });

    it('should handle complex schemas with query parameters', async () => {
      const schemaContent = JSON.stringify(complexOpenAPISchema);
      const result = await parser.parse(schemaContent);

      const postsRoute = result.routes.find(r => r.path === '/posts');
      const getMethod = postsRoute?.methods.find(m => m.method === 'GET');

      expect(getMethod?.parameters).toHaveLength(2);
      
      const limitParam = getMethod?.parameters.find(p => p.name === 'limit');
      const offsetParam = getMethod?.parameters.find(p => p.name === 'offset');
      
      expect(limitParam?.location).toBe('query');
      expect(offsetParam?.location).toBe('query');
      expect(limitParam?.required).toBe(false);
      expect(offsetParam?.required).toBe(false);
    });

    it('should handle nested paths correctly', async () => {
      const schemaContent = JSON.stringify(complexOpenAPISchema);
      const result = await parser.parse(schemaContent);

      const commentsRoute = result.routes.find(r => r.path === '/posts/{postId}/comments');
      expect(commentsRoute).toBeDefined();
      expect(commentsRoute?.methods).toHaveLength(2);
      
      const getMethods = commentsRoute?.methods.filter(m => m.method === 'GET');
      const postMethods = commentsRoute?.methods.filter(m => m.method === 'POST');
      
      expect(getMethods).toHaveLength(1);
      expect(postMethods).toHaveLength(1);
    });

    it('should parse YAML content', async () => {
      const yamlContent = `
        openapi: "3.0.0"
        info:
          title: "YAML API"
          version: "1.0.0"
        paths:
          /health:
            get:
              responses:
                '200':
                  description: "Health check"
      `;

      const result = await parser.parse(yamlContent);
      expect(result.info.title).toBe('YAML API');
      expect(result.routes).toHaveLength(1);
      expect(result.routes[0]?.path).toBe('/health');
    });

    it('should throw error for invalid JSON/YAML', async () => {
      const invalidContent = '{ invalid json }';
      
      await expect(parser.parse(invalidContent)).rejects.toThrow('Failed to parse OpenAPI schema');
    });

    it('should throw error for invalid OpenAPI schema', async () => {
      const invalidSchema = JSON.stringify({
        openapi: '3.0.0',
        // Missing required info field
        paths: {}
      });
      
      await expect(parser.parse(invalidSchema)).rejects.toThrow('Failed to parse OpenAPI schema');
    });
  });
});
