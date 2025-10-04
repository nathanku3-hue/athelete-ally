import { test, expect } from '@playwright/test';

test('health endpoint is OK', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toMatchObject({ ok: true, status: 'healthy' });
});
