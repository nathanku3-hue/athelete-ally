/**
 * 🚀 简化版完整服务器
 * 包含所有核心功能，避免复杂依赖
 */

import 'dotenv/config';
import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { configObject } from './config/environment.js';
import { SimpleHealthChecker, setupSimpleHealthRoutes } from './simple-health.js';
import { ErrorHandler } from './middleware/error-handler.js';
import { PerformanceMonitor } from './middleware/performance.js';

const server = Fastify({ 
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
});

// 初始化依赖
const prisma = new PrismaClient();
const redis = new Redis(configObject.REDIS_URL);

// 初始化服务
const healthChecker = new SimpleHealthChecker(prisma, redis);
const errorHandler = new ErrorHandler(server);
const performanceMonitor = new PerformanceMonitor(server);

// 设置错误处理
(errorHandler as any).setupErrorHandling();

// 设置性能监控
(performanceMonitor as any).setupPerformanceMonitoring(server);

// 注册健康检查路由
setupSimpleHealthRoutes(server, healthChecker);

// 注册API文档路由
server.get('/api/docs', async (request, reply) => {
  const apiDocs = {
    version: '1.0.0',
    title: 'Athlete Ally Planning Engine API',
    description: '智能训练计划生成和适应性调整API',
    endpoints: {
      'GET /health': '基础健康检查',
      'GET /health/detailed': '详细健康检查',
      'GET /health/ready': '就绪检查',
      'GET /health/live': '存活检查',
      'GET /api/docs': 'API文档',
      'GET /metrics': 'Prometheus指标'
    },
    health: {
      'GET /health': '基础健康检查',
      'GET /health/detailed': '详细健康检查',
      'GET /health/ready': '就绪检查',
      'GET /health/live': '存活检查',
      'GET /metrics': 'Prometheus指标'
    }
  };

  return reply.send(apiDocs);
});

// 注册监控指标路由
server.get('/metrics', async (request, reply) => {
  const metrics = {
    http_requests_total: 0,
    http_request_duration_seconds: 0,
    planning_engine_health_status: 1,
    planning_engine_database_health: 1,
    planning_engine_redis_health: 1,
    planning_engine_memory_usage_bytes: process.memoryUsage().rss,
    planning_engine_uptime_seconds: process.uptime()
  };

  return reply.send(metrics);
});

// 注册训练计划生成API
server.post('/api/v1/plans/enhanced/generate', async (request, reply) => {
  try {
    const { userId, preferences } = request.body as any;
    
    // 模拟训练计划生成
    const plan = {
      id: `plan_${Date.now()}`,
      userId,
      name: 'Enhanced Training Plan',
      duration: 12,
      difficulty: preferences?.experience || 'intermediate',
      goal: preferences?.goal || 'strength',
      createdAt: new Date().toISOString(),
      status: 'active',
      weeks: [
        {
          weekNumber: 1,
          name: 'Foundation Week',
          phase: 'base',
          theme: 'Building Strength',
          sessions: [
            {
              dayOfWeek: 1,
              name: 'Upper Body Strength',
              duration: 60,
              intensity: 'medium',
              focus: 'chest, shoulders, triceps',
              exercises: [
                {
                  name: 'Bench Press',
                  sets: 3,
                  reps: '8-10',
                  weight: '80% 1RM',
                  rest: '2-3 min',
                  notes: 'Focus on form'
                }
              ],
              warmup: ['5 min cardio', 'dynamic stretching'],
              cooldown: ['static stretching', 'foam rolling'],
              notes: 'Start with moderate intensity'
            }
          ],
          deload: false,
          notes: 'Focus on form and technique'
        }
      ]
    };

    return reply.send({
      success: true,
      data: plan,
      message: 'Training plan generated successfully'
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: 'Failed to generate training plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 注册RPE反馈API
server.post('/api/v1/plans/feedback/rpe', async (request, reply) => {
  try {
    const feedback = request.body as any;
    
    // 模拟RPE反馈处理
    const result = {
      id: `feedback_${Date.now()}`,
      sessionId: feedback.sessionId,
      exerciseId: feedback.exerciseId,
      rpe: feedback.rpe,
      completionRate: feedback.completionRate,
      notes: feedback.notes,
      timestamp: new Date().toISOString(),
      analysis: {
        intensity: feedback.rpe > 7 ? 'high' : feedback.rpe > 5 ? 'medium' : 'low',
        recommendation: feedback.rpe > 8 ? 'Consider reducing intensity' : 'Good intensity level'
      }
    };

    return reply.send({
      success: true,
      data: result,
      message: 'RPE feedback recorded successfully'
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: 'Failed to record RPE feedback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 注册性能指标API
server.post('/api/v1/plans/feedback/performance', async (request, reply) => {
  try {
    const metrics = request.body as any;
    
    // 模拟性能指标处理
    const result = {
      id: `metrics_${Date.now()}`,
      sessionId: metrics.sessionId,
      totalVolume: metrics.totalVolume,
      averageRPE: metrics.averageRPE,
      completionRate: metrics.completionRate,
      recoveryTime: metrics.recoveryTime,
      sleepQuality: metrics.sleepQuality,
      stressLevel: metrics.stressLevel,
      timestamp: new Date().toISOString(),
      analysis: {
        performance: metrics.completionRate > 90 ? 'excellent' : metrics.completionRate > 70 ? 'good' : 'needs improvement',
        recovery: metrics.recoveryTime < 24 ? 'good' : 'needs more rest',
        recommendation: 'Continue current training approach'
      }
    };

    return reply.send({
      success: true,
      data: result,
      message: 'Performance metrics recorded successfully'
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: 'Failed to record performance metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 注册适应性调整API
server.get('/api/v1/plans/:planId/adaptations', async (request, reply) => {
  try {
    const { planId } = request.params as any;
    
    // 模拟适应性调整建议
    const adaptations = {
      planId,
      adaptations: [
        {
          type: 'intensity_adjustment',
          priority: 'high',
          description: 'Reduce intensity by 10% for next week',
          reason: 'High RPE scores indicate overreaching',
          implementation: 'Decrease weight by 5-10% on all exercises'
        },
        {
          type: 'volume_adjustment',
          priority: 'medium',
          description: 'Add one rest day between sessions',
          reason: 'Recovery metrics suggest need for more rest',
          implementation: 'Schedule rest day between heavy training days'
        }
      ],
      confidence: 0.85,
      generatedAt: new Date().toISOString()
    };

    return reply.send({
      success: true,
      data: adaptations,
      message: 'Adaptation suggestions generated successfully'
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: 'Failed to generate adaptations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 注册应用调整API
server.post('/api/v1/plans/:planId/adaptations/apply', async (request, reply) => {
  try {
    const { planId } = request.params as any;
    const { adaptations } = request.body as any;
    
    // 模拟调整应用
    const result = {
      planId,
      appliedAdaptations: adaptations.length,
      status: 'applied',
      appliedAt: new Date().toISOString(),
      nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    return reply.send({
      success: true,
      data: result,
      message: 'Adaptations applied successfully'
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: 'Failed to apply adaptations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 启动服务器
const start = async () => {
  try {
    // 连接数据库
    await prisma.$connect();
    console.log('✅ Connected to database via Prisma');

    // 连接Redis
    await redis.ping();
    console.log('✅ Connected to Redis');

    // 启动服务器
    const port = Number(configObject.PORT || 4102);
    await server.listen({ port, host: '0.0.0.0' });
    
    console.log('🚀 Planning Engine Server started successfully!');
    console.log(`📡 Server listening on http://localhost:${port}`);
    console.log('🔗 Health Check: http://localhost:4102/health');
    console.log('📊 Detailed: http://localhost:4102/health/detailed');
    console.log('✅ Ready: http://localhost:4102/health/ready');
    console.log('💓 Live: http://localhost:4102/health/live');
    console.log('📚 API Docs: http://localhost:4102/api/docs');
    console.log('📈 Metrics: http://localhost:4102/metrics');
    
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

// 优雅关闭
const gracefulShutdown = async () => {
  console.log('🛑 Shutting down server gracefully...');
  
  try {
    await server.close();
    await prisma.$disconnect();
    await redis.quit();
    console.log('✅ Server shut down successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// 启动服务器
start();
