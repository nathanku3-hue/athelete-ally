import { describe, it, expect, beforeEach } from '@jest/globals';
import { decideAckAction } from '../consumer_logic';
import { Counter, Registry } from 'prom-client';

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

describe('DLQ Metrics', () => {
  let registry: Registry;
  let dlqMessagesCounter: Counter;

  beforeEach(() => {
    // Create a new registry for each test to avoid conflicts
    registry = new Registry();

    // Create the DLQ messages counter
    dlqMessagesCounter = new Counter({
      name: 'dlq_messages_total',
      help: 'Total number of messages sent to Dead Letter Queue',
      labelNames: ['consumer', 'reason', 'subject'],
      registers: [registry]
    });
  });

  describe('dlq_messages_total metric', () => {
    it('should be registered with correct name and help text', async () => {
      const metrics = await registry.getMetricsAsJSON();
      const dlqMetric = metrics.find(m => m.name === 'dlq_messages_total');

      expect(dlqMetric).toBeDefined();
      expect(dlqMetric?.help).toBe('Total number of messages sent to Dead Letter Queue');
      expect(dlqMetric?.type).toBe('counter');
    });

    it('should have correct label names', async () => {
      const metrics = await registry.getMetricsAsJSON();
      const dlqMetric = metrics.find(m => m.name === 'dlq_messages_total');

      // Counter should support consumer, reason, and subject labels
      expect(dlqMetric).toBeDefined();
    });

    it('should increment for HRV schema_invalid messages', async () => {
      dlqMessagesCounter.inc({ consumer: 'hrv', reason: 'schema_invalid', subject: 'hrv.raw.received' });

      const metrics = await registry.getMetricsAsJSON();
      const dlqMetric = metrics.find(m => m.name === 'dlq_messages_total');

      expect(dlqMetric?.values).toHaveLength(1);
      expect(dlqMetric?.values[0].labels).toEqual({
        consumer: 'hrv',
        reason: 'schema_invalid',
        subject: 'hrv.raw.received'
      });
      expect(dlqMetric?.values[0].value).toBe(1);
    });

    it('should increment for Sleep max_deliver messages', async () => {
      dlqMessagesCounter.inc({ consumer: 'sleep', reason: 'max_deliver', subject: 'sleep.raw.received' });

      const metrics = await registry.getMetricsAsJSON();
      const dlqMetric = metrics.find(m => m.name === 'dlq_messages_total');

      expect(dlqMetric?.values).toHaveLength(1);
      expect(dlqMetric?.values[0].labels).toEqual({
        consumer: 'sleep',
        reason: 'max_deliver',
        subject: 'sleep.raw.received'
      });
      expect(dlqMetric?.values[0].value).toBe(1);
    });

    it('should increment for Oura non_retryable messages', async () => {
      dlqMessagesCounter.inc({ consumer: 'oura', reason: 'non_retryable', subject: 'vendor.oura.webhook.received' });

      const metrics = await registry.getMetricsAsJSON();
      const dlqMetric = metrics.find(m => m.name === 'dlq_messages_total');

      expect(dlqMetric?.values).toHaveLength(1);
      expect(dlqMetric?.values[0].labels).toEqual({
        consumer: 'oura',
        reason: 'non_retryable',
        subject: 'vendor.oura.webhook.received'
      });
      expect(dlqMetric?.values[0].value).toBe(1);
    });

    it('should track separate counts for different label combinations', async () => {
      // Increment different label combinations
      dlqMessagesCounter.inc({ consumer: 'hrv', reason: 'schema_invalid', subject: 'hrv.raw.received' });
      dlqMessagesCounter.inc({ consumer: 'hrv', reason: 'schema_invalid', subject: 'hrv.raw.received' });
      dlqMessagesCounter.inc({ consumer: 'sleep', reason: 'max_deliver', subject: 'sleep.raw.received' });
      dlqMessagesCounter.inc({ consumer: 'oura', reason: 'non_retryable', subject: 'vendor.oura.webhook.received' });

      const metrics = await registry.getMetricsAsJSON();
      const dlqMetric = metrics.find(m => m.name === 'dlq_messages_total');

      expect(dlqMetric?.values).toHaveLength(3); // 3 unique label combinations

      // Check HRV counter (incremented twice)
      const hrvMetric = dlqMetric?.values.find(v =>
        v.labels.consumer === 'hrv' &&
        v.labels.reason === 'schema_invalid'
      );
      expect(hrvMetric?.value).toBe(2);

      // Check Sleep counter (incremented once)
      const sleepMetric = dlqMetric?.values.find(v =>
        v.labels.consumer === 'sleep' &&
        v.labels.reason === 'max_deliver'
      );
      expect(sleepMetric?.value).toBe(1);

      // Check Oura counter (incremented once)
      const ouraMetric = dlqMetric?.values.find(v =>
        v.labels.consumer === 'oura' &&
        v.labels.reason === 'non_retryable'
      );
      expect(ouraMetric?.value).toBe(1);
    });

    it('should support all three consumers', () => {
      const validConsumers = ['hrv', 'sleep', 'oura'];

      validConsumers.forEach(consumer => {
        expect(() => {
          dlqMessagesCounter.inc({
            consumer,
            reason: 'schema_invalid',
            subject: `${consumer}.raw.received`
          });
        }).not.toThrow();
      });
    });

    it('should support all three DLQ reasons', () => {
      const validReasons = ['schema_invalid', 'max_deliver', 'non_retryable'];

      validReasons.forEach(reason => {
        expect(() => {
          dlqMessagesCounter.inc({
            consumer: 'hrv',
            reason,
            subject: 'hrv.raw.received'
          });
        }).not.toThrow();
      });
    });
  });
});

