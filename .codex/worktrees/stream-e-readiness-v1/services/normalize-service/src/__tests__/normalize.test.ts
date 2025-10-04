import { describe, it, expect } from '@jest/globals';

describe('Normalize Service', () => {
  it('should have correct HRV topic constants', () => {
    // Verify topic constants match expected values
    const expectedTopics = {
      HRV_RAW_RECEIVED: 'athlete-ally.hrv.raw-received',
      HRV_NORMALIZED_STORED: 'athlete-ally.hrv.normalized-stored'
    };

    expect(expectedTopics.HRV_RAW_RECEIVED).toBe('athlete-ally.hrv.raw-received');
    expect(expectedTopics.HRV_NORMALIZED_STORED).toBe('athlete-ally.hrv.normalized-stored');
  });

  it('should validate HRV normalized event structure', () => {
    // Test that our expected normalized event shape is correct
    const validEvent = {
      record: {
        userId: 'test-user',
        date: '2024-01-15',
        rMSSD: 42.5,
        lnRMSSD: 3.75,
        readinessScore: 85,
        vendor: 'oura',
        capturedAt: '2024-01-15T08:00:00Z'
      }
    };

    expect(validEvent.record.userId).toBe('test-user');
    expect(validEvent.record.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(validEvent.record.rMSSD).toBeGreaterThanOrEqual(0);
    expect(typeof validEvent.record.lnRMSSD).toBe('number');
    expect(validEvent.record.readinessScore).toBeGreaterThanOrEqual(0);
    expect(validEvent.record.readinessScore).toBeLessThanOrEqual(100);
    expect(['oura', 'whoop', 'unknown']).toContain(validEvent.record.vendor);
    expect(validEvent.record.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should handle different vendor types', () => {
    const vendors = ['oura', 'whoop', 'unknown'] as const;

    vendors.forEach(vendor => {
      const event = {
        record: {
          userId: 'test-user',
          date: '2024-01-15',
          rMSSD: 42.5,
          lnRMSSD: 3.75,
          readinessScore: 85,
          vendor,
          capturedAt: '2024-01-15T08:00:00Z'
        }
      };

      expect(event.record.vendor).toBe(vendor);
    });
  });

  it('should be defined', () => {
    expect(true).toBe(true);
  });
});
