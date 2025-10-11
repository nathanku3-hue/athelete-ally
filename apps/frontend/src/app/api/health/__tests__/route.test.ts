/**
 * Health route smoke test
 * Ensures health endpoint imports from @athlete-ally/health-schema and returns standardized shape
 */

import { createNextHealthHandler } from '@athlete-ally/health-schema';

describe('/api/health', () => {
  it('should import health-schema and return standardized response', async () => {
    // Test that we can import the handler
    const handler = createNextHealthHandler({
      serviceName: 'frontend-test',
      version: '1.0.0',
      environment: 'test'
    });

    // Test that handler returns a Response object
    const response = await handler();
    expect(response).toBeInstanceOf(Response);
    
    // Test response structure
    const data = await response.json();
    expect(data).toHaveProperty('ok');
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('service');
    expect(data).toHaveProperty('timestamp');
    expect(data.service).toBe('frontend-test');
    expect(typeof data.ok).toBe('boolean');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);
  });
});
