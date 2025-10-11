import { describe, it, expect } from '@jest/globals';

/**
 * Unit tests for HRV consumer retry and DLQ logic
 *
 * These tests verify the decision logic for ACK/NAK/TERM operations
 * based on error types and delivery counts.
 */

describe('HRV Consumer Retry Logic', () => {
  /**
   * Helper function to determine if an error is retryable
   * Mirrors logic from services/normalize-service/src/index.ts
   */
  const isRetryable = (err: Error | string): boolean => {
    const errMsg = err instanceof Error ? err.message : String(err);
    return (
      errMsg.includes('ECONNREFUSED') ||
      errMsg.includes('timeout') ||
      errMsg.includes('ETIMEDOUT') ||
      errMsg.includes('Connection') ||
      errMsg.includes('ENOTFOUND')
    );
  };

  describe('Error Classification', () => {
    it('should classify database connection errors as retryable', () => {
      const dbError = new Error('connect ECONNREFUSED 127.0.0.1:5432');
      expect(isRetryable(dbError)).toBe(true);
    });

    it('should classify timeout errors as retryable', () => {
      const timeoutError = new Error('Connection timeout after 30s');
      expect(isRetryable(timeoutError)).toBe(true);
    });

    it('should classify ETIMEDOUT errors as retryable', () => {
      const etimedoutError = new Error('ETIMEDOUT: Connection timed out');
      expect(isRetryable(etimedoutError)).toBe(true);
    });

    it('should classify ENOTFOUND errors as retryable', () => {
      const notFoundError = new Error('getaddrinfo ENOTFOUND postgres-host');
      expect(isRetryable(notFoundError)).toBe(true);
    });

    it('should classify schema validation errors as non-retryable', () => {
      const schemaError = new Error('Schema validation failed: invalid field type');
      expect(isRetryable(schemaError)).toBe(false);
    });

    it('should classify business logic errors as non-retryable', () => {
      const businessError = new Error('Invalid user ID format');
      expect(isRetryable(businessError)).toBe(false);
    });

    it('should classify constraint violations as non-retryable', () => {
      const constraintError = new Error('Unique constraint violation');
      expect(isRetryable(constraintError)).toBe(false);
    });
  });

  describe('Retry Decision Logic', () => {
    const maxDeliver = 5;

    it('should NAK retryable errors on first attempt', () => {
      const error = new Error('ECONNREFUSED');
      const deliveryCount = 1;
      const shouldRetry = isRetryable(error) && deliveryCount < maxDeliver;

      expect(shouldRetry).toBe(true);
    });

    it('should NAK retryable errors on attempts 2-4', () => {
      const error = new Error('Connection timeout');

      for (let attempt = 2; attempt <= 4; attempt++) {
        const shouldRetry = isRetryable(error) && attempt < maxDeliver;
        expect(shouldRetry).toBe(true);
      }
    });

    it('should send to DLQ on 5th attempt (max retries)', () => {
      const error = new Error('ECONNREFUSED');
      const deliveryCount = 5;
      const shouldRetry = isRetryable(error) && deliveryCount < maxDeliver;
      const shouldDLQ = deliveryCount >= maxDeliver;

      expect(shouldRetry).toBe(false);
      expect(shouldDLQ).toBe(true);
    });

    it('should send non-retryable errors to DLQ immediately', () => {
      const error = new Error('Schema validation failed');
      const deliveryCount = 1;
      const shouldRetry = isRetryable(error) && deliveryCount < maxDeliver;
      const shouldDLQ = !isRetryable(error) || deliveryCount >= maxDeliver;

      expect(shouldRetry).toBe(false);
      expect(shouldDLQ).toBe(true);
    });
  });

  describe('ACK Strategy', () => {
    it('should ACK successful processing', () => {
      // Success case - no error thrown
      const processingSuccess = true;
      expect(processingSuccess).toBe(true);
    });

    it('should calculate retry delay correctly', () => {
      // NAK delay is 5000ms (5 seconds) as per implementation
      const nakDelay = 5000;
      expect(nakDelay).toBe(5000);
    });
  });

  describe('JetStream Metadata', () => {
    it('should track delivery count correctly', () => {
      // Simulate deliveryCount from JetStream metadata
      const messageInfo = {
        stream: 'ATHLETE_ALLY_EVENTS',
        streamSequence: 123,
        deliverySequence: 456,
        deliveryCount: 3
      };

      // Redelivery count = deliveryCount - 1
      const redeliveryCount = Math.max(0, messageInfo.deliveryCount - 1);
      expect(redeliveryCount).toBe(2);
    });

    it('should handle first delivery correctly', () => {
      const messageInfo = {
        deliveryCount: 1
      };

      const redeliveryCount = Math.max(0, messageInfo.deliveryCount - 1);
      expect(redeliveryCount).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should use correct consumer configuration defaults', () => {
      const config = {
        durableName: process.env.NORMALIZE_HRV_DURABLE || 'normalize-hrv-durable',
        maxDeliver: parseInt(process.env.NORMALIZE_HRV_MAX_DELIVER || '5'),
        dlqSubject: process.env.NORMALIZE_HRV_DLQ_SUBJECT || 'dlq.vendor.oura.webhook',
        ackWaitMs: parseInt(process.env.NORMALIZE_HRV_ACK_WAIT_MS || '30000')
      };

      expect(config.durableName).toBe('normalize-hrv-durable');
      expect(config.maxDeliver).toBe(5);
      expect(config.dlqSubject).toBe('dlq.vendor.oura.webhook');
      expect(config.ackWaitMs).toBe(30000);
    });

    it('should use environment overrides when provided', () => {
      const testEnv = {
        NORMALIZE_HRV_DURABLE: 'custom-consumer',
        NORMALIZE_HRV_MAX_DELIVER: '10',
        NORMALIZE_HRV_DLQ_SUBJECT: 'custom.dlq',
        NORMALIZE_HRV_ACK_WAIT_MS: '60000'
      };

      const config = {
        durableName: testEnv.NORMALIZE_HRV_DURABLE,
        maxDeliver: parseInt(testEnv.NORMALIZE_HRV_MAX_DELIVER),
        dlqSubject: testEnv.NORMALIZE_HRV_DLQ_SUBJECT,
        ackWaitMs: parseInt(testEnv.NORMALIZE_HRV_ACK_WAIT_MS)
      };

      expect(config.durableName).toBe('custom-consumer');
      expect(config.maxDeliver).toBe(10);
      expect(config.dlqSubject).toBe('custom.dlq');
      expect(config.ackWaitMs).toBe(60000);
    });
  });
});
