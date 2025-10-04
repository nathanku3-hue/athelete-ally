/**
 * 💾 缓存管理器
 * 提供多级缓存和性能优化
 */

import { Redis } from 'ioredis';
import { configObject } from '../config/environment.js';

export class CacheManager {
  private redis: Redis;
  private localCache: Map<string, { data: any; expiry: number }> = new Map();

  constructor() {
    this.redis = new Redis(configObject.REDIS_URL);
    this.setupCacheCleanup();
  }

  async get<T>(key: string): Promise<T | null> {
    // 先检查本地缓存
    const local = this.localCache.get(key);
    if (local && local.expiry > Date.now()) {
      return local.data;
    }

    // 检查Redis缓存
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        const data = JSON.parse(cached);
        // 更新本地缓存
        this.localCache.set(key, {
          data,
          expiry: Date.now() + 60000 // 1分钟本地缓存
        });
        return data;
      }
    } catch (error) {
      console.error('Redis cache error:', error);
    }

    return null;
  }

  async set(key: string, data: any, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(data));
      
      // 更新本地缓存
      this.localCache.set(key, {
        data,
        expiry: Date.now() + Math.min(ttl * 1000, 60000) // 最多1分钟本地缓存
      });
    } catch (error) {
      console.error('Redis cache error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.localCache.delete(key);
    } catch (error) {
      console.error('Redis cache error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
      this.localCache.clear();
    } catch (error) {
      console.error('Redis cache error:', error);
    }
  }

  private setupCacheCleanup(): void {
    // 每分钟清理过期的本地缓存
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.localCache.entries()) {
        if (value.expiry <= now) {
          this.localCache.delete(key);
        }
      }
    }, 60000);
  }
}

export const cacheManager = new CacheManager();
