
// 缓存管理类
import Redis from 'ioredis';

class CacheManager {
  constructor(config) {
    this.redis = new Redis(config);
    this.config = config;
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0
    };
  }
  
  // 获取缓存
  async get(key) {
    try {
      const start = Date.now();
      const value = await this.redis.get(key);
      const duration = Date.now() - start;
      
      if (value) {
        this.stats.hits++;
        console.log(`Cache HIT: ${key} (${duration}ms)`);
        return JSON.parse(value);
      } else {
        this.stats.misses++;
        console.log(`Cache MISS: ${key} (${duration}ms)`);
        return null;
      }
    } catch (error) {
      this.stats.errors++;
      console.error(`Cache ERROR: ${key}`, error);
      return null;
    }
  }
  
  // 设置缓存
  async set(key, value, ttl = 3600) {
    try {
      const start = Date.now();
      await this.redis.setex(key, ttl, JSON.stringify(value));
      const duration = Date.now() - start;
      console.log(`Cache SET: ${key} (TTL: ${ttl}s, ${duration}ms)`);
    } catch (error) {
      this.stats.errors++;
      console.error(`Cache SET ERROR: ${key}`, error);
    }
  }
  
  // 删除缓存
  async del(key) {
    try {
      await this.redis.del(key);
      console.log(`Cache DEL: ${key}`);
    } catch (error) {
      this.stats.errors++;
      console.error(`Cache DEL ERROR: ${key}`, error);
    }
  }
  
  // 批量获取
  async mget(keys) {
    try {
      const start = Date.now();
      const values = await this.redis.mget(...keys);
      const duration = Date.now() - start;
      
      const results = values.map((value, index) => {
        if (value) {
          this.stats.hits++;
          return JSON.parse(value);
        } else {
          this.stats.misses++;
          return null;
        }
      });
      
      console.log(`Cache MGET: ${keys.length} keys (${duration}ms)`);
      return results;
    } catch (error) {
      this.stats.errors++;
      console.error(`Cache MGET ERROR`, error);
      return keys.map(() => null);
    }
  }
  
  // 批量设置
  async mset(keyValuePairs, ttl = 3600) {
    try {
      const start = Date.now();
      const pipeline = this.redis.pipeline();
      
      keyValuePairs.forEach(([key, value]) => {
        pipeline.setex(key, ttl, JSON.stringify(value));
      });
      
      await pipeline.exec();
      const duration = Date.now() - start;
      console.log(`Cache MSET: ${keyValuePairs.length} pairs (TTL: ${ttl}s, ${duration}ms)`);
    } catch (error) {
      this.stats.errors++;
      console.error(`Cache MSET ERROR`, error);
    }
  }
  
  // 获取缓存统计
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      ...this.stats,
      total,
      hitRate: hitRate.toFixed(2) + '%'
    };
  }
  
  // 清理缓存
  async clear(pattern = '*') {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`Cache CLEAR: ${keys.length} keys removed`);
      }
    } catch (error) {
      console.error(`Cache CLEAR ERROR`, error);
    }
  }
  
  // 健康检查
  async health() {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch (error) {
      return false;
    }
  }
}

export default CacheManager;
