import type { JWTPayload } from './index.js';

export type RequestUser = JWTPayload;

declare module 'fastify' {
  interface FastifyRequest {
    user?: RequestUser;
    requestId?: string;
    rawBody?: string;
  }
}

// Re-export Fastify types for convenience
export type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

