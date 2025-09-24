module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.integration.test.ts',
    '**/__tests__/**/*.e2e.test.ts'
  ],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@packages/(.*)$': '<rootDir>/../../packages/$1',
    '^@services/(.*)$': '<rootDir>/../../services/$1',
    '^@apps/(.*)$': '<rootDir>/../../apps/$1',
    '^\\.\\/proxy\\.js$': '<rootDir>/src/lib/proxy.ts',
    '^\\.\\/routes\\.js$': '<rootDir>/src/lib/routes.ts',
    '^\.\./telemetry\\.js$': '<rootDir>/src/telemetry.ts',
    '^\.\./config\\.js$': '<rootDir>/src/config.ts'
  },

  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false,
      tsconfig: {
        jsx: 'react-jsx',
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
          '@packages/*': ['../../packages/*'],
          '@services/*': ['../../services/*'],
          '@apps/*': ['../../apps/*']
        }
      }
    }],
    '^.+\\.js$': 'babel-jest'
  },

  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],

  setupFilesAfterEnv: ['<rootDir>/../../src/__tests__/setup.ts'],

  testTimeout: 15000,

  passWithNoTests: true,
  verbose: true
};