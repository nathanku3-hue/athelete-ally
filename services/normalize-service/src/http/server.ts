/**
 * HTTP server setup
 */

import Fastify from 'fastify';

export function createHttpServer() {
  return Fastify({ logger: true });
}
