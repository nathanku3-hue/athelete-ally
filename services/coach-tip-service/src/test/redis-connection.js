import { Redis } from 'ioredis';

async function testRedisConnection() {
  console.log('🔍 Testing Redis Connection...');
  
  const redis = new Redis({
    host: 'localhost',
    port: 6379,
    db: 14,
    retryDelayOnFailover: 100,
    lazyConnect: true,
    maxRetriesPerRequest: 3
  });
  
  try {
    await redis.connect();
    console.log('✅ Connected to Redis');
    
    await redis.set('test:key', 'test:value');
    const value = await redis.get('test:key');
    console.log('✅ Redis operations working:', { value });
    
    await redis.del('test:key');
    console.log('✅ Cleanup completed');
    
    await redis.disconnect();
    console.log('✅ Disconnected from Redis');
    
    console.log('🎉 Redis connection test PASSED!');
  } catch (error) {
    console.error('❌ Redis connection test FAILED:', error.message);
    process.exit(1);
  }
}

testRedisConnection();