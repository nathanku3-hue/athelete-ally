import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { proxyRequest } from './proxy';
import { EnhancedPlanGenerationRequestSchema, RPEFeedbackSchema, PerformanceMetricsSchema, AdaptationsApplySchema, ApiEnvelopeSchema } from '@athlete-ally/shared-types';
import { traceApiRequest } from '../telemetry';
import { config } from '../config';


export function registerMagicSliceRoutes(server: FastifyInstance) {
  // Enhanced plan generation (strict)
  server.post('/v1/plans/enhanced/generate', {}, async (request, reply) => {
    const body = request.body as unknown;
    const parsed = EnhancedPlanGenerationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return reply.code(400).send({ success: false, error: parsed.error.format(), message: 'Invalid request' });
    }
    const span = traceApiRequest('POST', '/v1/plans/enhanced/generate', (request as any).user?.userId);
    try {
      const res = await proxyRequest('POST', `${config.PLANNING_ENGINE_URL}/api/v1/plans/enhanced/generate`, parsed.data, { upstream: 'planning-engine', route: '/v1/plans/enhanced/generate' });
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

  // RPE feedback (standard)
  server.post('/v1/plans/feedback/rpe', {}, async (request, reply) => {
    const parsed = RPEFeedbackSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ success: false, error: parsed.error.format(), message: 'Invalid RPE feedback' });
    }
    const span = traceApiRequest('POST', '/v1/plans/feedback/rpe', (request as any).user?.userId);
    try {
      const res = await proxyRequest('POST', `${config.PLANNING_ENGINE_URL}/api/v1/plans/feedback/rpe`, parsed.data, { upstream: 'planning-engine', route: '/v1/plans/feedback/rpe' });
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

  // Performance metrics (standard)
  server.post('/v1/plans/feedback/performance', {}, async (request, reply) => {
    const parsed = PerformanceMetricsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ success: false, error: parsed.error.format(), message: 'Invalid performance metrics' });
    }
    const span = traceApiRequest('POST', '/v1/plans/feedback/performance', (request as any).user?.userId);
    try {
      const res = await proxyRequest('POST', `${config.PLANNING_ENGINE_URL}/api/v1/plans/feedback/performance`, parsed.data, { upstream: 'planning-engine', route: '/v1/plans/feedback/performance' });
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