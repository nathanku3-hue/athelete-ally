#!/usr/bin/env node

/**
 * 监控系统验证脚本
 * 验证所有监控指标是否正确流入Grafana
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://localhost:9090';
const GRAFANA_URL = process.env.GRAFANA_URL || 'http://localhost:3000';

// 监控指标检查
const metricsToCheck = [
  {
    name: 'HTTP请求总数',
    query: 'http_requests_total',
    description: 'API请求计数器'
  },
  {
    name: 'HTTP请求持续时间',
    query: 'http_request_duration_seconds_bucket',
    description: 'API响应时间直方图'
  },
  {
    name: '错误率',
    query: 'http_requests_total{status=~"5.."}',
    description: '5xx错误请求计数'
  },
  {
    name: '事件处理',
    query: 'nats_jetstream_consumer_messages_processed',
    description: 'NATS JetStream消息处理计数'
  },
  {
    name: '速率限制',
    query: 'rate_limit_requests_total',
    description: '速率限制请求计数'
  },
  {
    name: '数据库连接',
    query: 'db_connections_active',
    description: '活跃数据库连接数'
  },
  {
    name: 'Redis连接',
    query: 'redis_connections_active',
    description: '活跃Redis连接数'
  },
  {
    name: '内存使用',
    query: 'process_resident_memory_bytes',
    description: '进程内存使用量'
  }
];

async function checkPrometheusMetrics() {
  console.log('🔍 检查Prometheus指标...');
  
  try {
    const response = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=up`);
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('✅ Prometheus服务正常运行');
      return true;
    } else {
      console.log('❌ Prometheus查询失败');
      return false;
    }
  } catch (error) {
    console.log(`❌ 无法连接到Prometheus: ${error.message}`);
    return false;
  }
}

async function checkGrafanaDashboard() {
  console.log('🔍 检查Grafana仪表盘...');
  
  try {
    const response = await fetch(`${GRAFANA_URL}/api/health`);
    const data = await response.json();
    
    if (data.database === 'ok') {
      console.log('✅ Grafana服务正常运行');
      return true;
    } else {
      console.log('❌ Grafana数据库连接异常');
      return false;
    }
  } catch (error) {
    console.log(`❌ 无法连接到Grafana: ${error.message}`);
    return false;
  }
}

async function generateTestTraffic() {
  console.log('🚀 生成测试流量以产生监控指标...');
  
  const testRequests = [
    { method: 'GET', endpoint: '/api/v1/user/preferences' },
    { method: 'POST', endpoint: '/api/v1/rpe-data', data: {
      exerciseId: 'ex1',
      setNumber: 1,
      reps: 8,
      weight: 135,
      rpe: 7.5,
      userId: '123e4567-e89b-12d3-a456-426614174000'
    }},
    { method: 'PATCH', endpoint: '/api/v1/user/preferences', data: {
      unit: 'kg',
      theme: 'dark'
    }},
    { method: 'GET', endpoint: '/api/v1/rpe-data?userId=123e4567-e89b-12d3-a456-426614174000&limit=10' }
  ];
  
  for (const request of testRequests) {
    try {
      const url = `${BASE_URL}${request.endpoint}`;
      const options = {
        method: request.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (request.data) {
        options.body = JSON.stringify(request.data);
      }
      
      await fetch(url, options);
      console.log(`  ✅ ${request.method} ${request.endpoint}`);
    } catch (error) {
      console.log(`  ❌ ${request.method} ${request.endpoint}: ${error.message}`);
    }
  }
}

async function validateMetrics() {
  console.log('📊 验证监控指标...');
  
  const results = [];
  
  for (const metric of metricsToCheck) {
    try {
      const response = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${metric.query}`);
      const data = await response.json();
      
      if (data.status === 'success' && data.data.result.length > 0) {
        console.log(`  ✅ ${metric.name}: 有数据`);
        results.push({ name: metric.name, status: 'success', data: data.data.result.length });
      } else {
        console.log(`  ⚠️  ${metric.name}: 暂无数据`);
        results.push({ name: metric.name, status: 'no_data', data: 0 });
      }
    } catch (error) {
      console.log(`  ❌ ${metric.name}: 查询失败 - ${error.message}`);
      results.push({ name: metric.name, status: 'error', data: 0 });
    }
  }
  
  return results;
}

async function generateMonitoringReport() {
  console.log('📋 生成监控验证报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    prometheus: await checkPrometheusMetrics(),
    grafana: await checkGrafanaDashboard(),
    metrics: await validateMetrics()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 监控系统验证报告');
  console.log('='.repeat(60));
  console.log(`时间: ${report.timestamp}`);
  console.log(`Prometheus状态: ${report.prometheus ? '✅ 正常' : '❌ 异常'}`);
  console.log(`Grafana状态: ${report.grafana ? '✅ 正常' : '❌ 异常'}`);
  console.log('\n指标详情:');
  
  report.metrics.forEach(metric => {
    const status = metric.status === 'success' ? '✅' : 
                  metric.status === 'no_data' ? '⚠️' : '❌';
    console.log(`  ${status} ${metric.name}: ${metric.data} 个数据点`);
  });
  
  const successCount = report.metrics.filter(m => m.status === 'success').length;
  const totalCount = report.metrics.length;
  
  console.log(`\n总体状态: ${successCount}/${totalCount} 指标正常`);
  
  if (successCount === totalCount) {
    console.log('🎉 所有监控指标都正常工作！');
  } else if (successCount > totalCount / 2) {
    console.log('⚠️  大部分监控指标正常，但需要检查异常指标');
  } else {
    console.log('❌ 监控系统需要紧急修复');
  }
  
  return report;
}

async function main() {
  console.log('🚀 开始监控系统验证');
  console.log('='.repeat(50));
  
  // 生成测试流量
  await generateTestTraffic();
  
  // 等待指标收集
  console.log('\n⏳ 等待指标收集...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 验证监控系统
  const report = await generateMonitoringReport();
  
  // 保存报告
  const fs = require('fs');
  fs.writeFileSync('monitoring-validation-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 报告已保存到 monitoring-validation-report.json');
}

// 检查是否在Node.js环境中运行
if (typeof fetch === 'undefined') {
  console.log('❌ 此脚本需要Node.js 18+内置fetch支持');
  console.log('   或安装node-fetch: npm install node-fetch');
  process.exit(1);
}

main().catch(console.error);
