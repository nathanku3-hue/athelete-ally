import { describe, it, expect } from '@jest/globals';
import { HRVRawReceivedEvent, SleepRawReceivedEvent } from '@athlete-ally/contracts';

describe('Ingest Service', () => {
  describe('HRV Events', () => {
    it('should validate HRV event structure', () => {
      const validEvent: HRVRawReceivedEvent = {
        eventId: 'test-event-id-1',
        payload: {
          userId: 'test-user',
          date: '2024-01-15',
          rMSSD: 42.5,
          capturedAt: '2024-01-15T08:00:00Z'
        }
      };

      expect(validEvent.payload.userId).toBe('test-user');
      expect(validEvent.payload.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(validEvent.payload.rMSSD).toBeGreaterThanOrEqual(0);
      expect(validEvent.payload.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle optional raw field', () => {
      const eventWithRaw: HRVRawReceivedEvent = {
        eventId: 'test-event-id-2',
        payload: {
          userId: 'test-user',
          date: '2024-01-15',
          rMSSD: 42.5,
          capturedAt: '2024-01-15T08:00:00Z',
          raw: { source: 'test', extra: 'data' }
        }
      };

      expect(eventWithRaw.payload.raw).toBeDefined();
      expect(eventWithRaw.payload.raw?.source).toBe('test');
    });
  });

  describe('Sleep Events', () => {
    it('should validate Sleep event structure', () => {
      const validEvent: SleepRawReceivedEvent = {
        eventId: 'test-event-id-3',
        payload: {
          userId: 'test-user',
          date: '2024-01-15',
          durationMinutes: 420,
          capturedAt: '2024-01-15T08:00:00Z'
        }
      };

      expect(validEvent.payload.userId).toBe('test-user');
      expect(validEvent.payload.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(validEvent.payload.durationMinutes).toBeGreaterThanOrEqual(0);
      expect(validEvent.payload.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle optional fields', () => {
      const eventWithOptionals: SleepRawReceivedEvent = {
        eventId: 'test-event-id-4',
        payload: {
          userId: 'test-user',
          date: '2024-01-15',
          durationMinutes: 420,
          capturedAt: '2024-01-15T08:00:00Z',
          raw: { source: 'oura', sleepScore: 85 }
        }
      };

      expect(eventWithOptionals.payload.raw).toBeDefined();
      expect(eventWithOptionals.payload.raw?.source).toBe('oura');
    });

    it('should accept zero duration', () => {
      const eventWithZeroDuration: SleepRawReceivedEvent = {
        eventId: 'test-event-id-5',
        payload: {
          userId: 'test-user',
          date: '2024-01-15',
          durationMinutes: 0
        }
      };

      expect(eventWithZeroDuration.payload.durationMinutes).toBe(0);
    });
  });

  it('should be defined', () => {
    expect(true).toBe(true);
  });
});
