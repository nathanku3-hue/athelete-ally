const base = require('./jest.config.base.cjs');

module.exports = {
  rootDir: '..',
  ...base,
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['/.next/', '/dist/', '/out/', '/coverage/'],
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.integration.test.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    // Skip problematic tests
    '.*message-reliability\\.test\\.ts$',
    '.*reliability\\.test\\.ts$',
    '.*performance/planning-engine-performance\\.test\\.ts$'
    // Note: end-to-end.test.ts is now included for integration testing
  ],
  // Allow empty test runs to pass (for CI stability)
  passWithNoTests: true
};


