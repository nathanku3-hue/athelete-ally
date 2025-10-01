// 设置测试环境变量 - 使用默认值避免连接问题
process.env.PLANNING_DATABASE_URL ??= 'file:./tmp/test.db';
process.env.REDIS_URL ??= 'redis://localhost:6379';
process.env.NATS_URL ??= 'nats://localhost:4223';
process.env.OPENAI_API_KEY ??= 'test-key';
// NODE_ENV is read-only in Jest environment, skip setting it

// 设置其他必需的环境变量
process.env.PORT ??= '4102';
process.env.METRICS_PORT ??= '9466';
process.env.NATS_MAX_ACK_PENDING ??= '10';
process.env.NATS_PROCESSING_TIMEOUT_MS ??= '30000';
process.env.NATS_MAX_DELIVER ??= '3';
process.env.NATS_ACK_WAIT_MS ??= '30000';
process.env.EVENT_PROCESSING_MAX_CONCURRENT ??= '5';
process.env.EVENT_PROCESSING_QUEUE_SIZE ??= '100';
process.env.EVENT_PROCESSING_BATCH_SIZE ??= '1';
process.env.LLM_TIMEOUT_MS ??= '25000';
process.env.LLM_MAX_TOKENS ??= '4000';
process.env.LLM_TEMPERATURE ??= '0.7';
process.env.LLM_MAX_RETRIES ??= '2';
process.env.METRICS_UPDATE_INTERVAL_MS ??= '30000';
process.env.PLAN_GENERATION_MAX_CONCURRENT ??= '3';
process.env.PLAN_CACHE_TTL_SECONDS ??= '3600';
process.env.PLAN_GENERATION_TIMEOUT_MS ??= '60000';
process.env.PLAN_GENERATION_RETRY_DELAY_MS ??= '5000';
process.env.DB_BATCH_SIZE ??= '100';
process.env.DB_CONNECTION_POOL_SIZE ??= '10';
process.env.DB_QUERY_TIMEOUT_MS ??= '30000';
