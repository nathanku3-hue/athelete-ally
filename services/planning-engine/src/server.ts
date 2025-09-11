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
import { EventBus } from '@athlete-ally/event-bus';
import { OnboardingCompletedEvent, PlanGeneratedEvent, PlanGenerationRequestedEvent, PlanGenerationFailedEvent } from '@athlete-ally/contracts';
import { businessMetrics, tracePlanGeneration, traceLLMCall, traceDatabaseOperation } from './telemetry.js';

// 定义类型和函数（从 index.ts 移动过来）
export const PlanGenerateRequest = z.object({
  userId: z.string(),
  seedPlanId: z.string().optional(),
});

export type PlanGenerateRequest = z.infer<typeof PlanGenerateRequest>;

export async function generatePlan(req: PlanGenerateRequest) {
  // TODO: connect llm-orchestrator, repository, queue, etc.
  return {
    planId: 'demo-plan',
    version: 1,
    status: 'generated',
  } as const;
}

const server = Fastify({ logger: true });

// minimal connectivity placeholders
const pg = new PgClient({ connectionString: config.PLANNING_DATABASE_URL });
const redis = new Redis(config.REDIS_URL);
// 使用真实的EventBus
const eventBus = new EventBus();

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
    await eventBus.connect(process.env.NATS_URL || 'nats://localhost:4222');
    server.log.info('connected to event bus');
    
    // Subscribe to onboarding completed events
    await eventBus.subscribeToOnboardingCompleted(handleOnboardingCompleted);
    server.log.info('subscribed to onboarding completed events');
    
    // Subscribe to plan generation requested events
    await eventBus.subscribeToPlanGenerationRequested(handlePlanGenerationRequested);
    server.log.info('subscribed to plan generation requested events');
  } catch (e) {
    server.log.error({ err: e }, 'failed to connect event bus');
    process.exit(1);
  }
});

// Event handler for onboarding completed
async function handleOnboardingCompleted(event: any) {
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

    await eventBus.publishPlanGenerated(planGeneratedEvent);
    server.log.info({ planId: plan.id, userId: event.userId }, 'Plan generated successfully');
    
  } catch (error) {
    server.log.error({ error, eventId: event.eventId, userId: event.userId }, 'Failed to generate plan from event');
  }
}

// Event handler for plan generation requested
async function handlePlanGenerationRequested(event: PlanGenerationRequestedEvent) {
  server.log.info({ eventId: event.eventId, userId: event.userId, jobId: event.jobId }, 'Processing plan generation requested event');
  
  try {
    // 创建PlanJob记录
    const planJob = await prisma.planJob.create({
      data: {
        jobId: event.jobId,
        userId: event.userId,
        status: 'processing',
        progress: 0,
        requestData: event as any,
        startedAt: new Date(),
      },
    });

    // 更新进度
    await prisma.planJob.update({
      where: { id: planJob.id },
      data: { progress: 25 },
    });

    // 生成计划
    const planData = await generateTrainingPlan({
      userId: event.userId,
      proficiency: event.proficiency || 'intermediate',
      season: event.season || 'offseason',
      availabilityDays: event.availabilityDays || 3,
      weeklyGoalDays: event.weeklyGoalDays,
      equipment: event.equipment || ['bodyweight'],
      purpose: event.purpose,
    });

    // 更新进度
    await prisma.planJob.update({
      where: { id: planJob.id },
      data: { progress: 75 },
    });

    // 保存计划到数据库
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

    // 更新PlanJob为完成状态
    await prisma.planJob.update({
      where: { id: planJob.id },
      data: {
        status: 'completed',
        progress: 100,
        resultData: { planId: plan.id, planName: plan.name },
        completedAt: new Date(),
      },
    });

    // 发布计划生成完成事件
    const planGeneratedEvent: PlanGeneratedEvent = {
      eventId: `plan-generated-${plan.id}-${Date.now()}`,
      userId: event.userId,
      planId: plan.id,
      timestamp: Date.now(),
      planName: plan.name || 'Generated Plan',
      status: 'completed',
      version: plan.version,
    };

    await eventBus.publishPlanGenerated(planGeneratedEvent);
    server.log.info({ planId: plan.id, userId: event.userId, jobId: event.jobId }, 'Plan generated successfully');
    
  } catch (error) {
    server.log.error({ error, eventId: event.eventId, userId: event.userId, jobId: event.jobId }, 'Failed to generate plan from event');
    
    // 更新PlanJob为失败状态
    try {
      await prisma.planJob.updateMany({
        where: { jobId: event.jobId },
        data: {
          status: 'failed',
          errorData: { error: (error as Error).message, stack: (error as Error).stack },
          completedAt: new Date(),
        },
      });
    } catch (dbError) {
      server.log.error({ dbError }, 'Failed to update PlanJob status to failed');
    }

    // 发布计划生成失败事件
    const planGenerationFailedEvent: PlanGenerationFailedEvent = {
      eventId: `plan-failed-${event.jobId}-${Date.now()}`,
      userId: event.userId,
      jobId: event.jobId,
      timestamp: Date.now(),
      error: (error as Error).message,
    };

    await eventBus.publishPlanGenerationFailed(planGenerationFailedEvent);
  }
}

server.get('/health', async () => ({ status: 'ok' }));

// 查询计划生成状态
server.get('/status/:jobId', async (request, reply) => {
  const { jobId } = request.params as { jobId: string };
  
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
      proficiency: 'intermediate', // TODO: Get from user profile
      season: 'offseason',
      availabilityDays: 3,
      weeklyGoalDays: 4,
      equipment: ['bodyweight', 'dumbbells'],
      purpose: 'general_fitness',
    };

    // 发布事件到消息队列
    await eventBus.publishPlanGenerationRequested(planGenerationRequest);

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

const port = Number(config.PORT || 4102);
server
  .listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`planning-engine listening on :${port}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });