import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import { ok, err, isOk, unwrap } from '../tests/test-utils/helpers';

// Test schemas for protocol types
const ProtocolSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['STANDARD', 'TOP_SET_AMRAP', 'MAX_STRENGTH_TEST']),
  exercises: z.array(z.object({
    id: z.string(),
    name: z.string(),
    sets: z.number().min(1),
    reps: z.number().min(1),
    weight: z.number().min(0)
  }))
});

const BlockSchema = z.object({
  id: z.string(),
  protocolId: z.string(),
  week: z.number().min(1).max(52),
  day: z.number().min(1).max(7),
  exercises: z.array(z.string())
});

describe('Protocol Types Package Smoke Tests', () => {
  describe('Test Utils Integration', () => {
    it('should handle successful protocol operations', () => {
      const response = ok({ protocolId: 'proto-123', status: 'active' });
      expect(isOk(response)).toBe(true);
      if (isOk(response)) {
        expect(response.data.protocolId).toBe('proto-123');
      }
    });

    it('should handle protocol errors', () => {
      const response = err({ code: 'PROTOCOL_NOT_FOUND', message: 'Protocol does not exist' });
      expect(isOk(response)).toBe(false);
      if (!isOk(response)) {
        expect(response.error).toBeDefined();
      }
    });

    it('should unwrap protocol data', () => {
      const response = ok({ count: 5 });
      const data = unwrap(response);
      expect(data.count).toBe(5);
    });
  });

  describe('Protocol Schema Validation', () => {
    it('should validate standard protocol', () => {
      const validProtocol = {
        id: 'proto-123',
        name: '5/3/1 Strength',
        type: 'STANDARD' as const,
        exercises: [
          {
            id: 'squat',
            name: 'Back Squat',
            sets: 3,
            reps: 5,
            weight: 100
          },
          {
            id: 'bench',
            name: 'Bench Press',
            sets: 3,
            reps: 5,
            weight: 80
          }
        ]
      };

      const result = ProtocolSchema.safeParse(validProtocol);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.type).toBe('STANDARD');
        expect(result.data.exercises).toHaveLength(2);
      }
    });

    it('should validate top set AMRAP protocol', () => {
      const validProtocol = {
        id: 'proto-456',
        name: 'AMRAP Protocol',
        type: 'TOP_SET_AMRAP' as const,
        exercises: [
          {
            id: 'deadlift',
            name: 'Deadlift',
            sets: 1,
            reps: 1,
            weight: 200
          }
        ]
      };

      const result = ProtocolSchema.safeParse(validProtocol);
      expect(result.success).toBe(true);
    });

    it('should validate max strength test protocol', () => {
      const validProtocol = {
        id: 'proto-789',
        name: 'Max Strength Test',
        type: 'MAX_STRENGTH_TEST' as const,
        exercises: [
          {
            id: 'squat',
            name: 'Back Squat',
            sets: 1,
            reps: 1,
            weight: 150
          }
        ]
      };

      const result = ProtocolSchema.safeParse(validProtocol);
      expect(result.success).toBe(true);
    });
  });

  describe('Block Schema Validation', () => {
    it('should validate training block', () => {
      const validBlock = {
        id: 'block-123',
        protocolId: 'proto-123',
        week: 1,
        day: 1,
        exercises: ['squat', 'bench', 'deadlift']
      };

      const result = BlockSchema.safeParse(validBlock);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.week).toBe(1);
        expect(result.data.exercises).toHaveLength(3);
      }
    });

    it('should reject invalid block data', () => {
      const invalidBlock = {
        id: 'block-123',
        protocolId: 'proto-123',
        week: 0, // invalid week
        day: 8, // invalid day
        exercises: []
      };

      const result = BlockSchema.safeParse(invalidBlock);
      expect(result.success).toBe(false);
    });
  });

  describe('Package Integration', () => {
    it('should export protocol types', async () => {
      const types = await import('../src/index');
      expect(types).toBeDefined();
    });

    it('should handle protocol operations with test utils', () => {
      const protocolOp = () => {
        return { id: 'proto-123', name: 'Test Protocol' };
      };

      const result = protocolOp();
      const response = ok(result);
      
      expect(isOk(response)).toBe(true);
      if (isOk(response)) {
        expect(response.data.id).toBe('proto-123');
      }
    });

    it('should handle complex protocol structures', () => {
      const complexProtocol = {
        id: 'proto-complex',
        name: 'Complex Training Protocol',
        type: 'STANDARD' as const,
        exercises: [
          { id: 'squat', name: 'Squat', sets: 3, reps: 5, weight: 100 },
          { id: 'bench', name: 'Bench', sets: 3, reps: 5, weight: 80 },
          { id: 'deadlift', name: 'Deadlift', sets: 1, reps: 5, weight: 120 }
        ],
        metadata: {
          created: Date.now(),
          version: '1.0',
          tags: ['strength', 'powerlifting']
        }
      };

      const response = ok(complexProtocol);
      expect(isOk(response)).toBe(true);
      if (isOk(response)) {
        expect(response.data.exercises).toHaveLength(3);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle protocol validation errors', () => {
      const invalidProtocol = {
        id: 'proto-invalid',
        name: 'Invalid Protocol',
        type: 'INVALID_TYPE', // not in enum
        exercises: [] // empty exercises
      };

      const result = ProtocolSchema.safeParse(invalidProtocol);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const response = err(result.error);
        expect(isOk(response)).toBe(false);
      }
    });

    it('should handle async protocol operations', async () => {
      const asyncProtocolOp = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { id: 'async-proto', status: 'loaded' };
      };

      const result = await asyncProtocolOp();
      const response = ok(result);
      
      expect(isOk(response)).toBe(true);
      if (isOk(response)) {
        expect(response.data.status).toBe('loaded');
      }
    });
  });
});