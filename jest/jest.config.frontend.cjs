const base = require('./jest.config.base.cjs');

module.exports = {
  rootDir: '..',
  ...base,
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/apps/frontend'],
  testMatch: [
    '**/__tests__/**/*.test.tsx',
    '**/__tests__/**/*.test.ts',
    '**/tests/**/*.test.ts'
  ],
  testPathIgnorePatterns: [
    // Exclude Playwright E2E tests from Jest runs
    '/apps/frontend/src/__tests__/e2e/',
    '/apps/frontend/tests/e2e/',
    // Exclude legacy integration-like tests from unit tests
    '/apps/frontend/tests/permissions/',
    '/apps/frontend/tests/security/'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/apps/frontend/src/__tests__/setup.ts',
    '<rootDir>/src/__tests__/setup.ts'
  ],
  testEnvironmentOptions: { url: 'http://localhost:3000' },
  // Increase timeout for CI environment
  testTimeout: 15000
};