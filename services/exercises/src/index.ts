// Initialize OpenTelemetry first
import './telemetry';
import 'dotenv/config';
import Fastify from 'fastify';
import { z } from 'zod';
import { config } from './config';
import { prisma } from './db';
import { businessMetrics, traceExerciseSearch, traceExerciseView, traceExerciseRating } from './telemetry';

const server = Fastify({ logger: true });

// Validation schemas
const ExerciseSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  equipment: z.array(z.string()).optional(),
  difficulty: z.number().min(1).max(5).optional(),
  muscles: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const ExerciseRatingSchema = z.object({
  exerciseId: z.string(),
  userId: z.string(),
  rating: z.number().min(1).max(5),
  difficulty: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// Health check
server.get('/health', async () => ({ status: 'ok' }));

// Get exercise by ID
server.get('/exercises/:id', async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  
  try {
    const span = traceExerciseView(id, (request.headers as any)['user-id']);
    
    businessMetrics.exerciseRequests.add(1, {
      'exercise.id': id,
      'operation': 'get_by_id',
    });

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        exerciseVariations: true,
        userRatings: {
          select: {
            rating: true,
            difficulty: true,
            comment: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!exercise) {
      span.setStatus({ code: 2, message: 'Exercise not found' });
      span.end();
      return reply.code(404).send({ error: 'Exercise not found' });
    }

    // Calculate average rating
    const avgRating = exercise.userRatings.length > 0
      ? exercise.userRatings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / exercise.userRatings.length
      : 0;

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/exercises/:id',
      'http.status_code': '200',
    });

    businessMetrics.exerciseViews.add(1, {
      'exercise.id': id,
      'exercise.category': exercise.category,
    });

    span.setStatus({ code: 1, message: 'Success' });
    span.end();

    return {
      ...exercise,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: exercise.userRatings.length,
    };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to get exercise');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Search exercises
server.get('/exercises', async (request, reply) => {
  const startTime = Date.now();
  const query = request.query as any;
  
  try {
    const parsed = ExerciseSearchSchema.safeParse(query);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid query parameters' });
    }

    const { query: searchQuery, category, equipment, difficulty, muscles, limit, offset } = parsed.data;
    
    const span = traceExerciseSearch(searchQuery || '', {
      category,
      equipment,
      difficulty,
      muscles,
    }, (request.headers as any)['user-id']);

    businessMetrics.exerciseSearches.add(1, {
      'search.query': searchQuery || 'empty',
      'search.category': category || 'all',
    });

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { has: searchQuery.toLowerCase() } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (equipment && equipment.length > 0) {
      where.equipment = { hasSome: equipment };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (muscles && muscles.length > 0) {
      where.OR = [
        ...(where.OR || []),
        { primaryMuscles: { hasSome: muscles } },
        { secondaryMuscles: { hasSome: muscles } },
      ];
    }

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        include: {
          userRatings: {
            select: { rating: true },
          },
        },
        orderBy: [
          { popularity: 'desc' },
          { name: 'asc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.exercise.count({ where }),
    ]);

    // Calculate average ratings
    const exercisesWithRatings = exercises.map((exercise: any) => {
      const avgRating = exercise.userRatings.length > 0
        ? exercise.userRatings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / exercise.userRatings.length
        : 0;

      return {
        ...exercise,
        averageRating: Math.round(avgRating * 10) / 10,
        totalRatings: exercise.userRatings.length,
        userRatings: undefined, // Remove from response
      };
    });

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/exercises',
      'http.status_code': '200',
    });

    span.setStatus({ code: 1, message: 'Success' });
    span.end();

    return {
      exercises: exercisesWithRatings,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to search exercises');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Rate an exercise
server.post('/exercises/:id/rate', async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  
  try {
    const parsed = ExerciseRatingSchema.safeParse({
      ...(request.body as object || {}),
      exerciseId: id,
    });

    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid rating data' });
    }

    const { userId, rating, difficulty, comment } = parsed.data;
    
    const span = traceExerciseRating(id, rating, userId);

    // Check if exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      span.setStatus({ code: 2, message: 'Exercise not found' });
      span.end();
      return reply.code(404).send({ error: 'Exercise not found' });
    }

    // Upsert rating
    const exerciseRating = await prisma.exerciseRating.upsert({
      where: {
        exerciseId_userId: {
          exerciseId: id,
          userId,
        },
      },
      update: {
        rating,
        difficulty,
        comment,
      },
      create: {
        exerciseId: id,
        userId,
        rating,
        difficulty,
        comment,
      },
    });

    // Update exercise popularity
    await prisma.exercise.update({
      where: { id },
      data: {
        popularity: {
          increment: 1,
        },
      },
    });

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/exercises/:id/rate',
      'http.status_code': '200',
    });

    businessMetrics.exerciseRatings.add(1, {
      'exercise.id': id,
      'rating.value': rating.toString(),
    });

    span.setStatus({ code: 1, message: 'Success' });
    span.end();

    return exerciseRating;
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    server.log.error({ error }, 'Failed to rate exercise');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Get exercise categories
server.get('/categories', async (_request, reply) => {
  try {
    const categories = await prisma.exerciseCategory.findMany({
      orderBy: { order: 'asc' },
    });

    return { categories };
  } catch (error) {
    server.log.error({ error }, 'Failed to get categories');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Get popular exercises
server.get('/exercises/popular', async (_request, reply) => {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { isActive: true },
      orderBy: { popularity: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        primaryMuscles: true,
        equipment: true,
        imageUrl: true,
        popularity: true,
      },
    });

    return { exercises };
  } catch (error) {
    server.log.error({ error }, 'Failed to get popular exercises');
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

const port = Number(config.PORT || 4103);
server
  .listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`exercises-service listening on :${port}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

