// 全局测试设置文件
import { jest } from '@jest/globals';

// 设置测试环境变量
(process.env as any).NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.NATS_URL = 'nats://localhost:4222';

// 全局测试超时
jest.setTimeout(15000);

// 全局模拟
global.console = {
  ...console,
  // 在测试中静默 console.log
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 清理函数
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});
