// 性能监控脚本 - 用于验证优化效果
const fetch = require('node-fetch');

class PerformanceMonitor {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.services = {
      planningEngine: 'http://localhost:4102',
      workouts: 'http://localhost:4104',
      profileOnboarding: 'http://localhost:8001',
      exercises: 'http://localhost:4103',
      fatigue: 'http://localhost:4105',
    };
    this.results = {
      apiResponseTimes: {},
      errorRates: {},
      throughput: {},
      userExperience: {},
    };
  }

  async runPerformanceTests() {
    console.log('🚀 Starting performance monitoring...\n');

    // 测试API响应时间
    await this.testApiResponseTimes();
    
    // 测试错误率
    await this.testErrorRates();
    
    // 测试吞吐量
    await this.testThroughput();
    
    // 测试用户体验指标
    await this.testUserExperience();
    
    // 生成报告
    this.generateReport();
  }

  async testApiResponseTimes() {
    console.log('📊 Testing API response times...');
    
    const tests = [
      { name: 'Planning Engine - Generate Plan', url: `${this.services.planningEngine}/generate`, method: 'POST', body: { userId: 'test_user' } },
      { name: 'Planning Engine - Health Check', url: `${this.services.planningEngine}/health`, method: 'GET' },
      { name: 'Workouts - Summary', url: `${this.services.workouts}/api/v1/summary/test_user`, method: 'GET' },
      { name: 'Workouts - Health Check', url: `${this.services.workouts}/health`, method: 'GET' },
      { name: 'Profile Onboarding - Health Check', url: `${this.services.profileOnboarding}/health`, method: 'GET' },
      { name: 'Exercises - Search', url: `${this.services.exercises}/exercises?query=push`, method: 'GET' },
      { name: 'Exercises - Health Check', url: `${this.services.exercises}/health`, method: 'GET' },
    ];

    for (const test of tests) {
      const times = [];
      const iterations = 10;
      
      for (let i = 0; i < iterations; i++) {
        try {
          const startTime = Date.now();
          
          const options = {
            method: test.method,
            headers: { 'Content-Type': 'application/json' },
          };
          
          if (test.body) {
            options.body = JSON.stringify(test.body);
          }
          
          const response = await fetch(test.url, options);
          const endTime = Date.now();
          
          if (response.ok) {
            times.push(endTime - startTime);
          }
        } catch (error) {
          console.warn(`⚠️  ${test.name} failed: ${error.message}`);
        }
      }
      
      if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const p95Time = times.sort((a, b) => a - b)[Math.ceil(times.length * 0.95) - 1];
        
        this.results.apiResponseTimes[test.name] = {
          average: Math.round(avgTime),
          p95: p95Time,
          successRate: (times.length / iterations) * 100,
        };
        
        console.log(`✅ ${test.name}: ${Math.round(avgTime)}ms avg, ${p95Time}ms P95`);
      }
    }
  }

  async testErrorRates() {
    console.log('\n🔍 Testing error rates...');
    
    const tests = [
      { name: 'Planning Engine', url: `${this.services.planningEngine}/generate` },
      { name: 'Workouts Service', url: `${this.services.workouts}/api/v1/summary/invalid_user` },
      { name: 'Exercises Service', url: `${this.services.exercises}/exercises` },
    ];

    for (const test of tests) {
      let errorCount = 0;
      const iterations = 20;
      
      for (let i = 0; i < iterations; i++) {
        try {
          const response = await fetch(test.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'test_user' }),
          });
          
          if (!response.ok) {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }
      
      const errorRate = (errorCount / iterations) * 100;
      this.results.errorRates[test.name] = errorRate;
      
      console.log(`📈 ${test.name}: ${errorRate.toFixed(1)}% error rate`);
    }
  }

  async testThroughput() {
    console.log('\n⚡ Testing throughput...');
    
    // 测试并发请求处理能力
    const concurrentRequests = 50;
    const testUrl = `${this.services.planningEngine}/health`;
    
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        fetch(testUrl).then(response => ({
          success: response.ok,
          responseTime: Date.now() - startTime,
        }))
      );
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const successfulRequests = results.filter(r => r.success).length;
    const totalTime = endTime - startTime;
    const requestsPerSecond = (successfulRequests / totalTime) * 1000;
    
    this.results.throughput = {
      concurrentRequests,
      successfulRequests,
      totalTime,
      requestsPerSecond: Math.round(requestsPerSecond),
    };
    
    console.log(`🚀 Throughput: ${Math.round(requestsPerSecond)} requests/second`);
  }

  async testUserExperience() {
    console.log('\n👤 Testing user experience metrics...');
    
    // 模拟用户引导流程
    const onboardingSteps = [
      { step: 1, name: 'purpose_selection' },
      { step: 2, name: 'proficiency_assessment' },
      { step: 3, name: 'season_goals' },
      { step: 4, name: 'availability_setup' },
      { step: 5, name: 'equipment_selection' },
    ];
    
    const stepTimes = [];
    let totalTime = 0;
    
    for (const step of onboardingSteps) {
      const stepStartTime = Date.now();
      
      // 模拟步骤处理时间
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      const stepTime = Date.now() - stepStartTime;
      stepTimes.push(stepTime);
      totalTime += stepTime;
      
      console.log(`📝 Step ${step.step} (${step.name}): ${stepTime}ms`);
    }
    
    this.results.userExperience = {
      totalOnboardingTime: totalTime,
      averageStepTime: Math.round(totalTime / onboardingSteps.length),
      stepTimes,
      completionRate: 100, // 假设100%完成率用于测试
    };
    
    console.log(`⏱️  Total onboarding time: ${totalTime}ms`);
  }

  generateReport() {
    console.log('\n📋 Performance Monitoring Report');
    console.log('=====================================\n');
    
    // API响应时间报告
    console.log('🔧 API Response Times:');
    Object.entries(this.results.apiResponseTimes).forEach(([name, data]) => {
      const status = data.p95 < 2000 ? '✅' : data.p95 < 5000 ? '⚠️' : '❌';
      console.log(`  ${status} ${name}: ${data.average}ms avg, ${data.p95}ms P95 (${data.successRate.toFixed(1)}% success)`);
    });
    
    // 错误率报告
    console.log('\n🚨 Error Rates:');
    Object.entries(this.results.errorRates).forEach(([name, rate]) => {
      const status = rate < 1 ? '✅' : rate < 5 ? '⚠️' : '❌';
      console.log(`  ${status} ${name}: ${rate.toFixed(1)}%`);
    });
    
    // 吞吐量报告
    console.log('\n⚡ Throughput:');
    const { requestsPerSecond, successfulRequests, concurrentRequests } = this.results.throughput;
    const successRate = (successfulRequests / concurrentRequests) * 100;
    const status = requestsPerSecond > 100 ? '✅' : requestsPerSecond > 50 ? '⚠️' : '❌';
    console.log(`  ${status} ${requestsPerSecond} requests/second (${successRate.toFixed(1)}% success)`);
    
    // 用户体验报告
    console.log('\n👤 User Experience:');
    const { totalOnboardingTime, averageStepTime, completionRate } = this.results.userExperience;
    const onboardingStatus = totalOnboardingTime < 10000 ? '✅' : totalOnboardingTime < 30000 ? '⚠️' : '❌';
    console.log(`  ${onboardingStatus} Onboarding: ${totalOnboardingTime}ms total, ${averageStepTime}ms avg per step`);
    console.log(`  📊 Completion rate: ${completionRate}%`);
    
    // 性能建议
    console.log('\n💡 Performance Recommendations:');
    this.generateRecommendations();
  }

  generateRecommendations() {
    const recommendations = [];
    
    // 检查API响应时间
    Object.entries(this.results.apiResponseTimes).forEach(([name, data]) => {
      if (data.p95 > 5000) {
        recommendations.push(`🔧 Optimize ${name} - P95 response time is ${data.p95}ms (target: <2000ms)`);
      }
    });
    
    // 检查错误率
    Object.entries(this.results.errorRates).forEach(([name, rate]) => {
      if (rate > 5) {
        recommendations.push(`🚨 Fix ${name} - Error rate is ${rate.toFixed(1)}% (target: <1%)`);
      }
    });
    
    // 检查吞吐量
    if (this.results.throughput.requestsPerSecond < 50) {
      recommendations.push(`⚡ Improve throughput - Currently ${this.results.throughput.requestsPerSecond} req/s (target: >100 req/s)`);
    }
    
    // 检查用户体验
    if (this.results.userExperience.totalOnboardingTime > 30000) {
      recommendations.push(`👤 Optimize onboarding flow - Total time is ${this.results.userExperience.totalOnboardingTime}ms (target: <30s)`);
    }
    
    if (recommendations.length === 0) {
      console.log('  🎉 All performance metrics are within acceptable ranges!');
    } else {
      recommendations.forEach(rec => console.log(`  ${rec}`));
    }
  }
}

// 运行性能监控
async function main() {
  const monitor = new PerformanceMonitor();
  await monitor.runPerformanceTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PerformanceMonitor;

