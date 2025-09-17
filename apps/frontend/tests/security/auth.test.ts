import { describe, it, expect, beforeEach } from 'vitest';
import { JWTManager, SecurityContextManager } from '@athlete-ally/shared';

describe('JWT Authentication Security', () => {
  beforeEach(() => {
    // 清理安全上下文
    SecurityContextManager.clearContext('test-request-id');
  });

  describe('JWT Token Generation and Validation', () => {
    it('should generate valid JWT token', () => {
      const payload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'user' as const
      };

      const token = JWTManager.generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify valid JWT token', () => {
      const payload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'user' as const
      };

      const token = JWTManager.generateToken(payload);
      const decoded = JWTManager.verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should reject invalid JWT token', () => {
      expect(() => {
        JWTManager.verifyToken('invalid-token');
      }).toThrow('JWT verification failed');
    });

    it('should reject expired JWT token', () => {
      // 创建一个已过期的token（这里需要模拟，实际测试中可能需要调整时间）
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTYwOTQ1NjAwMCwiZXhwIjoxNjA5NDU2MDAwfQ.invalid';
      
      expect(() => {
        JWTManager.verifyToken(expiredToken);
      }).toThrow();
    });
  });

  describe('Authorization Header Parsing', () => {
    it('should extract token from valid Authorization header', () => {
      const token = 'valid-jwt-token';
      const authHeader = `Bearer ${token}`;
      
      const extractedToken = JWTManager.extractTokenFromHeader(authHeader);
      expect(extractedToken).toBe(token);
    });

    it('should reject missing Authorization header', () => {
      expect(() => {
        JWTManager.extractTokenFromHeader(undefined);
      }).toThrow('Authorization header is required');
    });

    it('should reject invalid Authorization header format', () => {
      expect(() => {
        JWTManager.extractTokenFromHeader('InvalidFormat token');
      }).toThrow('Invalid authorization header format');
    });

    it('should reject Authorization header without Bearer', () => {
      expect(() => {
        JWTManager.extractTokenFromHeader('token');
      }).toThrow('Invalid authorization header format');
    });
  });

  describe('Security Context Management', () => {
    it('should set and get security context', () => {
      const requestId = 'test-request-id';
      const user = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'user' as const
      };

      SecurityContextManager.setContext(requestId, user);
      const context = SecurityContextManager.getContext(requestId);

      expect(context).toBeDefined();
      expect(context?.user).toEqual(user);
      expect(context?.requestId).toBe(requestId);
    });

    it('should verify ownership correctly', () => {
      const requestId = 'test-request-id';
      const user = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'user' as const
      };

      SecurityContextManager.setContext(requestId, user);

      // 相同用户ID应该通过验证
      expect(SecurityContextManager.verifyOwnership(requestId, user.userId)).toBe(true);

      // 不同用户ID应该失败
      expect(SecurityContextManager.verifyOwnership(requestId, 'different-user-id')).toBe(false);
    });

    it('should clear security context', () => {
      const requestId = 'test-request-id';
      const user = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'user' as const
      };

      SecurityContextManager.setContext(requestId, user);
      expect(SecurityContextManager.getContext(requestId)).toBeDefined();

      SecurityContextManager.clearContext(requestId);
      expect(SecurityContextManager.getContext(requestId)).toBeUndefined();
    });
  });
});
