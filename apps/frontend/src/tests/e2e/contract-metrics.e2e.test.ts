/**
 * E2E Test for Contract Metrics
 * 
 * Tests that legacy mapping requests increase contract_legacy_mapping_total
 * via /api/metrics endpoint.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Contract Metrics E2E', () => {
  let baseUrl: string;
  let metricsApiKey: string;

  beforeAll(() => {
    baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    metricsApiKey = process.env.METRICS_API_KEY || 'test-key';
  });

  it('should increase contract_legacy_mapping_total when legacy request is made', async () => {
    // Get initial metrics
    const initialMetrics = await fetchMetrics();
    const initialCount = extractMetricValue(initialMetrics, 'contract_legacy_mapping_total', 'fatigue_level', 'normal');

    // Make a legacy request
    await makeLegacyRequest();

    // Wait a moment for metrics to be recorded
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get updated metrics
    const updatedMetrics = await fetchMetrics();
    const updatedCount = extractMetricValue(updatedMetrics, 'contract_legacy_mapping_total', 'fatigue_level', 'normal');

    // Verify the count increased
    expect(updatedCount).toBeGreaterThan(initialCount);
    expect(updatedCount - initialCount).toBe(1);
  });

  it('should increase contract_legacy_mapping_total for season mappings', async () => {
    // Get initial metrics
    const initialMetrics = await fetchMetrics();
    const initialCount = extractMetricValue(initialMetrics, 'contract_legacy_mapping_total', 'season', 'off-season');

    // Make a legacy season request
    await makeLegacySeasonRequest();

    // Wait for metrics
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get updated metrics
    const updatedMetrics = await fetchMetrics();
    const updatedCount = extractMetricValue(updatedMetrics, 'contract_legacy_mapping_total', 'season', 'off-season');

    // Verify the count increased
    expect(updatedCount).toBeGreaterThan(initialCount);
  });

  it('should return metrics in Prometheus format with correct content-type', async () => {
    const response = await fetch(`${baseUrl}/api/metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': metricsApiKey
      }
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/plain; version=0.0.4; charset=utf-8');
    
    const metrics = await response.text();
    
    // Check Prometheus format
    expect(metrics).toContain('# HELP contract_legacy_mapping_total');
    expect(metrics).toContain('# TYPE contract_legacy_mapping_total counter');
    expect(metrics).toMatch(/contract_legacy_mapping_total\{[^}]+\} \d+/);
  });

  it('should return 401 in production without auth', async () => {
    // Mock production environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    try {
      const response = await fetch(`${baseUrl}/api/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // No API key
        }
      });

      expect(response.status).toBe(401);
      const error = await response.json();
      expect(error.error).toBe('Unauthorized');
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('should sanitize PII from metrics', async () => {
    // Make request with potentially sensitive data
    await makeRequestWithSensitiveData();

    // Wait for metrics
    await new Promise(resolve => setTimeout(resolve, 1000));

    const metrics = await fetchMetrics();
    
    // Verify no PII in metrics
    expect(metrics).not.toMatch(/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/); // No email addresses
    expect(metrics).not.toMatch(/\b\d{3}-\d{2}-\d{4}\b/); // No SSN pattern
    expect(metrics).not.toMatch(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/); // No IP addresses
  });

  it('should require authentication for metrics endpoint', async () => {
    const response = await fetch(`${baseUrl}/api/metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Should require authentication
    expect(response.status).toBe(401);
  });

  it('should allow access with valid API key', async () => {
    const response = await fetch(`${baseUrl}/api/metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': metricsApiKey
      }
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/plain; version=0.0.4; charset=utf-8');
  });

  /**
   * Fetch metrics from the API
   */
  async function fetchMetrics(): Promise<string> {
    const response = await fetch(`${baseUrl}/api/metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': metricsApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Make a legacy fatigue level request
   */
  async function makeLegacyRequest(): Promise<void> {
    const response = await fetch(`${baseUrl}/api/v1/fatigue/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        level: 'normal', // Legacy value
        sleepQuality: 8,
        stressLevel: 4,
        muscleSoreness: 3,
        energyLevel: 9,
        motivation: 8
      })
    });

    if (!response.ok) {
      throw new Error(`Legacy request failed: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Make a legacy season request
   */
  async function makeLegacySeasonRequest(): Promise<void> {
    // This would be a request that triggers season mapping
    // For now, we'll simulate it by making a request that would trigger the mapping
    const response = await fetch(`${baseUrl}/api/v1/fatigue/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        season: 'off-season', // Legacy value
        sleepQuality: 8,
        stressLevel: 4,
        muscleSoreness: 3,
        energyLevel: 9,
        motivation: 8
      })
    });

    if (!response.ok) {
      throw new Error(`Legacy season request failed: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Make request with potentially sensitive data
   */
  async function makeRequestWithSensitiveData(): Promise<void> {
    const response = await fetch(`${baseUrl}/api/v1/fatigue/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        level: 'normal',
        userEmail: 'test@example.com', // Potentially sensitive
        userIP: '192.168.1.1', // Potentially sensitive
        sleepQuality: 8,
        stressLevel: 4,
        muscleSoreness: 3,
        energyLevel: 9,
        motivation: 8
      })
    });

    if (!response.ok) {
      throw new Error(`Sensitive data request failed: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Extract metric value from Prometheus format
   */
  function extractMetricValue(metrics: string, metricName: string, labelKey: string, labelValue: string): number {
    const lines = metrics.split('\n');
    
    for (const line of lines) {
      if (line.startsWith(`${metricName}{`)) {
        const labelPattern = `${labelKey}="${labelValue}"`;
        if (line.includes(labelPattern)) {
          const match = line.match(/\} (\d+)$/);
          if (match) {
            return parseInt(match[1], 10);
          }
        }
      }
    }
    
    return 0;
  }
});
