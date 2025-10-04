/**
 * 🚀 Redis缓存系统
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 高性能缓存管理
 * - 自动序列化/反序列化
 * - TTL支持
 * - 批量操作
 * - 错误处理和降级
 */

import { Redis } from 'ioredis';
import { config } from '../config.js';

export class RedisCache {
  private redis: Redis;
  private defaultTTL: number;

  constructor() {
    this.redis = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    this.defaultTTL = config.PLAN_CACHE_TTL_SECONDS || 3600; // 1 hour default

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    this.redis.on('ready', () => {
      console.log('Redis ready for operations');
    });

    this.redis.on('close', () => {
      console.log('Redis connection closed');
    });
  }

  // 设置缓存
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const expiration = ttl || this.defaultTTL;
      
      await this.redis.setex(key, expiration, serializedValue);
    } catch (error) {
      console.error('Redis set error:', error);
      // 不抛出错误，允许应用继续运行
    }
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  // 删除缓存
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  // 批量删除
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis delPattern error:', error);
    }
  }

  // 检查键是否存在
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  // 设置过期时间
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl);
    } catch (error) {
      console.error('Redis expire error:', error);
    }
  }

  // 获取剩余过期时间
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error('Redis ttl error:', error);
      return -1;
    }
  }

  // 原子性递增
  async incr(key: string, ttl?: number): Promise<number> {
    try {
      const result = await this.redis.incr(key);
      if (ttl) {
        await this.redis.expire(key, ttl);
      }
      return result;
    } catch (error) {
      console.error('Redis incr error:', error);
      return 0;
    }
  }

  // 原子性递减
  async decr(key: string, ttl?: number): Promise<number> {
    try {
      const result = await this.redis.decr(key);
      if (ttl) {
        await this.redis.expire(key, ttl);
      }
      return result;
    } catch (error) {
      console.error('Redis decr error:', error);
      return 0;
    }
  }

  // 设置哈希字段
  async hset(key: string, field: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.hset(key, field, serializedValue);
      if (ttl) {
        await this.redis.expire(key, ttl);
      }
    } catch (error) {
      console.error('Redis hset error:', error);
    }
  }

  // 获取哈希字段
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis hget error:', error);
      return null;
    }
  }

  // 获取所有哈希字段
  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      const hash = await this.redis.hgetall(key);
      const result: Record<string, T> = {};
      
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value) as T;
        } catch (parseError) {
          console.error(`Failed to parse hash field ${field}:`, parseError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Redis hgetall error:', error);
      return {};
    }
  }

  // 删除哈希字段
  async hdel(key: string, field: string): Promise<void> {
    try {
      await this.redis.hdel(key, field);
    } catch (error) {
      console.error('Redis hdel error:', error);
    }
  }

  // 添加到列表
  async lpush(key: string, ...values: any[]): Promise<void> {
    try {
      const serializedValues = values.map(v => JSON.stringify(v));
      await this.redis.lpush(key, ...serializedValues);
    } catch (error) {
      console.error('Redis lpush error:', error);
    }
  }

  // 从列表弹出
  async rpop<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.rpop(key);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis rpop error:', error);
      return null;
    }
  }

  // 获取列表长度
  async llen(key: string): Promise<number> {
    try {
      return await this.redis.llen(key);
    } catch (error) {
      console.error('Redis llen error:', error);
      return 0;
    }
  }

  // 获取列表范围
  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.redis.lrange(key, start, stop);
      return values.map(v => JSON.parse(v) as T);
    } catch (error) {
      console.error('Redis lrange error:', error);
      return [];
    }
  }

  // 设置有序集合成员
  async zadd(key: string, score: number, member: any, ttl?: number): Promise<void> {
    try {
      const serializedMember = JSON.stringify(member);
      await this.redis.zadd(key, score, serializedMember);
      if (ttl) {
        await this.redis.expire(key, ttl);
      }
    } catch (error) {
      console.error('Redis zadd error:', error);
    }
  }

  // 获取有序集合范围
  async zrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const members = await this.redis.zrange(key, start, stop);
      return members.map(m => JSON.parse(m) as T);
    } catch (error) {
      console.error('Redis zrange error:', error);
      return [];
    }
  }

  // 获取有序集合分数范围
  async zrangebyscore<T>(key: string, min: number, max: number): Promise<T[]> {
    try {
      const members = await this.redis.zrangebyscore(key, min, max);
      return members.map(m => JSON.parse(m) as T);
    } catch (error) {
      console.error('Redis zrangebyscore error:', error);
      return [];
    }
  }

  // 获取缓存统计信息
  async getStats(): Promise<{
    connected: boolean;
    memory: any;
    keys: number;
    info: any;
  }> {
    try {
      const info = await this.redis.info();
      const keys = await this.redis.dbsize();
      
      return {
        connected: this.redis.status === 'ready',
        memory: this.parseRedisInfo(info, 'memory'),
        keys,
        info: this.parseRedisInfo(info)
      };
    } catch (error) {
      console.error('Redis stats error:', error);
      return {
        connected: false,
        memory: {},
        keys: 0,
        info: {}
      };
    }
  }

  // 解析Redis信息
  private parseRedisInfo(info: string, section?: string): any {
    const lines = info.split('\r\n');
    const result: any = {};
    let currentSection = '';
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        currentSection = line.substring(2).toLowerCase();
        continue;
      }
      
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (!section || currentSection === section) {
          result[key] = isNaN(Number(value)) ? value : Number(value);
        }
      }
    }
    
    return section ? result : { [currentSection]: result };
  }

  // 关闭连接
  async close(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
      console.error('Redis close error:', error);
    }
  }

  // 健康检查
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      await this.redis.ping();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown Redis error'
      };
    }
  }
}

// 缓存装饰器
export function Cache(ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = new RedisCache();

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      // 尝试从缓存获取
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // 执行原方法
      const result = await method.apply(this, args);
      
      // 缓存结果
      await cache.set(cacheKey, result, ttl);
      
      return result;
    };
  };
}

// 单例实例
export const redisCache = new RedisCache();
