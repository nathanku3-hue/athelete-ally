// Initialize OpenTelemetry first
import './telemetry.js';
import 'dotenv/config';
import Fastify from 'fastify';
import { Client as PgClient } from 'pg';
import { Redis } from 'ioredis';
import { config } from './config.js';
import { prisma } from './db.js';
import { z } from 'zod';
// 暂时注释掉shared包导入，使用本地实现
// import { authMiddleware, ownershipCheckMiddleware, cleanupMiddleware } from '@athlete-ally/shared';

// 简化的身份验证中间件
async function authMiddleware(request: any, reply: any) {
  // 暂时跳过身份验证（开发环境）
  (request as any).user = { userId: 'dev-user-id' };
}

async function cleanupMiddleware(request: any, reply: any) {
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
  connect: async (url: string) => {
    console.log(`Mock EventBus connecting to ${url}`);
  },
  publishOnboardingCompleted: async (event: any) => {
    console.log('Mock EventBus publishing onboarding completed:', event);
  }
};

server.addHook('onReady', async () => {
  try {
    await pg.connect();
    server.log.info('connected to profile_db');
  } catch (e) {
    server.log.error({ err: e }, 'failed to connect profile_db');
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
  } catch (e) {
    server.log.error({ err: e }, 'failed to connect event bus');
    process.exit(1);
  }
});

const OnboardingPayload = z.object({
  userId: z.string(),
  // Step 1: Training Purpose
  purpose: z.enum(['general_fitness', 'sport_performance', 'muscle_building', 'weight_loss', 'rehabilitation']).optional(),
  purposeDetails: z.string().optional(),
  
  // Step 2: Proficiency Level
  proficiency: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  
  // Step 3: Season and Goals
  season: z.enum(['offseason', 'preseason', 'inseason']).optional(),
  competitionDate: z.string().datetime().optional(),
  
  // Step 4: Availability
  availabilityDays: z.number().int().min(1).max(7).optional(),
  weeklyGoalDays: z.number().int().min(1).max(7).optional(),
  
  // Step 5: Equipment and scheduling
  equipment: z.array(z.string()).optional(),
  fixedSchedules: z
    .array(
      z.object({ day: z.string(), start: z.string(), end: z.string() })
    )
    .optional(),
  
  // Step 6: Recovery habits (optional)
  recoveryHabits: z.array(z.string()).optional(),
  
  // Onboarding status
  onboardingStep: z.number().int().min(1).max(6).optional(),
  isOnboardingComplete: z.boolean().optional(),
});

server.get('/health', async () => ({ status: 'ok' }));

server.post('/v1/onboarding', async (request, reply) => {
  const parsed = OnboardingPayload.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: 'invalid_payload' });
  }

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
    } else {
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
    const event: any = {
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
  } catch (error) {
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
    const user = (request as any).user;
    const requestUserId = user?.userId;
    
    if (!requestUserId) {
      return reply.code(401).send({ error: 'unauthorized', message: 'User authentication required' });
    }
    
    // 验证请求体中的userId与JWT token中的userId一致
    const parsed = OnboardingPayload.safeParse(request.body);
    if (parsed.success && parsed.data.userId !== requestUserId) {
      return reply.code(403).send({ 
        error: 'forbidden', 
        message: 'User ID in request body does not match authenticated user' 
      });
    }
  }
});

const port = Number(config.PORT || 4101);
server
  .listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`profile-onboarding listening on :${port}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });