/**
 * Health endpoint integration test
 * Tests the standardized health response from /api/health
 */

import { GET } from '../route';

describe('/api/health integration', () => {
  it('should return standardized health response', async () => {
    const response = await GET();
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    // Verify standardized health response structure
    expect(data).toHaveProperty('ok');
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('sha');
    expect(data).toHaveProperty('buildId');
    expect(data).toHaveProperty('service');
    expect(data).toHaveProperty('uptimeSec');
    expect(data).toHaveProperty('timestamp');
    
    // Verify types
    expect(typeof data.ok).toBe('boolean');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);
    expect(typeof data.sha).toBe('string');
    expect(typeof data.buildId).toBe('string');
    expect(typeof data.service).toBe('string');
    expect(typeof data.uptimeSec).toBe('number');
    expect(typeof data.timestamp).toBe('string');
    
    // Verify service name
    expect(data.service).toBe('frontend');
  });
});
