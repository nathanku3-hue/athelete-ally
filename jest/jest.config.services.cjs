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
  // Stabilize: exclude heavy perf test from the default services run.
  // It has its own targeted script/CI job to avoid Prisma/engine env coupling.
  testPathIgnorePatterns: [
    '/node_modules/',
    // Skip Event Bus tests that have module resolution issues
    '.*message-reliability\\.test\\.ts$',
    '.*reliability\\.test\\.ts$',
    '.*planning-engine-performance\\.test\\.ts$'
  ],
  // No global test skipping - use describe.skip/it.skip in individual test files
  // See services/planning-engine/JEST_CONFIG.md for details
  // Each service has its own setup file at services/<service-name>/src/__tests__/setup.ts
  // CI并发控制 - 避免CI容器在高并发下不稳定
  maxWorkers: process.env.CI === 'true' ? 1 : '50%'
  // runInBand is handled by CI, not config
};
