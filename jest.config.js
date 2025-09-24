/**
 * Jest configuration for Athlete Ally monorepo
 * Supports TypeScript, ES modules, and monorepo package resolution
 */
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
  
  // Module resolution for monorepo packages
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/frontend/src/$1',
    '^@components/(.*)$': '<rootDir>/apps/frontend/src/components/$1',
    '^@contexts/(.*)$': '<rootDir>/apps/frontend/src/contexts/$1',
    '^@lib/(.*)$': '<rootDir>/apps/frontend/src/lib/$1',
    '^@hooks/(.*)$': '<rootDir>/apps/frontend/src/hooks/$1',
    '^@packages/(.*)$': '<rootDir>/packages/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@apps/(.*)$': '<rootDir>/apps/$1',
    '^@athlete-ally/(.*)$': '<rootDir>/packages/$1',
    '^@athlete-ally/event-bus/(.*)$': '<rootDir>/packages/event-bus/src/$1',
    '^@athlete-ally/contracts/(.*)$': '<rootDir>/packages/contracts/events/$1',
    '^@athlete-ally/shared/(.*)$': '<rootDir>/packages/shared/src/$1',
    '^@athlete-ally/shared-types/(.*)$': '<rootDir>/packages/shared-types/src/$1',
    '^@athlete-ally/protocol-types$': '<rootDir>/packages/protocol-types/src',
    '^@athlete-ally/protocol-types/(.*)$': '<rootDir>/packages/protocol-types/src/$1',
    // Shims for tests authored for Vitest or hard-coded relative specifiers
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
        paths: {
          '@/*': ['apps/frontend/src/*'],
          '@packages/*': ['packages/*'],
          '@services/*': ['services/*'],
          '@apps/*': ['apps/*'],
          '@athlete-ally/*': ['packages/*'],
          '@athlete-ally/event-bus/*': ['packages/event-bus/src/*'],
          '@athlete-ally/contracts/*': ['packages/contracts/events/*'],
          '@athlete-ally/shared/*': ['packages/shared/src/*'],
          '@athlete-ally/shared-types/*': ['packages/shared-types/src/*'],
          '@athlete-ally/protocol-types/*': ['packages/protocol-types/src/*']
        }
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
