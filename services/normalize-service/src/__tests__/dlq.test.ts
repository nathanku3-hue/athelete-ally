import { describe, it, expect } from '@jest/globals';
import { decideAckAction } from '../consumer_logic';

describe('Normalize DLQ policy', () => {
  it('invalid messages are retried up to 4 times, then routed to DLQ on 5th', () => {
    // First 4 deliveries => nak
    for (let c = 1; c <= 4; c++) {
      expect(decideAckAction(false, c)).toBe('nak');
    }
    // 5th delivery => dlq
    expect(decideAckAction(false, 5)).toBe('dlq');
    // >5 deliveries => still dlq
    expect(decideAckAction(false, 6)).toBe('dlq');
  });

  it('valid messages ack immediately', () => {
    expect(decideAckAction(true, 1)).toBe('ack');
    expect(decideAckAction(true, 5)).toBe('ack');
  });
});

