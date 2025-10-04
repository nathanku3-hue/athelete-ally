// 缓存优化配置
import Redis from 'ioredis';
import fs from 'fs';
import path from 'path';

const cacheOptimization = () => {
  console.log('⚡ 开始缓存优化配置...\n');
  
  // 1. Redis连接配置
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    
    // 连接池配置
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    
    // 性能优化
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
    
    // 集群配置（如果需要）
    enableOfflineQueue: false,
    maxMemoryPolicy: 'allkeys-lru'
  };
  
  // 2. 缓存策略配置
  const cacheStrategies = {
    // 用户数据缓存
    userProfile: {
      key: 'user:profile:{userId}',
      ttl: 3600, // 1小时
      strategy: 'write-through'
    },
    
    // 训练计划缓存
    trainingPlan: {
      key: 'plan:{planId}',
      ttl: 1800, // 30分钟
      strategy: 'write-behind'
    },
    
    // 练习数据缓存
    exercises: {
      key: 'exercises:category:{category}',
      ttl: 7200, // 2小时
      strategy: 'write-through'
    },
    
    // RPE反馈缓存
    rpeFeedback: {
      key: 'rpe:user:{userId}:session:{sessionId}',
      ttl: 900, // 15分钟
      strategy: 'write-through'
    },
    
    // 性能指标缓存
    performanceMetrics: {
      key: 'metrics:user:{userId}:type:{type}',
      ttl: 600, // 10分钟
      strategy: 'write-behind'
    },
    
    // 会话数据缓存
    sessionData: {
      key: 'session:{sessionId}',
      ttl: 1800, // 30分钟
      strategy: 'write-through'
    }
  };
  
  // 3. 缓存预热配置
  const cacheWarmup = {
    // 预加载常用数据
    preloadData: [
      'exercises:category:strength',
      'exercises:category:cardio',
      'exercises:category:flexibility',
      'system:config',
      'system:health'
    ],
    
    // 预加载用户数据（活跃用户）
    preloadUsers: {
      query: 'SELECT user_id FROM user_activity WHERE last_active > NOW() - INTERVAL \'7 days\'',
      batchSize: 100
    }
  };
  
  // 4. 缓存监控配置
  const cacheMonitoring = {
    // 缓存命中率监控
    hitRateThreshold: 0.8, // 80%
    
    // 缓存大小监控
    maxMemoryUsage: '512MB',
    
    // 慢查询监控
    slowQueryThreshold: 100, // 100ms
    
    // 连接数监控
    maxConnections: 100
  };
  
  // 5. 创建缓存管理类
  const cacheManager = `
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
        console.log(\`Cache HIT: \${key} (\${duration}ms)\`);
        return JSON.parse(value);
      } else {
        this.stats.misses++;
        console.log(\`Cache MISS: \${key} (\${duration}ms)\`);
        return null;
      }
    } catch (error) {
      this.stats.errors++;
      console.error(\`Cache ERROR: \${key}\`, error);
      return null;
    }
  }
  
  // 设置缓存
  async set(key, value, ttl = 3600) {
    try {
      const start = Date.now();
      await this.redis.setex(key, ttl, JSON.stringify(value));
      const duration = Date.now() - start;
      console.log(\`Cache SET: \${key} (TTL: \${ttl}s, \${duration}ms)\`);
    } catch (error) {
      this.stats.errors++;
      console.error(\`Cache SET ERROR: \${key}\`, error);
    }
  }
  
  // 删除缓存
  async del(key) {
    try {
      await this.redis.del(key);
      console.log(\`Cache DEL: \${key}\`);
    } catch (error) {
      this.stats.errors++;
      console.error(\`Cache DEL ERROR: \${key}\`, error);
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
      
      console.log(\`Cache MGET: \${keys.length} keys (\${duration}ms)\`);
      return results;
    } catch (error) {
      this.stats.errors++;
      console.error(\`Cache MGET ERROR\`, error);
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
      console.log(\`Cache MSET: \${keyValuePairs.length} pairs (TTL: \${ttl}s, \${duration}ms)\`);
    } catch (error) {
      this.stats.errors++;
      console.error(\`Cache MSET ERROR\`, error);
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
        console.log(\`Cache CLEAR: \${keys.length} keys removed\`);
      }
    } catch (error) {
      console.error(\`Cache CLEAR ERROR\`, error);
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
`;
  
  // 6. 创建缓存预热脚本
  const cacheWarmupScript = `
// 缓存预热脚本
import CacheManager from './cache-manager.js';
import { prisma } from './db.js';

const warmupCache = async () => {
  console.log('🔥 开始缓存预热...');
  
  const cache = new CacheManager(redisConfig);
  
  try {
    // 预加载系统配置
    await cache.set('system:config', {
      version: '1.0.0',
      features: ['training_plans', 'rpe_feedback', 'performance_tracking'],
      limits: {
        maxPlansPerUser: 10,
        maxSessionsPerPlan: 12
      }
    }, 3600);
    
    // 预加载练习数据
    const exercises = await prisma.exercise.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        subcategory: true
      }
    });
    
    const exercisesByCategory = exercises.reduce((acc, exercise) => {
      if (!acc[exercise.category]) {
        acc[exercise.category] = [];
      }
      acc[exercise.category].push(exercise);
      return acc;
    }, {});
    
    for (const [category, categoryExercises] of Object.entries(exercisesByCategory)) {
      await cache.set(\`exercises:category:\${category}\`, categoryExercises, 7200);
    }
    
    // 预加载活跃用户数据
    const activeUsers = await prisma.user.findMany({
      where: {
        lastActive: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天内活跃
        }
      },
      select: {
        id: true,
        preferences: true,
        lastActive: true
      },
      take: 100
    });
    
    for (const user of activeUsers) {
      await cache.set(\`user:profile:\${user.id}\`, user, 3600);
    }
    
    console.log('✅ 缓存预热完成');
    console.log(\`📊 预热统计: \${JSON.stringify(cache.getStats())}\`);
    
  } catch (error) {
    console.error('❌ 缓存预热失败:', error);
  }
};

export default warmupCache;
`;
  
  // 7. 保存配置文件
  const cacheDir = './cache';
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(cacheDir, 'cache-config.json'), JSON.stringify({
    redis: redisConfig,
    strategies: cacheStrategies,
    warmup: cacheWarmup,
    monitoring: cacheMonitoring
  }, null, 2));
  
  fs.writeFileSync(path.join(cacheDir, 'cache-manager.js'), cacheManager);
  fs.writeFileSync(path.join(cacheDir, 'cache-warmup.js'), cacheWarmupScript);
  
  console.log('✅ 缓存配置文件已创建');
  console.log('✅ 缓存管理类已创建');
  console.log('✅ 缓存预热脚本已创建');
  
  // 8. 缓存优化建议
  console.log('\n⚡ 缓存优化建议:');
  console.log('1. 使用Redis集群提高可用性');
  console.log('2. 实施缓存分层策略');
  console.log('3. 监控缓存命中率和性能');
  console.log('4. 定期清理过期数据');
  console.log('5. 使用缓存预热减少冷启动');
  console.log('6. 实施缓存失效策略');
  console.log('7. 优化缓存键命名规范');
  console.log('8. 使用管道批量操作');
  
  return {
    redis: redisConfig,
    strategies: cacheStrategies,
    warmup: cacheWarmup,
    monitoring: cacheMonitoring
  };
};

// 运行缓存优化
const result = cacheOptimization();
console.log('\n🎉 缓存优化配置完成！');
