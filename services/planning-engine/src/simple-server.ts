/**
 * 🚀 简化服务器 - 仅健康检查功能
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 基础健康检查
 * - 数据库连接
 * - Redis连接
 * - 系统监控
 */

import 'dotenv/config';
import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { config } from './config.js';
import { SimpleHealthChecker, setupSimpleHealthRoutes } from './simple-health.js';
import { register } from 'prom-client';

// 创建服务器
const server = Fastify({ 
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});

// 数据库和Redis连接
const prisma = new PrismaClient();
const redis = new Redis(config.REDIS_URL);

// 初始化健康检查器
const healthChecker = new SimpleHealthChecker(prisma, redis);

// 设置健康检查路由
setupSimpleHealthRoutes(server, healthChecker);

// 添加 Prometheus 指标端点
server.get('/metrics', async (request, reply) => {
  reply.type('text/plain');
  return register.metrics();
});

// 基础路由
server.get('/', async (request, reply) => {
  return {
    service: 'planning-engine',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      detailed: '/health/detailed',
      ready: '/health/ready',
      live: '/health/live',
      system: '/health/system',
      metrics: '/metrics'
    }
  };
});

// 服务器启动
server.addHook('onReady', async () => {
  try {
    // 测试数据库连接
    await prisma.$queryRaw`SELECT 1`;
    server.log.info('✅ Database connected');
    
    // 测试Redis连接
    await redis.ping();
    server.log.info('✅ Redis connected');
    
    server.log.info('🚀 Planning Engine Health Check Server started');
    server.log.info(`📊 Health check available at: http://localhost:${config.PORT}/health`);
    server.log.info(`📈 Metrics available at: http://localhost:${config.PORT}/metrics`);
    
  } catch (error) {
    server.log.error({ error }, '❌ Failed to start server');
    process.exit(1);
  }
});

// 优雅关闭
process.on('SIGINT', async () => {
  server.log.info('🛑 Shutting down server...');
  
  try {
    await prisma.$disconnect();
    await redis.quit();
    await server.close();
    server.log.info('✅ Server shut down gracefully');
    process.exit(0);
  } catch (error) {
    server.log.error({ error }, '❌ Error during shutdown');
    process.exit(1);
  }
});

// 启动服务器
const port = Number(config.PORT || 4102);
server
  .listen({ port, host: '0.0.0.0' })
  .then(() => {
    console.log(`🏥 Planning Engine Health Check Server listening on :${port}`);
    console.log(`🔗 Health Check: http://localhost:${port}/health`);
    console.log(`📊 Metrics: http://localhost:${port}/metrics`);
  })
  .catch((err) => {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  });

