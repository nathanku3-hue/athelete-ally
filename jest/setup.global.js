/**
 * Global Jest Setup
 * 
 * This file runs before all test suites across all projects.
 * Use for global configuration, mocks, and environment setup.
 */

// Global test timeout
jest.setTimeout(30000);

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global console suppression in CI
if (process.env.CI === 'true') {
  const originalConsole = console;
  global.console = {
    ...originalConsole,
    log: () => {},
    info: () => {},
    warn: originalConsole.warn,
    error: originalConsole.error,
  };
}

// Global test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Global mocks for external services
jest.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: () => ({
      startSpan: jest.fn(() => ({
        setStatus: jest.fn(),
        setAttributes: jest.fn(),
        end: jest.fn(),
      })),
    }),
  },
  metrics: {
    getMeter: () => ({
      createCounter: jest.fn(() => ({ add: jest.fn() })),
      createHistogram: jest.fn(() => ({ record: jest.fn() })),
    }),
  },
}));

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
  }),
  
  createMockSession: () => ({
    id: 'test-session-id',
    userId: 'test-user-id',
    status: 'active',
  }),
  
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};
