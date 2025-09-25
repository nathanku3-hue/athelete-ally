/**
 * E2E 测试环境设置
 * 配置测试环境变量和全局设置
 */

// 设置测试环境变量
(process.env as any).NODE_ENV = 'test';
(process.env as any).FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
(process.env as any).GATEWAY_BFF_URL = process.env.GATEWAY_BFF_URL || 'http://localhost:4000';
(process.env as any).API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
(process.env as any).NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// 测试专用的环境变量
(process.env as any).OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test_openai_key_for_ci';
(process.env as any).JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_ci';
(process.env as any).ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test_encryption_key_for_ci';
(process.env as any).REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// 禁用遥测
(process.env as any).TELEMETRY_ENABLED = 'false';
(process.env as any).NEXT_TELEMETRY_DISABLED = '1';

// 设置测试超时
jest.setTimeout(60000);

// 全局测试设置
beforeAll(() => {
  console.log('🚀 E2E 测试环境初始化');
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Gateway BFF URL: ${process.env.GATEWAY_BFF_URL}`);
});

afterAll(() => {
  console.log('✅ E2E 测试环境清理完成');
});
