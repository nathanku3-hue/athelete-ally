import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@athlete-ally/event-bus': '../../packages/event-bus/dist/index.js',
      '@athlete-ally/contracts': '../../packages/contracts/events/index.ts',
    }
  }
});
