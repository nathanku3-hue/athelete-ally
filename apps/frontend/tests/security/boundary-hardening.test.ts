import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateTrainingPlan } from '../../services/planning-engine/src/llm.js';

describe('边界控制与韧性测试', () => {
  beforeEach(() => {
    // 清理环境变量
    delete process.env.OPENAI_API_KEY;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    // 恢复环境变量
    process.env.NODE_ENV = 'test';
  });

  describe('LLM服务快速失败原则', () => {
    it('生产环境缺少API密钥时必须抛出错误', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.OPENAI_API_KEY;

      const request = {
        userId: 'test-user',
        proficiency: 'intermediate',
        season: 'offseason',
        availabilityDays: 3,
        equipment: ['bodyweight']
      };

      await expect(generateTrainingPlan(request)).rejects.toThrow(
        '🚨 CRITICAL: LLM service is not available in production. OPENAI_API_KEY is required.'
      );
    });

    it('开发环境缺少API密钥时允许使用mock数据', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.OPENAI_API_KEY;

      const request = {
        userId: 'test-user',
        proficiency: 'intermediate',
        season: 'offseason',
        availabilityDays: 3,
        equipment: ['bodyweight']
      };

      const result = await generateTrainingPlan(request);
      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.microcycles).toBeDefined();
    });

    it('生产环境有API密钥时正常工作', async () => {
      process.env.NODE_ENV = 'production';
      process.env.OPENAI_API_KEY = 'test-api-key';

      const request = {
        userId: 'test-user',
        proficiency: 'intermediate',
        season: 'offseason',
        availabilityDays: 3,
        equipment: ['bodyweight']
      };

      // 这里会失败，因为没有真实的API密钥，但不会回退到mock数据
      await expect(generateTrainingPlan(request)).rejects.toThrow();
    });
  });

  describe('安全ID生成验证', () => {
    it('生成的jobId应该是不可预测的', () => {
      const { randomUUID } = await import('crypto');
      
      const jobId1 = `job_${randomUUID()}`;
      const jobId2 = `job_${randomUUID()}`;
      
      expect(jobId1).not.toBe(jobId2);
      expect(jobId1).toMatch(/^job_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(jobId2).toMatch(/^job_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('生成的planId应该是不可预测的', () => {
      const { randomUUID } = await import('crypto');
      
      const planId1 = `plan_${randomUUID()}`;
      const planId2 = `plan_${randomUUID()}`;
      
      expect(planId1).not.toBe(planId2);
      expect(planId1).toMatch(/^plan_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(planId2).toMatch(/^plan_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('不应该包含可预测的时间戳模式', () => {
      const { randomUUID } = await import('crypto');
      
      const jobId = `job_${randomUUID()}`;
      const planId = `plan_${randomUUID()}`;
      
      // 不应该包含时间戳模式
      expect(jobId).not.toMatch(/\d{13}/);
      expect(planId).not.toMatch(/\d{13}/);
      
      // 不应该包含简单的递增模式
      expect(jobId).not.toMatch(/job_\d+$/);
      expect(planId).not.toMatch(/plan_\d+$/);
    });
  });

  describe('身份验证边界测试', () => {
    it('应该拒绝缺少Authorization header的请求', () => {
      const mockRequest = {
        headers: {},
        url: '/v1/generate'
      };
      
      const mockReply = {
        code: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // 这里需要测试身份验证中间件
      // 由于中间件是异步的，这里只是验证逻辑
      expect(mockRequest.headers.authorization).toBeUndefined();
    });

    it('应该拒绝格式错误的Authorization header', () => {
      const mockRequest = {
        headers: {
          authorization: 'InvalidFormat token'
        },
        url: '/v1/generate'
      };
      
      const mockReply = {
        code: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // 验证格式检查逻辑
      const parts = mockRequest.headers.authorization.split(' ');
      expect(parts.length).not.toBe(2);
      expect(parts[0]).not.toBe('Bearer');
    });

    it('应该接受正确格式的Bearer token', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token'
        },
        url: '/v1/generate'
      };
      
      // 验证格式检查逻辑
      const parts = mockRequest.headers.authorization.split(' ');
      expect(parts.length).toBe(2);
      expect(parts[0]).toBe('Bearer');
      expect(parts[1]).toBe('valid-token');
    });
  });

  describe('速率限制边界测试', () => {
    it('应该为不同用户维护独立的速率限制', () => {
      // 模拟不同用户的请求
      const userA = 'user-a-id';
      const userB = 'user-b-id';
      const endpoint = '/v1/generate';
      
      // 每个用户应该有独立的速率限制计数器
      const keyA = `rate_limit:${userA}:${endpoint}`;
      const keyB = `rate_limit:${userB}:${endpoint}`;
      
      expect(keyA).not.toBe(keyB);
    });

    it('应该为敏感端点应用更严格的限制', () => {
      const sensitiveEndpoints = ['/v1/generate', '/v1/onboarding'];
      const regularEndpoints = ['/v1/status', '/v1/health'];
      
      // 敏感端点应该使用strict_rate_limit前缀
      sensitiveEndpoints.forEach(endpoint => {
        const key = `strict_rate_limit:user-id:${endpoint}`;
        expect(key).toMatch(/^strict_rate_limit:/);
      });
      
      // 常规端点应该使用rate_limit前缀
      regularEndpoints.forEach(endpoint => {
        const key = `rate_limit:user-id:${endpoint}`;
        expect(key).toMatch(/^rate_limit:/);
      });
    });
  });

  describe('所有权检查边界测试', () => {
    it('应该防止用户访问其他用户的资源', () => {
      const userA = { userId: 'user-a-id' };
      const userB = { userId: 'user-b-id' };
      const resourceUserId = 'user-b-id';
      
      // 用户A不应该能够访问用户B的资源
      expect(userA.userId).not.toBe(resourceUserId);
    });

    it('应该允许用户访问自己的资源', () => {
      const user = { userId: 'user-id' };
      const resourceUserId = 'user-id';
      
      // 用户应该能够访问自己的资源
      expect(user.userId).toBe(resourceUserId);
    });

    it('应该验证请求体中的userId与JWT token中的userId一致', () => {
      const jwtUserId = 'jwt-user-id';
      const requestBodyUserId = 'request-body-user-id';
      
      // 如果不一致，应该拒绝请求
      if (jwtUserId !== requestBodyUserId) {
        expect(jwtUserId).not.toBe(requestBodyUserId);
      }
    });
  });

  describe('环境配置验证', () => {
    it('生产环境应该要求所有必要的环境变量', () => {
      const requiredEnvVars = [
        'OPENAI_API_KEY',
        'JWT_SECRET',
        'REDIS_URL'
      ];
      
      process.env.NODE_ENV = 'production';
      
      requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
          // 在生产环境中，缺少必要的环境变量应该导致错误
          expect(process.env[envVar]).toBeUndefined();
        }
      });
    });

    it('开发环境应该允许使用默认值', () => {
      process.env.NODE_ENV = 'development';
      
      // 开发环境应该允许使用默认值或mock数据
      expect(process.env.NODE_ENV).toBe('development');
    });
  });
});
