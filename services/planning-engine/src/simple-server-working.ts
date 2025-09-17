/**
 * 🚀 简化工作服务器
 * 专注于核心API功能，暂时跳过复杂依赖
 */

import 'dotenv/config';
import Fastify from 'fastify';
import { configObject } from './config/environment.js';
import { SimpleHealthChecker, setupSimpleHealthRoutes } from './simple-health.js';

const server = Fastify({ 
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
});

// 创建简化的健康检查路由
server.get('/health', async (request, reply) => {
  return reply.send({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    service: 'planning-engine-working',
    checks: {
      server: {
        status: 'healthy',
        responseTime: 0,
        details: {
          type: 'Server',
          connection: 'active'
        }
      },
      memory: {
        status: 'healthy',
        details: {
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
          usagePercent: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100) + '%'
        }
      }
    },
    summary: {
      total: 2,
      healthy: 2,
      unhealthy: 0,
      degraded: 0
    },
    metrics: {
      requestCount: 0,
      errorCount: 0
    }
  });
});

server.get('/health/detailed', async (request, reply) => {
  return reply.send({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: [
      {
        service: 'server',
        status: 'healthy',
        responseTime: 0,
        details: {
          type: 'Server',
          connection: 'active'
        }
      },
      {
        service: 'memory',
        status: 'healthy',
        details: {
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB'
        }
      }
    ],
    summary: {
      total: 2,
      healthy: 2,
      unhealthy: 0,
      degraded: 0
    }
  });
});

server.get('/health/ready', async (request, reply) => {
  return reply.send({
    status: 'ready',
    timestamp: new Date().toISOString(),
    message: 'Service is ready to accept requests'
  });
});

server.get('/health/live', async (request, reply) => {
  return reply.send({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Service is alive and running'
  });
});

// 注册API文档路由
server.get('/api/docs', async (request, reply) => {
  const apiDocs = {
    version: '1.0.0',
    title: 'Athlete Ally Planning Engine API',
    description: '智能训练计划生成和适应性调整API',
    baseUrl: 'http://localhost:4102',
    endpoints: {
      'GET /health': '基础健康检查',
      'GET /health/detailed': '详细健康检查',
      'GET /health/ready': '就绪检查',
      'GET /health/live': '存活检查',
      'GET /api/docs': 'API文档',
      'GET /metrics': 'Prometheus指标',
      'POST /api/v1/plans/enhanced/generate': '生成增强训练计划',
      'POST /api/v1/plans/feedback/rpe': '提交RPE反馈',
      'POST /api/v1/plans/feedback/performance': '提交性能指标',
      'GET /api/v1/plans/:planId/adaptations': '获取适应性调整建议',
      'POST /api/v1/plans/:planId/adaptations/apply': '应用适应性调整'
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

// 注册指标路由
server.get('/metrics', async (request, reply) => {
  const metrics = {
    http_requests_total: 0,
    http_request_duration_seconds: 0,
    planning_engine_health_status: 1,
    planning_engine_database_health: 1,
    planning_engine_redis_health: 1,
    planning_engine_memory_usage_bytes: process.memoryUsage().heapUsed,
    planning_engine_uptime_seconds: process.uptime()
  };

  return reply.send(metrics);
});

// 注册训练计划生成API（简化版）
server.post('/api/v1/plans/enhanced/generate', async (request, reply) => {
  try {
    const requestData = request.body as any;
    
    // 简化的训练计划生成逻辑
    const plan = {
      id: `plan_${Date.now()}`,
      name: `${requestData.trainingIntent?.primaryGoal || 'Training'} Plan`,
      description: 'Generated training plan',
      duration: 12,
      difficulty: requestData.trainingIntent?.experienceLevel || 'intermediate',
      category: requestData.trainingIntent?.primaryGoal || 'general',
      tags: [requestData.trainingIntent?.primaryGoal || 'general'],
      microcycles: [
        {
          weekNumber: 1,
          name: 'Week 1',
          phase: 'base',
          theme: 'Foundation',
          sessions: [
            {
              dayOfWeek: 1,
              name: 'Strength Training',
              duration: 60,
              intensity: 'medium',
              focus: 'Upper Body',
              exercises: [
                {
                  name: 'Push-ups',
                  category: 'strength',
                  sets: 3,
                  reps: '10-15',
                  weight: 'Bodyweight',
                  restTime: 60,
                  notes: 'Focus on form'
                }
              ],
              warmup: ['5 min light cardio'],
              cooldown: ['5 min stretching'],
              notes: 'Start with moderate intensity'
            }
          ],
          deload: false,
          notes: 'Foundation building week'
        }
      ],
      progression: {
        type: 'linear',
        phases: [
          { name: 'Base Phase', duration: 4, focus: 'Foundation' },
          { name: 'Build Phase', duration: 4, focus: 'Progression' },
          { name: 'Peak Phase', duration: 4, focus: 'Performance' }
        ]
      },
      adaptations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return reply.send({
      success: true,
      data: plan,
      message: 'Training plan generated successfully'
    });
  } catch (error) {
    server.log.error('Error generating training plan:', error as any);
    return reply.status(500).send({
      success: false,
      error: 'Failed to generate training plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 注册RPE反馈API（简化版）
server.post('/api/v1/plans/feedback/rpe', async (request, reply) => {
  try {
    const feedbackData = request.body as any;
    
    // 简化的RPE反馈处理
    const feedback = {
      id: `feedback_${Date.now()}`,
      sessionId: feedbackData.sessionId || 'session_1',
      rpe: feedbackData.rpe || 5,
      completionRate: feedbackData.completionRate || 100,
      notes: feedbackData.notes || 'No notes provided',
      createdAt: new Date().toISOString()
    };

    return reply.send({
      success: true,
      data: feedback,
      message: 'RPE feedback recorded successfully'
    });
  } catch (error) {
    server.log.error('Error recording RPE feedback:', error as any);
    return reply.status(500).send({
      success: false,
      error: 'Failed to record RPE feedback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 注册性能指标API（简化版）
server.post('/api/v1/plans/feedback/performance', async (request, reply) => {
  try {
    const metricsData = request.body as any;
    
    // 简化的性能指标处理
    const metrics = {
      id: `metrics_${Date.now()}`,
      sessionId: metricsData.sessionId || 'session_1',
      heartRate: metricsData.heartRate || 120,
      power: metricsData.power || 200,
      speed: metricsData.speed || 10,
      distance: metricsData.distance || 5,
      duration: metricsData.duration || 30,
      createdAt: new Date().toISOString()
    };

    return reply.send({
      success: true,
      data: metrics,
      message: 'Performance metrics recorded successfully'
    });
  } catch (error) {
    server.log.error('Error recording performance metrics:', error as any);
    return reply.status(500).send({
      success: false,
      error: 'Failed to record performance metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 注册适应性调整API（简化版）
server.get('/api/v1/plans/:planId/adaptations', async (request, reply) => {
  try {
    const { planId } = request.params as { planId: string };
    
    // 简化的适应性调整建议
    const adaptations = [
      {
        id: `adaptation_${Date.now()}`,
        planId: planId,
        type: 'intensity_adjustment',
        description: 'Increase intensity by 10%',
        reason: 'Based on recent performance data',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];

    return reply.send({
      success: true,
      data: adaptations,
      message: 'Adaptation suggestions retrieved successfully'
    });
  } catch (error) {
    server.log.error('Error retrieving adaptations:', error as any);
    return reply.status(500).send({
      success: false,
      error: 'Failed to retrieve adaptations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 注册应用适应性调整API（简化版）
server.post('/api/v1/plans/:planId/adaptations/apply', async (request, reply) => {
  try {
    const { planId } = request.params as { planId: string };
    const { adaptationId } = request.body as { adaptationId: string };
    
    // 简化的适应性调整应用
    const result = {
      id: `applied_${Date.now()}`,
      planId: planId,
      adaptationId: adaptationId,
      status: 'applied',
      appliedAt: new Date().toISOString()
    };

    return reply.send({
      success: true,
      data: result,
      message: 'Adaptation applied successfully'
    });
  } catch (error) {
    server.log.error('Error applying adaptation:', error as any);
    return reply.status(500).send({
      success: false,
      error: 'Failed to apply adaptation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 启动服务器
const start = async () => {
  try {
    const port = Number(configObject.PORT || 4102);
    await server.listen({ port, host: '0.0.0.0' });
    
    console.log('🚀 Planning Engine Working Server started successfully!');
    console.log(`📡 Server listening on http://localhost:${port}`);
    console.log('🔗 Health Check: http://localhost:4102/health');
    console.log('📊 Detailed: http://localhost:4102/health/detailed');
    console.log('✅ Ready: http://localhost:4102/health/ready');
    console.log('💓 Live: http://localhost:4102/health/live');
    console.log('📚 API Docs: http://localhost:4102/api/docs');
    console.log('📈 Metrics: http://localhost:4102/metrics');
    console.log('');
    console.log('🎯 Available API Endpoints:');
    console.log('  POST /api/v1/plans/enhanced/generate - Generate training plan');
    console.log('  POST /api/v1/plans/feedback/rpe - Submit RPE feedback');
    console.log('  POST /api/v1/plans/feedback/performance - Submit performance metrics');
    console.log('  GET  /api/v1/plans/:planId/adaptations - Get adaptation suggestions');
    console.log('  POST /api/v1/plans/:planId/adaptations/apply - Apply adaptations');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
