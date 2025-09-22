#!/usr/bin/env node

/**
 * 测试分布式追踪功能
 * 这个脚本会发送测试请求到各个服务，验证追踪数据是否正确发送到Jaeger
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';
const GATEWAY_BFF_URL = `${BASE_URL}`;
const PROFILE_ONBOARDING_URL = 'http://localhost:4101';
const PLANNING_ENGINE_URL = 'http://localhost:4102';

// 测试数据
const testOnboardingData = {
  userId: 'test-user-' + Date.now(),
  purpose: 'sport_performance',
  proficiency: 'intermediate',
  season: 'offseason',
  availabilityDays: 3,
  equipment: ['bodyweight', 'dumbbells'],
  fixedSchedules: [
    { day: 'Monday', start: '18:00', end: '19:00' },
    { day: 'Wednesday', start: '18:00', end: '19:00' },
    { day: 'Friday', start: '18:00', end: '19:00' }
  ]
};

const testPlanData = {
  userId: testOnboardingData.userId,
  seedPlanId: 'test-plan-' + Date.now()
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHealthCheck() {
  log('\n🔍 测试服务健康检查...', 'cyan');
  
  const services = [
    { name: 'Gateway BFF', url: `${GATEWAY_BFF_URL}/health` },
    { name: 'Profile Onboarding', url: `${PROFILE_ONBOARDING_URL}/health` },
    { name: 'Planning Engine', url: `${PLANNING_ENGINE_URL}/health` }
  ];

  for (const service of services) {
    try {
      const response = await fetch(service.url);
      const data = await response.json();
      if (response.ok) {
        log(`  ✅ ${service.name}: ${data.status}`, 'green');
      } else {
        log(`  ❌ ${service.name}: ${response.status}`, 'red');
      }
    } catch (error) {
      log(`  ❌ ${service.name}: ${error.message}`, 'red');
    }
  }
}

async function testOnboarding() {
  log('\n📝 测试用户引导流程...', 'cyan');
  
  try {
    const response = await fetch(`${GATEWAY_BFF_URL}/v1/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOnboardingData)
    });

    const data = await response.json();
    
    if (response.ok) {
      log(`  ✅ 引导提交成功: ${data.jobId}`, 'green');
      return data.jobId;
    } else {
      log(`  ❌ 引导提交失败: ${data.error}`, 'red');
      return null;
    }
  } catch (error) {
    log(`  ❌ 引导提交错误: ${error.message}`, 'red');
    return null;
  }
}

async function testPlanGeneration() {
  log('\n🏋️ 测试训练计划生成...', 'cyan');
  
  try {
    const response = await fetch(`${GATEWAY_BFF_URL}/v1/plans/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPlanData)
    });

    const data = await response.json();
    
    if (response.ok) {
      log(`  ✅ 计划生成成功: ${data.planId}`, 'green');
      return data.planId;
    } else {
      log(`  ❌ 计划生成失败: ${data.error}`, 'red');
      return null;
    }
  } catch (error) {
    log(`  ❌ 计划生成错误: ${error.message}`, 'red');
    return null;
  }
}

async function testMetrics() {
  log('\n📊 测试指标收集...', 'cyan');
  
  const metricsEndpoints = [
    { name: 'Gateway BFF', url: `${GATEWAY_BFF_URL}:9464/metrics` },
    { name: 'Profile Onboarding', url: `${PROFILE_ONBOARDING_URL}:9465/metrics` },
    { name: 'Planning Engine', url: `${PLANNING_ENGINE_URL}:9466/metrics` }
  ];

  for (const endpoint of metricsEndpoints) {
    try {
      const response = await fetch(endpoint.url);
      if (response.ok) {
        const text = await response.text();
        const businessMetrics = text.match(/onboarding_|plan_generation_|api_/g) || [];
        log(`  ✅ ${endpoint.name}: 找到 ${businessMetrics.length} 个业务指标`, 'green');
      } else {
        log(`  ❌ ${endpoint.name}: ${response.status}`, 'red');
      }
    } catch (error) {
      log(`  ❌ ${endpoint.name}: ${error.message}`, 'red');
    }
  }
}

async function main() {
  log('🚀 开始测试 Athlete Ally 分布式追踪功能', 'bright');
  log(`📅 测试时间: ${new Date().toLocaleString()}`, 'blue');
  log(`👤 测试用户: ${testOnboardingData.userId}`, 'blue');
  
  // 1. 健康检查
  await testHealthCheck();
  
  // 2. 测试用户引导
  const jobId = await testOnboarding();
  
  // 3. 等待一下让追踪数据发送
  await sleep(2000);
  
  // 4. 测试计划生成
  const planId = await testPlanGeneration();
  
  // 5. 等待一下让追踪数据发送
  await sleep(2000);
  
  // 6. 测试指标收集
  await testMetrics();
  
  // 7. 显示结果
  log('\n📋 测试结果总结:', 'bright');
  log(`  - 用户引导: ${jobId ? '✅ 成功' : '❌ 失败'}`, jobId ? 'green' : 'red');
  log(`  - 计划生成: ${planId ? '✅ 成功' : '❌ 失败'}`, planId ? 'green' : 'red');
  
  log('\n🔍 查看追踪数据:', 'cyan');
  log('  - Jaeger UI: http://localhost:16686', 'white');
  log('  - 搜索服务: gateway-bff, profile-onboarding, planning-engine', 'white');
  log('  - 搜索标签: user.id, plan.user_id', 'white');
  
  log('\n📊 查看指标数据:', 'cyan');
  log('  - Prometheus: http://localhost:9090', 'white');
  log('  - 查询指标: onboarding_requests_total, plan_generation_duration_seconds', 'white');
  
  log('\n✨ 测试完成！', 'green');
}

// 运行测试
main().catch(error => {
  log(`❌ 测试失败: ${error.message}`, 'red');
  process.exit(1);
});

