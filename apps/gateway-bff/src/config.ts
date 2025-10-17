import { z } from 'zod';

// 环境变量配置模式
const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().transform((v) => Number(v)).default('4000'),
  
  // 服务URL配置 (local dev defaults)
  PROFILE_ONBOARDING_URL: z.string().url().default('http://localhost:4101'),
  PLANNING_ENGINE_URL: z.string().url().default('http://localhost:4102'),
  EXERCISES_URL: z.string().url().default('http://localhost:4103'),
  FATIGUE_URL: z.string().url().default('http://localhost:4104'),
  WORKOUTS_URL: z.string().url().default('http://localhost:4105'),
  COACHTIP_SERVICE_URL: z.string().url().default('http://localhost:4106'),
  
  // 监控配置
  JAEGER_ENDPOINT: z.string().url().default('http://localhost:16686/api/traces'),
  METRICS_PORT: z.string().transform((v) => Number(v)).default('9464'),
  
  // Redis配置 (用于速率限制)
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  
  // 速率限制配置
  RATE_LIMIT_WINDOW_MS: z.string().transform((v) => Number(v)).default('60000'), // 1分钟窗口
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((v) => Number(v)).default('100'), // 每窗口最大请求数
  RATE_LIMIT_USER_BURST: z.string().transform((v) => Number(v)).default('20'), // 用户突发请求限制
  RATE_LIMIT_SKIP_SUCCESSFUL: z.string().transform((v) => v === 'true').default('false'), // 是否跳过成功请求
  RATE_LIMIT_SKIP_FAILED: z.string().transform((v) => v === 'true').default('false'), // 是否跳过失败请求
  
  // 速率限制存储配置
  RATE_LIMIT_STORE_TYPE: z.enum(['memory', 'redis']).default('redis'),
  RATE_LIMIT_STORE_SIZE: z.string().transform((v) => Number(v)).default('10000'), // 内存存储大小
});

export const config = (() => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('Invalid environment variables for gateway-bff', parsed.error.flatten());
    process.exit(1);
  }
  return parsed.data;
})();
