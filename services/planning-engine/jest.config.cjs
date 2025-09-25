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
  setupFilesAfterEnv: [
    '<rootDir>/services/planning-engine/src/__tests__/setup.ts'
  ],
  
  // ESM-specific configuration for planning-engine
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    ...base.moduleNameMapper,
    // Service-specific @athlete-ally package mappings (override base mappings)
    '^@athlete-ally/contracts$': '<rootDir>/packages/contracts/events',
    '^@athlete-ally/event-bus$': '<rootDir>/packages/event-bus/src',
    '^@athlete-ally/shared$': '<rootDir>/packages/shared/src',
    '^@athlete-ally/shared-types$': '<rootDir>/packages/shared-types/src',
    '^@athlete-ally/protocol-types$': '<rootDir>/packages/protocol-types/src',
    // Generic @athlete-ally package mapping (must come last)
    '^@athlete-ally/(.*)$': '<rootDir>/packages/$1/src',
  },

  // Inherit transform configuration from base (no duplication)
  // Base config already handles ESM properly with ts-jest
  
  // Transform ignore patterns for ESM packages
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@athlete-ally/.*))'
  ]
};