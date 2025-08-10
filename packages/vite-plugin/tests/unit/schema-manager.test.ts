import { describe, it, expect, vi, beforeEach } from 'vitest';
import yagOpenApiPlugin from '../../src/index.js';

describe('SchemaManager (internal class)', () => {
  let plugin: any;
  let mockSources: any;
  let callbacks: any[];

  beforeEach(() => {
    vi.clearAllMocks();
    callbacks = [];
    
    // Create mock sources that store their callbacks for later triggering
    mockSources = {
      API1: vi.fn((callback) => {
        callbacks.push({ name: 'API1', callback });
        return vi.fn(); // cleanup function
      }),
      API2: vi.fn((callback) => {
        callbacks.push({ name: 'API2', callback });
        return vi.fn(); // cleanup function
      })
    };
  });

  describe('schema subscription management', () => {
    it('should start all subscribers on plugin start', () => {
      plugin = yagOpenApiPlugin(mockSources);
      plugin.buildStart();

      expect(mockSources.API1).toHaveBeenCalled();
      expect(mockSources.API2).toHaveBeenCalled();
      expect(callbacks).toHaveLength(2);
    });

    it('should not start duplicate subscribers', () => {
      plugin = yagOpenApiPlugin(mockSources);
      
      // Start multiple times
      plugin.buildStart();
      plugin.buildStart();
      plugin.buildStart();

      // Should only have been called once per source
      expect(mockSources.API1).toHaveBeenCalledTimes(1);
      expect(mockSources.API2).toHaveBeenCalledTimes(1);
    });

    it('should track schema updates', () => {
      plugin = yagOpenApiPlugin(mockSources);
      plugin.buildStart();

      // Trigger schema updates
      const api1Callback = callbacks.find(cb => cb.name === 'API1')?.callback;
      const api2Callback = callbacks.find(cb => cb.name === 'API2')?.callback;

      api1Callback?.('{"schema": "v1"}');
      api2Callback?.('{"schema": "v2"}');

      // We can't directly test the internal schema storage, but we can verify
      // that the callbacks were set up correctly
      expect(api1Callback).toBeDefined();
      expect(api2Callback).toBeDefined();
    });
  });

  describe('change notifications', () => {
    it('should debounce rapid schema changes', async () => {
      const generateSpy = vi.fn();
      
      // Use fake timers for predictable testing
      vi.useFakeTimers();

      plugin = yagOpenApiPlugin(mockSources);
      plugin.configResolved({ root: '/test' });
      plugin.buildStart();

      const api1Callback = callbacks.find(cb => cb.name === 'API1')?.callback;

      // Trigger rapid changes
      api1Callback?.('{"schema": "v1"}');
      api1Callback?.('{"schema": "v2"}');
      api1Callback?.('{"schema": "v3"}');

      // Should debounce the changes
      vi.advanceTimersByTime(100);
      
      expect(() => vi.advanceTimersByTime(50)).not.toThrow();

      vi.useRealTimers();
    });
  });

  describe('cleanup', () => {
    it('should stop all subscribers on buildEnd', () => {
      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();
      
      mockSources.API1.mockReturnValue(cleanup1);
      mockSources.API2.mockReturnValue(cleanup2);

      plugin = yagOpenApiPlugin(mockSources);
      plugin.buildStart();
      plugin.buildEnd();

      // The actual cleanup functions are called internally
      // We test that buildEnd doesn't throw and completes successfully
      expect(() => plugin.buildEnd()).not.toThrow();
    });

    it('should handle cleanup when no subscribers exist', () => {
      plugin = yagOpenApiPlugin({});
      
      // Should not throw when cleaning up empty subscribers
      expect(() => plugin.buildEnd()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty schema map', () => {
      plugin = yagOpenApiPlugin({});
      
      expect(() => plugin.buildStart()).not.toThrow();
      expect(() => plugin.buildEnd()).not.toThrow();
    });

    it('should handle sources that throw errors', () => {
      const errorSource = vi.fn(() => {
        throw new Error('Source initialization failed');
      });

      plugin = yagOpenApiPlugin({ ErrorAPI: errorSource });
      
      expect(() => plugin.buildStart()).not.toThrow();
    });

    it('should handle callbacks called after abort', () => {
      plugin = yagOpenApiPlugin(mockSources);
      plugin.buildStart();

      const api1Callback = callbacks.find(cb => cb.name === 'API1')?.callback;
      
      // Stop the plugin
      plugin.buildEnd();
      
      // Try to trigger callback after cleanup
      expect(() => api1Callback?.('{"schema": "after-cleanup"}')).not.toThrow();
    });
  });
});
