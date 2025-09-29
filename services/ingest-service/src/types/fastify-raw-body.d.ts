// Type augmentation for Fastify to allow route-level `config.rawBody`
// This enables per-route raw body parsing for HMAC verification.
import 'fastify';
declare module 'fastify' {
  interface FastifyContextConfig {
    rawBody?: boolean;
  }
}

