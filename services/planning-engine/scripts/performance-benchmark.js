// 性能基准测试脚本
import http from 'http';

const benchmark = async (url, name, iterations = 100) => {
  console.log(`\n🚀 开始测试 ${name} (${iterations} 次请求)...`);
  
  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    const requestStart = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const duration = Date.now() - requestStart;
            results.push({
              duration,
              status: res.statusCode,
              success: res.statusCode === 200
            });
            resolve();
          });
        });
        
        req.on('error', (err) => {
          results.push({
            duration: Date.now() - requestStart,
            status: 0,
            success: false,
            error: err.message
          });
          resolve();
        });
        
        req.setTimeout(5000, () => {
          results.push({
            duration: 5000,
            status: 0,
            success: false,
            error: 'Timeout'
          });
          resolve();
        });
      });
    } catch (error) {
      results.push({
        duration: Date.now() - requestStart,
        status: 0,
        success: false,
        error: error.message
      });
    }
  }
  
  const totalTime = Date.now() - startTime;
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    const durations = successful.map(r => r.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const p95Duration = durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)];
    
    console.log(`✅ ${name} 测试结果:`);
    console.log(`   📊 成功率: ${successful.length}/${iterations} (${(successful.length/iterations*100).toFixed(1)}%)`);
    console.log(`   ⏱️  平均响应时间: ${avgDuration.toFixed(1)}ms`);
    console.log(`   🏃 最快响应时间: ${minDuration}ms`);
    console.log(`   🐌 最慢响应时间: ${maxDuration}ms`);
    console.log(`   📈 95%分位响应时间: ${p95Duration}ms`);
    console.log(`   🚀 总吞吐量: ${(iterations / (totalTime / 1000)).toFixed(2)} req/s`);
    
    if (failed.length > 0) {
      console.log(`   ❌ 失败请求: ${failed.length}`);
      const errorTypes = {};
      failed.forEach(f => {
        errorTypes[f.error] = (errorTypes[f.error] || 0) + 1;
      });
      Object.entries(errorTypes).forEach(([error, count]) => {
        console.log(`      - ${error}: ${count}次`);
      });
    }
    
    return {
      name,
      success: true,
      avgDuration,
      minDuration,
      maxDuration,
      p95Duration,
      successRate: successful.length / iterations,
      throughput: iterations / (totalTime / 1000)
    };
  } else {
    console.log(`❌ ${name} 测试失败: 所有请求都失败了`);
    return {
      name,
      success: false,
      avgDuration: -1,
      successRate: 0
    };
  }
};

const runBenchmarks = async () => {
  console.log('🎯 开始性能基准测试...\n');
  console.log('=' * 60);
  
  const tests = [
    { url: 'http://localhost:4102/health', name: 'Planning Engine Health', iterations: 100 },
    { url: 'http://localhost:9090/api/v1/status/config', name: 'Prometheus Config', iterations: 50 },
    { url: 'http://localhost:3001/api/health', name: 'Grafana Health', iterations: 50 }
  ];
  
  const results = [];
  for (const test of tests) {
    const result = await benchmark(test.url, test.name, test.iterations);
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 性能基准测试总结');
  console.log('='.repeat(60));
  
  const successfulTests = results.filter(r => r.success);
  const overallSuccessRate = results.reduce((sum, r) => sum + r.successRate, 0) / results.length;
  const avgResponseTime = successfulTests.reduce((sum, r) => sum + r.avgDuration, 0) / successfulTests.length;
  
  console.log(`🎯 总体成功率: ${(overallSuccessRate * 100).toFixed(1)}%`);
  console.log(`⏱️  平均响应时间: ${avgResponseTime.toFixed(1)}ms`);
  console.log(`✅ 成功测试: ${successfulTests.length}/${results.length}`);
  
  // 性能建议
  console.log('\n💡 性能优化建议:');
  if (avgResponseTime > 50) {
    console.log('   ⚠️  平均响应时间超过50ms，建议优化:');
    console.log('      - 检查数据库查询性能');
    console.log('      - 优化缓存策略');
    console.log('      - 检查网络延迟');
  } else {
    console.log('   ✅ 响应时间表现优秀 (<50ms)');
  }
  
  if (overallSuccessRate < 0.99) {
    console.log('   ⚠️  成功率低于99%，建议检查:');
    console.log('      - 服务稳定性');
    console.log('      - 错误处理机制');
    console.log('      - 资源限制');
  } else {
    console.log('   ✅ 成功率表现优秀 (>99%)');
  }
  
  console.log('\n🎉 性能基准测试完成！');
};

runBenchmarks().catch(console.error);

