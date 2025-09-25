/**
 * E2E 测试环境设置
 * 配置测试环境变量和全局设置
 */

// 设置测试环境变量
// @ts-expect-error - 测试环境需要设置环境变量
process.env.NODE_ENV = 'test';
// @ts-expect-error
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
// @ts-expect-error
process.env.GATEWAY_BFF_URL = process.env.GATEWAY_BFF_URL || 'http://localhost:4000';
// @ts-expect-error
process.env.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
// @ts-expect-error
process.env.NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// 测试专用的环境变量
// @ts-expect-error
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test_openai_key_for_ci';
// @ts-expect-error
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_ci';
// @ts-expect-error
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test_encryption_key_for_ci';
// @ts-expect-error
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// 禁用遥测
// @ts-expect-error
process.env.TELEMETRY_ENABLED = 'false';
// @ts-expect-error
process.env.NEXT_TELEMETRY_DISABLED = '1';

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
