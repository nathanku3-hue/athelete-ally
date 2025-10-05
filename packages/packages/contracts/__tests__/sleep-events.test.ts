import { describe, it, expect } from '@jest/globals';
import { SleepRawReceivedEvent, SleepNormalizedStoredEvent, EVENT_TOPICS } from '../events/index';

describe('Sleep Events', () => {
  it('SleepRawReceivedEvent structure', () => {
    const event: SleepRawReceivedEvent = {
      payload: {
        userId: 'user123',
        date: '2024-01-15',
        durationMinutes: 420,
        capturedAt: '2024-01-16T06:30:00Z',
        raw: { vendor: 'oura' }
      }
    };
    expect(event.payload.durationMinutes).toBe(420);
  });

  it('SleepNormalizedStoredEvent structure', () => {
    const event: SleepNormalizedStoredEvent = {
      record: {
        userId: 'user123',
        date: '2024-01-15',
        durationMinutes: 420,
        vendor: 'oura',
        capturedAt: '2024-01-16T06:30:00Z'
      }
    };
    expect(event.record.vendor).toBe('oura');
  });

  it('EVENT_TOPICS includes sleep topics', () => {
    expect(EVENT_TOPICS.SLEEP_RAW_RECEIVED).toBe('athlete-ally.sleep.raw-received');
    expect(EVENT_TOPICS.SLEEP_NORMALIZED_STORED).toBe('athlete-ally.sleep.normalized-stored');
  });
});
