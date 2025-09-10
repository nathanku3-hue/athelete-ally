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
export async function generatePlan(req) {
    // TODO: connect llm-orchestrator, repository, queue, etc.
    return {
        planId: 'demo-plan',
        version: 1,
        status: 'generated',
    };
}
const server = Fastify({ logger: true });
// minimal connectivity placeholders
const pg = new PgClient({ connectionString: config.PLANNING_DATABASE_URL });
const redis = new Redis(config.REDIS_URL);
// 暫時註釋掉 EventBus，創建一個模擬對象
const eventBus = {
    connect: async (url) => {
        console.log(`Mock EventBus connecting to ${url}`);
    },
    subscribeToOnboardingCompleted: async (handler) => {
        console.log('Mock EventBus subscribing to onboarding completed');
    },
    publishPlanGenerated: async (event) => {
        console.log('Mock EventBus publishing plan generated:', event);
    }
};
server.addHook('onReady', async () => {
    try {
        await pg.connect();
        server.log.info('connected to planning_db');
    }
    catch (e) {
        server.log.error({ err: e }, 'failed to connect planning_db');
        process.exit(1);
    }
    try {
        await redis.ping();
        server.log.info('connected to redis');
    }
    catch (e) {
        server.log.error({ err: e }, 'failed to connect redis');
        process.exit(1);
    }
    try {
        await eventBus.connect(process.env.NATS_URL || 'nats://localhost:4222');
        server.log.info('connected to event bus');
        // Subscribe to onboarding completed events
        await eventBus.subscribeToOnboardingCompleted(handleOnboardingCompleted);
        server.log.info('subscribed to onboarding completed events');
    }
    catch (e) {
        server.log.error({ err: e }, 'failed to connect event bus');
        process.exit(1);
    }
});
// Event handler for onboarding completed
async function handleOnboardingCompleted(event) {
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
                    create: planData.microcycles.map((mc) => ({
                        weekNumber: mc.weekNumber,
                        name: mc.name,
                        phase: mc.phase,
                        sessions: {
                            create: mc.sessions.map((session) => ({
                                dayOfWeek: session.dayOfWeek,
                                name: session.name,
                                duration: session.duration,
                                exercises: {
                                    create: session.exercises.map((exercise) => ({
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
        const planGeneratedEvent = {
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
    }
    catch (error) {
        server.log.error({ error, eventId: event.eventId, userId: event.userId }, 'Failed to generate plan from event');
    }
}
server.get('/health', async () => ({ status: 'ok' }));
server.post('/generate', async (request, reply) => {
    const startTime = Date.now();
    const parsed = PlanGenerateRequest.safeParse(request.body);
    if (!parsed.success) {
        businessMetrics.planGenerationFailures.add(1, { 'error.type': 'validation_error' });
        return reply.code(400).send({ error: 'invalid_payload' });
    }
    // 创建计划生成追踪
    const planSpan = tracePlanGeneration(parsed.data.userId, request.body);
    try {
        // 记录业务指标
        businessMetrics.planGenerationRequests.add(1, {
            'user.id': parsed.data.userId,
        });
        // 追踪LLM调用
        const llmSpan = traceLLMCall('gpt-4', 1000, parsed.data.userId); // 假设prompt长度
        // Generate plan using LLM
        const llmStartTime = Date.now();
        const planData = await generateTrainingPlan({
            userId: parsed.data.userId,
            proficiency: 'intermediate', // TODO: Get from user profile
            season: 'offseason',
            availabilityDays: 3,
            weeklyGoalDays: 4,
            equipment: ['bodyweight', 'dumbbells'],
        });
        const llmDuration = (Date.now() - llmStartTime) / 1000;
        businessMetrics.llmResponseTime.record(llmDuration, {
            'user.id': parsed.data.userId,
            'llm.model': 'gpt-4',
        });
        businessMetrics.llmRequests.add(1, {
            'user.id': parsed.data.userId,
            'llm.model': 'gpt-4',
        });
        llmSpan.setStatus({ code: 1, message: 'LLM call successful' });
        llmSpan.end();
        // 追踪数据库操作
        const dbSpan = traceDatabaseOperation('create', 'plans', parsed.data.userId);
        // Save plan to database
        const dbStartTime = Date.now();
        const plan = await prisma.plan.create({
            data: {
                userId: parsed.data.userId,
                status: 'completed',
                name: planData.name,
                description: planData.description,
                content: planData,
                microcycles: {
                    create: planData.microcycles.map((mc) => ({
                        weekNumber: mc.weekNumber,
                        name: mc.name,
                        phase: mc.phase,
                        sessions: {
                            create: mc.sessions.map((session) => ({
                                dayOfWeek: session.dayOfWeek,
                                name: session.name,
                                duration: session.duration,
                                exercises: {
                                    create: session.exercises.map((exercise) => ({
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
        const dbDuration = (Date.now() - dbStartTime) / 1000;
        businessMetrics.databaseQueryDuration.record(dbDuration, {
            'db.operation': 'create',
            'db.table': 'plans',
        });
        businessMetrics.databaseQueries.add(1, {
            'db.operation': 'create',
            'db.table': 'plans',
        });
        dbSpan.setStatus({ code: 1, message: 'Database operation successful' });
        dbSpan.end();
        const totalDuration = (Date.now() - startTime) / 1000;
        businessMetrics.planGenerationDuration.record(totalDuration, {
            'user.id': parsed.data.userId,
            'plan.status': 'success',
        });
        businessMetrics.planGenerationSuccess.add(1, {
            'user.id': parsed.data.userId,
        });
        planSpan.setStatus({ code: 1, message: 'Plan generation successful' });
        planSpan.end();
        return reply.code(200).send({
            planId: plan.id,
            version: plan.version,
            status: plan.status,
            name: plan.name,
        });
    }
    catch (error) {
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
//# sourceMappingURL=server.js.map