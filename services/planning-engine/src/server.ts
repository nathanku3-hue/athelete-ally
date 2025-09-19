// Initialize OpenTelemetry first
import './telemetry.js';
import 'dotenv/config';
import Fastify from 'fastify';
import { z } from 'zod';
import { Client as PgClient } from 'pg';
import { Redis } from 'ioredis';
import { config } from './config.js';
import { prisma } from './db.js';
import { generateTrainingPlan } from './llm.js';
// 临时类型定义
interface OnboardingCompletedEvent {
  userId: string;
  profileData: any;
  timestamp: Date;
}

interface PlanGeneratedEvent {
  planId: string;
  userId: string;
  planData: any;
  timestamp: Date;
}

interface PlanGenerationRequestedEvent {
  userId: string;
  requestData: any;
  timestamp: Date;
}

interface PlanGenerationFailedEvent {
  userId: string;
  error: string;
  timestamp: Date;
}
import { businessMetrics, tracePlanGeneration, traceLLMCall, traceDatabaseOperation } from './telemetry.js';
import { eventProcessor } from './events/processor.js';
import { eventPublisher } from './events/publisher.js';
import { concurrencyController } from './concurrency/controller.js';
import { Task } from './types/index.js';
import { AsyncPlanGenerator } from './optimization/async-plan-generator.js';
import { DatabaseOptimizer } from './optimization/database-optimizer.js';
// 使用内置的健康检查功能
import { enhancedPlanRoutes } from './routes/enhanced-plans.js';
import apiDocsRoutes from './routes/api-docs.js';
// Error handling and performance monitoring integrated into server hooks
// 使用统一的shared包组件
import { SecureIdGenerator, authMiddleware, cleanupMiddleware } from '@athlete-ally/shared';
import { register } from 'prom-client';

// 定义类型（从 index.ts 移动过来）
export const PlanGenerateRequest = z.object({
  userId: z.string(),
  seedPlanId: z.string().optional(),
});

export type PlanGenerateRequest = z.infer<typeof PlanGenerateRequest>;

const server = Fastify({ logger: true });

// minimal connectivity placeholders
const pg = new PgClient({ connectionString: config.PLANNING_DATABASE_URL });
const redis = new Redis(config.REDIS_URL);

// 初始化优化组件
const databaseOptimizer = new DatabaseOptimizer();
const asyncPlanGenerator = new AsyncPlanGenerator(redis, concurrencyController, eventPublisher);

// Health check routes integrated into main server
// Error handling and performance monitoring integrated into server hooks

server.addHook('onReady', async () => {
  try {
    await pg.connect();
    server.log.info('connected to planning_db');
  } catch (e) {
    server.log.error({ err: e }, 'failed to connect planning_db');
    process.exit(1);
  }
  try {
    await redis.ping();
    server.log.info('connected to redis');
  } catch (e) {
    server.log.error({ err: e }, 'failed to connect redis');
    process.exit(1);
  }
  try {
    // 连接到事件发布器
    await eventPublisher.connect();
    server.log.info('connected to event publisher');
    
    // 连接到新的事件处理器
    await eventProcessor.connect();
    server.log.info('connected to event processor');
    
    // 订阅事件并启用并发控制
    await eventProcessor.subscribe('onboarding_completed', handleOnboardingCompleted, {
      maxConcurrent: config.EVENT_PROCESSING_MAX_CONCURRENT,
      enableConcurrencyControl: true
    });
    server.log.info('subscribed to onboarding completed events with concurrency control');
    
    await eventProcessor.subscribe('plan_generation_requested', handlePlanGenerationRequested, {
      maxConcurrent: config.EVENT_PROCESSING_MAX_CONCURRENT,
      enableConcurrencyControl: true
    });
    server.log.info('subscribed to plan generation requested events with concurrency control');
    
    // OpenTelemetry metrics collection enabled
    server.log.info('event processor connected successfully');
    server.log.info('health check routes registered');
    
    // 注册增强计划API路由
    await server.register(enhancedPlanRoutes);
    server.log.info('enhanced plan routes registered');
    
    // 注册API文档路由
    await server.register(apiDocsRoutes);
    server.log.info('API documentation routes registered');
    
  } catch (e) {
    server.log.error({ err: e }, 'failed to connect event processor');
    process.exit(1);
  }
});

// Event handler for onboarding completed
async function handleOnboardingCompleted(task: Task<OnboardingCompletedEvent>) {
  const event = task.data;
  server.log.info({ eventId: event.eventId, userId: event.userId }, 'Processing onboarding completed event');
  
  try {
    // Generate plan using LLM
    const planData = await generateTrainingPlan({
      userId: event.userId,
      proficiency: event.proficiency || 'intermediate',
      season: event.season || 'offseason',
      availabilityDays: event.availabilityDays || 3,
      weeklyGoalDays: event.weeklyGoalDays,
      equipment: event.equipment || ['bodyweight'],
    });

    // Save plan to database
    const plan = await prisma.plan.create({
      data: {
        userId: event.userId,
        status: 'completed',
        name: planData.name,
        description: planData.description,
        content: planData,
        microcycles: {
          create: planData.microcycles.map((mc: any) => ({
            weekNumber: mc.weekNumber,
            name: mc.name,
            phase: mc.phase,
            sessions: {
              create: mc.sessions.map((session: any) => ({
                dayOfWeek: session.dayOfWeek,
                name: session.name,
                duration: session.duration,
                exercises: {
                  create: session.exercises.map((exercise: any) => ({
                    name: exercise.name,
                    category: exercise.category,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.weight,
                    notes: exercise.notes,
                  })),
                },
              })),
            },
          })),
        },
      },
    });

    // Publish plan generated event
    const planGeneratedEvent: any = {
      eventId: `plan-${plan.id}-${Date.now()}`,
      userId: event.userId,
      planId: plan.id,
      timestamp: Date.now(),
      planName: plan.name || 'Generated Plan',
      status: 'completed',
      version: plan.version,
    };

    await eventPublisher.publishPlanGenerated(planGeneratedEvent);
    server.log.info({ planId: plan.id, userId: event.userId }, 'Plan generated successfully');
    
  } catch (error) {
    server.log.error({ error, eventId: event.eventId, userId: event.userId }, 'Failed to generate plan from event');
  }
}

/**
 * Build a normalized plan generation request object from the incoming event.
 * This function is pure and makes it easy to unit test future changes.
 */
function buildPlanRequestFromEvent(event: PlanGenerationRequestedEvent) {
  return {
    userId: event.userId,
    proficiency: event.proficiency || 'intermediate',
    season: event.season || 'offseason',
    availabilityDays: event.availabilityDays || 3,
    weeklyGoalDays: event.weeklyGoalDays,
    equipment: event.equipment || ['bodyweight'],
    purpose: event.purpose,
  } as const;
}

// Event handler for plan generation requested (优化版本)
async function handlePlanGenerationRequested(task: Task<PlanGenerationRequestedEvent>) {
  const event = task.data;
  server.log.info({ eventId: event.eventId, userId: event.userId, jobId: event.jobId }, 'Processing plan generation requested event');
  
  try {
    // 创建PlanJob记录
    const planJob = await prisma.planJob.create({
      data: {
        jobId: event.jobId,
        userId: event.userId,
        status: 'queued',
        progress: 0,
        requestData: event as any,
        startedAt: new Date(),
      },
    });

    // 使用异步生成器处理计划生成
    const request = buildPlanRequestFromEvent(event);

    // 异步生成计划（非阻塞）
    await asyncPlanGenerator.generatePlanAsync(
      event.jobId,
      request,
      1 // 优先级
    );

    server.log.info({ jobId: event.jobId, userId: event.userId }, 'Plan generation queued successfully');
    
  } catch (error) {
    server.log.error({ error, eventId: event.eventId, userId: event.userId, jobId: event.jobId }, 'Failed to queue plan generation');
    
    // 更新任务状态为失败
    await prisma.planJob.updateMany({
      where: { jobId: event.jobId },
      data: { 
        status: 'failed', 
        progress: 0,
        completedAt: new Date(),
        errorData: { error: (error as Error).message, stack: (error as Error).stack },
      },
    });
  }
}

// 健康检查端点已移至下方，提供更详细的状态信息

// 查询计划生成状态
server.get('/status/:jobId', async (request, reply) => {
  const { jobId } = request.params as { jobId: string };
  
  // 从JWT token获取用户身份
  const user = (request as any).user;
  const userId = user.userId;
  
  try {
    // 查询PlanJob状态
    const planJob = await prisma.planJob.findUnique({
      where: { jobId },
      select: {
        id: true,
        jobId: true,
        userId: true,
        status: true,
        progress: true,
        resultData: true,
        errorData: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        retryCount: true,
        maxRetries: true,
      },
    });

    if (!planJob) {
      return reply.code(404).send({
        jobId: jobId,
        status: 'not_found',
        message: 'Plan generation job not found',
      });
    }

    // 安全验证：确保用户只能访问自己的job
    if (planJob.userId !== userId) {
      return reply.code(403).send({
        error: 'forbidden',
        message: 'Access denied: You can only access your own jobs'
      });
    }

    return reply.code(200).send({
      jobId: planJob.jobId,
      userId: planJob.userId,
      status: planJob.status,
      progress: planJob.progress,
      resultData: planJob.resultData,
      errorData: planJob.errorData,
      createdAt: planJob.createdAt,
      startedAt: planJob.startedAt,
      completedAt: planJob.completedAt,
      retryCount: planJob.retryCount,
      maxRetries: planJob.maxRetries,
    });
  } catch (error) {
    server.log.error({ error, jobId }, 'Failed to query plan job status');
    return reply.code(500).send({ error: 'status_query_failed' });
  }
});

server.post('/generate', async (request, reply) => {
  const startTime = Date.now();
  const parsed = PlanGenerateRequest.safeParse(request.body);
  
  if (!parsed.success) {
    businessMetrics.planGenerationFailures.add(1, { 'error.type': 'validation_error' });
    return reply.code(400).send({ error: 'invalid_payload' });
  }

  // 創建span用於追蹤
  const planSpan = tracePlanGeneration(parsed.data.userId, { jobId: 'plan-generation' });
  
  try {
    // 生成唯一的jobId
    const jobId = `plan-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建计划生成请求事件
    const planGenerationRequest = {
      eventId: jobId,
      userId: parsed.data.userId,
      timestamp: Date.now(),
      jobId: jobId,
      proficiency: 'intermediate', // Default value - will be enhanced with user profile integration
      season: 'offseason',
      availabilityDays: 3,
      weeklyGoalDays: 4,
      equipment: ['bodyweight', 'dumbbells'],
      purpose: 'general_fitness',
    };

    // 发布事件到消息队列
    await eventPublisher.publishPlanGenerationRequested(planGenerationRequest);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.planGenerationDuration.record(responseTime, {
      'user.id': parsed.data.userId,
      'plan.status': 'queued',
    });

    planSpan.setStatus({ code: 1, message: 'Plan generation queued successfully' });
    planSpan.end();

    // 立即返回jobId，让客户端可以轮询状态
    return reply.code(202).send({
      jobId: jobId,
      status: 'queued',
      message: 'Plan generation request queued successfully',
      estimatedCompletionTime: '2-5 minutes',
    });
  } catch (error) {
    const totalDuration = (Date.now() - startTime) / 1000;
    businessMetrics.planGenerationDuration.record(totalDuration, {
      'user.id': parsed.data.userId,
      'plan.status': 'failed',
    });
    businessMetrics.planGenerationFailures.add(1, {
      'user.id': parsed.data.userId,
      'error.type': 'internal_error',
    });
    
    planSpan.setStatus({ code: 2, message: 'Plan generation failed' });
    planSpan.end();
    
    server.log.error({ error }, 'Failed to generate plan');
    return reply.code(500).send({ error: 'plan_generation_failed' });
  }
});

// 添加 Prometheus 指标端点
server.get('/metrics', async (request, reply) => {
  reply.type('text/plain');
  return register.metrics();
});

// 健康检查端点已移至 health.ts 中的 setupHealthRoutes

// 添加并发状态端点
server.get('/concurrency/status', async (request, reply) => {
  const status = concurrencyController.getStatus();
  return {
    ...status,
    timestamp: new Date().toISOString()
  };
});

// 获取队列状态端点
server.get('/queue/status', async (request, reply) => {
  try {
    const queueStatus = asyncPlanGenerator.getQueueStatus();
    const dbMetrics = await databaseOptimizer.getPerformanceMetrics();
    
    return reply.send({
      queue: queueStatus,
      database: dbMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    server.log.error({ error }, 'Failed to get queue status');
    return reply.code(500).send({ error: 'queue_status_failed' });
  }
});

// 清理缓存端点
server.post('/cache/cleanup', async (request, reply) => {
  try {
    await asyncPlanGenerator.cleanupCache();
    const cleanupResult = await databaseOptimizer.cleanupExpiredData();
    
    return reply.send({
      message: 'Cache cleanup completed',
      cleanup: cleanupResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    server.log.error({ error }, 'Failed to cleanup cache');
    return reply.code(500).send({ error: 'cache_cleanup_failed' });
  }
});

// 注册安全中间件
server.addHook('onRequest', authMiddleware);
server.addHook('onSend', cleanupMiddleware);

// 为需要所有权检查的端点添加中间件
server.addHook('preHandler', async (request, reply) => {
  // 跳过健康检查和指标端点
  if (request.url === '/health' || request.url === '/metrics' || request.url === '/concurrency/status') {
    return;
  }
  
  // 为需要用户身份验证的端点添加所有权检查
  if (request.method === 'POST' && request.url === '/generate') {
    const user = (request as any).user;
    const requestUserId = user?.userId;
    
    if (!requestUserId) {
      return reply.code(401).send({ error: 'unauthorized', message: 'User authentication required' });
    }
  }
});

const port = Number(config.PORT || 4102);
server
  .listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`planning-engine listening on :${port}`))
  .catch(async (err) => {
    // const { safeLog } = await import('../../packages/shared/src/logger.js');
    const safeLog = { error: console.error, info: console.log, warn: console.warn };
    safeLog.error('Server startup error', err);
    process.exit(1);
  });
