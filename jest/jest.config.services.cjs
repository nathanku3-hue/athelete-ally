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
  // No global test skipping - use describe.skip/it.skip in individual test files
  // See services/planning-engine/JEST_CONFIG.md for details
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup.ts'
  ],
  // CI并发控制 - 避免CI容器在高并发下不稳定
  maxWorkers: process.env.CI === 'true' ? 1 : '50%',
  runInBand: process.env.CI === 'true'
};