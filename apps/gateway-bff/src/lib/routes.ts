import { FastifyInstance } from 'fastify';
import { z, ZodSchema } from 'zod';
import { proxyRequest } from './proxy';
import { EnhancedPlanGenerationRequestSchema, RPEFeedbackSchema, PerformanceMetricsSchema, AdaptationsApplySchema, ApiEnvelopeSchema } from '@athlete-ally/shared-types';
import { traceApiRequest } from '../telemetry';
import { config } from '../config';


/**
 * Register Magic Slice v1 routes on a Fastify server.
 * Route responsibilities:
 * - Validate incoming payloads (Zod)
 * - Proxy requests to Planning Engine
 * - Validate envelope shape of downstream responses
 */
export function registerMagicSliceRoutes(server: FastifyInstance) {
  /**
   * Validate a body against a schema and return typed data or a 400.
   */
  function validateOr400<T>(reply: any, schema: ZodSchema<T>, body: unknown): body is T {
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      reply.code(400).send({ success: false, error: parsed.error.format(), message: 'Invalid request' });
      return false;
    }
    // Reassign parsed data back onto request body for downstream proxy
    // (Callers will cast appropriately.)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    (reply.request as any).validated = parsed.data;
    return true;
  }

  /**
   * Proxy to Planning Engine and ensure envelope shape.
   */
  async function proxyWithEnvelope(method: 'GET'|'POST'|'PUT'|'DELETE', url: string, data?: any) {
    const res = await proxyRequest(method, url, data, { upstream: 'planning-engine', route: url.replace(/^.*\/api\//, '/api/') });
    const body = await res.json();
    const envSchema = ApiEnvelopeSchema(z.any());
    const valid = envSchema.safeParse(body);
    return { res, body, valid };
  }
  // Enhanced plan generation (strict)
  server.post('/v1/plans/enhanced/generate', {}, async (request, reply) => {
    if (!validateOr400(reply, EnhancedPlanGenerationRequestSchema, request.body)) return;
    const span = traceApiRequest('POST', '/v1/plans/enhanced/generate', (request as any).user?.userId);
    try {
      const { res, body, valid } = await proxyWithEnvelope('POST', `${config.PLANNING_ENGINE_URL}/api/v1/plans/enhanced/generate`, (reply.request as any).validated);
      if (!valid.success) {
        return reply.code(502).send({ success: false, error: 'Invalid downstream response', details: valid.error.format() });
      }
      span.setStatus({ code: res.ok ? 1 : 2 } as any);
      return reply.code(res.status).send(body);
    } finally { span.end(); }
  });

  // RPE feedback (standard)
  server.post('/v1/plans/feedback/rpe', {}, async (request, reply) => {
    if (!validateOr400(reply, RPEFeedbackSchema, request.body)) return;
    const span = traceApiRequest('POST', '/v1/plans/feedback/rpe', (request as any).user?.userId);
    try {
      const { res, body, valid } = await proxyWithEnvelope('POST', `${config.PLANNING_ENGINE_URL}/api/v1/plans/feedback/rpe`, (reply.request as any).validated);
      if (!valid.success) {
        return reply.code(502).send({ success: false, error: 'Invalid downstream response', details: valid.error.format() });
      }
      span.setStatus({ code: res.ok ? 1 : 2 } as any);
      return reply.code(res.status).send(body);
    } finally { span.end(); }
  });

  // Performance metrics (standard)
  server.post('/v1/plans/feedback/performance', {}, async (request, reply) => {
    if (!validateOr400(reply, PerformanceMetricsSchema, request.body)) return;
    const span = traceApiRequest('POST', '/v1/plans/feedback/performance', (request as any).user?.userId);
    try {
      const { res, body, valid } = await proxyWithEnvelope('POST', `${config.PLANNING_ENGINE_URL}/api/v1/plans/feedback/performance`, (reply.request as any).validated);
      if (!valid.success) {
        return reply.code(502).send({ success: false, error: 'Invalid downstream response', details: valid.error.format() });
      }
      span.setStatus({ code: res.ok ? 1 : 2 } as any);
      return reply.code(res.status).send(body);
    } finally { span.end(); }
  });

  // Get adaptations (standard)
  server.get('/v1/plans/:planId/adaptations', {}, async (request, reply) => {
    const { planId } = request.params as { planId: string };
    const span = traceApiRequest('GET', `/v1/plans/${planId}/adaptations`, (request as any).user?.userId);
    try {
      const res = await proxyRequest('GET', `${config.PLANNING_ENGINE_URL}/api/v1/plans/${planId}/adaptations`, undefined, { upstream: 'planning-engine', route: '/v1/plans/:planId/adaptations' });
      const body = await res.json();
      const envSchema = ApiEnvelopeSchema(z.any());
      const valid = envSchema.safeParse(body);
      if (!valid.success) {
        return reply.code(502).send({ success: false, error: 'Invalid downstream response', details: valid.error.format() });
      }
      span.setStatus({ code: res.ok ? 1 : 2 } as any);
      return reply.code(res.status).send(body);
    } finally { span.end(); }
  });

  // Apply adaptations (standard)
  server.post('/v1/plans/:planId/adaptations/apply', {}, async (request, reply) => {
    const parsed = AdaptationsApplySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ success: false, error: parsed.error.format(), message: 'Invalid adaptations payload' });
    }
    const { planId } = request.params as { planId: string };
    const span = traceApiRequest('POST', `/v1/plans/${planId}/adaptations/apply`, (request as any).user?.userId);
    try {
      const res = await proxyRequest('POST', `${config.PLANNING_ENGINE_URL}/api/v1/plans/${planId}/adaptations/apply`, parsed.data, { upstream: 'planning-engine', route: '/v1/plans/:planId/adaptations/apply' });
      const body = await res.json();
      const envSchema = ApiEnvelopeSchema(z.any());
      const valid = envSchema.safeParse(body);
      if (!valid.success) {
        return reply.code(502).send({ success: false, error: 'Invalid downstream response', details: valid.error.format() });
      }
      span.setStatus({ code: res.ok ? 1 : 2 } as any);
      return reply.code(res.status).send(body);
    } finally { span.end(); }
  });
}
