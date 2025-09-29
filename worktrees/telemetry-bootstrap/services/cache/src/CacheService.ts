// services/cache/src/CacheService.ts
import Redis from 'ioredis';

export interface CacheService {
  // 基础操作
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  
  // 批量操作
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  mset<T>(keyValuePairs: Record<string, T>, ttl?: number): Promise<void>;
  
  // 模式匹配
  keys(pattern: string): Promise<string[]>;
  
  // 过期管理
  expire(key: string, ttl: number): Promise<void>;
  ttl(key: string): Promise<number>;
  
  // 连接管理
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

export class RedisCacheService implements CacheService {
  private redis: Redis;
  private isConnectedFlag: boolean = false;
  
  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000
    });
    
    this.redis.on('connect', () => {
      this.isConnectedFlag = true;
      console.log('Redis connected successfully');
    });
    
    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
      this.isConnectedFlag = false;
    });
    
    this.redis.on('close', () => {
      this.isConnectedFlag = false;
      console.log('Redis connection closed');
    });
  }
  
  async connect(): Promise<void> {
    if (!this.isConnectedFlag) {
      await this.redis.connect();
    }
  }
  
  async disconnect(): Promise<void> {
    if (this.isConnectedFlag) {
      await this.redis.disconnect();
      this.isConnectedFlag = false;
    }
  }
  
  isConnected(): boolean {
    return this.isConnectedFlag;
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to get key ${key}:`, error);
      return null;
    }
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      console.error(`Failed to set key ${key}:`, error);
      throw error;
    }
  }
  
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Failed to delete key ${key}:`, error);
      throw error;
    }
  }
  
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Failed to check existence of key ${key}:`, error);
      return false;
    }
  }
  
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error(`Failed to mget keys:`, error);
      return keys.map(() => null);
    }
  }
  
  async mset<T>(keyValuePairs: Record<string, T>, ttl?: number): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serialized = JSON.stringify(value);
        if (ttl) {
          pipeline.setex(key, ttl, serialized);
        } else {
          pipeline.set(key, serialized);
        }
      }
      
      await pipeline.exec();
    } catch (error) {
      console.error(`Failed to mset key-value pairs:`, error);
      throw error;
    }
  }
  
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error(`Failed to get keys with pattern ${pattern}:`, error);
      return [];
    }
  }
  
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl);
    } catch (error) {
      console.error(`Failed to set expiry for key ${key}:`, error);
      throw error;
    }
  }
  
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error(`Failed to get TTL for key ${key}:`, error);
      return -1;
    }
  }
  
  // 健康检查
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping failed:', error);
      return false;
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
      const [memory, info, keys] = await Promise.all([
        this.redis.memory('usage'),
        this.redis.info('memory'),
        this.redis.dbsize()
      ]);
      
      return {
        connected: this.isConnectedFlag,
        memory,
        keys,
        info: this.parseRedisInfo(info)
      };
    } catch (error) {
      console.error('Failed to get Redis stats:', error);
      return {
        connected: false,
        memory: null,
        keys: 0,
        info: null
      };
    }
  }
  
  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const result: any = {};
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    
    return result;
  }
}

// 缓存服务工厂
export class CacheServiceFactory {
  static create(redisUrl: string): CacheService {
    return new RedisCacheService(redisUrl);
  }
  
  static createWithConfig(config: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  }): CacheService {
    const redisUrl = `redis://${config.password ? `:${config.password}@` : ''}${config.host}:${config.port}/${config.db || 0}`;
    return new RedisCacheService(redisUrl);
  }
}
