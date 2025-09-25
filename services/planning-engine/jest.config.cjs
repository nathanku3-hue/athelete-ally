/**
 * Jest configuration for planning-engine service
 * 
 * This configuration extends the base Jest config and adds service-specific
 * module mappings and ESM support for the planning-engine service.
 * 
 * Key features:
 * - ESM support for TypeScript files
 * - Correct @athlete-ally package mappings
 * - Service-specific test file patterns
 * - Proper setup file configuration
 */
const base = require('../../jest/jest.config.base.cjs');

module.exports = {
  ...base,
  
  // Service-specific configuration
  rootDir: '../..', // Relative to the monorepo root
  testEnvironment: 'node',
  roots: ['<rootDir>/services/planning-engine'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.integration.test.ts'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/services/planning-engine/src/__tests__/setup.ts'
  ],

  // ESM-specific configuration
  extensionsToTreatAsEsm: ['.ts'],
  
  // Module name mapping for @athlete-ally packages
  moduleNameMapper: {
    ...base.moduleNameMapper,
    // Handle .js imports in TypeScript files (ESM compatibility)
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Specific @athlete-ally package mappings (from tsconfig.base.json)
    '^@athlete-ally/contracts$': '<rootDir>/packages/contracts/events',
    '^@athlete-ally/event-bus$': '<rootDir>/packages/event-bus/src',
    '^@athlete-ally/shared$': '<rootDir>/packages/shared/src',
    '^@athlete-ally/shared-types$': '<rootDir>/packages/shared-types/src',
    '^@athlete-ally/protocol-types$': '<rootDir>/packages/protocol-types/src',
    // Generic @athlete-ally package mapping
    '^@athlete-ally/(.*)$': '<rootDir>/packages/$1/src',
  },

  // Inherit transform configuration from base (no duplication)
  // Base config already handles ESM properly with ts-jest
  
  testTimeout: 15000,
  passWithNoTests: true,
  verbose: true
};