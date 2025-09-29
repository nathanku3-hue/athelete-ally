// Minimal, testable helpers for DLQ decisioning.
export type AckAction = 'ack' | 'nak' | 'dlq';

// Decide how to ack a message based on validation result and redelivery count.
export function decideAckAction(valid: boolean, redeliveryCount: number): AckAction {
  if (valid) return 'ack';
  return redeliveryCount >= 5 ? 'dlq' : 'nak';
}

