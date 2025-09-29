/**
 * 🔧 环境配置设置脚本
 * 用于快速设置开发环境
 */

import fs from 'fs';
import path from 'path';

const envContent = `# Planning Engine 环境配置
# 开发环境配置

# 数据库配置
PLANNING_DATABASE_URL=postgresql://postgres:password@localhost:5432/planning_db

# Redis配置
REDIS_URL=redis://localhost:6379

# OpenAI配置
OPENAI_API_KEY=your_openai_api_key_here

# NATS配置
NATS_URL=nats://localhost:4222

# 服务配置
NODE_ENV=development
PORT=4102
SERVICE_NAME=planning-engine

# 缓存配置
PLAN_CACHE_TTL_SECONDS=3600

# 限流配置
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# 数据库优化配置
DB_BATCH_SIZE=100
DB_CONNECTION_POOL_SIZE=10
DB_QUERY_TIMEOUT_MS=30000

# LLM配置
LLM_TIMEOUT_MS=25000
LLM_MAX_TOKENS=4000
LLM_TEMPERATURE=0.7
LLM_MAX_RETRIES=2

# 性能优化配置
PLAN_GENERATION_MAX_CONCURRENT=3
PLAN_GENERATION_TIMEOUT_MS=60000
PLAN_GENERATION_RETRY_DELAY_MS=5000

# 监控配置
METRICS_PORT=9466
METRICS_UPDATE_INTERVAL_MS=30000
`;

const envPath = path.join(process.cwd(), '.env');

try {
  // 检查.env文件是否存在
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env 文件已创建');
    console.log('📝 请编辑 .env 文件并填入正确的配置值');
  } else {
    console.log('⚠️  .env 文件已存在，跳过创建');
  }
  
  console.log('\n🔧 环境配置说明：');
  console.log('1. 数据库: 确保PostgreSQL运行在localhost:5432');
  console.log('2. Redis: 确保Redis运行在localhost:6379');
  console.log('3. OpenAI: 需要有效的API密钥');
  console.log('4. NATS: 确保NATS运行在localhost:4222');
  
} catch (error) {
  console.error('❌ 创建.env文件失败:', error.message);
  process.exit(1);
}