import { describe, it, expect } from '@jest/globals';
import { SecureIdGenerator, SecureIdValidator } from '@athlete-ally/shared';

describe('Secure ID Generation and Validation', () => {
  describe('SecureIdGenerator', () => {
    it('should generate unique job IDs', () => {
      const jobId1 = SecureIdGenerator.generateJobId();
      const jobId2 = SecureIdGenerator.generateJobId();

      expect(jobId1).toMatch(/^job_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(jobId2).toMatch(/^job_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(jobId1).not.toBe(jobId2);
    });

    it('should generate unique plan IDs', () => {
      const planId1 = SecureIdGenerator.generatePlanId();
      const planId2 = SecureIdGenerator.generatePlanId();

      expect(planId1).toMatch(/^plan_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(planId2).toMatch(/^plan_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(planId1).not.toBe(planId2);
    });

    it('should generate unique session IDs', () => {
      const sessionId1 = SecureIdGenerator.generateSessionId();
      const sessionId2 = SecureIdGenerator.generateSessionId();

      expect(sessionId1).toMatch(/^session_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(sessionId2).toMatch(/^session_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(sessionId1).not.toBe(sessionId2);
    });

    it('should generate unique request IDs', () => {
      const requestId1 = SecureIdGenerator.generateRequestId();
      const requestId2 = SecureIdGenerator.generateRequestId();

      expect(requestId1).toMatch(/^req_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(requestId2).toMatch(/^req_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(requestId1).not.toBe(requestId2);
    });

    it('should generate unique event IDs', () => {
      const eventId1 = SecureIdGenerator.generateEventId();
      const eventId2 = SecureIdGenerator.generateEventId();

      expect(eventId1).toMatch(/^event_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(eventId2).toMatch(/^event_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(eventId1).not.toBe(eventId2);
    });

    it('should generate timestamped IDs', () => {
      const timestampedId = SecureIdGenerator.generateTimestampedId('test');
      
      expect(timestampedId).toMatch(/^test_\d+_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should validate secure ID format', () => {
      const validJobId = SecureIdGenerator.generateJobId();
      const invalidJobId = 'invalid-job-id';

      expect(SecureIdGenerator.isValidSecureId(validJobId, 'job')).toBe(true);
      expect(SecureIdGenerator.isValidSecureId(invalidJobId, 'job')).toBe(false);
    });
  });

  describe('SecureIdValidator', () => {
    it('should validate job IDs correctly', () => {
      const validJobId = SecureIdGenerator.generateJobId();
      const invalidJobId = 'invalid-job-id';

      expect(SecureIdValidator.isValidJobId(validJobId)).toBe(true);
      expect(SecureIdValidator.isValidJobId(invalidJobId)).toBe(false);
    });

    it('should validate plan IDs correctly', () => {
      const validPlanId = SecureIdGenerator.generatePlanId();
      const invalidPlanId = 'invalid-plan-id';

      expect(SecureIdValidator.isValidPlanId(validPlanId)).toBe(true);
      expect(SecureIdValidator.isValidPlanId(invalidPlanId)).toBe(false);
    });

    it('should validate session IDs correctly', () => {
      const validSessionId = SecureIdGenerator.generateSessionId();
      const invalidSessionId = 'invalid-session-id';

      expect(SecureIdValidator.isValidSessionId(validSessionId)).toBe(true);
      expect(SecureIdValidator.isValidSessionId(invalidSessionId)).toBe(false);
    });

    it('should validate request IDs correctly', () => {
      const validRequestId = SecureIdGenerator.generateRequestId();
      const invalidRequestId = 'invalid-request-id';

      expect(SecureIdValidator.isValidRequestId(validRequestId)).toBe(true);
      expect(SecureIdValidator.isValidRequestId(invalidRequestId)).toBe(false);
    });

    it('should validate event IDs correctly', () => {
      const validEventId = SecureIdGenerator.generateEventId();
      const invalidEventId = 'invalid-event-id';

      expect(SecureIdValidator.isValidEventId(validEventId)).toBe(true);
      expect(SecureIdValidator.isValidEventId(invalidEventId)).toBe(false);
    });
  });

  describe('Security Properties', () => {
    it('should generate unpredictable IDs', () => {
      const ids = new Set();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        ids.add(SecureIdGenerator.generateJobId());
      }

      // 所有生成的ID都应该是唯一的
      expect(ids.size).toBe(iterations);
    });

    it('should not contain predictable patterns', () => {
      const jobId = SecureIdGenerator.generateJobId();
      const planId = SecureIdGenerator.generatePlanId();

      // 不应该包含时间戳模式
      expect(jobId).not.toMatch(/\d{13}/);
      expect(planId).not.toMatch(/\d{13}/);

      // 不应该包含简单的递增模式
      expect(jobId).not.toMatch(/job_\d+$/);
      expect(planId).not.toMatch(/plan_\d+$/);
    });

    it('should have sufficient entropy', () => {
      const jobId = SecureIdGenerator.generateJobId();
      const uuidPart = jobId.split('_')[1];
      
      // UUID v4 应该有足够的熵
      expect(uuidPart).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });
});
