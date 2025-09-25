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
    // Handle .js imports in TypeScript files
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Fix @athlete-ally package mapping
    '^@athlete-ally/(.*)$': '<rootDir>/packages/$1/src/index.ts',
  },
  
  // Ensure proper ESM handling
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        baseUrl: '.',
        paths: {
          "@/*": ["./src/*"],
          "@packages/*": ["../../packages/*/src"],
          "@services/*": ["../../services/*/src"],
          "@apps/*": ["../../apps/*/src"]
        }
      }
    }]
  },
  
  // Transform ignore patterns for ESM packages
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@athlete-ally/.*))'
  ]
};