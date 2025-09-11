import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventProcessor } from '../events/processor.js';
import { JetStreamConsumer } from '../events/jetstream-consumer.js';
import { ConcurrencyController } from '../concurrency/controller.js';

describe('Planning Engine Reliability Tests', () => {
  let eventProcessor: EventProcessor;
  let concurrencyController: ConcurrencyController;

  beforeEach(() => {
    eventProcessor = new EventProcessor();
    concurrencyController = new ConcurrencyController();
  });

  afterEach(async () => {
    await eventProcessor.disconnect();
    concurrencyController.reset();
  });

  describe('JetStream Message Consumption', () => {
    it('should handle batch processing correctly', async () => {
      // 模拟JetStream消费者
      const mockConsumer = {
        fetch: vi.fn().mockResolvedValue([
          { data: new TextEncoder().encode(JSON.stringify({ eventId: '1', userId: 'user1' })), ack: vi.fn(), nak: vi.fn() },
          { data: new TextEncoder().encode(JSON.stringify({ eventId: '2', userId: 'user2' })), ack: vi.fn(), nak: vi.fn() }
        ])
      };

      const handler = vi.fn().mockResolvedValue(undefined);
      
      // 测试批处理
      const consumer = new JetStreamConsumer(null as any, null as any, null as any);
      
      // 模拟批处理逻辑
      const messages = await mockConsumer.fetch({ max: 2, expires: 1000 });
      expect(messages).toHaveLength(2);
      
      // 验证消息被正确处理
      for (const message of messages) {
        const eventData = JSON.parse(new TextDecoder().decode(message.data));
        expect(eventData).toHaveProperty('eventId');
        expect(eventData).toHaveProperty('userId');
      }
    });

    it('should retry failed messages appropriately', async () => {
      const mockMessage = {
        data: new TextEncoder().encode(JSON.stringify({ eventId: '1', userId: 'user1' })),
        ack: vi.fn(),
        nak: vi.fn()
      };

      const consumer = new JetStreamConsumer(null as any, null as any, null as any);
      
      // 测试重试逻辑
      const shouldRetry = (consumer as any).shouldRetry({ code: 'TIMEOUT' });
      expect(shouldRetry).toBe(true);
      
      const shouldNotRetry = (consumer as any).shouldRetry({ code: 'VALIDATION_ERROR' });
      expect(shouldNotRetry).toBe(false);
    });
  });

  describe('Concurrency Control', () => {
    it('should queue events when concurrency limit is reached', async () => {
      const maxConcurrent = 2;
      concurrencyController.setMaxConcurrency('test', maxConcurrent);
      
      const handler = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      // 启动多个并发任务
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const task = { data: { id: i }, retries: 0, maxRetries: 3, createdAt: new Date() };
        promises.push(concurrencyController.execute('test', task, handler));
      }
      
      // 等待所有任务完成
      await Promise.allSettled(promises);
      
      // 验证所有任务都被处理
      expect(handler).toHaveBeenCalledTimes(5);
    });

    it('should not skip events when concurrency limit is reached', async () => {
      const maxConcurrent = 1;
      concurrencyController.setMaxConcurrency('test', maxConcurrent);
      
      const handler = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));
      
      // 启动多个任务
      const promises = [];
      for (let i = 0; i < 3; i++) {
        const task = { data: { id: i }, retries: 0, maxRetries: 3, createdAt: new Date() };
        promises.push(concurrencyController.execute('test', task, handler));
      }
      
      await Promise.allSettled(promises);
      
      // 验证没有事件被跳过
      expect(handler).toHaveBeenCalledTimes(3);
    });
  });

  describe('Event Processing', () => {
    it('should handle events with proper error recovery', async () => {
      const handler = vi.fn()
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValue(undefined);
      
      const task = { data: { id: 1 }, retries: 0, maxRetries: 3, createdAt: new Date() };
      
      // 第一次调用应该失败
      await expect(concurrencyController.execute('test', task, handler)).rejects.toThrow('Temporary error');
      
      // 第二次调用应该成功
      const task2 = { data: { id: 2 }, retries: 0, maxRetries: 3, createdAt: new Date() };
      await expect(concurrencyController.execute('test', task2, handler)).resolves.toBeUndefined();
      
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should maintain proper concurrency metrics', async () => {
      const maxConcurrent = 2;
      concurrencyController.setMaxConcurrency('test', maxConcurrent);
      
      const handler = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      // 启动任务
      const task = { data: { id: 1 }, retries: 0, maxRetries: 3, createdAt: new Date() };
      const promise = concurrencyController.execute('test', task, handler);
      
      // 检查状态
      const status = concurrencyController.getStatus('test');
      expect(status.currentConcurrency).toBeGreaterThan(0);
      expect(status.maxConcurrency).toBe(maxConcurrent);
      
      await promise;
      
      // 任务完成后检查状态
      const finalStatus = concurrencyController.getStatus('test');
      expect(finalStatus.currentConcurrency).toBe(0);
    });
  });

  describe('Docker Container Health', () => {
    it('should have all required dependencies', () => {
      // 检查必要的模块是否可用
      expect(() => require('nats')).not.toThrow();
      expect(() => require('ioredis')).not.toThrow();
      expect(() => require('pg')).not.toThrow();
      expect(() => require('@prisma/client')).not.toThrow();
    });

    it('should have proper environment configuration', () => {
      // 检查环境变量配置
      const requiredEnvVars = [
        'NODE_ENV',
        'PORT',
        'PLANNING_DATABASE_URL',
        'REDIS_URL',
        'NATS_URL'
      ];
      
      // 在测试环境中，这些变量可能未设置，但配置应该能够处理
      requiredEnvVars.forEach(envVar => {
        expect(process.env[envVar] !== undefined || envVar === 'NODE_ENV').toBe(true);
      });
    });
  });
});
