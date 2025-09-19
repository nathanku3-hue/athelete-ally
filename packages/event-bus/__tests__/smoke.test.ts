import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import { ok, err, isOk, unwrap, map } from '../tests/test-utils/helpers';
import { ApiResponse } from '../tests/test-utils/types';

// Test schema for event validation
const EventSchema = z.object({
  id: z.string(),
  type: z.string(),
  timestamp: z.number(),
  data: z.record(z.unknown())
});

describe('Event Bus Smoke Tests', () => {
  describe('Test Utils Integration', () => {
    it('should create successful responses', () => {
      const response = ok({ message: 'success' });
      expect(isOk(response)).toBe(true);
      if (isOk(response)) {
        expect(response.data.message).toBe('success');
      }
    });

    it('should create error responses', () => {
      const response = err('test error');
      expect(isOk(response)).toBe(false);
      if (!isOk(response)) {
        expect(response.error).toBe('test error');
      }
    });

    it('should unwrap successful responses', () => {
      const response = ok({ id: '123' });
      const data = unwrap(response);
      expect(data.id).toBe('123');
    });

    it('should map responses', () => {
      const response = ok({ count: 5 });
      const mapped = map(response, (data) => ({ doubled: data.count * 2 }));
      
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data.doubled).toBe(10);
      }
    });
  });

  describe('Event Schema Validation', () => {
    it('should validate valid event data', () => {
      const validEvent = {
        id: 'evt-123',
        type: 'user.created',
        timestamp: Date.now(),
        data: { userId: 'user-456' }
      };

      const result = EventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.id).toBe('evt-123');
        expect(result.data.type).toBe('user.created');
      }
    });

    it('should reject invalid event data', () => {
      const invalidEvent = {
        id: 'evt-123',
        // missing required fields
        data: { userId: 'user-456' }
      };

      const result = EventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('Package Integration', () => {
    it('should export main functionality', async () => {
      // Test that main exports are available
      const eventBusModule = await import('../src/index');
      expect(eventBusModule).toBeDefined();
    });

    it('should handle async operations with test utils', async () => {
      const asyncOp = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { processed: true };
      };

      const result = await asyncOp();
      const response = ok(result);
      
      expect(isOk(response)).toBe(true);
      if (isOk(response)) {
        expect(response.data.processed).toBe(true);
      }
    });
  });
});
