// Base Jest config for monorepo (CommonJS to avoid ESM interop issues)
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../tsconfig.base.json');

module.exports = {
  rootDir: '..',
  preset: 'ts-jest',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Unify module resolution from TS paths
  moduleNameMapper: {
    // Specific @athlete-ally package mappings (must come before generic mapping)
    '^@athlete-ally/contracts$': '<rootDir>/packages/contracts/events',
    '^@athlete-ally/contracts/events/(.*)$': '<rootDir>/packages/contracts/events/$1',
    '^@athlete-ally/contracts/(.*)$': '<rootDir>/packages/contracts/$1',
    // Specific llm.js mappings (must come before generic .js mapping)
    '^(\\.\\./)*services/planning-engine/src/llm\\.js$': '<rootDir>/services/planning-engine/src/llm.ts',
    '^(\\.\\./)*services/planning-engine/src/llm$': '<rootDir>/services/planning-engine/src/llm.ts',
    // Legacy shims removed after Vitest→Jest migration
    '^\\.\\.\\/helpers\\/test-data$': '<rootDir>/apps/frontend/tests/_stubs/test-data.ts',
    // Handle .js imports in TypeScript files (ESM compatibility) - must come after specific mappings
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Generic @athlete-ally package mapping (must come last)
    '^@athlete-ally/(.*)$': '<rootDir>/packages/$1/src',
    // ESM imports resolved by ts-jest automatically (after specific mappings)
    ...(pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }))
  },

  // TypeScript transform aligned to monorepo tsconfig paths
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        baseUrl: '.',
        paths: compilerOptions.paths || {}
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Enable ESM support for Jest (moved to transform config)
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@athlete-ally/.*))'],

  testTimeout: 15000,
  passWithNoTests: true,
  verbose: true
};