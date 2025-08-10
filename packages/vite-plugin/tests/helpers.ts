import { vi } from 'vitest';

// Global test utilities
export const createMockAbortController = () => {
  const controller = new AbortController();
  const mockAbort = vi.fn();
  
  Object.defineProperty(controller, 'abort', {
    value: mockAbort,
    writable: true
  });
  
  return { controller, mockAbort };
};

export const createMockViteConfig = (overrides: any = {}) => ({
  root: '/test/project',
  ...overrides
});

export const waitForAsync = (ms = 150) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const mockConsole = () => {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  const mockLog = vi.fn();
  const mockError = vi.fn();
  const mockWarn = vi.fn();
  
  console.log = mockLog;
  console.error = mockError;
  console.warn = mockWarn;
  
  return {
    mockLog,
    mockError,
    mockWarn,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  };
};

export const createMockSchema = (title: string = 'Test API', version: string = '1.0.0') => ({
  swagger: '2.0',
  info: { title, version },
  host: 'api.test.com',
  basePath: '/v1',
  paths: {
    '/test': {
      get: {
        summary: 'Test endpoint',
        responses: {
          '200': {
            description: 'OK'
          }
        }
      }
    }
  }
});
