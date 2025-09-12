module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // 统一的测试文件发现模式
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests', 
    '<rootDir>/packages',
    '<rootDir>/services',
    '<rootDir>/apps'
  ],
  
  // 严格的测试文件匹配模式
  testMatch: [
    '**/__tests__/**/*.test.ts',
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
    '^@apps/(.*)$': '<rootDir>/apps/$1'
  },
  
  // 转换配置
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false,
      tsconfig: {
        jsx: 'react-jsx',
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
          '@packages/*': ['packages/*'],
          '@services/*': ['services/*'],
          '@apps/*': ['apps/*']
        }
      }
    }],
    '^.+\\.js$': 'babel-jest'
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.ts',
    'packages/**/*.ts',
    'services/**/*.ts',
    'apps/**/*.ts',
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
  verbose: true
};
