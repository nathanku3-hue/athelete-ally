import { describe, it, expect } from '@jest/globals';
import { HRVRawReceivedEvent, HRVNormalizedStoredEvent, EVENT_TOPICS } from '../events/index';

describe('HRV Events', () => {
  describe('HRVRawReceivedEvent', () => {
    it('should have correct interface structure', () => {
      const event: HRVRawReceivedEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          capturedAt: '2024-01-15T08:30:00Z',
          raw: { source: 'oura', device: 'ring' }
        }
      };

      expect(event.payload.userId).toBe('user123');
      expect(event.payload.date).toBe('2024-01-15');
      expect(event.payload.rMSSD).toBe(45.5);
      expect(event.payload.capturedAt).toBe('2024-01-15T08:30:00Z');
      expect(event.payload.raw).toEqual({ source: 'oura', device: 'ring' });
    });

    it('should allow optional raw field', () => {
      const event: HRVRawReceivedEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      expect(event.payload.raw).toBeUndefined();
    });
  });

  describe('HRVNormalizedStoredEvent', () => {
    it('should have correct interface structure', () => {
      const event: HRVNormalizedStoredEvent = {
        record: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          lnRMSSD: 3.82,
          readinessScore: 75,
          vendor: 'oura',
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      expect(event.record.userId).toBe('user123');
      expect(event.record.date).toBe('2024-01-15');
      expect(event.record.rMSSD).toBe(45.5);
      expect(event.record.lnRMSSD).toBe(3.82);
      expect(event.record.readinessScore).toBe(75);
      expect(event.record.vendor).toBe('oura');
      expect(event.record.capturedAt).toBe('2024-01-15T08:30:00Z');
    });

    it('should support all vendor types', () => {
      const vendors: Array<'oura' | 'whoop' | 'unknown'> = ['oura', 'whoop', 'unknown'];
      
      vendors.forEach(vendor => {
        const event: HRVNormalizedStoredEvent = {
          record: {
            userId: 'user123',
            date: '2024-01-15',
            rMSSD: 45.5,
            lnRMSSD: 3.82,
            readinessScore: 75,
            vendor,
            capturedAt: '2024-01-15T08:30:00Z'
          }
        };
        expect(event.record.vendor).toBe(vendor);
      });
    });
  });

  describe('EVENT_TOPICS', () => {
    it('should include HRV topics', () => {
      expect(EVENT_TOPICS.HRV_RAW_RECEIVED).toBe('athlete-ally.hrv.raw-received');
      expect(EVENT_TOPICS.HRV_NORMALIZED_STORED).toBe('athlete-ally.hrv.normalized-stored');
    });

    it('should maintain existing topics', () => {
      expect(EVENT_TOPICS.ONBOARDING_COMPLETED).toBe('athlete-ally.onboarding.completed');
      expect(EVENT_TOPICS.PLAN_GENERATION_REQUESTED).toBe('athlete-ally.plans.generation-requested');
      expect(EVENT_TOPICS.PLAN_GENERATED).toBe('athlete-ally.plans.generated');
      expect(EVENT_TOPICS.PLAN_GENERATION_FAILED).toBe('athlete-ally.plans.generation-failed');
    });
  });
});
