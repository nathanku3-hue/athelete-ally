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
import { businessMetrics, tracePlanGeneration } from './telemetry.js';
import { eventProcessor } from './events/processor.js';
import { eventPublisher } from './events/publisher.js';
import { concurrencyController } from './concurrency/controller.js';
import { authMiddleware, cleanupMiddleware } from '@athlete-ally/shared';
import { register } from 'prom-client';
// 定义类型（从 index.ts 移动过来）
export const PlanGenerateRequest = z.object({
    userId: z.string(),
    seedPlanId: z.string().optional(),
});
const server = Fastify({ logger: true });
// minimal connectivity placeholders
const pg = new PgClient({ connectionString: config.PLANNING_DATABASE_URL });
const redis = new Redis(config.REDIS_URL);
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
        // 指标更新已移除 - 使用OpenTelemetry自动指标收集
        server.log.info('event processor connected successfully');
    }
    catch (e) {
        server.log.error({ err: e }, 'failed to connect event processor');
        process.exit(1);
    }
});
// Event handler for onboarding completed
async function handleOnboardingCompleted(task) {
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
        await eventPublisher.publishPlanGenerated(planGeneratedEvent);
        server.log.info({ planId: plan.id, userId: event.userId }, 'Plan generated successfully');
    }
    catch (error) {
        server.log.error({ error, eventId: event.eventId, userId: event.userId }, 'Failed to generate plan from event');
    }
}
// Event handler for plan generation requested
async function handlePlanGenerationRequested(task) {
    const event = task.data;
    server.log.info({ eventId: event.eventId, userId: event.userId, jobId: event.jobId }, 'Processing plan generation requested event');
    try {
        // 创建PlanJob记录
        const planJob = await prisma.planJob.create({
            data: {
                jobId: event.jobId,
                userId: event.userId,
                status: 'processing',
                progress: 0,
                requestData: event,
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
        const planGeneratedEvent = {
            eventId: `plan-generated-${plan.id}-${Date.now()}`,
            userId: event.userId,
            planId: plan.id,
            timestamp: Date.now(),
            planName: plan.name || 'Generated Plan',
            status: 'completed',
            version: plan.version,
        };
        await eventPublisher.publishPlanGenerated(planGeneratedEvent);
        server.log.info({ planId: plan.id, userId: event.userId, jobId: event.jobId }, 'Plan generated successfully');
    }
    catch (error) {
        server.log.error({ error, eventId: event.eventId, userId: event.userId, jobId: event.jobId }, 'Failed to generate plan from event');
        // 更新PlanJob为失败状态
        try {
            await prisma.planJob.updateMany({
                where: { jobId: event.jobId },
                data: {
                    status: 'failed',
                    errorData: { error: error.message, stack: error.stack },
                    completedAt: new Date(),
                },
            });
        }
        catch (dbError) {
            server.log.error({ dbError }, 'Failed to update PlanJob status to failed');
        }
        // 发布计划生成失败事件
        const planGenerationFailedEvent = {
            eventId: `plan-failed-${event.jobId}-${Date.now()}`,
            userId: event.userId,
            jobId: event.jobId,
            timestamp: Date.now(),
            error: error.message,
            retryCount: task.retries,
        };
        await eventPublisher.publishPlanGenerationFailed(planGenerationFailedEvent);
    }
}
// 健康检查端点已移至下方，提供更详细的状态信息
// 查询计划生成状态
server.get('/status/:jobId', async (request, reply) => {
    const { jobId } = request.params;
    // 从JWT token获取用户身份
    const user = request.user;
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
    }
    catch (error) {
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
// 添加 Prometheus 指标端点
server.get('/metrics', async (request, reply) => {
    reply.type('text/plain');
    return register.metrics();
});
// 添加健康检查端点
server.get('/health', async (request, reply) => {
    const concurrencyStatus = concurrencyController.getStatus();
    const eventProcessorHealthy = eventProcessor.isHealthy();
    return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        concurrency: concurrencyStatus,
        eventProcessor: {
            connected: eventProcessorHealthy,
            consumers: eventProcessor.isHealthy() ? 'active' : 'disconnected'
        }
    };
});
// 添加并发状态端点
server.get('/concurrency/status', async (request, reply) => {
    const status = concurrencyController.getStatus();
    return {
        ...status,
        timestamp: new Date().toISOString()
    };
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
        const user = request.user;
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
    .catch((err) => {
    const { safeLog } = await import('@athlete-ally/shared/logger');
    safeLog.error('Server startup error', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map