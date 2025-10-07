declare module 'fastify' {
  interface FastifyRequest {
    user?: { userId?: string; [k: string]: unknown };
    requestId?: string;
    rawBody?: string;
  }
}

// Re-export Fastify types for convenience
export type { FastifyRequest, FastifyReply } from 'fastify';
