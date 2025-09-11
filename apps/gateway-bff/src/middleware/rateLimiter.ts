import { FastifyRequest, FastifyReply } from 'fastify';
import { Redis } from 'ioredis';
import { config } from '../config.js';

// 速率限制配置
const RATE_LIMIT_CONFIG = {
  // 每用户每分钟最大请求数
  MAX_REQUESTS_PER_MINUTE: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_PER_MINUTE || '60'),
  // 每用户每小时最大请求数
  MAX_REQUESTS_PER_HOUR: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_PER_HOUR || '1000'),
  // 每用户每天最大请求数
  MAX_REQUESTS_PER_DAY: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_PER_DAY || '10000'),
  // 窗口大小（毫秒）
  WINDOW_SIZE_MS: 60 * 1000, // 1分钟
  // 清理间隔（毫秒）
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // 5分钟
};

// Redis客户端（如果可用）
let redis: Redis | null = null;
if (config.REDIS_URL) {
  redis = new Redis(config.REDIS_URL);
}

// 内存存储（备用方案）
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// 清理过期条目
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetTime) {
      memoryStore.delete(key);
    }
  }
}, RATE_LIMIT_CONFIG.CLEANUP_INTERVAL_MS);

// 速率限制检查
async function checkRateLimit(userId: string, endpoint: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}> {
  const key = `rate_limit:${userId}:${endpoint}`;
  const now = Date.now();
  const windowStart = Math.floor(now / RATE_LIMIT_CONFIG.WINDOW_SIZE_MS) * RATE_LIMIT_CONFIG.WINDOW_SIZE_MS;
  const resetTime = windowStart + RATE_LIMIT_CONFIG.WINDOW_SIZE_MS;

  try {
    if (redis) {
      // 使用Redis进行分布式速率限制
      const pipeline = redis.pipeline();
      
      // 获取当前计数
      pipeline.get(key);
      // 设置过期时间
      pipeline.expire(key, Math.ceil(RATE_LIMIT_CONFIG.WINDOW_SIZE_MS / 1000));
      
      const results = await pipeline.exec();
      const currentCount = results?.[0]?.[1] ? parseInt(results[0][1] as string) : 0;
      
      if (currentCount >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil((resetTime - now) / 1000)
        };
      }
      
      // 增加计数
      await redis.incr(key);
      
      return {
        allowed: true,
        remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE - currentCount - 1,
        resetTime
      };
    } else {
      // 使用内存存储
      const current = memoryStore.get(key);
      const count = current && current.resetTime > now ? current.count : 0;
      
      if (count >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: current?.resetTime || resetTime,
          retryAfter: Math.ceil(((current?.resetTime || resetTime) - now) / 1000)
        };
      }
      
      memoryStore.set(key, {
        count: count + 1,
        resetTime
      });
      
      return {
        allowed: true,
        remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE - count - 1,
        resetTime
      };
    }
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // 在错误情况下允许请求通过，但记录错误
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE,
      resetTime
    };
  }
}

// 用户级速率限制中间件
export async function userRateLimitMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // 跳过健康检查和指标端点
  if (request.url === '/health' || request.url === '/metrics') {
    return;
  }

  try {
    // 获取用户ID
    const user = (request as any).user;
    const userId = user?.userId || 'anonymous';
    
    // 获取端点
    const endpoint = request.url.split('?')[0]; // 移除查询参数
    
    // 检查速率限制
    const result = await checkRateLimit(userId, endpoint);
    
    // 设置响应头
    reply.header('X-RateLimit-Limit', RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE);
    reply.header('X-RateLimit-Remaining', result.remaining);
    reply.header('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
    
    if (!result.allowed) {
      reply.header('Retry-After', result.retryAfter || 60);
      reply.code(429).send({
        error: 'rate_limit_exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: result.retryAfter || 60,
        resetTime: new Date(result.resetTime).toISOString()
      });
      return;
    }
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    // 在错误情况下允许请求通过
  }
}

// 特定端点的严格速率限制
export async function strictRateLimitMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // 只对敏感端点应用严格限制
  const strictEndpoints = ['/v1/generate', '/v1/onboarding'];
  const endpoint = request.url.split('?')[0];
  
  if (!strictEndpoints.some(ep => endpoint.includes(ep))) {
    return;
  }

  try {
    const user = (request as any).user;
    const userId = user?.userId || 'anonymous';
    
    // 对敏感端点使用更严格的限制
    const strictConfig = {
      ...RATE_LIMIT_CONFIG,
      MAX_REQUESTS_PER_MINUTE: 10, // 更严格的限制
    };
    
    const key = `strict_rate_limit:${userId}:${endpoint}`;
    const now = Date.now();
    const windowStart = Math.floor(now / RATE_LIMIT_CONFIG.WINDOW_SIZE_MS) * RATE_LIMIT_CONFIG.WINDOW_SIZE_MS;
    const resetTime = windowStart + RATE_LIMIT_CONFIG.WINDOW_SIZE_MS;
    
    let currentCount = 0;
    
    if (redis) {
      const count = await redis.get(key);
      currentCount = count ? parseInt(count) : 0;
      
      if (currentCount >= strictConfig.MAX_REQUESTS_PER_MINUTE) {
        reply.header('Retry-After', Math.ceil((resetTime - now) / 1000));
        reply.code(429).send({
          error: 'strict_rate_limit_exceeded',
          message: 'Rate limit exceeded for sensitive endpoint. Please try again later.',
          retryAfter: Math.ceil((resetTime - now) / 1000),
          resetTime: new Date(resetTime).toISOString()
        });
        return;
      }
      
      await redis.incr(key);
      await redis.expire(key, Math.ceil(RATE_LIMIT_CONFIG.WINDOW_SIZE_MS / 1000));
    } else {
      const current = memoryStore.get(key);
      currentCount = current && current.resetTime > now ? current.count : 0;
      
      if (currentCount >= strictConfig.MAX_REQUESTS_PER_MINUTE) {
        reply.header('Retry-After', Math.ceil((resetTime - now) / 1000));
        reply.code(429).send({
          error: 'strict_rate_limit_exceeded',
          message: 'Rate limit exceeded for sensitive endpoint. Please try again later.',
          retryAfter: Math.ceil((resetTime - now) / 1000),
          resetTime: new Date(resetTime).toISOString()
        });
        return;
      }
      
      memoryStore.set(key, {
        count: currentCount + 1,
        resetTime
      });
    }
    
    // 设置响应头
    reply.header('X-RateLimit-Limit', strictConfig.MAX_REQUESTS_PER_MINUTE);
    reply.header('X-RateLimit-Remaining', strictConfig.MAX_REQUESTS_PER_MINUTE - currentCount - 1);
    reply.header('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
    
  } catch (error) {
    console.error('Strict rate limit middleware error:', error);
    // 在错误情况下允许请求通过
  }
}

// 清理资源
export function cleanup() {
  if (redis) {
    redis.disconnect();
  }
  memoryStore.clear();
}
