const base = require('./jest.config.base.cjs');

module.exports = {
  rootDir: '..',
  displayName: 'stream2-logs',
  ...base,
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['/.next/', '/dist/', '/out/', '/coverage/'],
  testMatch: ['<rootDir>/apps/frontend/src/tests/integration/**/*.integration.test.(ts|tsx)'],
  moduleNameMapper: {
    ...(base.moduleNameMapper || {}),
    '^@athlete-ally/logger/(.*)$': '<rootDir>/packages/logger/src/$1',
    '^@athlete-ally/logger$': '<rootDir>/packages/logger/src/index.ts'
  },
};
