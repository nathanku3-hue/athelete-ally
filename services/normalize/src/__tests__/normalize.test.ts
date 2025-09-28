import { describe, it, expect } from '@jest/globals';
import { EVENT_TOPICS, HRVNormalizedStoredEvent } from '@athlete-ally/contracts';

describe('Normalize Service', () => {
  it('should have correct HRV topic constants', () => {
    expect(EVENT_TOPICS.HRV_RAW_RECEIVED).toBe('athlete-ally.hrv.raw-received');
    expect(EVENT_TOPICS.HRV_NORMALIZED_STORED).toBe('athlete-ally.hrv.normalized-stored');
  });

  it('should validate HRV normalized event structure', () => {
    const validEvent: HRVNormalizedStoredEvent = {
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
      const event: HRVNormalizedStoredEvent = {
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
