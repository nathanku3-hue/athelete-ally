/**
 * 🔧 环境配置管理
 * 统一管理所有环境变量和配置
 */

import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PLANNING_PORT: z.string().default('4102'),
  PLANNING_DATABASE_URL: z.string().min(1, 'Database URL is required'),
  REDIS_URL: z.string().min(1, 'Redis URL is required'),
  NATS_URL: z.string().min(1, 'NATS URL is required'),
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  JWT_SECRET: z.string().optional().default('default-jwt-secret-that-is-long-enough-for-development-purposes'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  CACHE_TTL: z.string().default('3600'), // 1 hour
  HEALTH_CHECK_TIMEOUT: z.string().default('5000'), // 5 seconds
  PLAN_CACHE_TTL_SECONDS: z.string().default('3600'),
  DB_BATCH_SIZE: z.string().default('100'),
  DB_CONNECTION_POOL_SIZE: z.string().default('10'),
  DB_QUERY_TIMEOUT_MS: z.string().default('30000'),
  LLM_TIMEOUT_MS: z.string().default('25000'),
  LLM_MAX_TOKENS: z.string().default('4000'),
  LLM_TEMPERATURE: z.string().default('0.7'),
  LLM_MAX_RETRIES: z.string().default('2'),
  PLAN_GENERATION_MAX_CONCURRENT: z.string().default('3'),
  PLAN_GENERATION_TIMEOUT_MS: z.string().default('60000'),
  PLAN_GENERATION_RETRY_DELAY_MS: z.string().default('5000'),
  METRICS_PORT: z.string().default('9466'),
  METRICS_UPDATE_INTERVAL_MS: z.string().default('30000'),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(): Environment {
  try {
    return environmentSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.reduce((acc, err) => {
        const field = err.path.join('.');
        acc[field] = err.message;
        return acc;
      }, {} as Record<string, string>);

      console.error('❌ Invalid environment variables:', {
        formErrors: [],
        fieldErrors,
      });
      
      throw new Error('Environment validation failed');
    }
    throw error;
  }
}

export const config = validateEnvironment();

// 导出配置对象，保持向后兼容
export const configObject = {
  NODE_ENV: config.NODE_ENV,
  PORT: parseInt(config.PLANNING_PORT),
  PLANNING_DATABASE_URL: config.PLANNING_DATABASE_URL,
  REDIS_URL: config.REDIS_URL,
  NATS_URL: config.NATS_URL,
  OPENAI_API_KEY: config.OPENAI_API_KEY,
  JWT_SECRET: config.JWT_SECRET,
  LOG_LEVEL: config.LOG_LEVEL,
  RATE_LIMIT_WINDOW_MS: parseInt(config.RATE_LIMIT_WINDOW_MS),
  RATE_LIMIT_MAX_REQUESTS: parseInt(config.RATE_LIMIT_MAX_REQUESTS),
  CACHE_TTL: parseInt(config.CACHE_TTL),
  HEALTH_CHECK_TIMEOUT: parseInt(config.HEALTH_CHECK_TIMEOUT),
  PLAN_CACHE_TTL_SECONDS: parseInt(config.PLAN_CACHE_TTL_SECONDS),
  DB_BATCH_SIZE: parseInt(config.DB_BATCH_SIZE),
  DB_CONNECTION_POOL_SIZE: parseInt(config.DB_CONNECTION_POOL_SIZE),
  DB_QUERY_TIMEOUT_MS: parseInt(config.DB_QUERY_TIMEOUT_MS),
  LLM_TIMEOUT_MS: parseInt(config.LLM_TIMEOUT_MS),
  LLM_MAX_TOKENS: parseInt(config.LLM_MAX_TOKENS),
  LLM_TEMPERATURE: parseFloat(config.LLM_TEMPERATURE),
  LLM_MAX_RETRIES: parseInt(config.LLM_MAX_RETRIES),
  PLAN_GENERATION_MAX_CONCURRENT: parseInt(config.PLAN_GENERATION_MAX_CONCURRENT),
  PLAN_GENERATION_TIMEOUT_MS: parseInt(config.PLAN_GENERATION_TIMEOUT_MS),
  PLAN_GENERATION_RETRY_DELAY_MS: parseInt(config.PLAN_GENERATION_RETRY_DELAY_MS),
  METRICS_PORT: parseInt(config.METRICS_PORT),
  METRICS_UPDATE_INTERVAL_MS: parseInt(config.METRICS_UPDATE_INTERVAL_MS),
};
