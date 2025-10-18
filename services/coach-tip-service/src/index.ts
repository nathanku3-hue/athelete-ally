import 'dotenv/config';
import Fastify from 'fastify';
import { Redis } from 'ioredis';
import { EventBus } from '@athlete-ally/event-bus';
import { CoachTipGenerator } from './tip-generator.js';
import { TipStorage } from './tip-storage.js';
import { CoachTipSubscriber } from './subscriber.js';
import { registerCoachTipRoutes } from './routes/coach-tips.js';
import { register as metricsRegister } from './metrics.js';

// Configuration
const config = {
  PORT: Number(process.env.PORT) || 4106,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// Global components
let redis: Redis;
let eventBus: EventBus;
let tipGenerator: CoachTipGenerator;
let tipStorage: TipStorage;
let subscriber: CoachTipSubscriber;

const server = Fastify({ 
  logger: {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

/**
 * Initialize all service components
 */
async function initializeComponents() {
  // Initialize Redis connection
  redis = new Redis(config.REDIS_URL, {
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true
  });
  
  await redis.connect();
  server.log.info('Connected to Redis');

  // Initialize event bus
  eventBus = new EventBus();
  await eventBus.connect(process.env.NATS_URL || 'nats://localhost:4223');
  
  server.log.info('Event bus connected');

  // Initialize tip generator
  tipGenerator = new CoachTipGenerator();
  server.log.info('Tip generator initialized');

  // Initialize tip storage
  tipStorage = new TipStorage(redis);
  server.log.info('Tip storage initialized');

  // Initialize event subscriber  
  subscriber = new CoachTipSubscriber(eventBus, tipGenerator, tipStorage);
  await subscriber.connect();
  server.log.info('Event subscriber connected');
}

/**
 * Register API routes and middleware
 */
async function setupRoutes() {
  // Prometheus metrics endpoint (aggregates EventBus + CoachTip service metrics)
  server.get('/metrics', async (_request, reply) => {
    try {
      // Get EventBus metrics
      const eventBusMetrics = await eventBus.getMetrics();

      // Get CoachTip service metrics (from our custom register)
      const serviceMetrics = await metricsRegister.metrics();

      // Combine both metric outputs
      const combinedMetrics = `${eventBusMetrics}\n${serviceMetrics}`;

      return reply.type('text/plain').send(combinedMetrics);
    } catch (error) {
      server.log.error({ error }, 'Failed to collect metrics');
      return reply.code(500).send('Failed to collect metrics');
    }
  });

  // Enhanced health check endpoint with detailed component status
  server.get('/health', async (_request, reply) => {
    const redisStatus = redis.status;
    const subscriberConnected = subscriber.isConnected();
    const subscriberStats = subscriber.getStats();

    // Check EventBus connection
    let eventBusConnected = false;
    let eventBusStatus = 'disconnected';
    try {
      const nc = eventBus.getNatsConnection();
      eventBusConnected = !nc.isClosed();
      eventBusStatus = eventBusConnected ? 'connected' : 'closed';
    } catch (e) {
      eventBusStatus = 'not_initialized';
    }

    // Calculate health based on error rate
    const errorRateThreshold = 100;
    const subscriberHealthy = subscriberConnected && subscriberStats.errors < errorRateThreshold;

    const isHealthy = redisStatus === 'ready' && subscriberConnected && eventBusConnected && subscriberHealthy;

    return reply.code(isHealthy ? 200 : 503).send({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '0.1.0',
      components: {
        redis: {
          status: redisStatus,
          healthy: redisStatus === 'ready'
        },
        eventBus: {
          status: eventBusStatus,
          connected: eventBusConnected,
          healthy: eventBusConnected
        },
        subscriber: {
          connected: subscriberConnected,
          eventsReceived: subscriberStats.eventsReceived,
          tipsGenerated: subscriberStats.tipsGenerated,
          tipsSkipped: subscriberStats.tipsSkipped,
          errors: subscriberStats.errors,
          lastEventTimestamp: subscriberStats.lastEventTimestamp,
          errorsByType: subscriberStats.errorsByType,
          skipReasons: subscriberStats.skipReasons,
          healthy: subscriberHealthy,
          errorRateThreshold
        },
        tipStorage: {
          status: 'operational',
          healthy: true
        }
      }
    });
  });

  // Service info endpoint
  server.get('/info', async (_request, reply) => {
    return reply.send({
      service: 'coach-tip-service',
      version: '0.1.0',
      description: 'CoachTip generation service for personalized coaching recommendations',
      endpoints: [
        'GET /health - Health check with component status',
        'GET /metrics - Prometheus metrics',
        'GET /info - Service information',
        'GET /subscriber/status - Event subscriber statistics',
        'GET /v1/plans/:id/coach-tip',
        'GET /v1/coach-tips/:tipId', 
        'GET /v1/users/:userId/coach-tips',
        'GET /v1/coach-tips/stats',
        'POST /v1/coach-tips/cleanup'
      ],
      observability: {
        structuredLogging: true,
        prometheusMetrics: true,
        correlationIds: true
      },
      timestamp: new Date().toISOString()
    });
  });

  // Subscriber status endpoint with detailed statistics
  server.get('/subscriber/status', async (_request, reply) => {
    const stats = subscriber.getStats();
    return reply.send({
      ...stats,
      performance: {
        successRate: stats.eventsReceived > 0
          ? ((stats.tipsGenerated / stats.eventsReceived) * 100).toFixed(2) + '%'
          : '0%',
        skipRate: stats.eventsReceived > 0
          ? ((stats.tipsSkipped / stats.eventsReceived) * 100).toFixed(2) + '%'
          : '0%',
        errorRate: stats.eventsReceived > 0
          ? ((stats.errors / stats.eventsReceived) * 100).toFixed(2) + '%'
          : '0%'
      }
    });
  });

  // Register CoachTip API routes
  await registerCoachTipRoutes(server, tipStorage);
  server.log.info('API routes registered');
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown() {
  const gracefulShutdown = async (signal: string) => {
    server.log.info(`Received ${signal}, starting graceful shutdown...`);
    
    try {
      // Stop accepting new requests
      await server.close();
      server.log.info('HTTP server closed');

      // Disconnect event subscriber
      if (subscriber) {
        await subscriber.disconnect();
        server.log.info('Event subscriber disconnected');
      }

      // Close Redis connection
      if (redis) {
        await redis.disconnect();
        server.log.info('Redis connection closed');
      }

      server.log.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      server.log.error({ error }, 'Error during graceful shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));
}

/**
 * Setup periodic maintenance tasks
 */
function setupMaintenanceTasks() {
  // Clean up expired tips every hour
  const cleanupInterval = setInterval(async () => {
    try {
      const cleanedCount = await tipStorage.cleanupExpiredTips();
      if (cleanedCount > 0) {
        server.log.info({ cleanedCount }, 'Periodic cleanup completed');
      }
    } catch (error) {
      server.log.error({ error }, 'Periodic cleanup failed');
    }
  }, 60 * 60 * 1000); // 1 hour

  // Clear interval on shutdown
  process.once('SIGTERM', () => clearInterval(cleanupInterval));
  process.once('SIGINT', () => clearInterval(cleanupInterval));
}

/**
 * Main server startup
 */
async function start() {
  try {
    server.log.info('Starting CoachTip service...');
    
    // Initialize components
    await initializeComponents();
    
    // Setup routes and middleware
    await setupRoutes();
    
    // Setup graceful shutdown
    setupGracefulShutdown();
    
    // Setup maintenance tasks
    setupMaintenanceTasks();
    
    // Start HTTP server
    await server.listen({ 
      port: config.PORT, 
      host: '0.0.0.0' 
    });
    
    server.log.info(`CoachTip service listening on port ${config.PORT}`);
    server.log.info('Service startup completed successfully');
    
  } catch (error) {
    server.log.error({ error }, 'Failed to start CoachTip service');
    process.exit(1);
  }
}

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the service
start().catch((error) => {
  console.error('Startup error:', error);
  process.exit(1);
});