import Redis from 'ioredis';
import { z } from 'zod';

// Redis 配置模式
const RedisConfigSchema = z.object({
  host: z.string().default('localhost'),
  port: z.number().default(6379),
  password: z.string().optional(),
  db: z.number().default(0),
  retryDelayOnFailover: z.number().default(100),
  maxRetriesPerRequest: z.number().default(3),
  lazyConnect: z.boolean().default(true),
  keepAlive: z.number().default(30000),
  connectTimeout: z.number().default(10000),
  commandTimeout: z.number().default(5000),
});

export type RedisConfig = z.infer<typeof RedisConfigSchema>;

// Redis 客户端类
export class RedisClient {
  private client: Redis;
  private config: RedisConfig;

  constructor(config: Partial<RedisConfig> = {}) {
    this.config = RedisConfigSchema.parse({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      ...config,
    });

    this.client = new Redis(this.config);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('✅ Redis 连接已建立');
    });

    this.client.on('ready', () => {
      console.log('🚀 Redis 客户端已准备就绪');
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis 连接错误:', error);
    });

    this.client.on('close', () => {
      console.log('🔌 Redis 连接已关闭');
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis 正在重新连接...');
    });
  }

  // 基础操作
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return await this.client.setex(key, ttl, value);
    }
    return await this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  // 哈希操作
  async hget(key: string, field: string): Promise<string | null> {
    return await this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.client.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.client.hgetall(key);
  }

  async hdel(key: string, field: string): Promise<number> {
    return await this.client.hdel(key, field);
  }

  // 列表操作
  async lpush(key: string, ...values: string[]): Promise<number> {
    return await this.client.lpush(key, ...values);
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    return await this.client.rpush(key, ...values);
  }

  async lpop(key: string): Promise<string | null> {
    return await this.client.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return await this.client.rpop(key);
  }

  async llen(key: string): Promise<number> {
    return await this.client.llen(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.lrange(key, start, stop);
  }

  // 集合操作
  async sadd(key: string, ...members: string[]): Promise<number> {
    return await this.client.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return await this.client.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }

  async sismember(key: string, member: string): Promise<number> {
    return await this.client.sismember(key, member);
  }

  // 有序集合操作
  async zadd(key: string, score: number, member: string): Promise<number> {
    return await this.client.zadd(key, score, member);
  }

  async zrem(key: string, member: string): Promise<number> {
    return await this.client.zrem(key, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.zrange(key, start, stop);
  }

  async zrangebyscore(key: string, min: number, max: number): Promise<string[]> {
    return await this.client.zrangebyscore(key, min, max);
  }

  // 缓存操作
  async cacheGet<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('缓存反序列化错误:', error);
      return null;
    }
  }

  async cacheSet<T>(key: string, value: T, ttl?: number): Promise<'OK'> {
    const serialized = JSON.stringify(value);
    return await this.set(key, serialized, ttl);
  }

  // 批量操作
  async mget(keys: string[]): Promise<(string | null)[]> {
    return await this.client.mget(...keys);
  }

  async mset(keyValuePairs: Record<string, string>): Promise<'OK'> {
    const args: string[] = [];
    for (const [key, value] of Object.entries(keyValuePairs)) {
      args.push(key, value);
    }
    return await this.client.mset(...args);
  }

  // 管道操作
  pipeline() {
    return this.client.pipeline();
  }

  // 事务操作
  multi() {
    return this.client.multi();
  }

  // 发布订阅
  async publish(channel: string, message: string): Promise<number> {
    return await this.client.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.client.subscribe(channel);
    this.client.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(message);
      }
    });
  }

  // 健康检查
  async ping(): Promise<string> {
    return await this.client.ping();
  }

  // 信息获取
  async info(section?: string): Promise<string> {
    return await this.client.info(section);
  }

  // 内存使用情况
  async memoryUsage(key: string): Promise<number> {
    return await this.client.memory('usage', key);
  }

  // 键模式匹配
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  // 扫描操作
  async scan(cursor: number, pattern?: string, count?: number): Promise<[string, string[]]> {
    const args: (string | number)[] = [cursor];
    if (pattern) args.push('MATCH', pattern);
    if (count) args.push('COUNT', count);
    
    return await this.client.scan(...args);
  }

  // 关闭连接
  async close(): Promise<void> {
    await this.client.quit();
  }

  // 强制关闭连接
  async disconnect(): Promise<void> {
    this.client.disconnect();
  }
}

// 单例实例
let redisClient: RedisClient | null = null;

export function getRedisClient(config?: Partial<RedisConfig>): RedisClient {
  if (!redisClient) {
    redisClient = new RedisClient(config);
  }
  return redisClient;
}

// 缓存键生成器
export class CacheKeyGenerator {
  static userProfile(userId: string): string {
    return `user:profile:${userId}`;
  }

  static userPermissions(userId: string): string {
    return `user:permissions:${userId}`;
  }

  static protocol(protocolId: string): string {
    return `protocol:${protocolId}`;
  }

  static protocolShares(protocolId: string): string {
    return `protocol:shares:${protocolId}`;
  }

  static plan(planId: string): string {
    return `plan:${planId}`;
  }

  static workout(workoutId: string): string {
    return `workout:${workoutId}`;
  }

  static rateLimit(userId: string, endpoint: string): string {
    return `rate_limit:${userId}:${endpoint}`;
  }

  static session(sessionId: string): string {
    return `session:${sessionId}`;
  }

  static apiResponse(endpoint: string, params: string): string {
    return `api:${endpoint}:${Buffer.from(params).toString('base64')}`;
  }
}

// 缓存策略
export class CacheStrategy {
  static readonly USER_PROFILE_TTL = 3600; // 1小时
  static readonly PERMISSIONS_TTL = 1800; // 30分钟
  static readonly PROTOCOL_TTL = 7200; // 2小时
  static readonly PLAN_TTL = 1800; // 30分钟
  static readonly WORKOUT_TTL = 900; // 15分钟
  static readonly RATE_LIMIT_TTL = 60; // 1分钟
  static readonly SESSION_TTL = 86400; // 24小时
  static readonly API_RESPONSE_TTL = 300; // 5分钟
}

export default RedisClient;
