// Initialize OpenTelemetry first
import { trackEvent } from './telemetry.js';
import 'dotenv/config';
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fetch from 'node-fetch';

import { config } from './config.js';
import { authMiddleware, cleanupMiddleware } from '@athlete-ally/shared';
import { userRateLimitMiddleware, strictRateLimitMiddleware } from './middleware/rateLimiter.js';
import { registerMagicSliceRoutes } from './lib/routes.js';

const hasCuratorAccess = (request: FastifyRequest) => {
  const user = (request as unknown as { user?: { role?: string } }).user;
  if (!user) return false;
  return user.role === 'curator' || user.role === 'admin';
};

type ProxyOptions = {
  method?: string;
  body?: unknown;
};

const forwardToPlanningEngine = async (
  request: FastifyRequest,
  reply: FastifyReply,
  path: string,
  options: ProxyOptions = {},
) => {
  try {
    const headers: Record<string, string> = {};
    const authHeader = request.headers.authorization;
    if (authHeader) {
      headers.Authorization = String(authHeader);
    }

    let body: string | undefined;
    const method = options.method ?? (options.body ? 'POST' : 'GET');
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }

    const response = await fetch(`${config.PLANNING_ENGINE_URL}${path}`, {
      method,
      headers,
      body,
    });

    const text = await response.text();
    try {
      const json = text ? JSON.parse(text) : {};
      return reply.code(response.status).send(json);
    } catch {
      return reply.code(response.status).send(text);
    }
  } catch (err) {
    request.log.error({ err, path }, 'movement curation proxy failed');
    return reply.code(502).send({ error: 'bad_gateway' });
  }
};

// Create server
const server = Fastify({ logger: true });

// CORS configuration (dev-safe defaults; configurable via env)
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim());
const allowCredentials = (process.env.CORS_ALLOW_CREDENTIALS || 'true').toLowerCase() === 'true';

await server.register(cors, {
  origin: (origin, cb) => {
    // Allow non-browser or same-origin requests
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    // Reject unauthorized origins
    cb(new Error('CORS origin not allowed'), false);
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

// Register Magic Slice routes for frontend hooks
registerMagicSliceRoutes(server);

// Root welcome
server.get('/', async () => ({ message: 'Welcome to the API!' }));

// Contracts and simple docs
server.get('/api/contracts/openapi.yaml', async (_req, reply) => {
  const fs = await import('fs');
  const path = await import('path');
  // Try container-safe path first, fallback to packages path
  const containerPath = path.resolve(process.cwd(), 'openapi.yaml');
  const packagesPath = path.resolve(process.cwd(), 'packages/contracts/openapi.yaml');
  
  let content: string;
  try {
    if (fs.existsSync(containerPath)) {
      content = fs.readFileSync(containerPath, 'utf8');
    } else {
      content = fs.readFileSync(packagesPath, 'utf8');
    }
  } catch (error) {
    reply.status(404).send({ error: 'OpenAPI spec not found' });
    return;
  }
  
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
    return reply.code(502).send({ error: 'bad_gateway' });
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
    return reply.code(502).send({ error: 'bad_gateway' });
  }
});

// Proxy: Time Crunch preview -> Planning Engine
server.post('/api/v1/time-crunch/preview', async (request, reply) => {
  try {
    const user = (request as any).user;
    const { planId, targetMinutes } = (request.body ?? {}) as {
      planId?: string;
      targetMinutes?: number;
    };

    if (typeof planId !== 'string' || planId.length === 0) {
      return reply.code(400).send({ error: 'planId_required' });
    }

    trackEvent('stream5.time_crunch_preview_requested', {
      planId,
      targetMinutes,
      compressionStrategy: 'pending',
      userId: user?.userId,
      source: 'gateway-bff'
    });

    const url = `${config.PLANNING_ENGINE_URL}/api/v1/time-crunch/preview`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.authorization ? { Authorization: String(request.headers.authorization) } : {}),
      },
      body: JSON.stringify(request.body || {}),
    });
    const text = await resp.text();
    try { return reply.code(resp.status).send(text ? JSON.parse(text) : {}); } catch { return reply.code(resp.status).send(text); }
  } catch (err) {
    request.log.error({ err }, 'time crunch preview proxy failed');
    return reply.code(502).send({ error: 'bad_gateway' });
  }
});

server.post('/api/v1/time-crunch/telemetry', async (request, reply) => {
  const user = (request as any).user;
  const { event, planId, targetMinutes, reason, compressionStrategy } = (request.body ?? {}) as {
    event?: string;
    planId?: string;
    targetMinutes?: number;
    reason?: string;
    compressionStrategy?: string;
  };

  if (event !== 'stream5.time_crunch_preview_declined') {
    return reply.code(400).send({ error: 'unsupported_event' });
  }

  if (typeof planId !== 'string' || planId.length === 0) {
    return reply.code(400).send({ error: 'planId_required' });
  }

  trackEvent(event, {
    planId,
    targetMinutes,
    compressionStrategy: compressionStrategy ?? 'user_decline',
    reason: reason ?? 'modal_closed',
    userId: user?.userId,
    source: 'gateway-bff'
  });

  return reply.code(204).send();
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
    return reply.code(502).send({ error: 'bad_gateway' });
  }
});

const curatorForbidden = (reply: FastifyReply) =>
  reply.code(403).send({ error: 'forbidden', message: 'Curator access required' });

server.get('/api/internal/curation/movements', async (request, reply) => {
  if (!hasCuratorAccess(request)) {
    return curatorForbidden(reply);
  }

  const query = (request.query ?? {}) as {
    status?: unknown;
    search?: unknown;
    tag?: unknown;
    reviewerId?: unknown;
  };

  const toArray = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item)).filter((item) => item.length > 0);
    }
    if (value === undefined || value === null) return [];
    const stringified = String(value).trim();
    return stringified ? [stringified] : [];
  };

  const params = new URLSearchParams();
  for (const statusValue of toArray(query.status)) {
    params.append('status', statusValue);
  }

  const search = typeof query.search === 'string' ? query.search.trim() : undefined;
  const tag = typeof query.tag === 'string' ? query.tag.trim() : undefined;
  const reviewerId = typeof query.reviewerId === 'string' ? query.reviewerId.trim() : undefined;

  if (search) params.set('search', search);
  if (tag) params.set('tag', tag);
  if (reviewerId) params.set('reviewerId', reviewerId);

  const qs = params.toString();
  return forwardToPlanningEngine(
    request,
    reply,
    `/api/internal/curation/movements${qs ? `?${qs}` : ''}`,
  );
});

server.get('/api/internal/curation/movements/:id', async (request, reply) => {
  if (!hasCuratorAccess(request)) {
    return curatorForbidden(reply);
  }

  const { id } = (request.params ?? {}) as { id?: string };
  if (!id) {
    return reply.code(400).send({ error: 'invalid_request', message: 'Movement id is required' });
  }

  return forwardToPlanningEngine(
    request,
    reply,
    `/api/internal/curation/movements/${encodeURIComponent(id)}`,
  );
});

server.post('/api/internal/curation/movements', async (request, reply) => {
  if (!hasCuratorAccess(request)) {
    return curatorForbidden(reply);
  }

  return forwardToPlanningEngine(request, reply, '/api/internal/curation/movements', {
    method: 'POST',
    body: request.body ?? {},
  });
});

server.patch('/api/internal/curation/movements/:id', async (request, reply) => {
  if (!hasCuratorAccess(request)) {
    return curatorForbidden(reply);
  }

  const { id } = (request.params ?? {}) as { id?: string };
  if (!id) {
    return reply.code(400).send({ error: 'invalid_request', message: 'Movement id is required' });
  }

  return forwardToPlanningEngine(
    request,
    reply,
    `/api/internal/curation/movements/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: request.body ?? {} },
  );
});

server.post('/api/internal/curation/movements/:id/submit', async (request, reply) => {
  if (!hasCuratorAccess(request)) {
    return curatorForbidden(reply);
  }

  const { id } = (request.params ?? {}) as { id?: string };
  if (!id) {
    return reply.code(400).send({ error: 'invalid_request', message: 'Movement id is required' });
  }

  return forwardToPlanningEngine(
    request,
    reply,
    `/api/internal/curation/movements/${encodeURIComponent(id)}/submit`,
    { method: 'POST', body: request.body ?? {} },
  );
});

server.post('/api/internal/curation/movements/:id/request-changes', async (request, reply) => {
  if (!hasCuratorAccess(request)) {
    return curatorForbidden(reply);
  }

  const { id } = (request.params ?? {}) as { id?: string };
  if (!id) {
    return reply.code(400).send({ error: 'invalid_request', message: 'Movement id is required' });
  }

  return forwardToPlanningEngine(
    request,
    reply,
    `/api/internal/curation/movements/${encodeURIComponent(id)}/request-changes`,
    { method: 'POST', body: request.body ?? {} },
  );
});

server.post('/api/internal/curation/movements/:id/approve', async (request, reply) => {
  if (!hasCuratorAccess(request)) {
    return curatorForbidden(reply);
  }

  const { id } = (request.params ?? {}) as { id?: string };
  if (!id) {
    return reply.code(400).send({ error: 'invalid_request', message: 'Movement id is required' });
  }

  return forwardToPlanningEngine(
    request,
    reply,
    `/api/internal/curation/movements/${encodeURIComponent(id)}/approve`,
    { method: 'POST', body: request.body ?? {} },
  );
});

server.post('/api/internal/curation/movements/:id/publish', async (request, reply) => {
  if (!hasCuratorAccess(request)) {
    return curatorForbidden(reply);
  }

  const { id } = (request.params ?? {}) as { id?: string };
  if (!id) {
    return reply.code(400).send({ error: 'invalid_request', message: 'Movement id is required' });
  }

  return forwardToPlanningEngine(
    request,
    reply,
    `/api/internal/curation/movements/${encodeURIComponent(id)}/publish`,
    { method: 'POST', body: request.body ?? {} },
  );
});

server.get('/api/internal/curation/library', async (request, reply) => {
  if (!hasCuratorAccess(request)) {
    return curatorForbidden(reply);
  }

  const query = (request.query ?? {}) as { search?: unknown };
  const search = typeof query.search === 'string' ? query.search.trim() : undefined;
  const path = `/api/internal/curation/library${
    search ? `?${new URLSearchParams({ search }).toString()}` : ''
  }`;

  return forwardToPlanningEngine(request, reply, path);
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
    return reply.code(502).send({ error: 'bad_gateway' });
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
    return reply.code(502).send({ error: 'bad_gateway' });
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
    return reply.code(502).send({ error: 'bad_gateway' });
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
    return reply.code(502).send({ error: 'bad_gateway' });
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
    return reply.code(502).send({ error: 'bad_gateway' });
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
    return reply.code(502).send({ error: 'bad_gateway' });
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
    return reply.code(502).send({ error: 'bad_gateway' });
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
    return reply.code(502).send({ error: 'bad_gateway' });
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
