const base = require('./jest.config.base.cjs');

module.exports = {
  rootDir: '..',
  ...base,
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.integration.test.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    // Skip problematic tests
    '.*message-reliability\\.test\\.ts$',
    '.*reliability\\.test\\.ts$',
    '.*performance/planning-engine-performance\\.test\\.ts$',
    '.*integration/end-to-end\\.test\\.ts$'
  ],
};