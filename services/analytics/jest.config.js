module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/__tests__/setup.ts'
  ],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['@swc/jest', { 
      configFile: '../../scripts/swc.jest.config.json' 
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  testTimeout: 10000,
  passWithNoTests: true
};
