import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { file, remote } from '../../src/source.js';
import yagOpenApiPlugin from '../../src/index.js';

// Mock generate to return realistic output
vi.mock('@yag-openapi/core', () => ({
  generate: vi.fn(),
  // models generator stub, not used in these tests but required by plugin
  generateModels: vi.fn(async () => '// model types'),
}));

import { generate } from '@yag-openapi/core';

describe('Vite Plugin Integration', () => {
  const testProjectRoot = '/tmp/test-vite-project';
  let plugin: any;
  let cleanup: (() => void)[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup = [];
    
    // Mock generate to return framework-specific types
    vi.mocked(generate).mockImplementation(async (name: string, schema: string, framework: string) => {
      if (framework === 'elysia') {
        return `export type ${name} = Elysia<"", {}, {}, {}, {}>;`;
      } else if (framework === 'hono') {
        return `export type ${name} = Hono<{}, {}, "/">;`;
      }
      return '';
    });
  });

  afterEach(() => {
    cleanup.forEach(fn => fn());
    vi.useRealTimers();
  });

  describe('full workflow with file source', () => {
    it('should handle complete file-based schema workflow', async () => {
      // Use actual test fixture
      const schemaPath = join(__dirname, '../fixtures/test-schema.json');
      
      const schemaMap = {
        TestAPI: file(schemaPath)
      };

      plugin = yagOpenApiPlugin(schemaMap);
      
      // Mock config
      plugin.configResolved({ root: testProjectRoot });
      
      // Start the plugin
      plugin.buildStart();
      
      // Wait for initial generation
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify that generate was called correctly
      expect(generate).toHaveBeenCalledWith(
        'TestAPI',
        expect.stringContaining('"title": "Test API"'),
        'elysia'
      );
      
      expect(generate).toHaveBeenCalledWith(
        'TestAPI',
        expect.stringContaining('"title": "Test API"'),
        'hono'
      );
      
  // Test virtual module resolution
      expect(plugin.resolveId('@yag-openapi/client/elysia')).toBe('@yag-openapi/client/elysia');
      expect(plugin.resolveId('@yag-openapi/client/hono')).toBe('@yag-openapi/client/hono');
  expect(plugin.resolveId('@yag-openapi/client')).toBe('@yag-openapi/client');
      
      // Test virtual module loading
  const elysiaModule = await plugin.load('@yag-openapi/client/elysia');
  const honoModule = await plugin.load('@yag-openapi/client/hono');
  const modelsModule = await plugin.load('@yag-openapi/client');
      
      expect(elysiaModule).toBe('// Virtual module provided by @yag-openapi/vite-plugin\nexport {};');
  expect(honoModule).toBe('// Virtual module provided by @yag-openapi/vite-plugin\nexport {};');
  expect(modelsModule).toBe('// Virtual module provided by @yag-openapi/vite-plugin\nexport {};');
      
      // Clean up
      plugin.buildEnd();
    });
  });

  describe('full workflow with remote source', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should handle complete remote-based schema workflow', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          swagger: '2.0',
          info: { title: 'Remote API', version: '1.0.0' },
          paths: {}
        }))
      });

      global.fetch = mockFetch;

      const schemaMap = {
        RemoteAPI: remote('https://api.example.com/swagger.json', {
          pollingInterval: 5000 // Longer interval to avoid rapid polling
        })
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved({ root: testProjectRoot });
      plugin.buildStart();
      
      // Wait for initial fetch to complete
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/swagger.json', { headers: {} });
      });
      
      // Wait for generation to complete
      await vi.waitFor(() => {
        expect(generate).toHaveBeenCalledWith(
          'RemoteAPI',
          expect.stringContaining('Remote API'),
          'elysia'
        );
      });
      
      expect(generate).toHaveBeenCalledWith(
        'RemoteAPI',
        expect.stringContaining('Remote API'),
        'hono'
      );
      
      plugin.buildEnd();
    });

    it('should handle schema updates from remote source', async () => {
      let fetchCallCount = 0;
      const mockFetch = vi.fn().mockImplementation(() => {
        fetchCallCount++;
        const version = fetchCallCount === 1 ? '1.0.0' : '1.1.0';
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({
            swagger: '2.0',
            info: { title: 'Remote API', version },
            paths: {}
          }))
        });
      });

      global.fetch = mockFetch;

      const schemaMap = {
        RemoteAPI: remote('https://api.example.com/swagger.json', {
          pollingInterval: 5000 // Longer interval to avoid rapid polling
        })
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved({ root: testProjectRoot });
      plugin.buildStart();
      
      // Wait for initial fetch and generation
      await vi.waitFor(() => {
        expect(generate).toHaveBeenCalledWith(
          'RemoteAPI',
          expect.stringContaining('1.0.0'),
          'elysia'
        );
      });
      
      // Clear previous calls
      vi.mocked(generate).mockClear();
      mockFetch.mockClear();
      
      // Manually trigger second fetch by simulating polling interval
      vi.advanceTimersByTime(5000);
      
      // Wait for the second fetch to complete and generate to be called
      await vi.waitFor(() => {
        expect(generate).toHaveBeenCalledWith(
          'RemoteAPI',
          expect.stringContaining('1.1.0'),
          'elysia'
        );
      });
      
      plugin.buildEnd();
    });
  });

  describe('multiple schemas integration', () => {
    it('should handle multiple schemas from different sources', async () => {
      const filePath = join(__dirname, '../fixtures/simple-schema.json');
      
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          swagger: '2.0',
          info: { title: 'Remote API', version: '1.0.0' },
          paths: {}
        }))
      });

      global.fetch = mockFetch;

      const schemaMap = {
        LocalAPI: file(filePath),
        RemoteAPI: remote('https://api.example.com/swagger.json', {
          pollingInterval: 60000 // Very long interval to avoid polling during test
        })
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved({ root: testProjectRoot });
      plugin.buildStart();
      
      // Wait for both sources to complete initial loading
      await vi.waitFor(() => {
        // Check that generate has been called for both schemas and both frameworks
        const calls = vi.mocked(generate).mock.calls;
        const hasLocalElysia = calls.some(call => call[0] === 'LocalAPI' && call[2] === 'elysia');
        const hasLocalHono = calls.some(call => call[0] === 'LocalAPI' && call[2] === 'hono');
        const hasRemoteElysia = calls.some(call => call[0] === 'RemoteAPI' && call[2] === 'elysia');
        const hasRemoteHono = calls.some(call => call[0] === 'RemoteAPI' && call[2] === 'hono');
        
        expect(hasLocalElysia && hasLocalHono && hasRemoteElysia && hasRemoteHono).toBe(true);
      });
      
      expect(generate).toHaveBeenCalledWith('LocalAPI', expect.any(String), 'elysia');
      expect(generate).toHaveBeenCalledWith('LocalAPI', expect.any(String), 'hono');
      expect(generate).toHaveBeenCalledWith('RemoteAPI', expect.any(String), 'elysia');
      expect(generate).toHaveBeenCalledWith('RemoteAPI', expect.any(String), 'hono');
      
      plugin.buildEnd();
    });
  });

  describe('error scenarios integration', () => {
    it('should handle network failures gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      const schemaMap = {
        FailingAPI: remote('https://api.example.com/swagger.json', {
          pollingInterval: 60000 // Very long interval to avoid continuous polling
        })
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved({ root: testProjectRoot });
      plugin.buildStart();
      
      // Wait for the error to occur
      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('[yag-openapi] Failed to fetch OpenAPI schema from https://api.example.com/swagger.json')
        );
      });
      
      // Should not crash and should not call generate for the failing API
      const generateCalls = vi.mocked(generate).mock.calls;
      const failingAPICalls = generateCalls.filter(call => call[0] === 'FailingAPI');
      expect(failingAPICalls).toHaveLength(0);
      
      plugin.buildEnd();
      consoleSpy.mockRestore();
    });

    it('should handle invalid schema gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(generate).mockRejectedValue(new Error('Invalid schema'));
      
      const filePath = join(__dirname, '../fixtures/test-schema.json');
      
      const schemaMap = {
        InvalidAPI: file(filePath)
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved({ root: testProjectRoot });
      plugin.buildStart();
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(generate).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error generating types for InvalidAPI:',
        expect.any(Error)
      );
      
      plugin.buildEnd();
      consoleSpy.mockRestore();
    });
  });

  describe('plugin lifecycle', () => {
    it('should properly initialize and cleanup', () => {
      const schemaMap = {
        TestAPI: file(join(__dirname, '../fixtures/test-schema.json'))
      };

      plugin = yagOpenApiPlugin(schemaMap);
      
      // Should not throw during initialization
      expect(() => plugin.configResolved({ root: testProjectRoot })).not.toThrow();
      expect(() => plugin.buildStart()).not.toThrow();
      expect(() => plugin.buildEnd()).not.toThrow();
    });

    it('should handle rapid start/stop cycles', () => {
      const schemaMap = {
        TestAPI: file(join(__dirname, '../fixtures/test-schema.json'))
      };

      plugin = yagOpenApiPlugin(schemaMap);
      plugin.configResolved({ root: testProjectRoot });
      
      // Multiple start/stop cycles
      for (let i = 0; i < 5; i++) {
        expect(() => plugin.buildStart()).not.toThrow();
        expect(() => plugin.buildEnd()).not.toThrow();
      }
    });
  });
});
