#!/usr/bin/env node

// Planning Engine 性能基准测试脚本
const { performance } = require('perf_hooks');
const axios = require('axios');

// 配置
const CONFIG = {
  baseUrl: process.env.PLANNING_ENGINE_URL || 'http://localhost:4102',
  concurrentUsers: parseInt(process.env.CONCURRENT_USERS) || 10,
  requestsPerUser: parseInt(process.env.REQUESTS_PER_USER) || 5,
  testDuration: parseInt(process.env.TEST_DURATION) || 60000, // 60秒
  warmupDuration: parseInt(process.env.WARMUP_DURATION) || 10000, // 10秒预热
};

// 测试数据生成器
function generateTestRequest(userId, requestId) {
  const proficiencies = ['beginner', 'intermediate', 'advanced'];
  const seasons = ['offseason', 'preseason', 'inseason', 'postseason'];
  const equipmentOptions = [
    ['bodyweight'],
    ['bodyweight', 'dumbbells'],
    ['barbell', 'plates', 'bench'],
    ['bodyweight', 'dumbbells', 'kettlebell'],
  ];
  const purposes = ['general_fitness', 'strength_training', 'endurance', 'weight_loss'];

  return {
    userId: `test-user-${userId}`,
    proficiency: proficiencies[Math.floor(Math.random() * proficiencies.length)],
    season: seasons[Math.floor(Math.random() * seasons.length)],
    availabilityDays: Math.floor(Math.random() * 4) + 2, // 2-5天
    weeklyGoalDays: Math.floor(Math.random() * 3) + 2, // 2-4天
    equipment: equipmentOptions[Math.floor(Math.random() * equipmentOptions.length)],
    purpose: purposes[Math.floor(Math.random() * purposes.length)],
  };
}

// 性能指标收集器
class PerformanceCollector {
  constructor() {
    this.metrics = {
      requests: [],
      errors: [],
      responseTimes: [],
      throughput: [],
      memoryUsage: [],
    };
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.startTime = performance.now();
    console.log('🚀 开始性能基准测试...');
  }

  stop() {
    this.endTime = performance.now();
    console.log('✅ 性能基准测试完成');
  }

  recordRequest(requestTime, responseTime, success, error = null) {
    const duration = responseTime - requestTime;
    this.metrics.requests.push({
      requestTime,
      responseTime,
      duration,
      success,
      error: error?.message,
    });
    
    if (success) {
      this.metrics.responseTimes.push(duration);
    } else {
      this.metrics.errors.push({
        requestTime,
        error: error?.message,
        duration,
      });
    }
  }

  recordMemoryUsage() {
    const memUsage = process.memoryUsage();
    this.metrics.memoryUsage.push({
      timestamp: performance.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
    });
  }

  calculateStats() {
    const totalDuration = this.endTime - this.startTime;
    const totalRequests = this.metrics.requests.length;
    const successfulRequests = this.metrics.responseTimes.length;
    const failedRequests = this.metrics.errors.length;
    
    const responseTimes = this.metrics.responseTimes;
    const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
    
    const stats = {
      duration: totalDuration,
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: (successfulRequests / totalRequests) * 100,
      throughput: (totalRequests / totalDuration) * 1000, // 请求/秒
      responseTime: {
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        avg: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        p50: this.percentile(sortedResponseTimes, 50),
        p95: this.percentile(sortedResponseTimes, 95),
        p99: this.percentile(sortedResponseTimes, 99),
      },
      memory: this.calculateMemoryStats(),
    };

    return stats;
  }

  percentile(sortedArray, percentile) {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[index] || 0;
  }

  calculateMemoryStats() {
    const memUsage = this.metrics.memoryUsage;
    if (memUsage.length === 0) return null;

    const heapUsed = memUsage.map(m => m.heapUsed);
    const heapTotal = memUsage.map(m => m.heapTotal);
    
    return {
      heapUsed: {
        min: Math.min(...heapUsed),
        max: Math.max(...heapUsed),
        avg: heapUsed.reduce((a, b) => a + b, 0) / heapUsed.length,
      },
      heapTotal: {
        min: Math.min(...heapTotal),
        max: Math.max(...heapTotal),
        avg: heapTotal.reduce((a, b) => a + b, 0) / heapTotal.length,
      },
    };
  }

  printReport() {
    const stats = this.calculateStats();
    
    console.log('\n📊 性能测试报告');
    console.log('='.repeat(50));
    console.log(`测试持续时间: ${(stats.duration / 1000).toFixed(2)}秒`);
    console.log(`总请求数: ${stats.totalRequests}`);
    console.log(`成功请求数: ${stats.successfulRequests}`);
    console.log(`失败请求数: ${stats.failedRequests}`);
    console.log(`成功率: ${stats.successRate.toFixed(2)}%`);
    console.log(`吞吐量: ${stats.throughput.toFixed(2)} 请求/秒`);
    
    console.log('\n⏱️  响应时间统计 (毫秒)');
    console.log('-'.repeat(30));
    console.log(`最小: ${stats.responseTime.min.toFixed(2)}ms`);
    console.log(`最大: ${stats.responseTime.max.toFixed(2)}ms`);
    console.log(`平均: ${stats.responseTime.avg.toFixed(2)}ms`);
    console.log(`P50: ${stats.responseTime.p50.toFixed(2)}ms`);
    console.log(`P95: ${stats.responseTime.p95.toFixed(2)}ms`);
    console.log(`P99: ${stats.responseTime.p99.toFixed(2)}ms`);
    
    if (stats.memory) {
      console.log('\n💾 内存使用统计 (字节)');
      console.log('-'.repeat(30));
      console.log(`堆使用 - 最小: ${(stats.memory.heapUsed.min / 1024 / 1024).toFixed(2)}MB`);
      console.log(`堆使用 - 最大: ${(stats.memory.heapUsed.max / 1024 / 1024).toFixed(2)}MB`);
      console.log(`堆使用 - 平均: ${(stats.memory.heapUsed.avg / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // V3准备标准检查
    console.log('\n🎯 V3准备标准检查');
    console.log('-'.repeat(30));
    const p95ResponseTime = stats.responseTime.p95;
    const successRate = stats.successRate;
    const throughput = stats.throughput;
    
    console.log(`P95响应时间: ${p95ResponseTime.toFixed(2)}ms ${p95ResponseTime < 1000 ? '✅' : '❌'} (目标: <1000ms)`);
    console.log(`成功率: ${successRate.toFixed(2)}% ${successRate > 99 ? '✅' : '❌'} (目标: >99%)`);
    console.log(`吞吐量: ${throughput.toFixed(2)} req/s ${throughput > 10 ? '✅' : '❌'} (目标: >10 req/s)`);
    
    const allPassed = p95ResponseTime < 1000 && successRate > 99 && throughput > 10;
    console.log(`\n总体评估: ${allPassed ? '✅ 通过V3准备标准' : '❌ 未达到V3准备标准'}`);
  }
}

// 单个用户模拟器
async function simulateUser(userId, requestsPerUser, collector, testDuration) {
  const endTime = performance.now() + testDuration;
  let requestCount = 0;
  
  while (performance.now() < endTime && requestCount < requestsPerUser) {
    const requestTime = performance.now();
    const request = generateTestRequest(userId, requestCount);
    
    try {
      const response = await axios.post(`${CONFIG.baseUrl}/generate`, request, {
        timeout: 30000, // 30秒超时
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token', // 测试token
        },
      });
      
      const responseTime = performance.now();
      collector.recordRequest(requestTime, responseTime, true);
      
      // 检查响应
      if (response.status === 202 && response.data.jobId) {
        console.log(`✅ 用户${userId} 请求${requestCount + 1} 成功 - JobId: ${response.data.jobId}`);
      } else {
        console.log(`⚠️  用户${userId} 请求${requestCount + 1} 响应异常:`, response.status);
      }
      
    } catch (error) {
      const responseTime = performance.now();
      collector.recordRequest(requestTime, responseTime, false, error);
      console.log(`❌ 用户${userId} 请求${requestCount + 1} 失败:`, error.message);
    }
    
    requestCount++;
    
    // 请求间隔（避免过于频繁）
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`👤 用户${userId} 完成 ${requestCount} 个请求`);
}

// 主测试函数
async function runPerformanceTest() {
  const collector = new PerformanceCollector();
  
  try {
    // 检查服务健康状态
    console.log('🔍 检查Planning Engine服务状态...');
    const healthResponse = await axios.get(`${CONFIG.baseUrl}/health`);
    console.log('✅ 服务健康检查通过');
    
    // 获取队列状态
    try {
      const queueResponse = await axios.get(`${CONFIG.baseUrl}/queue/status`);
      console.log('📊 当前队列状态:', queueResponse.data);
    } catch (error) {
      console.log('⚠️  无法获取队列状态:', error.message);
    }
    
    collector.start();
    
    // 预热阶段
    console.log(`🔥 开始${CONFIG.warmupDuration / 1000}秒预热...`);
    const warmupPromises = Array.from({ length: 2 }, (_, i) =>
      simulateUser(`warmup-${i}`, 3, collector, CONFIG.warmupDuration)
    );
    await Promise.all(warmupPromises);
    console.log('✅ 预热完成');
    
    // 正式测试
    console.log(`🚀 开始正式测试 - ${CONFIG.concurrentUsers}个用户，每个用户${CONFIG.requestsPerUser}个请求`);
    
    const testPromises = Array.from({ length: CONFIG.concurrentUsers }, (_, i) =>
      simulateUser(i, CONFIG.requestsPerUser, collector, CONFIG.testDuration)
    );
    
    // 定期记录内存使用
    const memoryInterval = setInterval(() => {
      collector.recordMemoryUsage();
    }, 5000);
    
    await Promise.all(testPromises);
    
    clearInterval(memoryInterval);
    collector.stop();
    
    // 生成报告
    collector.printReport();
    
    // 最终队列状态
    try {
      const finalQueueResponse = await axios.get(`${CONFIG.baseUrl}/queue/status`);
      console.log('\n📊 最终队列状态:', finalQueueResponse.data);
    } catch (error) {
      console.log('⚠️  无法获取最终队列状态:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runPerformanceTest().catch(console.error);
}

module.exports = { runPerformanceTest, PerformanceCollector };
