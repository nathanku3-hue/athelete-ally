import Fastify from 'fastify';
import { PrismaClient } from '../prisma/generated/client';

const fastify = Fastify({
  logger: true
});

const prisma = new PrismaClient();

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'healthy', 
    service: 'insights',
    timestamp: new Date().toISOString()
  };
});

// Readiness endpoints
fastify.get('/readiness/today', async (request, reply) => {
  try {
    const { userId } = request.query as { userId: string };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const score = await prisma.readinessScore.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    });
    
    if (!score) {
      return reply.code(204).send(); // No data available
    }
    
    return {
      userId: score.userId,
      date: score.date,
      score: score.score,
      drivers: score.drivers
    };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Internal server error' });
  }
});

fastify.get('/readiness', async (request, reply) => {
  try {
    const { userId, start, end } = request.query as { 
      userId: string; 
      start?: string; 
      end?: string; 
    };
    
    const startDate = start ? new Date(start) : new Date();
    const endDate = end ? new Date(end) : new Date();
    
    const scores = await prisma.readinessScore.findMany({
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
    
    if (scores.length === 0) {
      return reply.code(204).send(); // No data available
    }
    
    return {
      userId,
      period: { start: startDate, end: endDate },
      scores: scores.map((s: any) => ({
        date: s.date,
        score: s.score,
        drivers: s.drivers
      }))
    };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Internal server error' });
  }
});

// Readiness calculation drivers
interface ReadinessDrivers {
  hrv_delta: number;
  trend_3d: number;
  data_freshness: number;
}

async function calculateReadinessDrivers(userId: string, date: Date): Promise<ReadinessDrivers> {
  // HRV Delta: lnRMSSD - 7-day baseline
  const hrvDelta = await calculateHrvDelta(userId, date);
  
  // Trend 3d: short trend analysis
  const trend3d = await calculateTrend3d(userId, date);
  
  // Data freshness: minutes since capturedAt
  const dataFreshness = await calculateDataFreshness(userId, date);
  
  return {
    hrv_delta: hrvDelta,
    trend_3d: trend3d,
    data_freshness: dataFreshness
  };
}

async function calculateHrvDelta(userId: string, date: Date): Promise<number> {
  // TODO: Implement HRV delta calculation
  // This should query the normalize service's database or API
  // For now, return a placeholder value
  return 0;
}

async function calculateTrend3d(userId: string, date: Date): Promise<number> {
  // Get last 3 days of readiness scores
  const threeDaysAgo = new Date(date);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const recentScores = await prisma.readinessScore.findMany({
    where: {
      userId,
      date: {
        gte: threeDaysAgo,
        lt: date
      }
    },
    orderBy: { date: 'desc' },
    take: 3
  });
  
  if (recentScores.length < 2) {
    return 0; // Not enough data for trend
  }
  
  // Simple linear trend calculation
  const scores = recentScores.map((s: any) => s.score);
  const trend = scores[0] - scores[scores.length - 1];
  return trend;
}

async function calculateDataFreshness(userId: string, date: Date): Promise<number> {
  // TODO: Implement data freshness calculation
  // This should query the normalize service's database or API
  // For now, return a placeholder value
  return 0;
}

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '4109');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Insights service listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
