/**
 * 📚 API文档路由
 * 提供完整的API文档和测试接口
 */

import { FastifyInstance } from 'fastify';

async function apiDocsRoutes(fastify: FastifyInstance) {
  // API文档端点
  fastify.get('/api/docs', async (request, reply) => {
    const apiDocs = {
      version: '1.0.0',
      title: 'Athlete Ally Planning Engine API',
      description: '智能训练计划生成和适应性调整API',
      baseUrl: 'http://localhost:4102',
      endpoints: {
        'POST /api/v1/plans/enhanced/generate': {
          description: '生成增强训练计划',
          method: 'POST',
          path: '/api/v1/plans/enhanced/generate',
          parameters: {
            userProfile: {
              type: 'object',
              required: true,
              description: '用户档案信息',
              properties: {
                age: { type: 'number', description: '年龄' },
                gender: { type: 'string', description: '性别' },
                height: { type: 'number', description: '身高(cm)' },
                weight: { type: 'number', description: '体重(kg)' },
                experience: { type: 'number', description: '运动经验(年)' }
              }
            },
            trainingIntent: {
              type: 'object',
              required: true,
              description: '训练意图和目标',
              properties: {
                primaryGoal: { 
                  type: 'string', 
                  enum: ['strength', 'endurance', 'flexibility', 'weight_loss', 'muscle_gain', 'sports_specific'],
                  description: '主要目标'
                },
                experienceLevel: {
                  type: 'string',
                  enum: ['beginner', 'intermediate', 'advanced', 'expert'],
                  description: '经验水平'
                },
                timeAvailability: {
                  type: 'object',
                  description: '时间安排',
                  properties: {
                    weeklyHours: { type: 'number', description: '每周可用小时数' },
                    sessionDuration: { type: 'number', description: '单次训练时长(分钟)' }
                  }
                }
              }
            },
            currentPlan: {
              type: 'object',
              required: false,
              description: '当前计划（可选）'
            }
          },
          response: {
            success: { type: 'boolean' },
            data: { type: 'object', description: '生成的训练计划数据' },
            message: { type: 'string' }
          }
        },
        
        'POST /api/v1/plans/feedback/rpe': {
          description: '提交RPE反馈',
          method: 'POST',
          path: '/api/v1/plans/feedback/rpe',
          parameters: {
            sessionId: { type: 'string', required: true, description: '训练会话ID' },
            exerciseId: { type: 'string', required: true, description: '运动ID' },
            rpe: { type: 'number', required: true, min: 1, max: 10, description: 'RPE评分(1-10)' },
            completionRate: { type: 'number', required: true, min: 0, max: 100, description: '完成率(0-100)' },
            notes: { type: 'string', required: false, description: '备注信息' }
          },
          response: {
            success: { type: 'boolean' },
            data: { 
              type: 'object',
              properties: {
                feedback: { type: 'object' },
                analysis: { type: 'object' }
              }
            },
            message: { type: 'string' }
          }
        },
        
        'POST /api/v1/plans/feedback/performance': {
          description: '提交性能指标',
          method: 'POST',
          path: '/api/v1/plans/feedback/performance',
          parameters: {
            sessionId: { type: 'string', required: true, description: '训练会话ID' },
            totalVolume: { type: 'number', required: true, description: '总训练量' },
            averageRPE: { type: 'number', required: true, min: 1, max: 10, description: '平均RPE' },
            completionRate: { type: 'number', required: true, min: 0, max: 100, description: '完成率' },
            recoveryTime: { type: 'number', required: false, description: '恢复时间(小时)' },
            sleepQuality: { type: 'number', required: false, min: 1, max: 10, description: '睡眠质量(1-10)' },
            stressLevel: { type: 'number', required: false, min: 1, max: 10, description: '压力水平(1-10)' }
          },
          response: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                metrics: { type: 'object' },
                analysis: { type: 'object' }
              }
            },
            message: { type: 'string' }
          }
        },
        
        'GET /api/v1/plans/:planId/adaptations': {
          description: '获取适应性调整建议',
          method: 'GET',
          path: '/api/v1/plans/:planId/adaptations',
          parameters: {
            planId: { type: 'string', required: true, description: '训练计划ID' }
          },
          response: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                planId: { type: 'string' },
                analysis: { type: 'object' },
                adaptations: { type: 'array' }
              }
            },
            message: { type: 'string' }
          }
        },
        
        'POST /api/v1/plans/:planId/adaptations/apply': {
          description: '应用适应性调整',
          method: 'POST',
          path: '/api/v1/plans/:planId/adaptations/apply',
          parameters: {
            planId: { type: 'string', required: true, description: '训练计划ID' },
            adaptations: { 
              type: 'array', 
              required: true, 
              description: '要应用的调整列表',
              items: { type: 'object' }
            }
          },
          response: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' }
          }
        }
      },
      
      health: {
        'GET /health': {
          description: '基础健康检查',
          method: 'GET',
          path: '/health',
          response: {
            status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' }
          }
        },
        
        'GET /health/detailed': {
          description: '详细健康检查',
          method: 'GET',
          path: '/health/detailed',
          response: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            version: { type: 'string' },
            uptime: { type: 'number' },
            checks: { type: 'array' },
            summary: { type: 'object' }
          }
        },
        
        'GET /health/ready': {
          description: 'Kubernetes就绪探针',
          method: 'GET',
          path: '/health/ready',
          response: {
            ready: { type: 'boolean' },
            checks: { type: 'array' }
          }
        },
        
        'GET /health/live': {
          description: 'Kubernetes存活探针',
          method: 'GET',
          path: '/health/live',
          response: {
            alive: { type: 'boolean' },
            timestamp: { type: 'string' }
          }
        },
        
        'GET /health/system': {
          description: '系统信息',
          method: 'GET',
          path: '/health/system',
          response: {
            memory: { type: 'object' },
            cpu: { type: 'object' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            platform: { type: 'string' },
            arch: { type: 'string' }
          }
        },
        
        'GET /metrics': {
          description: 'Prometheus指标',
          method: 'GET',
          path: '/metrics',
          response: {
            type: 'text/plain',
            description: 'Prometheus格式的监控指标'
          }
        }
      },
      
      testing: {
        'GET /api/test/health': {
          description: '健康检查测试',
          method: 'GET',
          path: '/api/test/health'
        },
        
        'POST /api/test/plan-generation': {
          description: '计划生成测试',
          method: 'POST',
          path: '/api/test/plan-generation'
        },
        
        'POST /api/test/feedback': {
          description: '反馈收集测试',
          method: 'POST',
          path: '/api/test/feedback'
        }
      }
    };

    return reply.send(apiDocs);
  });

  // 健康检查测试端点
  fastify.get('/api/test/health', async (request, reply) => {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      service: 'planning-engine',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    };

    return reply.send(healthCheck);
  });

  // 计划生成测试端点
  fastify.post('/api/test/plan-generation', async (request, reply) => {
    const testData = {
      userProfile: {
        age: 25,
        gender: 'male',
        height: 175,
        weight: 70,
        experience: 2
      },
      trainingIntent: {
        primaryGoal: 'strength',
        experienceLevel: 'intermediate',
        timeAvailability: {
          weeklyHours: 6,
          sessionDuration: 60
        }
      }
    };

    return reply.send({
      success: true,
      message: 'Test data prepared for plan generation',
      testData,
      instructions: 'Use this data with POST /api/v1/plans/enhanced/generate'
    });
  });

  // 反馈收集测试端点
  fastify.post('/api/test/feedback', async (request, reply) => {
    const testRpeFeedback = {
      sessionId: 'test-session-1',
      exerciseId: 'test-exercise-1',
      rpe: 7,
      completionRate: 85,
      notes: 'Test RPE feedback'
    };

    const testPerformanceMetrics = {
      sessionId: 'test-session-1',
      totalVolume: 1500,
      averageRPE: 7.5,
      completionRate: 85,
      recoveryTime: 8,
      sleepQuality: 8,
      stressLevel: 6
    };

    return reply.send({
      success: true,
      message: 'Test data prepared for feedback collection',
      rpeFeedback: testRpeFeedback,
      performanceMetrics: testPerformanceMetrics,
      instructions: {
        rpe: 'Use rpeFeedback with POST /api/v1/plans/feedback/rpe',
        performance: 'Use performanceMetrics with POST /api/v1/plans/feedback/performance'
      }
    });
  });
}

export default apiDocsRoutes;
