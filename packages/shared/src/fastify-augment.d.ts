declare module 'fastify/types/request' {
  interface FastifyRequest {
    user?: { userId: string; [k: string]: unknown };
    requestId?: string;
    rawBody?: string;
  }
}
