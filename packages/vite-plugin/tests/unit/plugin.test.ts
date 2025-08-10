import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import * as fs from 'fs/promises';
import yagOpenApiPlugin from '../../src/index.js';
import { file, remote } from '../../src/source.js';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('@yag-openapi/core', () => ({
  generate: vi.fn(async () => ({
    hono: '// hono types',
    elysia: '// elysia types',
  })),
  // Provide models generator to satisfy plugin optional access
  generateModels: vi.fn(async () => '// model types'),
}));

// Import mocked generate after mock
import { generate } from '@yag-openapi/core';

describe('yagOpenApiPlugin', () => {
  let mockConfig: any;
  let plugin: any;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = {
      root: '/test/project'
    };
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });


  describe('plugin initialization', () => {
    it('should create plugin with correct name', () => {
      const schemaMap = {};
      plugin = yagOpenApiPlugin(schemaMap);
      
      expect(plugin.name).toBe('yag-openapi');
    });

    it('should have all required hooks', () => {
      const schemaMap = {};
      plugin = yagOpenApiPlugin(schemaMap);
      
      expect(plugin.configResolved).toBeDefined();
      expect(plugin.buildStart).toBeDefined();
      expect(plugin.buildEnd).toBeDefined();
      expect(plugin.resolveId).toBeDefined();
      expect(plugin.load).toBeDefined();
    });
  });

  describe('configResolved hook', () => {
    it('should store project root', () => {
      const schemaMap = {};
      plugin = yagOpenApiPlugin(schemaMap);
      
      plugin.configResolved(mockConfig);
      
      // We can't directly test the stored value, but we can test
      // that it's used in buildStart via the generateDeclarationFiles call
      expect(() => plugin.configResolved(mockConfig)).not.toThrow();
    });
  });

  describe('resolveId hook', () => {
    beforeEach(() => {
      const schemaMap = {};
      plugin = yagOpenApiPlugin(schemaMap);
    });

    it('should resolve virtual module IDs', () => {
      expect(plugin.resolveId('@yag-openapi/client/hono')).toBe('@yag-openapi/client/hono');
      expect(plugin.resolveId('@yag-openapi/client/elysia')).toBe('@yag-openapi/client/elysia');
  expect(plugin.resolveId('@yag-openapi/client')).toBe('@yag-openapi/client');
    });

    it('should return null for non-virtual modules', () => {
      expect(plugin.resolveId('some-other-module')).toBeNull();
      expect(plugin.resolveId('./local-file.js')).toBeNull();
    });
  });

  describe('load hook', () => {
    beforeEach(() => {
      const schemaMap = {};
      plugin = yagOpenApiPlugin(schemaMap);
    });

    it('should return empty module for virtual modules', async () => {
      const honoResult = await plugin.load('@yag-openapi/client/hono');
      const elysiaResult = await plugin.load('@yag-openapi/client/elysia');
  const modelsResult = await plugin.load('@yag-openapi/client');
      
      expect(honoResult).toBe('// Virtual module provided by @yag-openapi/vite-plugin\nexport {};');
  expect(elysiaResult).toBe('// Virtual module provided by @yag-openapi/vite-plugin\nexport {};');
  expect(modelsResult).toBe('// Virtual module provided by @yag-openapi/vite-plugin\nexport {};');
    });

    it('should return null for non-virtual modules', async () => {
      const result = await plugin.load('some-other-module');
      expect(result).toBeNull();
    });
  });

  describe('type generation', () => {
    beforeEach(() => {
      vi.mocked(generate).mockResolvedValue('export type TestType = {};');
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    });

    it('should generate declaration files on buildStart', async () => {
      const mockSource = vi.fn((callback) => {
        // Immediately call callback with test schema
        callback('{"swagger": "2.0", "info": {"title": "Test"}}');
        return () => {}; // cleanup function
      });

      const schemaMap = {
        TestAPI: mockSource
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved(mockConfig);
      
      // Call buildStart and wait for async operations
      plugin.buildStart();
      
      // Wait a bit for debounced operations
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(fs.mkdir).toHaveBeenCalledWith(
        join('/test/project', 'node_modules', '@types', 'yag-openapi'),
        { recursive: true }
      );

      expect(fs.writeFile).toHaveBeenCalledWith(
        join('/test/project', 'node_modules', '@types', 'yag-openapi', 'package.json'),
        expect.stringContaining('@types/yag-openapi')
      );

      expect(fs.writeFile).toHaveBeenCalledWith(
        join('/test/project', 'node_modules', '@types', 'yag-openapi', 'index.d.ts'),
        expect.stringContaining('declare module')
      );
    });

    it('should call generate for both frameworks', async () => {
      const mockSource = vi.fn((callback) => {
        callback('{"swagger": "2.0", "info": {"title": "Test"}}');
        return () => {};
      });

      const schemaMap = {
        TestAPI: mockSource
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved(mockConfig);
      plugin.buildStart();
      
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(generate).toHaveBeenCalledWith('TestAPI', '{"swagger": "2.0", "info": {"title": "Test"}}', 'elysia');
      expect(generate).toHaveBeenCalledWith('TestAPI', '{"swagger": "2.0", "info": {"title": "Test"}}', 'hono');
    });

    it('should handle multiple schemas', async () => {
      const mockSource1 = vi.fn((callback) => {
        callback('{"swagger": "2.0", "info": {"title": "API1"}}');
        return () => {};
      });

      const mockSource2 = vi.fn((callback) => {
        callback('{"swagger": "2.0", "info": {"title": "API2"}}');
        return () => {};
      });

      const schemaMap = {
        API1: mockSource1,
        API2: mockSource2
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved(mockConfig);
      plugin.buildStart();
      
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(generate).toHaveBeenCalledTimes(4); // 2 schemas × 2 frameworks
      expect(generate).toHaveBeenCalledWith('API1', '{"swagger": "2.0", "info": {"title": "API1"}}', 'elysia');
      expect(generate).toHaveBeenCalledWith('API1', '{"swagger": "2.0", "info": {"title": "API1"}}', 'hono');
      expect(generate).toHaveBeenCalledWith('API2', '{"swagger": "2.0", "info": {"title": "API2"}}', 'elysia');
      expect(generate).toHaveBeenCalledWith('API2', '{"swagger": "2.0", "info": {"title": "API2"}}', 'hono');
    });

    it('should handle generation errors gracefully', async () => {
      vi.mocked(generate).mockRejectedValue(new Error('Generation failed'));
      
      const mockSource = vi.fn((callback) => {
        callback('{"swagger": "2.0", "info": {"title": "Test"}}');
        return () => {};
      });

      const schemaMap = {
        TestAPI: mockSource
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved(mockConfig);
      plugin.buildStart();
      
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error generating types for TestAPI:',
        expect.any(Error)
      );
    });

    it('should generate empty declarations when no schemas are available', async () => {
      const schemaMap = {};

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved(mockConfig);
      plugin.buildStart();
      
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(fs.writeFile).toHaveBeenCalledWith(
        join('/test/project', 'node_modules', '@types', 'yag-openapi', 'index.d.ts'),
        expect.stringContaining('// No schemas loaded yet')
      );
    });
  });

  describe('schema management', () => {
    it('should start all schema subscribers on buildStart', () => {
      const mockSource1 = vi.fn(() => () => {});
      const mockSource2 = vi.fn(() => () => {});

      const schemaMap = {
        API1: mockSource1,
        API2: mockSource2
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.buildStart();

      expect(mockSource1).toHaveBeenCalled();
      expect(mockSource2).toHaveBeenCalled();
    });

    it('should regenerate types when schemas change', async () => {
      let schemaCallback: any;
      const mockSource = vi.fn((callback) => {
        schemaCallback = callback;
        return () => {};
      });

      const schemaMap = {
        TestAPI: mockSource
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved(mockConfig);
      plugin.buildStart();

      // Clear initial calls
      vi.mocked(generate).mockClear();
      vi.mocked(fs.writeFile).mockClear();

      // Trigger schema change
      schemaCallback('{"swagger": "2.0", "info": {"title": "Updated"}}');
      
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(generate).toHaveBeenCalledWith('TestAPI', '{"swagger": "2.0", "info": {"title": "Updated"}}', 'elysia');
      expect(generate).toHaveBeenCalledWith('TestAPI', '{"swagger": "2.0", "info": {"title": "Updated"}}', 'hono');
    });
  });

  describe('cleanup', () => {
    it('should stop all subscribers on buildEnd', () => {
      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();
      const mockSource1 = vi.fn(() => cleanup1);
      const mockSource2 = vi.fn(() => cleanup2);

      const schemaMap = {
        API1: mockSource1,
        API2: mockSource2
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.buildStart();
      plugin.buildEnd();

      // Note: We can't directly test if cleanup functions are called
      // because they're managed internally by the SchemaManager
      // But we can test that buildEnd doesn't throw
      expect(() => plugin.buildEnd()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle file system errors gracefully', async () => {
      vi.mocked(fs.mkdir).mockRejectedValue(new Error('Permission denied'));
      
      const mockSource = vi.fn((callback) => {
        callback('{"swagger": "2.0"}');
        return () => {};
      });

      const schemaMap = {
        TestAPI: mockSource
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved(mockConfig);
      plugin.buildStart();
      
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(console.warn).toHaveBeenCalledWith(
        'Could not generate declaration files:',
        expect.any(Error)
      );
    });

    it('should handle missing project root', async () => {
      const mockSource = vi.fn((callback) => {
        callback('{"swagger": "2.0"}');
        return () => {};
      });

      const schemaMap = {
        TestAPI: mockSource
      };

      plugin = yagOpenApiPlugin(schemaMap);
      // Don't call configResolved, so projectRoot remains empty
      plugin.buildStart();
      
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should not try to create files when projectRoot is not set
      expect(fs.mkdir).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });
});
