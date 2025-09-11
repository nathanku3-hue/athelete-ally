// 设置测试环境变量
process.env.PLANNING_DATABASE_URL = 'postgresql://test:test@localhost:5432/test_planning';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.NATS_URL = 'nats://localhost:4222';
process.env.OPENAI_API_KEY = 'test-key';
process.env.NODE_ENV = 'test';
