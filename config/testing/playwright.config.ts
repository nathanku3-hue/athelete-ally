import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'apps/frontend/tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: 'dot',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: true,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Build happens in CI before tests; locally you can `npm run build` then `npm run start`.
    command: 'npm run start', // maps to `next start apps/frontend`
    url: 'http://localhost:3000',
    timeout: 60_000,
    reuseExistingServer: true,
  },
});
