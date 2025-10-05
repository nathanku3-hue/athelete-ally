import { describe, it, expect } from '@jest/globals';
import { ReadinessComputedEvent, ReadinessStoredEvent, EVENT_TOPICS } from '../events/index';

describe('Readiness Events', () => {
  describe('ReadinessComputedEvent', () => {
    it('should have correct interface structure', () => {
      const event: ReadinessComputedEvent = {
        eventId: 'evt_123',
        payload: {
          userId: 'user123',
          date: '20241001',
          score: 88,
          incomplete: false,
          components: {
            hrvScore: 80,
            sleepScore: 90,
            notes: 'baseline variant'
          }
        }
      };

      expect(event.eventId).toBe('evt_123');
      expect(event.payload.userId).toBe('user123');
      expect(event.payload.date).toBe('20241001');
      expect(event.payload.score).toBe(88);
      expect(event.payload.incomplete).toBe(false);
      expect(event.payload.components?.hrvScore).toBe(80);
      expect(event.payload.components?.sleepScore).toBe(90);
    });
  });

  describe('ReadinessStoredEvent', () => {
    it('should have correct interface structure', () => {
      const event: ReadinessStoredEvent = {
        record: {
          userId: 'user123',
          date: '20241001',
          score: 72,
          incomplete: true,
          components: {
            hrvScore: 60,
            sleepScore: 80
          },
          capturedAt: '2024-10-01T08:30:00Z'
        }
      };

      expect(event.record.userId).toBe('user123');
      expect(event.record.date).toBe('20241001');
      expect(event.record.score).toBe(72);
      expect(event.record.components?.sleepScore).toBe(80);
    });
  });

  describe('EVENT_TOPICS', () => {
    it('should include readiness topics', () => {
      expect(EVENT_TOPICS.READINESS_COMPUTED).toBe('athlete-ally.readiness.computed');
      expect(EVENT_TOPICS.READINESS_STORED).toBe('athlete-ally.readiness.stored');
    });
  });
});

