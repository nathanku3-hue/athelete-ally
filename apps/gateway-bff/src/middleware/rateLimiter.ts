import { FastifyRequest, FastifyReply } from 'fastify';
import { Redis } from 'ioredis';
import { config } from '../config.js';

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_PER_MINUTE || '60'),
  WINDOW_SIZE_MS: 60 * 1000, // 1 minute
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
};

// Redis client (if available)
let redis: Redis | null = null;
if (config.REDIS_URL) {
  redis = new Redis(config.REDIS_URL);
}

// In-memory fallback
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetTime) {
      memoryStore.delete(key);
    }
  }
}, RATE_LIMIT_CONFIG.CLEANUP_INTERVAL_MS).unref?.();

function getClientId(request: FastifyRequest): string {
  const user = (request as any).user;
  if (user?.userId) return user.userId;
  const xfwd = request.headers['x-forwarded-for'];
  if (typeof xfwd === 'string' && xfwd.length > 0) return xfwd.split(',')[0].trim();
  return (request.ip as string) || 'anonymous';
}

// Core limiter
async function checkRateLimit(userId: string, endpoint: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}> {
  const key = 'rate_limit:' + userId + ':' + endpoint;
  const now = Date.now();
  const windowStart = Math.floor(now / RATE_LIMIT_CONFIG.WINDOW_SIZE_MS) * RATE_LIMIT_CONFIG.WINDOW_SIZE_MS;
  const resetTime = windowStart + RATE_LIMIT_CONFIG.WINDOW_SIZE_MS;

  try {
    if (redis) {
      // Use INCR and set EXPIRE on first increment
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.pexpire(key, RATE_LIMIT_CONFIG.WINDOW_SIZE_MS);
      }
      if (current > RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE) {
        return { allowed: false, remaining: 0, resetTime, retryAfter: Math.ceil((resetTime - now) / 1000) };
      }
      return {
        allowed: true,
        remaining: Math.max(0, RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE - current),
        resetTime,
      };
    } else {
      const current = memoryStore.get(key);
      const count = current && current.resetTime > now ? current.count : 0;
      if (count >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: current?.resetTime || resetTime,
          retryAfter: Math.ceil(((current?.resetTime || resetTime) - now) / 1000),
        };
      }
      memoryStore.set(key, { count: count + 1, resetTime });
      return {
        allowed: true,
        remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE - (count + 1),
        resetTime,
      };
    }
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true, remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE, resetTime };
  }
}

// User-level rate limiting middleware
export async function userRateLimitMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // Skip health and metrics
  if (request.url.startsWith('/health') || request.url.startsWith('/api/health') || request.url.startsWith('/metrics')) {
    return;
  }
  try {
    const userId = getClientId(request);
    const endpoint = request.url.split('?')[0];
    const result = await checkRateLimit(userId, endpoint);
    reply.header('X-RateLimit-Limit', RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE);
    reply.header('X-RateLimit-Remaining', result.remaining);
    reply.header('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
    if (!result.allowed) {
      reply.header('Retry-After', result.retryAfter || 60);
      reply.code(429).send({
        error: 'rate_limit_exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: result.retryAfter || 60,
        resetTime: new Date(result.resetTime).toISOString(),
      });
      return;
    }
  } catch (error) {
    console.error('Rate limit middleware error:', error);
  }
}

// Strict rate limiting for sensitive endpoints
export async function strictRateLimitMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const strictEndpoints = [
    '/v1/plans/enhanced/generate',
    '/api/v1/plans/enhanced/generate',
    '/api/v1/plans/generate',
    '/api/v1/onboarding',
  ];
  const endpoint = request.url.split('?')[0];
  if (!strictEndpoints.some((ep) => endpoint.startsWith(ep))) {
    return;
  }
  try {
    const userId = getClientId(request);
    const strictKey = 'strict_rate_limit:' + userId + ':' + endpoint;
    const now = Date.now();
    const windowStart = Math.floor(now / RATE_LIMIT_CONFIG.WINDOW_SIZE_MS) * RATE_LIMIT_CONFIG.WINDOW_SIZE_MS;
    const resetTime = windowStart + RATE_LIMIT_CONFIG.WINDOW_SIZE_MS;
    const MAX_STRICT = 10;

    let current = 0;
    if (redis) {
      const val = await redis.incr(strictKey);
      current = val;
      if (val === 1) await redis.pexpire(strictKey, RATE_LIMIT_CONFIG.WINDOW_SIZE_MS);
    } else {
      const curr = memoryStore.get(strictKey);
      current = curr && curr.resetTime > now ? curr.count + 1 : 1;
      memoryStore.set(strictKey, { count: current, resetTime });
    }

    if (current > MAX_STRICT) {
      reply.header('Retry-After', Math.ceil((resetTime - now) / 1000));
      reply.code(429).send({
        error: 'strict_rate_limit_exceeded',
        message: 'Rate limit exceeded for sensitive endpoint. Please try again later.',
        retryAfter: Math.ceil((resetTime - now) / 1000),
        resetTime: new Date(resetTime).toISOString(),
      });
      return;
    }

    reply.header('X-RateLimit-Limit', MAX_STRICT);
    reply.header('X-RateLimit-Remaining', Math.max(0, MAX_STRICT - current));
    reply.header('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
  } catch (error) {
    console.error('Strict rate limit middleware error:', error);
  }
}

// Cleanup
export function cleanup() {
  if (redis) {
    redis.disconnect();
  }
  memoryStore.clear();
}
