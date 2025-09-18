import { describe, it, expect, beforeEach } from 'vitest';
import { SecurityContextManager } from '@athlete-ally/shared';

describe('IDOR (Insecure Direct Object Reference) Protection', () => {
  beforeEach(() => {
    // 清理安全上下文
    SecurityContextManager.clearContext('user-a-request');
    SecurityContextManager.clearContext('user-b-request');
  });

  describe('User A vs User B Access Control', () => {
    it('should allow user A to access their own resources', () => {
      const userA = {
        userId: 'user-a-id',
        email: 'user-a@example.com',
        role: 'user' as const
      };

      const requestId = 'user-a-request';
      SecurityContextManager.setContext(requestId, userA);

      // 用户A应该能够访问自己的资源
      expect(SecurityContextManager.verifyOwnership(requestId, 'user-a-id')).toBe(true);
    });

    it('should deny user A access to user B resources', () => {
      const userA = {
        userId: 'user-a-id',
        email: 'user-a@example.com',
        role: 'user' as const
      };

      const requestId = 'user-a-request';
      SecurityContextManager.setContext(requestId, userA);

      // 用户A不应该能够访问用户B的资源
      expect(SecurityContextManager.verifyOwnership(requestId, 'user-b-id')).toBe(false);
    });

    it('should deny user B access to user A resources', () => {
      const userB = {
        userId: 'user-b-id',
        email: 'user-b@example.com',
        role: 'user' as const
      };

      const requestId = 'user-b-request';
      SecurityContextManager.setContext(requestId, userB);

      // 用户B不应该能够访问用户A的资源
      expect(SecurityContextManager.verifyOwnership(requestId, 'user-a-id')).toBe(false);
    });

    it('should handle missing context gracefully', () => {
      const requestId = 'non-existent-request';

      // 不存在的上下文应该返回false
      expect(SecurityContextManager.verifyOwnership(requestId, 'any-user-id')).toBe(false);
    });
  });

  describe('Resource Access Scenarios', () => {
    it('should protect plan generation requests', () => {
      const userA = {
        userId: 'user-a-id',
        email: 'user-a@example.com',
        role: 'user' as const
      };

      const requestId = 'user-a-plan-request';
      SecurityContextManager.setContext(requestId, userA);

      // 模拟计划生成请求的所有权检查
      const requestedUserId = 'user-a-id'; // 从请求体获取
      const authenticatedUserId = userA.userId; // 从JWT token获取

      expect(authenticatedUserId).toBe(requestedUserId);
      expect(SecurityContextManager.verifyOwnership(requestId, requestedUserId)).toBe(true);
    });

    it('should protect job status queries', () => {
      const userA = {
        userId: 'user-a-id',
        email: 'user-a@example.com',
        role: 'user' as const
      };

      const requestId = 'user-a-status-request';
      SecurityContextManager.setContext(requestId, userA);

      // 模拟job状态查询的所有权检查
      const jobOwnerId = 'user-a-id'; // 从数据库查询获取
      const authenticatedUserId = userA.userId; // 从JWT token获取

      expect(authenticatedUserId).toBe(jobOwnerId);
      expect(SecurityContextManager.verifyOwnership(requestId, jobOwnerId)).toBe(true);
    });

    it('should prevent cross-user data access', () => {
      const userA = {
        userId: 'user-a-id',
        email: 'user-a@example.com',
        role: 'user' as const
      };

      const requestId = 'user-a-request';
      SecurityContextManager.setContext(requestId, userA);

      // 模拟尝试访问用户B的数据
      const userBData = {
        userId: 'user-b-id',
        planId: 'plan-b-123',
        jobId: 'job-b-456'
      };

      // 用户A不应该能够访问用户B的数据
      expect(SecurityContextManager.verifyOwnership(requestId, userBData.userId)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user IDs', () => {
      const user = {
        userId: '',
        email: 'test@example.com',
        role: 'user' as const
      };

      const requestId = 'empty-user-request';
      SecurityContextManager.setContext(requestId, user);

      expect(SecurityContextManager.verifyOwnership(requestId, '')).toBe(true);
      expect(SecurityContextManager.verifyOwnership(requestId, 'any-other-id')).toBe(false);
    });

    it('should handle null/undefined resource user IDs', () => {
      const user = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'user' as const
      };

      const requestId = 'null-resource-request';
      SecurityContextManager.setContext(requestId, user);

      // 空字符串应该匹配
      expect(SecurityContextManager.verifyOwnership(requestId, '')).toBe(false);
    });

    it('should handle case sensitivity', () => {
      const user = {
        userId: 'User-ID',
        email: 'test@example.com',
        role: 'user' as const
      };

      const requestId = 'case-sensitive-request';
      SecurityContextManager.setContext(requestId, user);

      // 大小写敏感的比较
      expect(SecurityContextManager.verifyOwnership(requestId, 'User-ID')).toBe(true);
      expect(SecurityContextManager.verifyOwnership(requestId, 'user-id')).toBe(false);
    });
  });

  describe('Security Context Lifecycle', () => {
    it('should clear context after request completion', () => {
      const user = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'user' as const
      };

      const requestId = 'lifecycle-request';
      SecurityContextManager.setContext(requestId, user);

      // 上下文应该存在
      expect(SecurityContextManager.getContext(requestId)).toBeDefined();
      expect(SecurityContextManager.verifyOwnership(requestId, 'user-id')).toBe(true);

      // 清理上下文
      SecurityContextManager.clearContext(requestId);

      // 上下文应该被清理
      expect(SecurityContextManager.getContext(requestId)).toBeUndefined();
      expect(SecurityContextManager.verifyOwnership(requestId, 'user-id')).toBe(false);
    });

    it('should handle multiple concurrent requests', () => {
      const userA = {
        userId: 'user-a-id',
        email: 'user-a@example.com',
        role: 'user' as const
      };

      const userB = {
        userId: 'user-b-id',
        email: 'user-b@example.com',
        role: 'user' as const
      };

      const requestAId = 'concurrent-request-a';
      const requestBId = 'concurrent-request-b';

      SecurityContextManager.setContext(requestAId, userA);
      SecurityContextManager.setContext(requestBId, userB);

      // 每个请求应该只能访问自己的资源
      expect(SecurityContextManager.verifyOwnership(requestAId, 'user-a-id')).toBe(true);
      expect(SecurityContextManager.verifyOwnership(requestAId, 'user-b-id')).toBe(false);

      expect(SecurityContextManager.verifyOwnership(requestBId, 'user-b-id')).toBe(true);
      expect(SecurityContextManager.verifyOwnership(requestBId, 'user-a-id')).toBe(false);
    });
  });
});
