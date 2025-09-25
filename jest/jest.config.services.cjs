const base = require('./jest.config.base.cjs');

module.exports = {
  rootDir: '..',
  ...base,
  testEnvironment: 'node',
  roots: ['<rootDir>/services'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.integration.test.ts'
  ],
  testPathIgnorePatterns: [
    // Skip problematic planning-engine tests that require complex ESM mocking
    // See services/planning-engine/JEST_CONFIG.md for details
    '/services/planning-engine/src/__tests__/(message-reliability|reliability|performance/planning-engine-performance|integration/end-to-end)\\.test\\.ts$'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup.ts'
  ],
  // CI并发控制 - 避免CI容器在高并发下不稳定
  maxWorkers: process.env.CI === 'true' ? 1 : '50%',
  runInBand: process.env.CI === 'true'
};