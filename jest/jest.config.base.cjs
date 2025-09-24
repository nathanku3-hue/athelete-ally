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
    ...(pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' })),
    // Legacy shims kept during migration
    '^vitest$': '<rootDir>/tests/_shims/vitest.ts',
    '^\\.\\.\\/helpers\\/test-data$': '<rootDir>/apps/frontend/tests/_stubs/test-data.ts',
    '^\\.\\.\\/\\.\\.\\/services\\/planning-engine\\/src\\/llm\\.js$': '<rootDir>/services/planning-engine/src/llm.ts'
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
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@athlete-ally/.*))'],

  testTimeout: 15000,
  passWithNoTests: true,
  verbose: true
};