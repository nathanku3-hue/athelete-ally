/**
 * Jest configuration for Athlete Ally monorepo
 * - Unifies path resolution by deriving moduleNameMapper from tsconfig.base.json
 * - Keeps jsdom env and minimal shims for legacy tests
 */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  preset: 'ts-jest',
  // Use jsdom by default to support frontend/component tests; Node-only tests still run fine
  testEnvironment: 'jsdom',

  // ES module support
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Test discovery
  roots: ['<rootDir>/src', '<rootDir>/packages', '<rootDir>/services', '<rootDir>/apps'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/__tests__/**/*.integration.test.ts',
    '**/__tests__/**/*.e2e.test.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/', '/dist/', '/build/', '/coverage/',
    '.*/setup.ts$', '.*/setup.js$'
  ],

  // Module resolution for monorepo packages — derive from TS paths
  moduleNameMapper: {
    // TS base paths (prefix rootDir)
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }),
    // Shims/legacy mappings left intentionally while migrating legacy tests
    '^vitest$': '<rootDir>/tests/_shims/vitest.ts',
    '^\\.\\.\\/helpers\\/test-data$': '<rootDir>/apps/frontend/tests/_stubs/test-data.ts',
    '^\\.\\.\\/\\.\\.\\/services\\/planning-engine\\/src\\/llm\\.js$': '<rootDir>/services/planning-engine/src/llm.ts'
  },

  // TypeScript transformation
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      // Align ts-jest path resolution to monorepo tsconfig paths
      tsconfig: {
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        baseUrl: '.',
        // Re-use tsconfig.base.json paths to keep compiler and Jest in sync
        paths: compilerOptions.paths || {}
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@athlete-ally/.*))'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'packages/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'apps/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  coverageThreshold: {
    global: { branches: 75, functions: 80, lines: 80, statements: 80 }
  },

  // Test configuration
  // Load frontend setup (jest-dom, browser mocks) and root setup (generic)
  setupFilesAfterEnv: [
    '<rootDir>/apps/frontend/src/__tests__/setup.ts',
    '<rootDir>/src/__tests__/setup.ts'
  ],
  testTimeout: 15000,
  passWithNoTests: true,
  verbose: true,
  testEnvironmentOptions: { url: 'http://localhost:3000' }
};