const base = require('./jest.config.base.cjs');

module.exports = {
  rootDir: '..',
  ...base,
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/apps/frontend'],
  testMatch: [
    '**/__tests__/**/*.test.tsx',
    '**/__tests__/**/*.test.ts'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/apps/frontend/src/__tests__/setup.ts',
    '<rootDir>/src/__tests__/setup.ts'
  ],
  testEnvironmentOptions: { url: 'http://localhost:3000' }
};