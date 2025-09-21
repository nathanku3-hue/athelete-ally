module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/apps/frontend'],
  testMatch: ['<rootDir>/apps/frontend/**/__tests__/a11y/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^next/src/client/components/navigation$': '<rootDir>/apps/frontend/src/__tests__/__mocks__/next-navigation.ts',
    '^@/(.*)$': '<rootDir>/apps/frontend/src/$1',
    '^@athlete-ally/(.*)$': '<rootDir>/packages/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/apps/frontend/src/__tests__/setup.ts'],
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
          '@/*': ['apps/frontend/src/*'],
          '@athlete-ally/*': ['packages/*']
        }
      }
    }]
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};