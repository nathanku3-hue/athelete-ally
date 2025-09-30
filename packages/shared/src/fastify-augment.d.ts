declare module 'fastify' {
  interface FastifyRequest {
    user?: { userId: string; [k: string]: unknown };
    requestId?: string;
    rawBody?: string;
  }
}
