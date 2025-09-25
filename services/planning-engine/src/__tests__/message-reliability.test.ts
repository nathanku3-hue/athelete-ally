/* @jest-environment node */
// Jest globals are available without import
import { EventBus } from '@athlete-ally/event-bus';
import { EventProcessor } from '../events/processor.ts';

describe('Message Reliability Tests', () => {
  let eventBus: EventBus;
  let eventProcessor: EventProcessor;

  beforeEach(async () => {
    eventBus = new EventBus();
    eventProcessor = new EventProcessor();
    
    // 模拟连接
    jest.spyOn(eventBus, 'connect').mockResolvedValue(undefined);
    jest.spyOn(eventProcessor, 'connect').mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await eventBus.close();
    await eventProcessor.disconnect();
  });

  describe('JetStream Batch Processing', () => {
    it('should process messages in batches without loss', async () => {
      const mockMessages = Array.from({ length: 10 }, (_, i) => ({
        data: new TextEncoder().encode(JSON.stringify({ 
          eventId: `event-${i}`, 
          userId: `user-${i}` 
        })),
        ack: jest.fn(),
        nak: jest.fn()
      }));

      const mockFetch = jest.fn()
        .mockResolvedValueOnce(mockMessages.slice(0, 5))
        .mockResolvedValueOnce(mockMessages.slice(5, 10))
        .mockResolvedValue([]);

      const mockPullSubscribe = jest.fn().mockResolvedValue({
        fetch: mockFetch
      });

      // 模拟JetStream
      const mockJs = {
        pullSubscribe: mockPullSubscribe
      };

      const eventBus = new EventBus();
      (eventBus as any).js = mockJs;

      const processedEvents: any[] = [];
      const handler = jest.fn().mockImplementation((event) => {
        processedEvents.push(event);
        return Promise.resolve();
      });

      // 测试批量处理
      await eventBus.subscribeToOnboardingCompleted(handler);

      // 等待处理完成
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(processedEvents).toHaveLength(10);
      expect(handler).toHaveBeenCalledTimes(10);
    });

    it('should handle errors gracefully with proper NAK/ACK', async () => {
      const mockMessages = [
        {
          data: new TextEncoder().encode(JSON.stringify({ 
            eventId: 'valid-event', 
            userId: 'user-1' 
          })),
          ack: jest.fn(),
          nak: jest.fn()
        },
        {
          data: new TextEncoder().encode(JSON.stringify({ 
            eventId: 'invalid-event' // 缺少userId
          })),
          ack: jest.fn(),
          nak: jest.fn()
        }
      ];

      const mockFetch = jest.fn()
        .mockResolvedValueOnce(mockMessages)
        .mockResolvedValue([]);

      const mockPullSubscribe = jest.fn().mockResolvedValue({
        fetch: mockFetch
      });

      const mockJs = {
        pullSubscribe: mockPullSubscribe
      };

      const eventBus = new EventBus();
      (eventBus as any).js = mockJs;

      const handler = jest.fn().mockResolvedValue(undefined);

      await eventBus.subscribeToOnboardingCompleted(handler);

      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证ACK/NAK调用
      expect(mockMessages[0].ack).toHaveBeenCalled();
      expect(mockMessages[1].nak).toHaveBeenCalled();
    });
  });

  describe('Concurrency Control', () => {
    it('should queue events when concurrency limit is reached', async () => {
      const maxConcurrent = 2;
      const eventProcessor = new EventProcessor();
      
      // 模拟长时间运行的处理函数
      const handler = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      // 启动多个并发任务
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const task = { 
          data: { id: i }, 
          retries: 0, 
          maxRetries: 3, 
          createdAt: new Date() 
        };
        promises.push(
          eventProcessor.subscribe('test', handler, { 
            maxConcurrent, 
            enableConcurrencyControl: true 
          })
        );
      }

      await Promise.allSettled(promises);

      // 验证所有任务都被处理
      expect(handler).toHaveBeenCalledTimes(5);
    });

    it('should not skip events when concurrency limit is reached', async () => {
      const maxConcurrent = 1;
      const eventProcessor = new EventProcessor();
      
      const handler = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 50))
      );

      // 启动多个任务
      const promises = [];
      for (let i = 0; i < 3; i++) {
        const task = { 
          data: { id: i }, 
          retries: 0, 
          maxRetries: 3, 
          createdAt: new Date() 
        };
        promises.push(
          eventProcessor.subscribe('test', handler, { 
            maxConcurrent, 
            enableConcurrencyControl: true 
          })
        );
      }

      await Promise.allSettled(promises);

      // 验证没有事件被跳过
      expect(handler).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Recovery', () => {
    it('should retry temporary errors', async () => {
      const mockMessage = {
        data: new TextEncoder().encode(JSON.stringify({ 
          eventId: 'retry-event', 
          userId: 'user-1' 
        })),
        ack: jest.fn(),
        nak: jest.fn()
      };

      const eventBus = new EventBus();
      const shouldRetry = (eventBus as any).shouldRetry({ code: 'TIMEOUT' });
      expect(shouldRetry).toBe(true);
    });

    it('should not retry permanent errors', async () => {
      const eventBus = new EventBus();
      const shouldNotRetry = (eventBus as any).shouldRetry({ code: 'VALIDATION_ERROR' });
      expect(shouldNotRetry).toBe(false);
    });
  });

  describe('Docker Container Health', () => {
    it('should have all required dependencies', () => {
      // 检查必要的模块是否可用
      expect(() => require('nats')).not.toThrow();
      expect(() => require('ioredis')).not.toThrow();
      expect(() => require('pg')).not.toThrow();
      expect(() => require('@prisma/client')).not.toThrow();
      expect(() => require('fastify')).not.toThrow();
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
