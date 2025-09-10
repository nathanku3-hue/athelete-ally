// Initialize OpenTelemetry first
import './telemetry.js';
import 'dotenv/config';
import Fastify from 'fastify';
import { Client as PgClient } from 'pg';
import { Redis } from 'ioredis';
import { config } from './config.js';
import { prisma } from './db.js';
import { z } from 'zod';
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
        .array(z.object({ day: z.string(), start: z.string(), end: z.string() }))
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
        // Create or update user with onboarding data
        const user = await prisma.user.upsert({
            where: { id: parsed.data.userId },
            update: {
                // Step 1: Training Purpose
                purpose: parsed.data.purpose,
                purposeDetails: parsed.data.purposeDetails,
                // Step 2: Proficiency Level
                proficiency: parsed.data.proficiency,
                // Step 3: Season and Goals
                season: parsed.data.season,
                competitionDate: parsed.data.competitionDate ? new Date(parsed.data.competitionDate) : null,
                // Step 4: Availability
                availabilityDays: parsed.data.availabilityDays,
                weeklyGoalDays: parsed.data.weeklyGoalDays,
                // Step 5: Equipment and scheduling
                equipment: parsed.data.equipment || [],
                fixedSchedules: parsed.data.fixedSchedules || [],
                // Step 6: Recovery habits
                recoveryHabits: parsed.data.recoveryHabits || [],
                // Onboarding status
                onboardingStep: parsed.data.onboardingStep || 1,
                isOnboardingComplete: parsed.data.isOnboardingComplete || false,
            },
            create: {
                id: parsed.data.userId,
                // Step 1: Training Purpose
                purpose: parsed.data.purpose,
                purposeDetails: parsed.data.purposeDetails,
                // Step 2: Proficiency Level
                proficiency: parsed.data.proficiency,
                // Step 3: Season and Goals
                season: parsed.data.season,
                competitionDate: parsed.data.competitionDate ? new Date(parsed.data.competitionDate) : null,
                // Step 4: Availability
                availabilityDays: parsed.data.availabilityDays,
                weeklyGoalDays: parsed.data.weeklyGoalDays,
                // Step 5: Equipment and scheduling
                equipment: parsed.data.equipment || [],
                fixedSchedules: parsed.data.fixedSchedules || [],
                // Step 6: Recovery habits
                recoveryHabits: parsed.data.recoveryHabits || [],
                // Onboarding status
                onboardingStep: parsed.data.onboardingStep || 1,
                isOnboardingComplete: parsed.data.isOnboardingComplete || false,
            },
        });
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
const port = Number(config.PORT || 4101);
server
    .listen({ port, host: '0.0.0.0' })
    .then(() => console.log(`profile-onboarding listening on :${port}`))
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map