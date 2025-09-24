// Initialize OpenTelemetry first
import './telemetry';
import 'dotenv/config';
import Fastify from 'fastify';
import { z } from 'zod';
import { config } from './config';
import { prisma } from './db';
import { businessMetrics } from './telemetry';
import { WorkoutSessionManager } from './session-manager';
import { AchievementEngine } from './achievement-engine';
import { createFastifyHealthHandler } from '@athlete-ally/health-schema';

const server = Fastify({ logger: true });
const sessionManager = new WorkoutSessionManager();
const achievementEngine = new AchievementEngine();

// Validation schemas
const WorkoutSessionSchema = z.object({
  userId: z.string(),
  planId: z.string().optional(),
  sessionName: z.string().optional(),
  location: z.string().optional(),
  weather: z.string().optional(),
  temperature: z.number().optional(),
});

const WorkoutExerciseSchema = z.object({
  exerciseId: z.string().optional(),
  exerciseName: z.string(),
  category: z.string(),
  order: z.number(),
  targetSets: z.number(),
  targetReps: z.number(),
  targetWeight: z.number().optional(),
  targetDuration: z.number().optional(),
  targetRest: z.number().optional(),
});

const WorkoutRecordSchema = z.object({
  setNumber: z.number(),
  targetReps: z.number(),
  actualReps: z.number(),
  targetWeight: z.number().optional(),
  actualWeight: z.number().optional(),
  targetDuration: z.number().optional(),
  actualDuration: z.number().optional(),
  restTime: z.number().optional(),
  rpe: z.number().min(1).max(10).optional(),
  form: z.number().min(1).max(5).optional(),
  difficulty: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

const PersonalRecordSchema = z.object({
  userId: z.string(),
  exerciseId: z.string().optional(),
  exerciseName: z.string(),
  recordType: z.enum(['max_weight', 'max_reps', 'max_volume', 'max_duration']),
  value: z.number(),
  unit: z.string(),
  sessionId: z.string().optional(),
  setNumber: z.number().optional(),
  notes: z.string().optional(),
});

const WorkoutGoalSchema = z.object({
  userId: z.string(),
  exerciseId: z.string().optional(),
  exerciseName: z.string(),
  goalType: z.enum(['weight', 'reps', 'volume', 'frequency', 'consistency']),
  targetValue: z.number(),
  unit: z.string(),
  startDate: z.string().transform(str => new Date(str)),
  targetDate: z.string().transform(str => new Date(str)),
  milestones: z.array(z.object({
    value: z.number(),
    date: z.string().transform(str => new Date(str)),
    description: z.string(),
  })).optional(),
});

// Health check with unified schema
server.get('/health', createFastifyHealthHandler({
  serviceName: 'workouts-service',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
}));

// 获取用户摘要数据
server.get('/api/v1/summary/:userId', async (request, reply) => {
  const { userId } = request.params as { userId: string };
  const { timeRange = '30d' } = request.query as { timeRange?: string };
  
  try {
    // 计算时间范围
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 查询摘要数据
    const summary = await prisma.userSummary.findFirst({
      where: {
        userId: userId,
        weekStart: {
          gte: startDate,
        },
      },
      orderBy: {
        weekStart: 'desc',
      },
    });

    if (!summary) {
      // 如果没有摘要数据，返回空数据
      return reply.code(200).send({
        userId: userId,
        timeRange: timeRange,
        personalRecords: [],
        recentSessions: [],
        personalRecordsSet: 0,
        completedWorkouts: 0,
        weeklyGoalCompletion: 0,
        recordTypes: [],
        message: 'No summary data available',
      });
    }

    // 查询最近的训练会话
    const recentSessions = await prisma.workoutSession.findMany({
      where: {
        userId: userId,
        startedAt: {
          gte: startDate,
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        sessionName: true,
        status: true,
        startedAt: true,
        completedAt: true,
        totalDuration: true,
        overallRating: true,
        difficulty: true,
        energy: true,
        motivation: true,
      },
    });

    // 查询个人记录
    const personalRecords = await prisma.workoutRecord.findMany({
      where: {
        session: {
          userId: userId,
          startedAt: {
            gte: startDate,
          },
        },
        isPersonalRecord: true,
      },
      include: {
        exercise: {
          select: {
            name: true,
            category: true,
          },
        },
        session: {
          select: {
            startedAt: true,
          },
        },
      },
      orderBy: {
        session: {
          startedAt: 'desc',
        },
      },
      take: 20,
    });

    // 格式化个人记录数据
    const formattedRecords = personalRecords.map(record => ({
      id: record.id,
      exerciseName: record.exercise.name,
      category: record.exercise.category,
      weight: record.weight,
      reps: record.reps,
      setNumber: record.setNumber,
      notes: record.notes,
      date: record.session.startedAt,
    }));

    // 计算记录类型分布
    const recordTypes = personalRecords.reduce((acc: any[], record) => {
      const category = record.exercise.category;
      const existing = acc.find(item => item.type === category);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ type: category, count: 1 });
      }
      return acc;
    }, []);

    return reply.code(200).send({
      userId: userId,
      timeRange: timeRange,
      personalRecords: formattedRecords,
      recentSessions: recentSessions,
      personalRecordsSet: summary.personalRecordsSet,
      completedWorkouts: summary.completedWorkouts,
      weeklyGoalCompletion: summary.weeklyGoalCompletion,
      consistencyScore: summary.consistencyScore,
      totalVolume: summary.totalVolume,
      averageSessionDuration: summary.averageSessionDuration,
      averageFatigueLevel: summary.averageFatigueLevel,
      recordTypes: recordTypes,
      lastUpdated: summary.lastUpdated,
    });
  } catch (error) {
    server.log.error({ error, userId, timeRange }, 'Failed to fetch summary data');
    return reply.code(500).send({ error: 'summary_fetch_failed' });
  }
});

// Session Management Endpoints
server.post('/sessions', async (request, reply) => {
  const startTime = Date.now();
  
  try {
    const parsed = WorkoutSessionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid session data' });
    }

    const session = await sessionManager.createSession(parsed.data);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/sessions',
      'http.status_code': '200',
    });

    return { session };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to create session');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.post('/sessions/:id/start', async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  const { userId } = request.body as { userId: string };
  
  try {
    const session = await sessionManager.startSession(id, userId);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/sessions/:id/start',
      'http.status_code': '200',
    });

    return { session };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to start session');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.post('/sessions/:id/pause', async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  const { userId } = request.body as { userId: string };
  
  try {
    const session = await sessionManager.pauseSession(id, userId);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/sessions/:id/pause',
      'http.status_code': '200',
    });

    return { session };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to pause session');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.post('/sessions/:id/resume', async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  const { userId } = request.body as { userId: string };
  
  try {
    const session = await sessionManager.resumeSession(id, userId);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/sessions/:id/resume',
      'http.status_code': '200',
    });

    return { session };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to resume session');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.post('/sessions/:id/complete', async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  const sessionData = request.body as {
    userId: string;
    notes?: string;
    overallRating?: number;
    difficulty?: number;
    energy?: number;
    motivation?: number;
  };
  
  try {
    const session = await sessionManager.completeSession(id, sessionData.userId, sessionData);

    // Check for personal records
    const newRecords = await achievementEngine.checkAndUpdatePersonalRecords(id, sessionData.userId);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/sessions/:id/complete',
      'http.status_code': '200',
    });

    return { 
      session,
      newRecords: newRecords.map(r => ({
        id: r.id,
        exerciseName: r.exerciseName,
        recordType: r.recordType,
        value: r.value,
        unit: r.unit,
      })),
    };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to complete session');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Exercise Management Endpoints
server.post('/sessions/:id/exercises', async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  const { userId, ...exerciseData } = request.body as { userId: string } & any;
  
  try {
    const parsed = WorkoutExerciseSchema.safeParse(exerciseData);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid exercise data' });
    }

    const exercise = await sessionManager.addExerciseToSession(id, userId, parsed.data);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/sessions/:id/exercises',
      'http.status_code': '200',
    });

    return { exercise };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to add exercise');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.post('/exercises/:id/records', async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  const { userId, ...recordData } = request.body as { userId: string } & any;
  
  try {
    const parsed = WorkoutRecordSchema.safeParse(recordData);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid record data' });
    }

    const record = await sessionManager.addRecordToExercise(id, userId, parsed.data);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/exercises/:id/records',
      'http.status_code': '200',
    });

    return { record };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to add record');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Session Query Endpoints
server.get('/sessions/:id', async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  const { userId } = request.query as { userId: string };
  
  try {
    const session = await sessionManager.getSessionById(id, userId);
    if (!session) {
      return reply.code(404).send({ error: 'Session not found' });
    }

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/sessions/:id',
      'http.status_code': '200',
    });

    return { session };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to get session');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.get('/sessions', async (request, reply) => {
  const startTime = Date.now();
  const { userId, limit = '20', offset = '0' } = request.query as { 
    userId: string; 
    limit?: string; 
    offset?: string; 
  };
  
  try {
    const sessions = await sessionManager.getSessionHistory(
      userId, 
      parseInt(limit), 
      parseInt(offset)
    );

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/sessions',
      'http.status_code': '200',
    });

    return { sessions };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to get sessions');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.get('/sessions/active/:userId', async (request, reply) => {
  const startTime = Date.now();
  const { userId } = request.params as { userId: string };
  
  try {
    const session = await sessionManager.getActiveSession(userId);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/sessions/active/:userId',
      'http.status_code': '200',
    });

    return { session };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to get active session');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Personal Records Endpoints
server.post('/records', async (request, reply) => {
  const startTime = Date.now();
  
  try {
    const parsed = PersonalRecordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid record data' });
    }

    const record = await achievementEngine.createPersonalRecord(parsed.data);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/records',
      'http.status_code': '200',
    });

    return { record };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to create record');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.get('/records/:userId', async (request, reply) => {
  const startTime = Date.now();
  const { userId } = request.params as { userId: string };
  const { exerciseId } = request.query as { exerciseId?: string };
  
  try {
    const records = await achievementEngine.getUserPersonalRecords(userId, exerciseId);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/records/:userId',
      'http.status_code': '200',
    });

    return { records };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to get records');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Goals Endpoints
server.post('/goals', async (request, reply) => {
  const startTime = Date.now();
  
  try {
    const parsed = WorkoutGoalSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid goal data' });
    }

    const goal = await achievementEngine.createWorkoutGoal(parsed.data);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/goals',
      'http.status_code': '200',
    });

    return { goal };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to create goal');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.get('/goals/:userId', async (request, reply) => {
  const startTime = Date.now();
  const { userId } = request.params as { userId: string };
  const { status } = request.query as { status?: 'active' | 'achieved' | 'expired' };
  
  try {
    const goals = await achievementEngine.getUserGoals(userId, status);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/goals/:userId',
      'http.status_code': '200',
    });

    return { goals };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to get goals');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.put('/goals/:id/progress', async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  const { userId, currentValue } = request.body as { userId: string; currentValue: number };
  
  try {
    const goal = await achievementEngine.updateGoalProgress(id, userId, currentValue);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'PUT',
      'http.path': '/goals/:id/progress',
      'http.status_code': '200',
    });

    return { goal };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to update goal progress');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Achievement Stats Endpoints
server.get('/achievements/:userId', async (request, reply) => {
  const startTime = Date.now();
  const { userId } = request.params as { userId: string };
  
  try {
    const stats = await achievementEngine.getAchievementStats(userId);

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/achievements/:userId',
      'http.status_code': '200',
    });

    return { stats };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to get achievements');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.get('/achievements/:userId/recent', async (request, reply) => {
  const startTime = Date.now();
  const { userId } = request.params as { userId: string };
  const { limit = '10' } = request.query as { limit?: string };
  
  try {
    const achievements = await achievementEngine.getRecentAchievements(userId, parseInt(limit));

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/achievements/:userId/recent',
      'http.status_code': '200',
    });

    return { achievements };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to get recent achievements');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

const port = Number(config.PORT || 4105);
server
  .listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`workouts-service listening on :${port}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

