import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().transform((v) => Number(v)).default('4102'),
  PLANNING_DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  OPENAI_API_KEY: z.string().optional(),
  
  // 监控配置
  METRICS_PORT: z.string().transform((v) => Number(v)).default('9466'),
  
  // NATS配置
  NATS_URL: z.string().url().default('nats://localhost:4222'),
  
  // NATS并发控制配置
  NATS_MAX_ACK_PENDING: z.string().transform((v) => Number(v)).default('10'), // 最大待确认消息数
  NATS_PROCESSING_TIMEOUT_MS: z.string().transform((v) => Number(v)).default('30000'), // 处理超时时间
  NATS_MAX_DELIVER: z.string().transform((v) => Number(v)).default('3'), // 最大重试次数
  NATS_ACK_WAIT_MS: z.string().transform((v) => Number(v)).default('30000'), // ACK等待时间
  
  // 事件处理并发控制
  EVENT_PROCESSING_MAX_CONCURRENT: z.string().transform((v) => Number(v)).default('5'), // 最大并发处理数
  EVENT_PROCESSING_QUEUE_SIZE: z.string().transform((v) => Number(v)).default('100'), // 处理队列大小
  EVENT_PROCESSING_BATCH_SIZE: z.string().transform((v) => Number(v)).default('1'), // 批处理大小
  
  // LLM 配置
  LLM_TIMEOUT_MS: z.string().transform((v) => Number(v)).default('25000'), // LLM 超时时间
  LLM_MAX_TOKENS: z.string().transform((v) => Number(v)).default('4000'), // LLM 最大令牌数
  LLM_TEMPERATURE: z.string().transform((v) => Number(v)).default('0.7'), // LLM 温度
  LLM_MAX_RETRIES: z.string().transform((v) => Number(v)).default('2'), // LLM 最大重试次数
  
  // 指标更新配置
  METRICS_UPDATE_INTERVAL_MS: z.string().transform((v) => Number(v)).default('30000'), // 指标更新间隔
  
  // 性能优化配置
  PLAN_GENERATION_MAX_CONCURRENT: z.string().transform((v) => Number(v)).default('3'), // 最大并发计划生成数
  PLAN_CACHE_TTL_SECONDS: z.string().transform((v) => Number(v)).default('3600'), // 计划缓存TTL（1小时）
  PLAN_GENERATION_TIMEOUT_MS: z.string().transform((v) => Number(v)).default('60000'), // 计划生成超时时间
  PLAN_GENERATION_RETRY_DELAY_MS: z.string().transform((v) => Number(v)).default('5000'), // 重试延迟时间
  
  // 数据库优化配置
  DB_BATCH_SIZE: z.string().transform((v) => Number(v)).default('100'), // 数据库批处理大小
  DB_CONNECTION_POOL_SIZE: z.string().transform((v) => Number(v)).default('10'), // 数据库连接池大小
  DB_QUERY_TIMEOUT_MS: z.string().transform((v) => Number(v)).default('30000'), // 数据库查询超时时间
});

export const config = (() => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('Invalid environment variables for planning-engine', parsed.error.flatten());
    process.exit(1);
  }
  return parsed.data;
})();