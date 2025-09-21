const CI_LOOSE = process.env.CI === 'true';
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  // 使用 projects 配置支持 monorepo
  projects: [
            // Frontend app
            {
              displayName: 'frontend',
              testEnvironment: 'jsdom',
              roots: ['<rootDir>/apps/frontend'],
  testMatch: [
                '<rootDir>/apps/frontend/**/__tests__/**/*.test.{ts,tsx}',
                '<rootDir>/apps/frontend/**/*.test.{ts,tsx}'
              ],
  testPathIgnorePatterns: [
                '<rootDir>/apps/frontend/.*/e2e/.*',
                '<rootDir>/apps/frontend/.*\\.e2e\\.test\\.(ts|tsx)',
                '<rootDir>/apps/frontend/tests/permissions/protocol-permissions.test.ts',
                '<rootDir>/apps/frontend/tests/security/boundary-hardening.test.ts',
                '<rootDir>/apps/frontend/tests/security/secure-id.test.ts',
                '<rootDir>/apps/frontend/src/__tests__/components/.*',
                '<rootDir>/apps/frontend/src/__tests__/permissions/.*',
                '<rootDir>/apps/frontend/src/__tests__/hooks/.*'
              ],
      setupFilesAfterEnv: ['<rootDir>/apps/frontend/src/__tests__/setup.ts'],
  moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/apps/frontend/src/$1',
    '^@athlete-ally/(.*)$': '<rootDir>/packages/$1',
    '^@athlete-ally/event-bus/(.*)$': '<rootDir>/packages/event-bus/src/$1',
    '^@athlete-ally/contracts/(.*)$': '<rootDir>/packages/contracts/events/$1',
    '^@athlete-ally/shared/(.*)$': '<rootDir>/packages/shared/src/$1',
    '^@athlete-ally/shared-types/(.*)$': '<rootDir>/packages/shared-types/src/$1'
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['babel-jest', {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            ['@babel/preset-react', { runtime: 'automatic' }],
            '@babel/preset-typescript'
          ]
        }]
      },
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      collectCoverageFrom: [
        'apps/frontend/src/**/*.{ts,tsx}',
        '!apps/frontend/src/**/*.d.ts',
        '!apps/frontend/src/**/__tests__/**',
        '!apps/frontend/src/**/node_modules/**'
      ]
    },
    
    // Gateway BFF
    {
      displayName: 'gateway-bff',
      testEnvironment: 'node',
      roots: ['<rootDir>/apps/gateway-bff'],
  testMatch: [
        '<rootDir>/apps/gateway-bff/**/__tests__/**/*.test.{ts,tsx}',
        '<rootDir>/apps/gateway-bff/**/*.test.{ts,tsx}'
      ],
  moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' })
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          useESM: true,
          tsconfig: '<rootDir>/apps/gateway-bff/tsconfig.json'
        }]
      },
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      collectCoverageFrom: [
        'apps/gateway-bff/src/**/*.{ts,tsx}',
        '!apps/gateway-bff/src/**/*.d.ts',
        '!apps/gateway-bff/src/**/__tests__/**',
        '!apps/gateway-bff/src/**/node_modules/**'
      ]
    },
    
    // Contracts package
    {
      displayName: 'contracts',
      testEnvironment: 'node',
      roots: ['<rootDir>/packages/contracts'],
      testMatch: [
        '<rootDir>/packages/contracts/**/__tests__/**/*.test.{ts,tsx}',
        '<rootDir>/packages/contracts/**/*.test.{ts,tsx}'
      ],
      setupFilesAfterEnv: ['<rootDir>/packages/contracts/__tests__/setup.ts'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        ...pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }),
        '^@contracts-test-utils/(.*)$': '<rootDir>/packages/contracts/tests/test-utils/$1'
      },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
          tsconfig: '<rootDir>/packages/contracts/tsconfig.test.json'
        }]
      },
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      collectCoverageFrom: [
        'packages/contracts/**/*.{ts,tsx}',
        '!packages/contracts/**/*.d.ts',
        '!packages/contracts/**/__tests__/**',
        '!packages/contracts/**/node_modules/**',
        '!packages/contracts/**/dist/**'
      ],
      coverageThreshold: CI_LOOSE ? {
  global: { branches: 0, functions: 0, lines: 0, statements: 0 }
} : {
  global: { branches: 50, functions: 60, lines: 60, statements: 60 },
  'packages/contracts/tests/test-utils/**/*.{ts,tsx}': { branches: 80, functions: 80, lines: 80, statements: 80 },
  'packages/shared/src/**/*.{ts,tsx}': { branches: 70, functions: 70, lines: 70, statements: 70 },
  'apps/gateway-bff/src/**/*.{ts,tsx}': { branches: 60, functions: 70, lines: 70, statements: 70 },
  'apps/frontend/src/lib/**/*.{ts,tsx}': { branches: 50, functions: 60, lines: 60, statements: 60 },
  'apps/frontend/src/components/**/*.{ts,tsx}': { branches: 40, functions: 50, lines: 50, statements: 50 }
}
};


