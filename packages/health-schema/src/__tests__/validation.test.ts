/**
 * Health schema validation tests
 * Tests validateHealthResponse function with valid and invalid inputs
 */

import { validateHealthResponse, HealthResponse } from '@athlete-ally/health-schema';

describe('validateHealthResponse', () => {
  it('should validate correct health response', () => {
    const validResponse: HealthResponse = {
      ok: true,
      status: 'healthy',
      sha: 'abc123',
      buildId: 'build-456',
      service: 'test-service',
      uptimeSec: 3600,
      timestamp: '2025-01-06T12:00:00Z',
      version: '1.0.0',
      environment: 'test'
    };

    expect(validateHealthResponse(validResponse)).toBe(true);
  });

  it('should reject invalid health response', () => {
    const invalidResponse = {
      ok: 'not-boolean',
      status: 'invalid-status',
      sha: 123,
      buildId: 'build-456',
      service: 'test-service',
      uptimeSec: 'not-number',
      timestamp: '2025-01-06T12:00:00Z'
    };

    expect(validateHealthResponse(invalidResponse)).toBe(false);
  });

  it('should reject null or undefined', () => {
    expect(validateHealthResponse(null)).toBe(false);
    expect(validateHealthResponse(undefined)).toBe(false);
  });

  it('should reject non-object types', () => {
    expect(validateHealthResponse('string')).toBe(false);
    expect(validateHealthResponse(123)).toBe(false);
    expect(validateHealthResponse([])).toBe(false);
  });
});
