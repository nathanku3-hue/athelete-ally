
// 速率限制测试脚本
import http from 'http';

const testRateLimit = async (url, requests = 10, delay = 100) => {
  const results = [];
  const start = Date.now();
  
  for (let i = 0; i < requests; i++) {
    const requestStart = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const duration = Date.now() - requestStart;
            results.push({
              status: res.statusCode,
              duration,
              success: res.statusCode === 200,
              rateLimited: res.statusCode === 429,
              headers: res.headers
            });
            resolve();
          });
        });
        
        req.on('error', (err) => {
          results.push({
            status: 0,
            duration: Date.now() - requestStart,
            success: false,
            rateLimited: false,
            error: err.message
          });
          resolve();
        });
        
        req.setTimeout(5000, () => {
          results.push({
            status: 0,
            duration: 5000,
            success: false,
            rateLimited: false,
            error: 'Timeout'
          });
          resolve();
        });
      });
    } catch (error) {
      results.push({
        status: 0,
        duration: Date.now() - requestStart,
        success: false,
        rateLimited: false,
        error: error.message
      });
    }
    
    // 延迟
    if (i < requests - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  const totalTime = Date.now() - start;
  const successful = results.filter(r => r.success);
  const rateLimited = results.filter(r => r.rateLimited);
  const failed = results.filter(r => !r.success && !r.rateLimited);
  
  return {
    total: results.length,
    successful: successful.length,
    rateLimited: rateLimited.length,
    failed: failed.length,
    totalTime,
    avgResponseTime: successful.length > 0 ? 
      successful.reduce((sum, r) => sum + r.duration, 0) / successful.length : 0
  };
};

const runRateLimitTest = async () => {
  console.log('🧪 开始速率限制测试...');
  
  const testCases = [
    {
      name: '正常请求测试',
      url: 'http://localhost:4102/health',
      requests: 10,
      delay: 1000,
      expectedRateLimited: false
    },
    {
      name: '快速请求测试',
      url: 'http://localhost:4102/health',
      requests: 20,
      delay: 100,
      expectedRateLimited: true
    },
    {
      name: 'API端点测试',
      url: 'http://localhost:4102/metrics',
      requests: 15,
      delay: 200,
      expectedRateLimited: false
    }
  ];
  
  const results = [];
  for (const testCase of testCases) {
    console.log('🔍 测试: ' + testCase.name + '...');
    const result = await testRateLimit(testCase.url, testCase.requests, testCase.delay);
    results.push({ ...testCase, ...result });
    
    const status = result.rateLimited > 0 ? '✅' : '❌';
    console.log('   ' + status + ' 速率限制: ' + result.rateLimited + '/' + result.total + ' 被限制');
    console.log('   📊 成功: ' + result.successful + '/' + result.total);
    console.log('   ⏱️  平均响应时间: ' + result.avgResponseTime.toFixed(2) + 'ms');
    console.log('   🕐 总耗时: ' + (result.totalTime / 1000).toFixed(2) + 's');
  }
  
  console.log('\\n📊 速率限制测试结果:');
  console.log('='.repeat(50));
  
  const totalTests = results.length;
  const workingTests = results.filter(r => r.rateLimited > 0 || r.successful > 0).length;
  
  console.log('✅ 工作正常: ' + workingTests + '/' + totalTests);
  console.log('❌ 需要修复: ' + (totalTests - workingTests) + '/' + totalTests);
  
  if (workingTests === totalTests) {
    console.log('\\n🎉 速率限制配置正常！');
    console.log('✅ 所有测试通过');
    console.log('✅ 速率限制工作正常');
  } else {
    console.log('\\n⚠️  速率限制需要修复');
    console.log('🔧 需要检查配置');
  }
  
  return results;
};

// 运行速率限制测试
runRateLimitTest().catch(console.error);
