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
    '/apps/frontend/tests/e2e/'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/apps/frontend/src/__tests__/setup.ts',
    '<rootDir>/src/__tests__/setup.ts'
  ],
  testEnvironmentOptions: { url: 'http://localhost:3000' }
};