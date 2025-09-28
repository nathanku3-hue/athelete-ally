// Oura webhook utilities and route registration
// Minimal skeleton: verifies HMAC-SHA256 using raw body and TTL idempotency.

import type { FastifyInstance, FastifyRequest } from 'fastify';
import crypto from 'node:crypto';

export function computeSignature(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifySignature(opts: { secret: string; rawBody: string; headerSignature?: string | string[] | undefined }): boolean {
  const { secret, rawBody } = opts;
  let headerSig = opts.headerSignature;
  if (Array.isArray(headerSig)) headerSig = headerSig[0];
  if (!headerSig) return false;

  const normalizedHeader = String(headerSig).trim().toLowerCase();
  const provided = normalizedHeader.startsWith('sha256=') ? normalizedHeader.slice('sha256='.length) : normalizedHeader;
  const expected = computeSignature(secret, rawBody);
  return safeEqual(provided, expected);
}

class TTLCache {
  private store = new Map<string, number>();
  private readonly ttlMs: number;
  private readonly janitor: NodeJS.Timeout;

  constructor(ttlSeconds: number) {
    this.ttlMs = Math.max(1, ttlSeconds) * 1000;
    this.janitor = setInterval(() => this.sweep(), Math.min(this.ttlMs, 60_000)).unref();
  }

  has(key: string): boolean {
    const now = Date.now();
    const exp = this.store.get(key);
    if (exp && exp > now) return true;
    if (exp) this.store.delete(key);
    return false;
  }

  add(key: string): void {
    this.store.set(key, Date.now() + this.ttlMs);
  }

  private sweep() {
    const now = Date.now();
    for (const [k, exp] of this.store) {
      if (exp <= now) this.store.delete(k);
    }
  }
}

export interface RegisterOuraOptions {
  publish?: (subject: string, data: Uint8Array) => Promise<void>;
}

export function registerOuraWebhookRoutes(app: FastifyInstance, options: RegisterOuraOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const rawBodyPlugin = require('fastify-raw-body');
  app.register(rawBodyPlugin, { field: 'rawBody', global: false, encoding: 'utf8', runFirst: true });

  const ttlSeconds = Number(process.env.OURA_IDEMPOTENCY_TTL_SECONDS || '600');
  const seen = new TTLCache(isFinite(ttlSeconds) ? ttlSeconds : 600);

  app.route({
    method: 'POST',
    url: '/webhooks/oura',
    config: { rawBody: true },
    handler: async (request: FastifyRequest, reply) => {
      try {
        const secret = process.env.OURA_WEBHOOK_SECRET || '';
        if (!secret) {
          request.log.error('OURA_WEBHOOK_SECRET not configured');
          return reply.code(500).send({ error: 'Webhook not configured' });
        }

        // @ts-expect-error added by fastify-raw-body
        const rawBody: string = (request as any).rawBody || '';
        const sigHeader = (request.headers['x-oura-signature'] || request.headers['x-oura-signature-sha256']) as any;

        if (!rawBody) {
          request.log.warn('Missing rawBody for signature verification');
          return reply.code(400).send({ error: 'Bad Request' });
        }

        if (!verifySignature({ secret, rawBody, headerSignature: sigHeader })) {
          request.log.warn({ headers: request.headers }, 'Invalid Oura signature');
          return reply.code(401).send({ error: 'Invalid signature' });
        }

        const idemKey = (request.headers['x-request-id'] as string) || computeSignature(secret, rawBody);
        if (seen.has(idemKey)) {
          request.log.info({ idemKey }, 'Duplicate webhook suppressed');
          return reply.code(200).send({ status: 'duplicate' });
        }
        seen.add(idemKey);

        if (options.publish) {
          const subject = 'vendor.oura.webhook.received';
          await options.publish(subject, Buffer.from(rawBody));
        }

        return reply.code(200).send({ status: 'ok' });
      } catch (err) {
        request.log.error({ err }, 'Oura webhook handler error');
        return reply.code(500).send({ error: 'Internal Server Error' });
      }
    }
  });
}