import { GET } from '@/app/api/health/route';

describe('Health Endpoint (E2E-lite)', () => {
  test('should return healthy status and build metadata', async () => {
    const res = await GET();
    const json = await (res as any).json();
    expect(json).toBeDefined();
    expect(json.ok).toBe(true);
    expect(json.status).toBe('healthy');
    expect(typeof json.commitSha).toBe('string');
    expect(typeof json.buildId).toBe('string');
  });
});
