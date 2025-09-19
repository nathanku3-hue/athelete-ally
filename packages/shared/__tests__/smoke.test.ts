import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import { ok, err, isOk, unwrap } from '../tests/test-utils/helpers';

// Test schemas for shared functionality
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(['user', 'admin', 'moderator'])
});

const ConfigSchema = z.object({
  port: z.number().min(1000).max(65535),
  env: z.enum(['development', 'production', 'test']),
  debug: z.boolean()
});

describe('Shared Package Smoke Tests', () => {
  describe('Test Utils Integration', () => {
    it('should handle successful operations', () => {
      const response = ok({ status: 'active' });
      expect(isOk(response)).toBe(true);
      if (isOk(response)) {
        expect(response.data.status).toBe('active');
      }
    });

    it('should handle error operations', () => {
      const response = err('operation failed');
      expect(isOk(response)).toBe(false);
      if (!isOk(response)) {
        expect(response.error).toBe('operation failed');
      }
    });

    it('should unwrap data correctly', () => {
      const response = ok({ count: 42 });
      const data = unwrap(response);
      expect(data.count).toBe(42);
    });
  });

  describe('Schema Validation', () => {
    it('should validate user data', () => {
      const validUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'user' as const
      };

      const result = UserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.role).toBe('user');
      }
    });

    it('should reject invalid user data', () => {
      const invalidUser = {
        id: 'user-123',
        email: 'invalid-email',
        role: 'invalid-role'
      };

      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should validate config data', () => {
      const validConfig = {
        port: 3000,
        env: 'development' as const,
        debug: true
      };

      const result = ConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });
  });

  describe('Package Exports', () => {
    it('should export JWT functionality', async () => {
      const { JWT_SECRET, JWT_EXPIRES_IN } = await import('../src/auth/jwt');
      expect(JWT_SECRET).toBeDefined();
      expect(JWT_EXPIRES_IN).toBeDefined();
    });

    it('should export logger functionality', async () => {
      const loggerModule = await import('../src/logger');
      expect(loggerModule).toBeDefined();
    });

    it('should export security utilities', async () => {
      const { SecureIdGenerator } = await import('../src/security/secure-id');
      expect(SecureIdGenerator).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle async errors gracefully', async () => {
      const failingOp = async () => {
        throw new Error('test error');
      };

      try {
        await failingOp();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('test error');
      }
    });

    it('should create error responses for failed operations', () => {
      const response = err(new Error('operation failed'));
      expect(isOk(response)).toBe(false);
      if (!isOk(response)) {
        expect(response.error).toBeInstanceOf(Error);
      }
    });
  });
});