// Initialize OpenTelemetry first
import './telemetry.js';
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fetch from 'node-fetch';
import { registerMagicSliceRoutes } from './lib/routes.js';

import { config } from './config.js';
import { authMiddleware, cleanupMiddleware } from '@athlete-ally/shared';
import { userRateLimitMiddleware, strictRateLimitMiddleware } from './middleware/rateLimiter.js';

// Create server
const server = Fastify({ logger: true });

// CORS configuration (dev-safe defaults; configurable via env)
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim());
const allowCredentials = (process.env.CORS_ALLOW_CREDENTIALS || 'true').toLowerCase() === 'true';

await server.register(cors, {
  origin: (origin, cb) => {
    // allow non-browser or same-origin requests
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS origin not allowed'));
  },
  credentials: allowCredentials,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
});

// Global hooks: auth first (to enrich request.user), then rate limiting, then cleanup
server.addHook('onRequest', authMiddleware);
server.addHook('onRequest', userRateLimitMiddleware);
server.addHook('onRequest', strictRateLimitMiddleware);
server.addHook('onSend', cleanupMiddleware);

// Swagger/OpenAPI under /api/docs
await server.register(swagger, {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'Athlete Ally API',
      version: '0.1.0',
      description: 'API for athlete strength & conditioning coaching app',
    },
    servers: [{ url: 'http://localhost:4000/api', description: 'Development server' }],
  },
});
await server.register(swaggerUi, { routePrefix: '/api/docs', uiConfig: { docExpansion: 'list', deepLinking: false } });

// Mount Magic Slice v1 routes under /api to expose /api/v1/* endpoints
await server.register(async (app) => {
  registerMagicSliceRoutes(app);
}, { prefix: '/api' });

// Also mount Magic Slice routes at root for clients calling '/v1/*'
registerMagicSliceRoutes(server);

// Root welcome
server.get('/', async () => ({ message: 'Welcome to the API!' }));

// Contracts and simple docs
server.get('/api/contracts/openapi.yaml', async (_req, reply) => {
  const fs = await import('fs');
  const path = await import('path');
  const p = path.resolve(process.cwd(), 'packages/contracts/openapi.yaml');
  const content = fs.readFileSync(p, 'utf8');
  reply.type('text/yaml').send(content);
});

server.get('/api/health', async () => ({ status: 'ok' }));
server.get('/health', async () => ({ status: 'ok' }));

// Basic v1 health for compatibility with frontend
server.get('/api/v1/health', async () => ({ status: 'ok' }));

// Proxy: Onboarding -> Profile Onboarding service
server.post('/api/v1/onboarding', async (request, reply) => {
  try {
    const url = `${config.PROFILE_ONBOARDING_URL}/v1/onboarding`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // pass Authorization downstream so service can extract user
        ...(request.headers.authorization ? { Authorization: String(request.headers.authorization) } : {}),
      },
      body: JSON.stringify(request.body || {}),
    });
    const text = await resp.text();
    try {
      const json = text ? JSON.parse(text) : {};
      return reply.code(resp.status).send(json);
    } catch {
      return reply.code(resp.status).send(text);
    }
  } catch (err) {
    request.log.error({ err }, 'onboarding proxy failed');
    if ((err as any)?.code === 'ECONNREFUSED') {\n    // Local dev stub: downstream unavailable, return accepted with stub jobId\n    const jobId = 'stub-' + Date.now();\n    return reply.code(202).send({ jobId, status: 'queued' });\n  }\n  return reply.code(502).send({ error: 'bad_gateway' });
  }
});

// Proxy: Plan generation -> Planning Engine
server.post('/api/v1/plans/generate', async (request, reply) => {
  try {
    const url = `${config.PLANNING_ENGINE_URL}/generate`;
    const user = (request as any).user;
    const body = { userId: user?.userId, ...(request.body as object || {}) };
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.authorization ? { Authorization: String(request.headers.authorization) } : {}),
      },
      body: JSON.stringify(body),
    });
    const text = await resp.text();
    try { return reply.code(resp.status).send(text ? JSON.parse(text) : {}); } catch { return reply.code(resp.status).send(text); }
  } catch (err) {
    request.log.error({ err }, 'plan generate proxy failed');
    if ((err as any)?.code === 'ECONNREFUSED') {\n    // Local dev stub: downstream unavailable, return accepted with stub jobId\n    const jobId = 'stub-' + Date.now();\n    return reply.code(202).send({ jobId, status: 'queued' });\n  }\n  return reply.code(502).send({ error: 'bad_gateway' });
  }
});

// Proxy: Plan generation status -> Planning Engine
server.get('/api/v1/plans/status', async (request, reply) => {
  try {
    const { jobId } = (request.query as any) || {};
    if (!jobId) return reply.code(400).send({ error: 'jobId_required' });
    const url = `${config.PLANNING_ENGINE_URL}/status/${encodeURIComponent(jobId)}`;
    const resp = await fetch(url, {
      headers: {
        ...(request.headers.authorization ? { Authorization: String(request.headers.authorization) } : {}),
      },
    });
    const text = await resp.text();
    try { return reply.code(resp.status).send(text ? JSON.parse(text) : {}); } catch { return reply.code(resp.status).send(text); }
  } catch (err) {
    request.log.error({ err }, 'plan status proxy failed');
    if ((err as any)?.code === 'ECONNREFUSED') {\n    // Local dev stub: downstream unavailable, return accepted with stub jobId\n    const jobId = 'stub-' + Date.now();\n    return reply.code(202).send({ jobId, status: 'queued' });\n  }\n  return reply.code(502).send({ error: 'bad_gateway' });
  }
});

// Proxy: Exercises list/search -> Exercises Service
server.get('/api/v1/exercises', async (request, reply) => {
  try {
    const qs = request.raw.url?.split('?')[1] || '';
    const url = `${config.EXERCISES_URL}/exercises${qs ? `?${qs}` : ''}`;
    const resp = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    const text = await resp.text();
    try { return reply.code(resp.status).send(text ? JSON.parse(text) : {}); } catch { return reply.code(resp.status).send(text); }
  } catch (err) {
    request.log.error({ err }, 'exercises list proxy failed');
    if ((err as any)?.code === 'ECONNREFUSED') {\n    // Local dev stub: downstream unavailable, return accepted with stub jobId\n    const jobId = 'stub-' + Date.now();\n    return reply.code(202).send({ jobId, status: 'queued' });\n  }\n  return reply.code(502).send({ error: 'bad_gateway' });
  }
});

// Proxy: Exercise by id -> Exercises Service
server.get('/api/v1/exercises/:id', async (request, reply) => {
  try {
    const { id } = request.params as any;
    const url = `${config.EXERCISES_URL}/exercises/${encodeURIComponent(id)}`;
    const resp = await fetch(url);
    const text = await resp.text();
    try { return reply.code(resp.status).send(text ? JSON.parse(text) : {}); } catch { return reply.code(resp.status).send(text); }
  } catch (err) {
    request.log.error({ err }, 'exercise by id proxy failed');
    if ((err as any)?.code === 'ECONNREFUSED') {\n    // Local dev stub: downstream unavailable, return accepted with stub jobId\n    const jobId = 'stub-' + Date.now();\n    return reply.code(202).send({ jobId, status: 'queued' });\n  }\n  return reply.code(502).send({ error: 'bad_gateway' });
  }
});

// Proxy: Workout summary -> Workouts Service (derive userId from JWT)
server.get('/api/v1/workouts/summary', async (request, reply) => {
  try {
    const user = (request as any).user;
    if (!user?.userId) return reply.code(401).send({ error: 'unauthorized' });
    const { timeRange = '30d' } = (request.query as any) || {};
    const url = `${config.WORKOUTS_URL}/api/v1/summary/${encodeURIComponent(user.userId)}?timeRange=${encodeURIComponent(timeRange)}`;
    const resp = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    const text = await resp.text();
    try { return reply.code(resp.status).send(text ? JSON.parse(text) : {}); } catch { return reply.code(resp.status).send(text); }
  } catch (err) {
    request.log.error({ err }, 'workout summary proxy failed');
    if ((err as any)?.code === 'ECONNREFUSED') {\n    // Local dev stub: downstream unavailable, return accepted with stub jobId\n    const jobId = 'stub-' + Date.now();\n    return reply.code(202).send({ jobId, status: 'queued' });\n  }\n  return reply.code(502).send({ error: 'bad_gateway' });
  }
});

// Proxy: Sessions (minimal)
server.get('/api/v1/sessions', async (request, reply) => {
  try {
    const user = (request as any).user;
    if (!user?.userId) return reply.code(401).send({ error: 'unauthorized' });
    const { limit, offset } = (request.query as any) || {};
    const qs = new URLSearchParams();
    qs.set('userId', user.userId);
    if (limit) qs.set('limit', String(limit));
    if (offset) qs.set('offset', String(offset));
    const url = `${config.WORKOUTS_URL}/sessions?${qs.toString()}`;
    const resp = await fetch(url);
    const text = await resp.text();
    try { return reply.code(resp.status).send(text ? JSON.parse(text) : {}); } catch { return reply.code(resp.status).send(text); }
  } catch (err) {
    request.log.error({ err }, 'sessions list proxy failed');
    if ((err as any)?.code === 'ECONNREFUSED') {\n    // Local dev stub: downstream unavailable, return accepted with stub jobId\n    const jobId = 'stub-' + Date.now();\n    return reply.code(202).send({ jobId, status: 'queued' });\n  }\n  return reply.code(502).send({ error: 'bad_gateway' });
  }
});

server.get('/api/v1/sessions/:id', async (request, reply) => {
  try {
    const user = (request as any).user;
    if (!user?.userId) return reply.code(401).send({ error: 'unauthorized' });
    const { id } = request.params as any;
    const url = `${config.WORKOUTS_URL}/sessions/${encodeURIComponent(id)}?userId=${encodeURIComponent(user.userId)}`;
    const resp = await fetch(url);
    const text = await resp.text();
    try { return reply.code(resp.status).send(text ? JSON.parse(text) : {}); } catch { return reply.code(resp.status).send(text); }
  } catch (err) {
    request.log.error({ err }, 'session by id proxy failed');
    if ((err as any)?.code === 'ECONNREFUSED') {\n    // Local dev stub: downstream unavailable, return accepted with stub jobId\n    const jobId = 'stub-' + Date.now();\n    return reply.code(202).send({ jobId, status: 'queued' });\n  }\n  return reply.code(502).send({ error: 'bad_gateway' });
  }
});

server.post('/api/v1/sessions', async (request, reply) => {
  try {
    const user = (request as any).user;
    if (!user?.userId) return reply.code(401).send({ error: 'unauthorized' });
    const url = `${config.WORKOUTS_URL}/sessions`;
    const body = { userId: user.userId, ...(request.body as object || {}) };
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const text = await resp.text();
    try { return reply.code(resp.status).send(text ? JSON.parse(text) : {}); } catch { return reply.code(resp.status).send(text); }
  } catch (err) {
    request.log.error({ err }, 'create session proxy failed');
    if ((err as any)?.code === 'ECONNREFUSED') {\n    // Local dev stub: downstream unavailable, return accepted with stub jobId\n    const jobId = 'stub-' + Date.now();\n    return reply.code(202).send({ jobId, status: 'queued' });\n  }\n  return reply.code(502).send({ error: 'bad_gateway' });
  }
});

server.post('/api/v1/sessions/:id/start', async (request, reply) => {
  try {
    const user = (request as any).user;
    if (!user?.userId) return reply.code(401).send({ error: 'unauthorized' });
    const { id } = request.params as any;
    const url = `${config.WORKOUTS_URL}/sessions/${encodeURIComponent(id)}/start`;
    const body = { userId: user.userId, ...(request.body as object || {}) };
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const text = await resp.text();
    try { return reply.code(resp.status).send(text ? JSON.parse(text) : {}); } catch { return reply.code(resp.status).send(text); }
  } catch (err) {
    request.log.error({ err }, 'start session proxy failed');
    if ((err as any)?.code === 'ECONNREFUSED') {\n    // Local dev stub: downstream unavailable, return accepted with stub jobId\n    const jobId = 'stub-' + Date.now();\n    return reply.code(202).send({ jobId, status: 'queued' });\n  }\n  return reply.code(502).send({ error: 'bad_gateway' });
  }
});

server.post('/api/v1/sessions/:id/complete', async (request, reply) => {
  try {
    const user = (request as any).user;
    if (!user?.userId) return reply.code(401).send({ error: 'unauthorized' });
    const { id } = request.params as any;
    const url = `${config.WORKOUTS_URL}/sessions/${encodeURIComponent(id)}/complete`;
    const body = { userId: user.userId, ...(request.body as object || {}) };
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const text = await resp.text();
    try { return reply.code(resp.status).send(text ? JSON.parse(text) : {}); } catch { return reply.code(resp.status).send(text); }
  } catch (err) {
    request.log.error({ err }, 'complete session proxy failed');
    if ((err as any)?.code === 'ECONNREFUSED') {\n    // Local dev stub: downstream unavailable, return accepted with stub jobId\n    const jobId = 'stub-' + Date.now();\n    return reply.code(202).send({ jobId, status: 'queued' });\n  }\n  return reply.code(502).send({ error: 'bad_gateway' });
  }
});

// Not yet implemented: PATCH session, complete exercise
server.patch('/api/v1/sessions/:id', async (_req, reply) => reply.code(501).send({ error: 'not_implemented' }));
server.post('/api/v1/sessions/:sessionId/exercises/:exerciseId/complete', async (_req, reply) => reply.code(501).send({ error: 'not_implemented' }));

// Start listening
const port = Number(config.PORT || 4000);
server
  .listen({ port, host: '0.0.0.0' })
  .then(() => server.log.info(`gateway-bff listening on :${port}`))
  .catch((err) => {
    server.log.error({ err }, 'Server startup error');
    process.exit(1);
  });


