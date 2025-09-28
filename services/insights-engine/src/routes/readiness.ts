import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '../../prisma/generated/client';
import { ReadinessTodaySchema, ReadinessRangeSchema, ReadinessDriver } from '@athlete-ally/shared-types';

interface ReadinessTodayQuery {
  userId: string;
}

interface ReadinessRangeQuery {
  userId: string;
  start: string;
  end: string;
}

export async function readinessRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();

  // GET /readiness/today?userId=
  fastify.get<{ Querystring: ReadinessTodayQuery }>('/readiness/today', async (request, reply) => {
    try {
      const { userId } = request.query;

      if (!userId) {
        return reply.code(400).send({ error: 'userId is required' });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const readinessScore = await prisma.readinessScore.findUnique({
        where: {
          userId_date: {
            userId,
            date: today
          }
        }
      });

      if (!readinessScore) {
        return reply.code(204).send();
      }

      // Build drivers array
      const drivers: ReadinessDriver[] = [
        {
          key: 'hrvDelta',
          label: 'HRV Delta',
          value: (readinessScore as any).hrvDelta
        },
        {
          key: 'trend3d',
          label: '3-Day Trend',
          value: (readinessScore as any).trend3d
        },
        {
          key: 'dataFreshness',
          label: 'Data Freshness',
          value: (readinessScore as any).dataFreshness
        }
      ];

      const response = {
        userId,
        date: today.toISOString().split('T')[0], // 'YYYY-MM-DD'
        readinessScore: readinessScore.score,
        drivers,
        timestamp: new Date().toISOString()
      };

      // Validate response with Zod schema
      const validatedResponse = ReadinessTodaySchema.parse(response);
      
      return reply.code(200).send(response);

    } catch (error: any) {
      fastify.log.error('Error fetching today readiness:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /readiness?userId=&start=YYYY-MM-DD&end=YYYY-MM-DD
  fastify.get<{ Querystring: ReadinessRangeQuery }>('/readiness', async (request, reply) => {
    try {
      const { userId, start, end } = request.query;

      if (!userId || !start || !end) {
        return reply.code(400).send({ error: 'userId, start, and end are required' });
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(start) || !dateRegex.test(end)) {
        return reply.code(400).send({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }

      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999); // End of day

      const readinessScores = await prisma.readinessScore.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          date: 'asc'
        }
      });

      if (readinessScores.length === 0) {
        return reply.code(204).send();
      }

      // Build response array
      const response = readinessScores.map(score => ({
        date: score.date.toISOString().split('T')[0], // 'YYYY-MM-DD'
        readinessScore: score.score,
        drivers: [
          {
            key: 'hrvDelta',
            label: 'HRV Delta',
            value: (score as any).hrvDelta
          },
          {
            key: 'trend3d',
            label: '3-Day Trend',
            value: (score as any).trend3d
          },
          {
            key: 'dataFreshness',
            label: 'Data Freshness',
            value: (score as any).dataFreshness
          }
        ]
      }));

      // Validate response with Zod schema
      const validatedResponse = ReadinessRangeSchema.parse(response);
      
      return reply.code(200).send(response);

    } catch (error: any) {
      fastify.log.error('Error fetching readiness range:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      
      return reply.code(200).send({
        status: 'healthy',
        service: 'insights-engine',
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    } catch (error: any) {
      fastify.log.error('Health check failed:', error);
      return reply.code(503).send({
        status: 'unhealthy',
        service: 'insights-engine',
        timestamp: new Date().toISOString(),
        database: 'disconnected'
      });
    }
  });

  // Metrics endpoint (placeholder)
  fastify.get('/metrics', async (request, reply) => {
    reply.type('text/plain');
    return '# metrics placeholder\n';
  });
}
