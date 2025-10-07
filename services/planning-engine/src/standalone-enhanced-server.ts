/**
 * 🚀 独立增强版服务器 - 不依赖数据库和Redis
 * 包含完整Swagger文档和API端点
 */

import 'dotenv/config';
import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const server = Fastify({ 
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
});

// 注册Swagger文档
server.register(swagger, {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'Athlete Ally Planning Engine API',
      description: '智能训练计划生成和适应性调整API',
      version: '1.0.0',
      contact: {
        name: 'Athlete Ally Team',
        email: 'support@athlete-ally.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:4102',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'Health', description: '健康检查相关端点' },
      { name: 'Plans', description: '训练计划管理' },
      { name: 'Feedback', description: '用户反馈和指标' },
      { name: 'Adaptations', description: '适应性调整' }
    ]
  }
});

server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
});

// 基础健康检查
server.get('/health', {
  schema: {
    tags: ['Health'],
    description: '基础健康检查',
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string' },
          uptime: { type: 'number' },
          version: { type: 'string' }
        }
      }
    }
  }
}, async (request, _reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  };
});

// 详细健康检查
server.get('/health/detailed', {
  schema: {
    tags: ['Health'],
    description: '详细健康检查',
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string' },
          uptime: { type: 'number' },
          version: { type: 'string' },
          service: { type: 'string' },
          checks: { type: 'object' },
          summary: { type: 'object' },
          metrics: { type: 'object' }
        }
      }
    }
  }
}, async (request, _reply) => {
  const memoryUsage = process.memoryUsage();
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    service: 'planning-engine-standalone',
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
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          usagePercent: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
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
  };
});

// 就绪检查
server.get('/health/ready', {
  schema: {
    tags: ['Health'],
    description: '就绪检查',
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, _reply) => {
  return {
    status: 'ready',
    message: 'Service is ready to accept requests'
  };
});

// 存活检查
server.get('/health/live', {
  schema: {
    tags: ['Health'],
    description: '存活检查',
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, _reply) => {
  return {
    status: 'alive',
    message: 'Service is alive'
  };
});

// 监控指标端点
server.get('/metrics', {
  schema: {
    tags: ['Health'],
    description: 'Prometheus指标端点',
    response: {
      200: {
        type: 'object',
        description: 'Prometheus格式的指标数据'
      }
    }
  }
}, async (request, _reply) => {
  const memoryUsage = process.memoryUsage();
  
  return {
    http_requests_total: 0,
    http_request_duration_seconds: 0,
    planning_engine_health_status: 1,
    planning_engine_memory_usage_bytes: memoryUsage.rss,
    planning_engine_uptime_seconds: process.uptime()
  };
});

// 训练计划生成API
server.post('/api/v1/plans/enhanced/generate', {
  schema: {
    tags: ['Plans'],
    description: '生成增强训练计划',
    body: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { 
          type: 'string',
          description: '用户ID'
        },
        preferences: {
          type: 'object',
          properties: {
            goal: { 
              type: 'string',
              enum: ['strength', 'endurance', 'hypertrophy', 'power', 'general_fitness'],
              description: '训练目标'
            },
            experience: { 
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              description: '训练经验'
            },
            duration: { 
              type: 'number',
              description: '计划持续时间（周）'
            },
            frequency: { 
              type: 'number',
              description: '每周训练次数'
            },
            equipment: {
              type: 'array',
              items: { type: 'string' },
              description: '可用设备'
            }
          }
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              name: { type: 'string' },
              duration: { type: 'number' },
              difficulty: { type: 'string' },
              goal: { type: 'string' },
              createdAt: { type: 'string' },
              status: { type: 'string' },
              weeks: { type: 'array' }
            }
          },
          message: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, _reply) => {
  try {
    const { userId, preferences } = request.body as any;
    
    // 模拟训练计划生成
    const plan = {
      id: `plan_${Date.now()}`,
      userId,
      name: 'Enhanced Training Plan',
      duration: preferences?.duration || 12,
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

// RPE反馈API
server.post('/api/v1/plans/feedback/rpe', {
  schema: {
    tags: ['Feedback'],
    description: '提交RPE（主观疲劳度）反馈',
    body: {
      type: 'object',
      required: ['sessionId', 'exerciseId', 'rpe'],
      properties: {
        sessionId: { 
          type: 'string',
          description: '训练会话ID'
        },
        exerciseId: { 
          type: 'string',
          description: '练习ID'
        },
        rpe: { 
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'RPE评分（1-10）'
        },
        completionRate: { 
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: '完成率（百分比）'
        },
        notes: { 
          type: 'string',
          description: '额外备注'
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, _reply) => {
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

// 性能指标API
server.post('/api/v1/plans/feedback/performance', {
  schema: {
    tags: ['Feedback'],
    description: '提交性能指标数据',
    body: {
      type: 'object',
      required: ['sessionId', 'totalVolume', 'averageRPE', 'completionRate'],
      properties: {
        sessionId: { 
          type: 'string',
          description: '训练会话ID'
        },
        totalVolume: { 
          type: 'number',
          description: '总训练量'
        },
        averageRPE: { 
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: '平均RPE'
        },
        completionRate: { 
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: '完成率（百分比）'
        },
        recoveryTime: { 
          type: 'number',
          description: '恢复时间（小时）'
        },
        sleepQuality: { 
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: '睡眠质量评分'
        },
        stressLevel: { 
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: '压力水平评分'
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, _reply) => {
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

// 适应性调整API
server.get('/api/v1/plans/:planId/adaptations', {
  schema: {
    tags: ['Adaptations'],
    description: '获取训练计划的适应性调整建议',
    params: {
      type: 'object',
      properties: {
        planId: { 
          type: 'string',
          description: '训练计划ID'
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              planId: { type: 'string' },
              adaptations: { type: 'array' },
              confidence: { type: 'number' },
              generatedAt: { type: 'string' }
            }
          },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, _reply) => {
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

// 应用调整API
server.post('/api/v1/plans/:planId/adaptations/apply', {
  schema: {
    tags: ['Adaptations'],
    description: '应用适应性调整到训练计划',
    params: {
      type: 'object',
      properties: {
        planId: { 
          type: 'string',
          description: '训练计划ID'
        }
      }
    },
    body: {
      type: 'object',
      required: ['adaptations'],
      properties: {
        adaptations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              priority: { type: 'string' },
              description: { type: 'string' }
            }
          }
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
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
    // 启动服务器
    const port = 4102;
    await server.listen({ port, host: '0.0.0.0' });
    
    console.log('🚀 Standalone Enhanced Planning Engine Server started successfully!');
    console.log(`📡 Server listening on http://localhost:${port}`);
    console.log('🔗 Health Check: http://localhost:4102/health');
    console.log('📊 Detailed: http://localhost:4102/health/detailed');
    console.log('✅ Ready: http://localhost:4102/health/ready');
    console.log('💓 Live: http://localhost:4102/health/live');
    console.log('📚 API Docs: http://localhost:4102/docs');
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
