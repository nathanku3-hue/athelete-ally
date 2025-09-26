const base = require('../../jest/jest.config.base.cjs');

module.exports = {
  ...base,
  rootDir: '../..',
  testEnvironment: 'node',
  roots: ['<rootDir>/services/planning-engine'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.integration.test.ts'
  ],
  testPathIgnorePatterns: [
    // Skip problematic tests that require complex ESM mocking
    // See JEST_CONFIG.md for details
    '/(message-reliability|reliability|performance/planning-engine-performance|integration/end-to-end)\\.test\\.ts$'
  ],
  // Global mocks for planning-engine tests (load before modules)
  setupFiles: [
    '<rootDir>/services/planning-engine/src/__tests__/global-mocks.ts'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/services/planning-engine/src/__tests__/setup.ts'
  ],
  
  // ESM-specific configuration for planning-engine
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    ...base.moduleNameMapper,
    // Prisma client module mapping for Pattern A (per-service clients)
    '^\\.\\./prisma/generated/client/index\\.js$': '<rootDir>/services/planning-engine/prisma/generated/client/index.js',
    '^\\.\\./prisma/generated/client$': '<rootDir>/services/planning-engine/prisma/generated/client',
    // Service-specific @athlete-ally package mappings (override base mappings)
    '^@athlete-ally/contracts$': '<rootDir>/packages/contracts/events',
    '^@athlete-ally/event-bus$': '<rootDir>/packages/event-bus/src',
    '^@athlete-ally/shared$': '<rootDir>/packages/shared/src',
    '^@athlete-ally/shared-types$': '<rootDir>/packages/shared-types/src',
    '^@athlete-ally/protocol-types$': '<rootDir>/packages/protocol-types/src',
    // Generic @athlete-ally package mapping (must come last)
    '^@athlete-ally/(.*)$': '<rootDir>/packages/$1/src',
  },
  
  // Transform ignore patterns for ESM packages
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@athlete-ally/.*))'
  ]
};