const base = require('./jest.config.base.cjs');

module.exports = {
  rootDir: '..',
  displayName: 'stream2-logs',
  ...base,
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['/.next/', '/dist/', '/out/', '/coverage/'],
  testMatch: ['<rootDir>/apps/frontend/src/tests/integration/**/*.integration.test.(ts|tsx)'],
  
  // Override transform config for ES modules
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        baseUrl: '.',
        paths: {
          '@athlete-ally/logger': ['packages/logger/src'],
          '@athlete-ally/logger/*': ['packages/logger/src/*']
        }
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  moduleNameMapper: {
    ...(base.moduleNameMapper || {}),
    // Map logger to source files for proper ES module handling
    '^@athlete-ally/logger/(.*)$': '<rootDir>/packages/logger/src/$1',
    '^@athlete-ally/logger$': '<rootDir>/packages/logger/src/index.ts'
  },
};
