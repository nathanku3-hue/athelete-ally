import { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

/**
 * Register Magic Slice routes for frontend hooks
 * These routes match the frontend API calls and proxy to appropriate services
 */
export function registerMagicSliceRoutes(server: FastifyInstance) {
  // Enhanced plan generation routes
  server.post('/v1/plans/enhanced/generate', async (request, reply) => {
    try {
      const response = await fetch(`${process.env.PLANNING_ENGINE_URL}/api/v1/plans/enhanced/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.authorization || '',
        },
        body: JSON.stringify(request.body),
      });

      const data = await response.json();
      reply.status(response.status).send(data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      reply.status(500).send({ error: 'Internal server error', message: errMsg });
    }
  });

  // Standard plan generation routes
  server.post('/v1/plans/generate', async (request, reply) => {
    try {
      const response = await fetch(`${process.env.PLANNING_ENGINE_URL}/api/v1/plans/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.authorization || '',
        },
        body: JSON.stringify(request.body),
      });

      const data = await response.json();
      reply.status(response.status).send(data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      reply.status(500).send({ error: 'Internal server error', message: errMsg });
    }
  });

  // Plan feedback routes
  server.post('/v1/plans/feedback', async (request, reply) => {
    try {
      const response = await fetch(`${process.env.PLANNING_ENGINE_URL}/api/v1/plans/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.authorization || '',
        },
        body: JSON.stringify(request.body),
      });

      const data = await response.json();
      reply.status(response.status).send(data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      reply.status(500).send({ error: 'Internal server error', message: errMsg });
    }
  });

  // Onboarding routes
  server.post('/v1/onboarding', async (request, reply) => {
    try {
      const response = await fetch(`${process.env.PROFILE_ONBOARDING_URL}/api/v1/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.authorization || '',
        },
        body: JSON.stringify(request.body),
      });

      const data = await response.json();
      reply.status(response.status).send(data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      reply.status(500).send({ error: 'Internal server error', message: errMsg });
    }
  });

  // Health check for Magic Slice routes
  server.get('/v1/health', async (request, reply) => {
    reply.send({ status: 'ok', service: 'magic-slice-routes' });
  });
}