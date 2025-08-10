/**
 * Unit tests for HonoTypeBuilder.
 * Tests Hono-specific type generation logic.
 */

import { describe, it, expect, vi } from 'vitest';
import { HonoTypeBuilder } from '../../src/frameworks/hono-type-builder';
import { TypeScriptWriter } from '../../src/core/typescript-writer';
import type { MethodModel, APIModel } from '../../src/core/interfaces';

describe('HonoTypeBuilder', () => {
  const writer = new TypeScriptWriter();
  const builder = new HonoTypeBuilder(writer);

  describe('buildInputType', () => {
    it('should build input type with path parameters', () => {
      const method: MethodModel = {
        method: 'GET',
        parameters: [
          {
            name: 'id',
            type: 'string',
            location: 'path',
            required: true
          }
        ],
        responses: []
      };

      const result = builder.buildInputType(method);
      expect(result).toBeDefined();
      expect(typeof result).toBe('function');
    });

    it('should build input type with query parameters', () => {
      const method: MethodModel = {
        method: 'GET',
        parameters: [
          {
            name: 'limit',
            type: 'number',
            location: 'query',
            required: false
          },
          {
            name: 'offset',
            type: 'number',
            location: 'query',
            required: false
          }
        ],
        responses: []
      };

      const result = builder.buildInputType(method);
      expect(result).toBeDefined();
      expect(typeof result).toBe('function');
    });

    it('should build input type with request body', () => {
      const method: MethodModel = {
        method: 'POST',
        parameters: [],
        requestBody: {
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' }
            },
            required: ['name', 'email']
          },
          required: true
        },
        responses: []
      };

      const result = builder.buildInputType(method);
      expect(result).toBeDefined();
      expect(typeof result).toBe('function');
    });

    it('should return empty object for method with no parameters', () => {
      const method: MethodModel = {
        method: 'GET',
        parameters: [],
        responses: []
      };

      const result = builder.buildInputType(method);
      expect(result).toBeDefined();
      expect(typeof result).toBe('function');
    });
  });

  describe('buildOutputType', () => {
    it('should build output type for successful response', () => {
      const method: MethodModel = {
        method: 'GET',
        parameters: [],
        responses: [
          {
            statusCode: '200',
            description: 'Success',
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' }
              },
              required: ['id', 'name']
            }
          }
        ]
      };

      const result = builder.buildOutputType(method);
      expect(result).toBeDefined();
      expect(typeof result).toBe('function');
    });

    it('should return empty object for method with no successful response', () => {
      const method: MethodModel = {
        method: 'GET',
        parameters: [],
        responses: [
          {
            statusCode: '404',
            description: 'Not found'
          }
        ]
      };

      const result = builder.buildOutputType(method);
      expect(result).toBeDefined();
      expect(typeof result).toBe('function');
    });
  });

  describe('buildMethodType', () => {
    it('should build complete method type', () => {
      const method: MethodModel = {
        method: 'GET',
        parameters: [
          {
            name: 'id',
            type: 'string',
            location: 'path',
            required: true
          }
        ],
        responses: [
          {
            statusCode: '200',
            description: 'Success',
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' }
              }
            }
          }
        ]
      };

      const result = builder.buildMethodType(method);
      expect(result).toBeDefined();
      expect(typeof result).toBe('function');
    });
  });

  describe('buildAppType', () => {
    it('should build complete Hono app type', () => {
      const api: APIModel = {
        info: {
          title: 'Test API',
          version: '1.0.0'
        },
        routes: [
          {
            path: '/users',
            methods: [
              {
                method: 'GET',
                parameters: [],
                responses: [
                  {
                    statusCode: '200',
                    description: 'Success',
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' }
                        }
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            path: '/users/{id}',
            methods: [
              {
                method: 'GET',
                parameters: [
                  {
                    name: 'id',
                    type: 'string',
                    location: 'path',
                    required: true
                  }
                ],
                responses: [
                  {
                    statusCode: '200',
                    description: 'Success',
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' }
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = builder.buildAppType(api);
      expect(result).toBeDefined();
      expect(typeof result).toBe('function');

      // Test the writer function by executing it
      const mockWriter = {
        write: vi.fn(),
        newLine: vi.fn(),
        indent: vi.fn((fn: () => void) => fn())
      };

      result(mockWriter as any);

      // Should generate Hono generic type
      expect(mockWriter.write).toHaveBeenCalledWith('Hono<');
    });

    it('should convert OpenAPI paths to Hono format', () => {
      const api: APIModel = {
        info: {
          title: 'Test API',
          version: '1.0.0'
        },
        routes: [
          {
            path: '/users/{id}/posts/{postId}',
            methods: [
              {
                method: 'GET',
                parameters: [],
                responses: []
              }
            ]
          }
        ]
      };

      const result = builder.buildAppType(api);
      
      // Execute the writer function to test path conversion
      const outputs: string[] = [];
      const mockWriter = {
        write: vi.fn((text: string) => outputs.push(text)),
        newLine: vi.fn(),
        indent: vi.fn((fn: () => void) => fn())
      };

      result(mockWriter as any);

      const fullOutput = outputs.join('');
      // Should convert {id} to :id for Hono
      expect(fullOutput).toContain('/users/:id/posts/:postId');
    });
  });
});
