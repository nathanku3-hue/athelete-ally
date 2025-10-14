// Initialize OpenTelemetry first
import './telemetry';
import 'dotenv/config';
import Fastify from 'fastify';
import { z } from 'zod';
import { config } from './config';
import { prisma } from './db';
import { businessMetrics, traceFatigueAssessment, traceUserFeedback } from './telemetry';
import { AdjustmentEngine, FatigueData, TrainingSession } from './adjustment-engine';
import { createFastifyHealthHandler } from '@athlete-ally/health-schema';

const server = Fastify({ logger: true });
const adjustmentEngine = new AdjustmentEngine();

// Validation schemas
const FatigueAssessmentSchema = z.object({
  userId: z.string(),
  sessionId: z.string().optional(),
  overallFatigue: z.number().min(1).max(5),
  physicalFatigue: z.number().min(1).max(5),
  mentalFatigue: z.number().min(1).max(5),
  sleepQuality: z.number().min(1).max(5),
  stressLevel: z.number().min(1).max(5),
  notes: z.string().optional(),
  previousWorkout: z.string().optional(),
  timeSinceLastWorkout: z.number().optional(),
  assessmentType: z.enum(['pre_workout', 'post_workout', 'daily']).default('pre_workout'),
});

const AdjustmentFeedbackSchema = z.object({
  adjustmentId: z.string(),
  satisfactionScore: z.number().min(1).max(5),
  feedback: z.string().optional(),
});

// Health check with unified schema (root level for infrastructure)
server.get('/health', createFastifyHealthHandler({
  serviceName: 'fatigue-service',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
}));

// API Routes Plugin with /api/v1 prefix
server.register(async (apiRoutes) => {
  // Submit fatigue assessment
  apiRoutes.post('/fatigue/assess', async (request, reply) => {
  const startTime = Date.now();
  
  try {
    const parsed = FatigueAssessmentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid fatigue assessment data' });
    }

    const data = parsed.data;
    const span = traceFatigueAssessment(data.userId, data.overallFatigue, data.assessmentType);

    // Save fatigue assessment
    const assessment = await prisma.fatigueAssessment.create({
      data: {
        userId: data.userId,
        sessionId: data.sessionId,
        overallFatigue: data.overallFatigue,
        physicalFatigue: data.physicalFatigue,
        mentalFatigue: data.mentalFatigue,
        sleepQuality: data.sleepQuality,
        stressLevel: data.stressLevel,
        notes: data.notes,
        previousWorkout: data.previousWorkout,
        timeSinceLastWorkout: data.timeSinceLastWorkout,
        assessmentType: data.assessmentType,
      },
    });

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/fatigue/assess',
      'http.status_code': '200',
    });

    businessMetrics.fatigueAssessments.add(1, {
      'user.id': data.userId,
      'assessment.type': data.assessmentType,
    });

    span.setStatus({ code: 1, message: 'Assessment saved successfully' });
    span.end();

    return { assessmentId: assessment.id, message: 'Fatigue assessment recorded' };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to save fatigue assessment');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

  // Get training adjustments based on fatigue
  apiRoutes.post('/fatigue/adjustments', async (request, reply) => {
  const startTime = Date.now();
  
  try {
    const { fatigueData, trainingSession } = request.body as {
      fatigueData: FatigueData;
      trainingSession: TrainingSession;
    };

    const userId = (request.body as any).userId;
    if (!userId) {
      return reply.code(400).send({ error: 'User ID is required' });
    }

    // Generate adjustments
    const adjustments = await adjustmentEngine.generateAdjustments(
      userId,
      fatigueData,
      trainingSession
    );

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/fatigue/adjustments',
      'http.status_code': '200',
    });

    return {
      adjustments,
      summary: {
        totalAdjustments: adjustments.length,
        highConfidence: adjustments.filter(a => a.confidence > 0.7).length,
        recommendedActions: adjustments.map(a => a.reason),
      },
    };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to generate adjustments');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

  // Submit adjustment feedback
  apiRoutes.post('/fatigue/feedback', async (request, reply) => {
  const startTime = Date.now();
  
  try {
    const parsed = AdjustmentFeedbackSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid feedback data' });
    }

    const { adjustmentId, satisfactionScore, feedback } = parsed.data;
    
    const span = traceUserFeedback('user', satisfactionScore, adjustmentId);
    
    await adjustmentEngine.recordAdjustmentFeedback(
      adjustmentId,
      satisfactionScore,
      feedback
    );

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/fatigue/feedback',
      'http.status_code': '200',
    });

    businessMetrics.adjustmentSuccess.add(1, {
      'adjustment.id': adjustmentId,
      'satisfaction.score': satisfactionScore.toString(),
    });

    span.setStatus({ code: 1, message: 'Feedback recorded successfully' });
    span.end();

    return { message: 'Feedback recorded successfully' };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to record feedback');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

  // Get user's fatigue history
  apiRoutes.get('/fatigue/history/:userId', async (request, reply) => {
  const startTime = Date.now();
  const { userId } = request.params as { userId: string };
  
  try {
    const assessments = await prisma.fatigueAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30, // Last 30 assessments
    });

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/fatigue/history/:userId',
      'http.status_code': '200',
    });

    return { assessments };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to get fatigue history');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

  // Get user's fatigue profile
  apiRoutes.get('/fatigue/profile/:userId', async (request, reply) => {
  const startTime = Date.now();
  const { userId } = request.params as { userId: string };
  
  try {
    let profile = await prisma.userFatigueProfile.findUnique({
      where: { userId },
    });

    // Create profile if it doesn't exist
    if (!profile) {
      profile = await prisma.userFatigueProfile.create({
        data: {
          userId,
          autoAdjustEnabled: true,
          adjustmentSensitivity: 0.5,
          preferredAdjustmentTypes: ['intensity', 'volume'],
          lowFatigueThreshold: 2,
          highFatigueThreshold: 4,
        },
      });
    }

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/fatigue/profile/:userId',
      'http.status_code': '200',
    });

    return { profile };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to get fatigue profile');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

  // Update user's fatigue profile
  apiRoutes.put('/fatigue/profile/:userId', async (request, reply) => {
  const startTime = Date.now();
  const { userId } = request.params as { userId: string };
  const updateData = request.body as any;
  
  try {
    const profile = await prisma.userFatigueProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    });

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'PUT',
      'http.path': '/fatigue/profile/:userId',
      'http.status_code': '200',
    });

    return { profile };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to update fatigue profile');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

  // Get recent adjustments for a user
  apiRoutes.get('/fatigue/adjustments/:userId', async (request, reply) => {
  const startTime = Date.now();
  const { userId } = request.params as { userId: string };
  
  try {
    const adjustments = await prisma.trainingAdjustment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20, // Last 20 adjustments
    });

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/fatigue/adjustments/:userId',
      'http.status_code': '200',
    });

    return { adjustments };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to get adjustments');
    return reply.code(500).send({ error: 'Internal server error' });
  }
  });
}, { prefix: '/api/v1' });

const port = Number(config.PORT || 4104);
server
  .listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`fatigue-service listening on :${port}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

