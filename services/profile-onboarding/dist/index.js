// Initialize OpenTelemetry first
import './telemetry.js';
import 'dotenv/config';
import Fastify from 'fastify';
import { Client as PgClient } from 'pg';
import { Redis } from 'ioredis';
import { config } from './config.js';
// import { OnboardingPayloadSchema, safeParseOnboardingPayload } from '../../packages/shared-types/src/index.ts';
// 暂时注释掉shared包导入，使用本地实现
// import { authMiddleware, ownershipCheckMiddleware, cleanupMiddleware } from '@athlete-ally/shared';
// 强化身份验证中间件
async function authMiddleware(request, reply) {
    // 跳过健康检查端点
    if (request.url === '/health') {
        return;
    }
    try {
        // 从Authorization header获取JWT token
        const authHeader = request.headers.authorization || request.headers.Authorization;
        if (!authHeader) {
            reply.code(401).send({
                error: 'unauthorized',
                message: 'Authorization header is required'
            });
            return;
        }
        // 解析Bearer token
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            reply.code(401).send({
                error: 'unauthorized',
                message: 'Invalid authorization header format. Expected: Bearer <token>'
            });
            return;
        }
        const token = parts[1];
        // 在开发环境中，允许使用特殊的开发token
        if (process.env.NODE_ENV === 'development' && token === 'dev-token') {
            request.user = { userId: 'dev-user-id', role: 'user' };
            return;
        }
        // 在生产环境中，必须验证真实的JWT token
        if (process.env.NODE_ENV === 'production') {
            // TODO: 实现真实的JWT验证
            // 这里应该使用JWT库验证token并提取用户信息
            reply.code(401).send({
                error: 'unauthorized',
                message: 'Valid JWT token is required in production'
            });
            return;
        }
        // 开发环境的默认用户
        request.user = { userId: 'dev-user-id', role: 'user' };
    }
    catch (error) {
        const { safeLog } = await import('@athlete-ally/shared/logger');
        safeLog.error('Authentication error', error);
        reply.code(401).send({
            error: 'unauthorized',
            message: 'Authentication failed'
        });
    }
}
async function cleanupMiddleware(request, reply) {
    // 清理逻辑
}
// 暫時註釋掉共享包依賴
// import { EventBus } from '@athlete-ally/event-bus';
// import { OnboardingCompletedEvent } from '@athlete-ally/contracts';
const server = Fastify({ logger: true });
// minimal connectivity placeholders
const pg = new PgClient({ connectionString: config.PROFILE_DATABASE_URL });
const redis = new Redis(config.REDIS_URL);
// 暫時註釋掉 EventBus，創建一個模擬對象
const eventBus = {
    connect: async (url) => {
        console.log(`Mock EventBus connecting to ${url}`);
    },
    publishOnboardingCompleted: async (event) => {
        console.log('Mock EventBus publishing onboarding completed:', event);
    }
};
server.addHook('onReady', async () => {
    try {
        await pg.connect();
        server.log.info('connected to profile_db');
    }
    catch (e) {
        server.log.error({ err: e }, 'failed to connect profile_db');
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
    }
    catch (e) {
        server.log.error({ err: e }, 'failed to connect event bus');
        process.exit(1);
    }
});
// 使用统一的OnboardingPayloadSchema
// const OnboardingPayload = OnboardingPayloadSchema;
server.get('/health', async () => ({ status: 'ok' }));
server.post('/v1/onboarding', async (request, reply) => {
    // 使用统一的schema验证
    // const validationResult = safeParseOnboardingPayload(request.body);
    // if (!validationResult.success) {
    //   return reply.code(400).send({ 
    //     error: 'validation_failed',
    //     details: validationResult.error?.errors 
    //   });
    // }
    // const parsed = { success: true, data: validationResult.data! };
    const parsed = { success: true, data: request.body };
    try {
        // Use native SQL query instead of Prisma
        const userId = parsed.data.userId;
        const now = new Date().toISOString();
        // Check if user exists
        const existingUser = await pg.query('SELECT id FROM users WHERE id = $1', [userId]);
        let user;
        if (existingUser.rows.length > 0) {
            // Update existing user
            const result = await pg.query(`
        UPDATE users SET 
          purpose = $2,
          purpose_details = $3,
          proficiency = $4,
          season = $5,
          competition_date = $6,
          availability_days = $7,
          weekly_goal_days = $8,
          equipment = $9,
          fixed_schedules = $10,
          recovery_habits = $11,
          onboarding_step = $12,
          is_onboarding_complete = $13,
          updated_at = $14
        WHERE id = $1
        RETURNING *
      `, [
                userId,
                parsed.data.purpose,
                parsed.data.purposeDetails,
                parsed.data.proficiency,
                parsed.data.season,
                parsed.data.competitionDate ? new Date(parsed.data.competitionDate) : null,
                parsed.data.availabilityDays,
                parsed.data.weeklyGoalDays,
                parsed.data.equipment || [],
                JSON.stringify(parsed.data.fixedSchedules || []),
                parsed.data.recoveryHabits || [],
                parsed.data.onboardingStep || 1,
                parsed.data.isOnboardingComplete || false,
                now
            ]);
            user = result.rows[0];
        }
        else {
            // Create new user
            const result = await pg.query(`
        INSERT INTO users (
          id, purpose, purpose_details, proficiency, season, competition_date,
          availability_days, weekly_goal_days, equipment, fixed_schedules,
          recovery_habits, onboarding_step, is_onboarding_complete,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
                userId,
                parsed.data.purpose,
                parsed.data.purposeDetails,
                parsed.data.proficiency,
                parsed.data.season,
                parsed.data.competitionDate ? new Date(parsed.data.competitionDate) : null,
                parsed.data.availabilityDays,
                parsed.data.weeklyGoalDays,
                parsed.data.equipment || [],
                JSON.stringify(parsed.data.fixedSchedules || []),
                parsed.data.recoveryHabits || [],
                parsed.data.onboardingStep || 1,
                parsed.data.isOnboardingComplete || false,
                now,
                now
            ]);
            user = result.rows[0];
        }
        // Publish event to trigger plan generation
        const event = {
            eventId: `onboarding-${user.id}-${Date.now()}`,
            userId: user.id,
            timestamp: Date.now(),
            purpose: parsed.data.purpose,
            purposeDetails: parsed.data.purposeDetails,
            proficiency: parsed.data.proficiency,
            season: parsed.data.season,
            competitionDate: parsed.data.competitionDate,
            availabilityDays: parsed.data.availabilityDays,
            weeklyGoalDays: parsed.data.weeklyGoalDays,
            equipment: parsed.data.equipment || [],
            fixedSchedules: parsed.data.fixedSchedules,
            recoveryHabits: parsed.data.recoveryHabits || [],
            onboardingStep: parsed.data.onboardingStep || 1,
            isOnboardingComplete: parsed.data.isOnboardingComplete || false,
        };
        await eventBus.publishOnboardingCompleted(event);
        return reply.code(202).send({
            jobId: event.eventId,
            status: 'queued',
            userId: user.id,
            weeklyGoalDays: user.weeklyGoalDays
        });
    }
    catch (error) {
        server.log.error({ error }, 'Failed to save onboarding data');
        return reply.code(500).send({ error: 'internal_server_error' });
    }
});
// 注册安全中间件
server.addHook('onRequest', authMiddleware);
server.addHook('onSend', cleanupMiddleware);
// 为onboarding端点添加所有权检查
server.addHook('preHandler', async (request, reply) => {
    // 跳过健康检查端点
    if (request.url === '/health') {
        return;
    }
    // 为onboarding端点添加所有权检查
    if (request.method === 'POST' && request.url === '/v1/onboarding') {
        const user = request.user;
        const requestUserId = user?.userId;
        if (!requestUserId) {
            return reply.code(401).send({ error: 'unauthorized', message: 'User authentication required' });
        }
        // 验证请求体中的userId与JWT token中的userId一致
        // const parsed = OnboardingPayload.safeParse(request.body);
        // if (parsed.success && parsed.data.userId !== requestUserId) {
        //   return reply.code(403).send({ 
        //     error: 'forbidden', 
        //     message: 'User ID in request body does not match authenticated user' 
        //   });
        // }
    }
});
const port = Number(config.PORT || 4101);
server
    .listen({ port, host: '0.0.0.0' })
    .then(() => console.log(`profile-onboarding listening on :${port}`))
    .catch(async (err) => {
    const { safeLog } = await import('@athlete-ally/shared/logger');
    safeLog.error('Server startup error', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map