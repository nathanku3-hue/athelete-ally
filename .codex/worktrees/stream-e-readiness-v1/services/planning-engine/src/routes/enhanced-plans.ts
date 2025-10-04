/**
 * 🚀 增强训练计划API路由
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 增强计划生成
 * - RPE反馈收集
 * - 适应性调整
 * - 性能指标跟踪
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { generateEnhancedTrainingPlan } from '../llm-enhanced.js';
import { AdaptationEngine, RPEFeedbackSchema, PerformanceMetricsSchema } from '../adaptation-engine.js';
import { prisma } from '../db.js';

// 增强计划生成请求schema
const EnhancedPlanGenerationRequestSchema = z.object({
  userId: z.string(),
  trainingIntent: z.object({
    primaryGoal: z.enum(['strength', 'endurance', 'flexibility', 'weight_loss', 'muscle_gain', 'sports_specific']),
    secondaryGoals: z.array(z.string()),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    timeConstraints: z.object({
      availableDays: z.number().min(1).max(7),
      sessionDuration: z.number().min(15).max(300),
      preferredTimes: z.array(z.string()),
    }),
    equipment: z.array(z.string()),
    limitations: z.array(z.string()),
    preferences: z.object({
      intensity: z.enum(['low', 'medium', 'high']),
      style: z.enum(['traditional', 'functional', 'hiit', 'yoga', 'pilates']),
      progression: z.enum(['linear', 'undulating', 'block']),
    }),
  }),
  currentFitnessLevel: z.object({
    strength: z.number().min(1).max(10),
    endurance: z.number().min(1).max(10),
    flexibility: z.number().min(1).max(10),
    mobility: z.number().min(1).max(10),
  }),
  injuryHistory: z.array(z.string()),
  performanceGoals: z.object({
    shortTerm: z.array(z.string()),
    mediumTerm: z.array(z.string()),
    longTerm: z.array(z.string()),
  }),
  feedbackHistory: z.array(z.object({
    sessionId: z.string(),
    rpe: z.number().min(1).max(10),
    completionRate: z.number().min(0).max(100),
    notes: z.string().optional(),
  })),
});

// 使用从adaptation-engine导入的schema

export async function enhancedPlanRoutes(fastify: FastifyInstance) {
  // 生成增强训练计划
  fastify.post('/api/v1/plans/enhanced/generate', {
    schema: {
      body: EnhancedPlanGenerationRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const requestData = request.body as z.infer<typeof EnhancedPlanGenerationRequestSchema>;
      
      // 生成增强计划
      const plan = await generateEnhancedTrainingPlan(requestData);
      
      // 保存到数据库
      const savedPlan = await prisma.plan.create({
        data: {
          userId: requestData.userId,
          status: 'completed',
          name: plan.name,
          description: plan.description,
          content: plan,
          microcycles: {
            create: plan.microcycles.map((mc: any) => ({
              weekNumber: mc.weekNumber,
              name: mc.name,
              phase: mc.phase,
              theme: mc.theme,
              deload: mc.deload || false,
              notes: mc.notes,
              sessions: {
                create: mc.sessions.map((session: any) => ({
                  dayOfWeek: session.dayOfWeek,
                  name: session.name,
                  duration: session.duration,
                  intensity: session.intensity,
                  focus: session.focus,
                  warmup: session.warmup,
                  cooldown: session.cooldown,
                  notes: session.notes,
                  exercises: {
                    create: session.exercises.map((exercise: any) => ({
                      name: exercise.name,
                      category: exercise.category,
                      subcategory: exercise.subcategory,
                      sets: exercise.sets,
                      reps: exercise.reps,
                      weight: exercise.weight,
                      restTime: exercise.restTime,
                      tempo: exercise.tempo,
                      notes: exercise.notes,
                      alternatives: exercise.alternatives,
                      progression: exercise.progression,
                    })),
                  },
                })),
              },
            })),
          },
        },
      });

      return reply.send({
        success: true,
        data: savedPlan,
        message: 'Enhanced training plan generated successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to generate enhanced training plan',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 提交RPE反馈
  fastify.post('/api/v1/plans/feedback/rpe', {
    schema: {
      body: RPEFeedbackSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const feedback = request.body as z.infer<typeof RPEFeedbackSchema>;
      
      // 保存RPE反馈到数据库
      const savedFeedback = await prisma.rPEFeedback.create({
        data: {
          sessionId: feedback.sessionId,
          exerciseId: feedback.exerciseId,
          rpe: feedback.rpe,
          completionRate: feedback.completionRate,
          notes: feedback.notes,
          timestamp: feedback.timestamp,
        },
      });

      // 使用AdaptationEngine分析反馈
      const adaptationEngine = new AdaptationEngine();
      const analysis = await adaptationEngine.analyzePerformance([feedback], []);

      return reply.send({
        success: true,
        data: {
          feedback: savedFeedback,
          analysis,
        },
        message: 'RPE feedback submitted successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to submit RPE feedback',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 提交性能指标
  fastify.post('/api/v1/plans/feedback/performance', {
    schema: {
      body: PerformanceMetricsSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const metrics = request.body as z.infer<typeof PerformanceMetricsSchema>;
      
      // 保存性能指标到数据库
      const savedMetrics = await prisma.performanceMetrics.create({
        data: {
          sessionId: metrics.sessionId,
          totalVolume: metrics.totalVolume,
          averageRPE: metrics.averageRPE,
          completionRate: metrics.completionRate,
          recoveryTime: metrics.recoveryTime,
          sleepQuality: metrics.sleepQuality,
          stressLevel: metrics.stressLevel,
          timestamp: metrics.timestamp,
        },
      });

      // 使用AdaptationEngine分析性能指标
      const adaptationEngine = new AdaptationEngine();
      const analysis = await adaptationEngine.analyzePerformance([], [metrics]);

      return reply.send({
        success: true,
        data: {
          metrics: savedMetrics,
          analysis,
        },
        message: 'Performance metrics submitted successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to submit performance metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 获取适应性调整建议
  fastify.get('/api/v1/plans/:planId/adaptations', {
    schema: {
      params: {
        type: 'object',
        properties: {
          planId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { planId } = request.params as { planId: string };
      
      // 获取计划
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        include: {
          microcycles: {
            include: {
              sessions: {
                include: {
                  exercises: true,
                },
              },
            },
          },
        },
      });

      if (!plan) {
        return reply.status(404).send({
          success: false,
          error: 'Plan not found',
        });
      }

      // 获取RPE反馈和性能指标
      const rpeFeedback = await prisma.rPEFeedback.findMany({
        where: { sessionId: { in: plan.microcycles.flatMap((mc: any) => mc.sessions.map((s: any) => s.id)) } },
        orderBy: { timestamp: 'desc' },
        take: 20,
      });

      const performanceMetrics = await prisma.performanceMetrics.findMany({
        where: { sessionId: { in: plan.microcycles.flatMap((mc: any) => mc.sessions.map((s: any) => s.id)) } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // 创建适应性调整引擎
      const adaptationEngine = new AdaptationEngine();
      
      // 转换数据格式
      const rpeData = rpeFeedback.map((feedback: any) => ({
        sessionId: feedback.sessionId,
        exerciseId: feedback.exerciseId,
        rpe: feedback.rpe,
        completionRate: feedback.completionRate,
        notes: feedback.notes || undefined,
        timestamp: feedback.timestamp,
      }));

      const performanceData = performanceMetrics.map((metrics: any) => ({
        sessionId: metrics.sessionId,
        totalVolume: metrics.totalVolume,
        averageRPE: metrics.averageRPE,
        completionRate: metrics.completionRate,
        recoveryTime: metrics.recoveryTime,
        sleepQuality: metrics.sleepQuality,
        stressLevel: metrics.stressLevel,
        timestamp: metrics.timestamp,
      }));

      // 分析性能并生成适应性调整建议
      const analysis = await adaptationEngine.analyzePerformance(rpeData, performanceData);
      const adaptations = await adaptationEngine.generateAdaptation(
        plan.content as any,
        analysis,
        { userId: plan.userId }
      );

      return reply.send({
        success: true,
        data: {
          planId,
          analysis,
          adaptations,
        },
        message: 'Adaptation suggestions generated successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to generate adaptation suggestions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 应用适应性调整
  fastify.post('/api/v1/plans/:planId/adaptations/apply', {
    schema: {
      params: {
        type: 'object',
        properties: {
          planId: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          adjustments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                value: { type: 'number' },
                reason: { type: 'string' },
                confidence: { type: 'number' },
              },
            },
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { planId } = request.params as { planId: string };
      const { adjustments } = request.body as { adjustments: any[] };
      
      // 获取计划
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        include: {
          microcycles: {
            include: {
              sessions: {
                include: {
                  exercises: true,
                },
              },
            },
          },
        },
      });

      if (!plan) {
        return reply.status(404).send({
          success: false,
          error: 'Plan not found',
        });
      }

      // 应用调整
      const adaptationEngine = new AdaptationEngine();
      const adjustedPlan = await adaptationEngine.applyAdaptations(plan.content as any, adjustments);

      // 更新计划
      const updatedPlan = await prisma.plan.update({
        where: { id: planId },
        data: {
          content: adjustedPlan,
          updatedAt: new Date(),
        },
      });

      return reply.send({
        success: true,
        data: updatedPlan,
        message: 'Adaptations applied successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to apply adaptations',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
