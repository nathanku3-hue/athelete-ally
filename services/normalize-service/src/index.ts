/**
 * Normalize Service - Main Entry Point
 * Orchestrates HRV, Sleep, and Oura webhook data normalization
 */

// Initialize OpenTelemetry first
import './telemetry.js';

import type { NatsConnection } from 'nats';
import { PrismaClient } from '../prisma/generated/client';
import { EventBus } from '@athlete-ally/event-bus';
import { config } from './config.js';
import { createHttpServer } from './http/server.js';
import { registerRoutes } from './http/routes.js';
import { HRVConsumer } from './consumers/hrv-consumer.js';
import { SleepConsumer } from './consumers/sleep-consumer.js';
import { OuraConsumer } from './consumers/oura-consumer.js';

// Initialize core dependencies
const prisma = new PrismaClient();
const httpServer = createHttpServer();
let eventBus: EventBus;
let nc: NatsConnection | null = null;

// Consumer instances
let hrvConsumer: HRVConsumer;
let sleepConsumer: SleepConsumer;
let ouraConsumer: OuraConsumer;

/**
 * Connect to NATS and initialize consumers
 */
async function connectNATS() {
  try {
    // Initialize EventBus
    eventBus = new EventBus();
    await eventBus.connect(config.natsUrl);
    httpServer.log.info('Connected to EventBus');

    nc = eventBus.getNatsConnection();

    // Initialize and start consumers
    hrvConsumer = new HRVConsumer(eventBus, prisma, httpServer.log);
    await hrvConsumer.start();
    httpServer.log.info('HRV consumer started');

    sleepConsumer = new SleepConsumer(eventBus, prisma, httpServer.log);
    await sleepConsumer.start();
    httpServer.log.info('Sleep consumer started');

    ouraConsumer = new OuraConsumer(eventBus, httpServer.log);
    await ouraConsumer.start();
    httpServer.log.info('Oura consumer started');

  } catch (err) {
    httpServer.log.error(`Failed to connect to NATS: ${JSON.stringify(err)}`);
    throw err;
  }
}

/**
 * Start the service
 */
async function start() {
  try {
    // Register HTTP routes
    registerRoutes(httpServer, prisma, () => nc);

    // Connect to NATS and start consumers
    await connectNATS();

    // Start HTTP server
    await httpServer.listen({ port: config.port, host: config.host });
    httpServer.log.info(`Normalize service listening on port ${config.port}`);
  } catch (error) {
    httpServer.log.error(`Failed to start normalize service: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string) {
  httpServer.log.info(`Received ${signal}, shutting down gracefully...`);
  running = false;

  try {
    // Stop consumers
    if (hrvConsumer) hrvConsumer.stop();
    if (sleepConsumer) sleepConsumer.stop();

    // Close connections
    await httpServer.close();
    if (nc) await nc.close();
    await prisma.$disconnect();

    httpServer.log.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    httpServer.log.error(`Error during shutdown: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start the service
start().catch((error) => {
  httpServer.log.error('Failed to start service:', error);
  process.exit(1);
});
