/**
 * Unit tests for TypeScriptWriter.
 * Tests the TypeScript code generation utilities.
 */

import { describe, it, expect, vi } from 'vitest';
import { TypeScriptWriter } from '../../src/core/typescript-writer';

describe('TypeScriptWriter', () => {
  const writer = new TypeScriptWriter();

  describe('schemaToTypeString', () => {
    it('should convert string type', () => {
      const schema = { type: 'string' };
      const result = writer.schemaToTypeString(schema);
      expect(result).toBe('string');
    });

    it('should convert number type', () => {
      const schema = { type: 'number' };
      const result = writer.schemaToTypeString(schema);
      expect(result).toBe('number');
    });

    it('should convert boolean type', () => {
      const schema = { type: 'boolean' };
      const result = writer.schemaToTypeString(schema);
      expect(result).toBe('boolean');
    });

    it('should convert array type', () => {
      const schema = {
        type: 'array',
        items: { type: 'string' }
      };
      const result = writer.schemaToTypeString(schema);
      expect(result).toBe('string[]');
    });

    it('should convert object type with properties', () => {
      const schema = {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          age: { type: 'number' }
        },
        required: ['id', 'name']
      };
      const result = writer.schemaToTypeString(schema);
      expect(result).toContain('id: string');
      expect(result).toContain('name: string');
      expect(result).toContain('age?: number');
    });

    it('should handle enum types', () => {
      const schema = {
        type: 'string',
        enum: ['active', 'inactive', 'pending']
      };
      const result = writer.schemaToTypeString(schema);
      expect(result).toBe('"active" | "inactive" | "pending"');
    });

    it('should handle $ref types', () => {
      const schema = {
        $ref: '#/components/schemas/User'
      };
      const result = writer.schemaToTypeString(schema);
      expect(result).toBe('User');
    });

    it('should handle oneOf types', () => {
      const schema = {
        oneOf: [
          { type: 'string' },
          { type: 'number' }
        ]
      };
      const result = writer.schemaToTypeString(schema);
      expect(result).toBe('string | number');
    });

    it('should handle allOf types', () => {
      const schema = {
        allOf: [
          { type: 'object', properties: { id: { type: 'string' } } },
          { type: 'object', properties: { name: { type: 'string' } } }
        ]
      };
      const result = writer.schemaToTypeString(schema);
      expect(result).toContain('&');
    });

    it('should return unknown for null schema', () => {
      const result = writer.schemaToTypeString(null);
      expect(result).toBe('unknown');
    });

    it('should return unknown for undefined schema', () => {
      const result = writer.schemaToTypeString(undefined);
      expect(result).toBe('unknown');
    });
  });

  describe('createObjectType', () => {
    it('should create object type with string properties', () => {
      const properties = {
        id: 'string',
        name: 'string',
        age: 'number'
      };

      const writerFunction = writer.createObjectType(properties);
      
      // Mock writer to capture output
      const mockWriter = {
        write: vi.fn(),
        newLine: vi.fn(),
        indent: vi.fn((fn: () => void) => fn())
      };

      writerFunction(mockWriter as any);

      expect(mockWriter.write).toHaveBeenCalledWith('{');
      expect(mockWriter.write).toHaveBeenCalledWith('}');
    });

    it('should create empty object for no properties', () => {
      const writerFunction = writer.createObjectType({});
      
      const mockWriter = {
        write: vi.fn(),
        newLine: vi.fn(),
        indent: vi.fn()
      };

      writerFunction(mockWriter as any);

      expect(mockWriter.write).toHaveBeenCalledWith('{');
      expect(mockWriter.write).toHaveBeenCalledWith('}');
    });
  });

  describe('createGenericType', () => {
    it('should create generic type with string parameters', () => {
      const writerFunction = writer.createGenericType('Array', ['string']);
      
      const mockWriter = {
        write: vi.fn()
      };

      writerFunction(mockWriter as any);

      expect(mockWriter.write).toHaveBeenCalledWith('Array<');
      expect(mockWriter.write).toHaveBeenCalledWith('string');
      expect(mockWriter.write).toHaveBeenCalledWith('>');
    });

    it('should create generic type with multiple parameters', () => {
      const writerFunction = writer.createGenericType('Map', ['string', 'number']);
      
      const mockWriter = {
        write: vi.fn()
      };

      writerFunction(mockWriter as any);

      expect(mockWriter.write).toHaveBeenCalledWith('Map<');
      expect(mockWriter.write).toHaveBeenCalledWith('string');
      expect(mockWriter.write).toHaveBeenCalledWith(', ');
      expect(mockWriter.write).toHaveBeenCalledWith('number');
      expect(mockWriter.write).toHaveBeenCalledWith('>');
    });
  });

  describe('createUnionType', () => {
    it('should create union type', () => {
      const writerFunction = writer.createUnionType(['string', 'number', 'boolean']);
      
      const mockWriter = {
        write: vi.fn()
      };

      writerFunction(mockWriter as any);

      expect(mockWriter.write).toHaveBeenCalledWith('string');
      expect(mockWriter.write).toHaveBeenCalledWith(' | ');
      expect(mockWriter.write).toHaveBeenCalledWith('number');
      expect(mockWriter.write).toHaveBeenCalledWith(' | ');
      expect(mockWriter.write).toHaveBeenCalledWith('boolean');
    });
  });

  describe('createIntersectionType', () => {
    it('should create intersection type', () => {
      const writerFunction = writer.createIntersectionType(['TypeA', 'TypeB']);
      
      const mockWriter = {
        write: vi.fn()
      };

      writerFunction(mockWriter as any);

      expect(mockWriter.write).toHaveBeenCalledWith('TypeA');
      expect(mockWriter.write).toHaveBeenCalledWith(' & ');
      expect(mockWriter.write).toHaveBeenCalledWith('TypeB');
    });
  });
});
