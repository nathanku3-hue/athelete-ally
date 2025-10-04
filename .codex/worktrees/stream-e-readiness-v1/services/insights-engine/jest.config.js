module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@athlete-ally/contracts$': '<rootDir>/test-support/contracts-mock.js',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
