export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testMatch: [
    '**/e2e/**/*.test.ts',
    '**/e2e/**/*.spec.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!**/node_modules/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  testTimeout: 60000, // E2E 測試需要更長的超時時間
  maxWorkers: '25%', // 限制並發以減少資源競爭
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  // E2E 測試特定配置
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  }
};
