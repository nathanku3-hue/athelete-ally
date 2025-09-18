module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // 专注于API测试
  
  // 支持ES模块
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // 统一的测试文件发现模式
  roots: [
    '<rootDir>/src',
    '<rootDir>/packages',
    '<rootDir>/services',
    '<rootDir>/apps'
  ],
  
  // 严格的测试文件匹配模式
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/__tests__/**/*.integration.test.ts',
    '**/__tests__/**/*.e2e.test.ts'
  ],
  
  // 忽略模式
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '.*/setup.ts$',
    '.*/setup.js$'
  ],
  
  // 模块解析配置
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@packages/(.*)$': '<rootDir>/packages/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@apps/(.*)$': '<rootDir>/apps/$1',
    '^@athlete-ally/(.*)$': '<rootDir>/packages/$1',
    '^@athlete-ally/event-bus/(.*)$': '<rootDir>/packages/event-bus/src/$1',
    '^@athlete-ally/contracts/(.*)$': '<rootDir>/packages/contracts/events/$1',
    '^@athlete-ally/shared/(.*)$': '<rootDir>/packages/shared/src/$1',
    '^@athlete-ally/shared-types/(.*)$': '<rootDir>/packages/shared-types/src/$1'
  },
  
  // 转换配置
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
        paths: {
          '@/*': ['src/*'],
          '@packages/*': ['packages/*'],
          '@services/*': ['services/*'],
          '@apps/*': ['apps/*'],
          '@athlete-ally/*': ['packages/*'],
          '@athlete-ally/event-bus/*': ['packages/event-bus/src/*'],
          '@athlete-ally/contracts/*': ['packages/contracts/events/*'],
          '@athlete-ally/shared/*': ['packages/shared/src/*'],
          '@athlete-ally/shared-types/*': ['packages/shared-types/src/*']
        }
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@athlete-ally/.*))'
  ],
  
  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'packages/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'apps/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!packages/**/*.d.ts',
    '!services/**/*.d.ts',
    '!apps/**/*.d.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // 测试环境配置
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // 超时配置
  testTimeout: 15000,
  
  // 其他配置
  passWithNoTests: true,
  verbose: true,
  
  // 支持ES模块
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // 测试环境变量
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  }
};
