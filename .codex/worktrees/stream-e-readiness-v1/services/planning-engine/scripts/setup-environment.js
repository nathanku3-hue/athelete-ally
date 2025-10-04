/**
 * 🔧 环境配置设置脚本
 * 用于快速设置开发和生产环境
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 环境配置模板
const envConfigs = {
  development: {
    NODE_ENV: 'development',
    PORT: '4102',
    SERVICE_NAME: 'planning-engine',
    
    // 数据库配置
    PLANNING_DATABASE_URL: 'postgresql://postgres:password@localhost:5432/planning_engine_dev',
    
    // Redis配置
    REDIS_URL: 'redis://localhost:6379',
    
    // OpenAI配置
    OPENAI_API_KEY: 'your_openai_api_key_here',
    
    // NATS配置
    NATS_URL: 'nats://localhost:4223',
    
    // 缓存配置
    PLAN_CACHE_TTL_SECONDS: '3600',
    
    // 限流配置
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX_REQUESTS: '100',
    
    // 数据库优化配置
    DB_BATCH_SIZE: '100',
    DB_CONNECTION_POOL_SIZE: '10',
    DB_QUERY_TIMEOUT_MS: '30000',
    
    // LLM配置
    LLM_TIMEOUT_MS: '25000',
    LLM_MAX_TOKENS: '4000',
    LLM_TEMPERATURE: '0.7',
    LLM_MAX_RETRIES: '2',
    
    // 性能优化配置
    PLAN_GENERATION_MAX_CONCURRENT: '3',
    PLAN_GENERATION_TIMEOUT_MS: '60000',
    PLAN_GENERATION_RETRY_DELAY_MS: '5000',
    
    // 监控配置
    METRICS_PORT: '9466',
    METRICS_UPDATE_INTERVAL_MS: '30000'
  },
  
  production: {
    NODE_ENV: 'production',
    PORT: '4102',
    SERVICE_NAME: 'planning-engine',
    
    // 数据库配置
    PLANNING_DATABASE_URL: 'postgresql://postgres:password@postgres:5432/planning_engine',
    
    // Redis配置
    REDIS_URL: 'redis://redis:6379',
    
    // OpenAI配置
    OPENAI_API_KEY: '${OPENAI_API_KEY}',
    
    // NATS配置
    NATS_URL: 'nats://nats:4223',
    
    // 缓存配置
    PLAN_CACHE_TTL_SECONDS: '3600',
    
    // 限流配置
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX_REQUESTS: '100',
    
    // 数据库优化配置
    DB_BATCH_SIZE: '100',
    DB_CONNECTION_POOL_SIZE: '10',
    DB_QUERY_TIMEOUT_MS: '30000',
    
    // LLM配置
    LLM_TIMEOUT_MS: '25000',
    LLM_MAX_TOKENS: '4000',
    LLM_TEMPERATURE: '0.7',
    LLM_MAX_RETRIES: '2',
    
    // 性能优化配置
    PLAN_GENERATION_MAX_CONCURRENT: '3',
    PLAN_GENERATION_TIMEOUT_MS: '60000',
    PLAN_GENERATION_RETRY_DELAY_MS: '5000',
    
    // 监控配置
    METRICS_PORT: '9466',
    METRICS_UPDATE_INTERVAL_MS: '30000'
  }
};

// 创建环境文件
function createEnvFile(envType) {
  const config = envConfigs[envType];
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envFile = path.join(__dirname, `.env.${envType}`);
  fs.writeFileSync(envFile, envContent);
  
  console.log(`✅ ${envType} 环境文件已创建: .env.${envType}`);
  return envFile;
}

// 创建主环境文件
function createMainEnvFile() {
  const envContent = `# Athlete Ally Planning Engine Environment Configuration
# 请根据实际环境修改以下配置

NODE_ENV=development
PORT=4102
SERVICE_NAME=planning-engine

# 数据库配置
PLANNING_DATABASE_URL=postgresql://postgres:password@localhost:5432/planning_engine_dev

# Redis配置
REDIS_URL=redis://localhost:6379

# OpenAI配置 (必需)
OPENAI_API_KEY=your_openai_api_key_here

# NATS配置
NATS_URL=nats://localhost:4223

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

  const envFile = path.join(__dirname, '.env');
  fs.writeFileSync(envFile, envContent);
  
  console.log('✅ 主环境文件已创建: .env');
  return envFile;
}

// 创建Docker Compose文件
function createDockerCompose() {
  const dockerComposeContent = `version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: planning_engine
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nats:
    image: nats:2.9-alpine
    ports:
      - "4223:4222"
    command: ["--jetstream", "--store_dir", "/data"]
    volumes:
      - nats_data:/data
    healthcheck:
      test: ["CMD", "nats", "server", "check", "jetstream"]
      interval: 10s
      timeout: 5s
      retries: 5

  planning-engine:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4102:4102"
    environment:
      - NODE_ENV=production
      - PLANNING_DATABASE_URL=postgresql://postgres:password@postgres:5432/planning_engine
      - REDIS_URL=redis://redis:6379
      - NATS_URL=nats://nats:4223
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      nats:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4102/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  postgres_data:
  redis_data:
  nats_data:
`;

  const dockerFile = path.join(__dirname, 'docker-compose.yml');
  fs.writeFileSync(dockerFile, dockerComposeContent);
  
  console.log('✅ Docker Compose文件已创建: docker-compose.yml');
  return dockerFile;
}

// 创建启动脚本
function createStartScripts() {
  const startScript = `#!/bin/bash
# 启动脚本

set -e

echo "🚀 Starting Athlete Ally Planning Engine..."

# 检查环境变量
if [ -z "$OPENAI_API_KEY" ] && [ "$NODE_ENV" = "production" ]; then
    echo "❌ Error: OPENAI_API_KEY environment variable is required for production"
    exit 1
fi

# 检查依赖服务
echo "🔍 Checking dependencies..."

# 检查PostgreSQL
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running. Starting with Docker Compose..."
    docker-compose up -d postgres redis nats
    sleep 10
fi

# 运行数据库迁移
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# 启动服务
echo "▶️  Starting Planning Engine..."
if [ "$NODE_ENV" = "production" ]; then
    npm run build
    npm start
else
    npm run dev:full
fi
`;

  const startFile = path.join(__dirname, 'start.sh');
  fs.writeFileSync(startFile, startScript);
  
  // 设置执行权限
  try {
    fs.chmodSync(startFile, '755');
  } catch (error) {
    console.log('⚠️  请手动设置start.sh的执行权限: chmod +x start.sh');
  }
  
  console.log('✅ 启动脚本已创建: start.sh');
  return startFile;
}

// 主函数
async function main() {
  console.log('🔧 开始设置Athlete Ally Planning Engine环境...\n');
  
  try {
    // 创建环境文件
    createMainEnvFile();
    createEnvFile('development');
    createEnvFile('production');
    
    // 创建Docker Compose文件
    createDockerCompose();
    
    // 创建启动脚本
    createStartScripts();
    
    console.log('\n🎉 环境设置完成！');
    console.log('\n📋 下一步操作：');
    console.log('1. 编辑 .env 文件，填入正确的配置值');
    console.log('2. 确保PostgreSQL、Redis、NATS服务正在运行');
    console.log('3. 运行数据库迁移: npx prisma migrate deploy');
    console.log('4. 启动服务: npm run dev:full');
    console.log('5. 测试健康检查: curl http://localhost:4102/health');
    
    console.log('\n🔗 重要端点：');
    console.log('- 健康检查: http://localhost:4102/health');
    console.log('- 详细健康: http://localhost:4102/health/detailed');
    console.log('- 系统信息: http://localhost:4102/health/system');
    console.log('- Prometheus指标: http://localhost:4102/metrics');
    
  } catch (error) {
    console.error('❌ 环境设置失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();
