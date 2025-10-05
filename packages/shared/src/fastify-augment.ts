// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FastifyRequest as OriginalFastifyRequest, FastifyReply as OriginalFastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: { userId?: string; [k: string]: unknown };
    requestId?: string;
    rawBody?: string;
  }
}

// Re-export Fastify types for convenience
export type { FastifyRequest, FastifyReply } from 'fastify';
