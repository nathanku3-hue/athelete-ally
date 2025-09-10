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
// 暫時註釋掉共享包依賴
// import { EventBus } from '@athlete-ally/event-bus';
// import { OnboardingCompletedEvent, PlanGeneratedEvent } from '@athlete-ally/contracts';
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
// 暫時註釋掉 EventBus，創建一個模擬對象
const eventBus = {
  connect: async (url: string) => {
    console.log(`Mock EventBus connecting to ${url}`);
  },
  subscribeToOnboardingCompleted: async (handler: any) => {
    console.log('Mock EventBus subscribing to onboarding completed');
  },
  publishPlanGenerated: async (event: any) => {
    console.log('Mock EventBus publishing plan generated:', event);
  }
};

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

server.get('/health', async () => ({ status: 'ok' }));

// 查询计划生成状态
server.get('/status/:jobId', async (request, reply) => {
  const { jobId } = request.params as { jobId: string };
  
  try {
    // 查询计划状态
    const plan = await prisma.plan.findFirst({
      where: {
        // 这里需要根据jobId查找，可能需要添加jobId字段到数据库
        userId: 'temp', // 临时实现
      },
      select: {
        id: true,
        status: true,
        name: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!plan) {
      return reply.code(404).send({
        jobId: jobId,
        status: 'not_found',
        message: 'Plan generation job not found',
      });
    }

    return reply.code(200).send({
      jobId: jobId,
      planId: plan.id,
      status: plan.status,
      name: plan.name,
      version: plan.version,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    });
  } catch (error) {
    server.log.error({ error, jobId }, 'Failed to query plan status');
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
    // await eventBus.publishPlanGenerationRequested(planGenerationRequest);

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