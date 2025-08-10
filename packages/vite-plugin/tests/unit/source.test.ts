import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { file, remote } from '../../src/source';

// Mock fs modules
vi.mock('fs', () => ({
  watch: vi.fn(),
  readFile: vi.fn()
}));

describe('source', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('file source', () => {
    const mockSchema = { openapi: '3.0.0', info: { title: 'Test API', version: '1.0.0' }, paths: {} };

    it('should read schema from file', async () => {
      const { readFile } = await import('fs');
      (readFile as any).mockImplementation((path: any, options: any, callback: any) => {
        // Handle both readFile(path, callback) and readFile(path, options, callback) signatures
        const cb = typeof options === 'function' ? options : callback;
        cb(null, JSON.stringify(mockSchema));
      });

      const source = file('/path/to/schema.json');
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      
      // Wait for file read callback
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(readFile).toHaveBeenCalledWith('/path/to/schema.json', 'utf-8', expect.any(Function));
      expect(changeHandler).toHaveBeenCalledWith(JSON.stringify(mockSchema));
      
      cleanup();
    });

    it('should handle file read errors gracefully', async () => {
      const { readFile } = await import('fs');
      (readFile as any).mockImplementation((path: any, options: any, callback: any) => {
        const cb = typeof options === 'function' ? options : callback;
        cb(new Error('File not found'));
      });
      
      const source = file('/path/to/nonexistent.json');
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(readFile).toHaveBeenCalledWith('/path/to/nonexistent.json', 'utf-8', expect.any(Function));
      expect(changeHandler).not.toHaveBeenCalled();
      
      cleanup();
    });

    it('should watch file for changes when watch option is true', async () => {
      const { readFile, watch } = await import('fs');
      const mockWatcher = {
        on: vi.fn(),
        close: vi.fn()
      };
      
      vi.mocked(watch).mockReturnValue(mockWatcher as any);
      (readFile as any).mockImplementation((path: any, options: any, callback: any) => {
        const cb = typeof options === 'function' ? options : callback;
        cb(null, JSON.stringify(mockSchema));
      });
      
      const source = file('/path/to/schema.json', { watch: true });
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      
      expect(watch).toHaveBeenCalledWith('/path/to/schema.json', expect.any(Function));
      
      cleanup();
      expect(mockWatcher.close).toHaveBeenCalled();
    });

    it('should not throw on cleanup', () => {
      const source = file('/path/to/schema.json');
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      
      expect(() => cleanup()).not.toThrow();
    });

    it('should stop watching when aborted', async () => {
      const { readFile, watch } = await import('fs');
      const mockWatcher = {
        on: vi.fn(),
        close: vi.fn()
      };
      
      vi.mocked(watch).mockReturnValue(mockWatcher as any);
      (readFile as any).mockImplementation((path: any, options: any, callback: any) => {
        const cb = typeof options === 'function' ? options : callback;
        cb(null, JSON.stringify(mockSchema));
      });
      
      const source = file('/path/to/schema.json', { watch: true });
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      
      // Cleanup should close the watcher
      cleanup();
      expect(mockWatcher.close).toHaveBeenCalled();
    });
  });

  describe('remote source', () => {
    const mockSchema = { openapi: '3.0.0', info: { title: 'Remote API', version: '1.0.0' }, paths: {} };
    let mockFetch: any;
    let originalFetch: any;

    beforeEach(() => {
      originalFetch = globalThis.fetch;
      mockFetch = vi.fn();
      globalThis.fetch = mockFetch;
      
      // Default successful response
      mockFetch.mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify(mockSchema))
      });
      
      vi.useFakeTimers();
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
      vi.useRealTimers();
    });

    it('should fetch schema immediately on start', async () => {
      const source = remote('https://api.example.com/schema');
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      
      // Wait for the changeHandler to be called (indicates the fetch completed)
      await vi.waitFor(() => {
        expect(changeHandler).toHaveBeenCalledWith(JSON.stringify(mockSchema));
      });
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/schema', {
        headers: {}
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      cleanup();
    });

    it('should use custom headers when provided', async () => {
      const source = remote('https://api.example.com/schema', {
        headers: { Authorization: 'Bearer token' }
      });
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      
      // Wait for the initial fetch promise to resolve
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/schema', {
        headers: { Authorization: 'Bearer token' }
      });
      
      cleanup();
    });

    it('should use custom fetch function when provided', async () => {
      const customFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue('{"custom": "schema"}')
      });
      
      const source = remote('https://api.example.com/schema', {
        customFetch
      });
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      
      // Wait for the changeHandler to be called (indicates the fetch completed)
      await vi.waitFor(() => {
        expect(changeHandler).toHaveBeenCalledWith('{"custom": "schema"}');
      });
      
      expect(customFetch).toHaveBeenCalledWith('https://api.example.com/schema', {
        headers: {}
      });
      expect(customFetch).toHaveBeenCalledTimes(1);
      
      cleanup();
    });

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const source = remote('https://api.example.com/schema');
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      await vi.advanceTimersToNextTimerAsync();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[yag-openapi] Failed to fetch OpenAPI schema from https://api.example.com/schema')
      );
      
      cleanup();
      consoleErrorSpy.mockRestore();
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const source = remote('https://api.example.com/schema');
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      await vi.advanceTimersToNextTimerAsync();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[yag-openapi] Failed to fetch OpenAPI schema from https://api.example.com/schema')
      );
      
      cleanup();
      consoleErrorSpy.mockRestore();
    });

    it('should schedule periodic fetches with default interval', async () => {
      const source = remote('https://api.example.com/schema');
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      
      // Wait for initial fetch to complete
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
      
      // Clear mock call count
      mockFetch.mockClear();
      
      // Advance to next timer (should trigger second fetch)
      await vi.advanceTimersToNextTimerAsync();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      cleanup();
    });

    it('should use custom polling interval', async () => {
      const source = remote('https://api.example.com/schema', {
        pollingInterval: 10000 // 10 seconds
      });
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      
      // Wait for initial fetch to complete
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
      
      // Clear mock call count
      mockFetch.mockClear();
      
      // Advance to next timer (should trigger second fetch)
      await vi.advanceTimersToNextTimerAsync();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      cleanup();
    });

    it('should stop polling when aborted', async () => {
      const source = remote('https://api.example.com/schema');
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      
      // Wait for initial fetch to complete
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
      
      // Cleanup (which calls abort)
      cleanup();
      
      // Clear mock call count
      mockFetch.mockClear();
      
      // Advance time - should not trigger more fetches
      vi.advanceTimersByTime(30000);
      await vi.advanceTimersToNextTimerAsync();
      
      // Should not have been called again
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    it('should cleanup timer on cleanup function call', async () => {
      const source = remote('https://api.example.com/schema');
      const changeHandler = vi.fn();
      const abort = new AbortController();
      
      const cleanup = source(changeHandler, abort);
      
      // Wait for initial fetch to complete
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
      
      // Should not throw when cleanup is called
      expect(() => cleanup()).not.toThrow();
      
      // Clear mock call count
      mockFetch.mockClear();
      
      // Advance time after cleanup - should not trigger fetch
      vi.advanceTimersByTime(30000);
      await vi.advanceTimersToNextTimerAsync();
      
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });
  });
});