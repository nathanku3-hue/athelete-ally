module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  moduleNameMapper: {
    '^@athlete-ally/contracts$': '<rootDir>/../../packages/contracts/src/index.ts',
    '^@athlete-ally/event-bus$': '<rootDir>/../../packages/event-bus/src/index.ts',
    '^@athlete-ally/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts',
  },
};
