
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
      await cache.set(`exercises:category:${category}`, categoryExercises, 7200);
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
      await cache.set(`user:profile:${user.id}`, user, 3600);
    }
    
    console.log('✅ 缓存预热完成');
    console.log(`📊 预热统计: ${JSON.stringify(cache.getStats())}`);
    
  } catch (error) {
    console.error('❌ 缓存预热失败:', error);
  }
};

export default warmupCache;
