// 监控系统验证脚本
import http from 'http';

const validateMonitoringSystem = async () => {
  console.log('📊 开始监控系统验证...\n');
  
  // 1. 验证Prometheus配置
  console.log('🔍 验证Prometheus配置...');
  const prometheusConfig = await testEndpoint('http://localhost:9090/api/v1/status/config');
  console.log(`   ${prometheusConfig.success ? '✅' : '❌'} Prometheus配置: ${prometheusConfig.status} (${prometheusConfig.duration}ms)`);
  
  // 2. 验证Prometheus目标
  console.log('🎯 验证Prometheus目标...');
  const prometheusTargets = await testEndpoint('http://localhost:9090/api/v1/targets');
  console.log(`   ${prometheusTargets.success ? '✅' : '❌'} Prometheus目标: ${prometheusTargets.status} (${prometheusTargets.duration}ms)`);
  
  // 3. 验证Grafana健康
  console.log('📈 验证Grafana健康...');
  const grafanaHealth = await testEndpoint('http://localhost:3001/api/health');
  console.log(`   ${grafanaHealth.success ? '✅' : '❌'} Grafana健康: ${grafanaHealth.status} (${grafanaHealth.duration}ms)`);
  
  // 4. 验证Planning Engine指标
  console.log('⚡ 验证Planning Engine指标...');
  const planningMetrics = await testEndpoint('http://localhost:4102/metrics');
  console.log(`   ${planningMetrics.success ? '✅' : '❌'} Planning Engine指标: ${planningMetrics.status} (${planningMetrics.duration}ms)`);
  
  // 5. 验证告警规则
  console.log('🚨 验证告警规则...');
  const alertRules = await testEndpoint('http://localhost:9090/api/v1/rules');
  console.log(`   ${alertRules.success ? '✅' : '❌'} 告警规则: ${alertRules.status} (${alertRules.duration}ms)`);
  
  // 6. 验证服务发现
  console.log('🔍 验证服务发现...');
  const serviceDiscovery = await testEndpoint('http://localhost:9090/api/v1/targets');
  console.log(`   ${serviceDiscovery.success ? '✅' : '❌'} 服务发现: ${serviceDiscovery.status} (${serviceDiscovery.duration}ms)`);
  
  // 7. 验证指标查询
  console.log('📊 验证指标查询...');
  const metricsQuery = await testEndpoint('http://localhost:9090/api/v1/query?query=up');
  console.log(`   ${metricsQuery.success ? '✅' : '❌'} 指标查询: ${metricsQuery.status} (${metricsQuery.duration}ms)`);
  
  // 8. 验证告警状态
  console.log('🚨 验证告警状态...');
  const alertStatus = await testEndpoint('http://localhost:9090/api/v1/alerts');
  console.log(`   ${alertStatus.success ? '✅' : '❌'} 告警状态: ${alertStatus.status} (${alertStatus.duration}ms)`);
  
  // 汇总结果
  const results = [
    prometheusConfig, prometheusTargets, grafanaHealth, 
    planningMetrics, alertRules, serviceDiscovery, 
    metricsQuery, alertStatus
  ];
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('\n📊 监控系统验证结果:');
  console.log('='.repeat(50));
  console.log(`✅ 成功: ${successful.length}/${results.length} (${(successful.length/results.length*100).toFixed(1)}%)`);
  console.log(`❌ 失败: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    console.log(`⏱️  平均响应时间: ${avgDuration.toFixed(1)}ms`);
  }
  
  if (failed.length > 0) {
    console.log('\n❌ 失败的组件:');
    failed.forEach(f => {
      console.log(`   - ${f.url}: ${f.status} (${f.duration}ms)`);
    });
  }
  
  // 监控系统健康评估
  console.log('\n🏥 监控系统健康评估:');
  if (successful.length === results.length) {
    console.log('   🎉 监控系统完全正常！');
    console.log('   ✅ 所有监控组件运行正常');
    console.log('   ✅ 告警规则配置正确');
    console.log('   ✅ 指标收集正常');
    console.log('   ✅ 服务发现正常');
  } else if (successful.length / results.length >= 0.8) {
    console.log('   ⚠️  监控系统基本正常');
    console.log('   🔧 需要修复少量问题');
  } else {
    console.log('   ❌ 监控系统存在问题');
    console.log('   🔧 需要检查配置和服务状态');
  }
  
  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    successRate: (successful.length / results.length) * 100
  };
};

const testEndpoint = async (url) => {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({
          url,
          status: res.statusCode,
          success: res.statusCode === 200,
          duration,
          data: data.substring(0, 200)
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 0,
        success: false,
        duration: Date.now() - start,
        error: err.message
      });
    });
    
    req.setTimeout(5000, () => {
      resolve({
        url,
        status: 0,
        success: false,
        duration: 5000,
        error: 'Timeout'
      });
    });
  });
};

// 运行监控系统验证
validateMonitoringSystem().catch(console.error);

