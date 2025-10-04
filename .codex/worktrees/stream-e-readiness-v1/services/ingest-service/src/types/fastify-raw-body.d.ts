// Type augmentation for Fastify to allow route-level `config.rawBody`.
// Enables per-route raw body parsing for HMAC verification (e.g., Oura webhook).
import 'fastify';
declare module 'fastify' {
  interface FastifyContextConfig {
    rawBody?: boolean;
  }
}

