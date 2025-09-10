// 端到端功能测试
const http = require('http');
require('dotenv').config();

console.log('🧪 开始端到端功能测试');
console.log('========================');

// 测试数据
const testData = {
  purpose: "strength",
  season: "off", 
  proficiency: "intermediate",
  equipment: ["barbell", "dumbbells"],
  availability: {
    days: ["monday", "wednesday", "friday"],
    duration: 60
  }
};

// 发送 HTTP 请求的辅助函数
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 测试 1: 健康检查
async function testHealthChecks() {
  console.log('\n1️⃣ 测试服务健康检查');
  
  try {
    const profileHealth = await makeRequest({
      hostname: 'localhost',
      port: process.env.PROFILE_ONBOARDING_PORT || 8001,
      path: '/health',
      method: 'GET'
    });
    
    const gatewayHealth = await makeRequest({
      hostname: 'localhost', 
      port: process.env.GATEWAY_BFF_PORT || 8000,
      path: '/health',
      method: 'GET'
    });
    
    console.log(`  ✅ Profile Onboarding: ${profileHealth.status} - ${JSON.stringify(profileHealth.data)}`);
    console.log(`  ✅ Gateway BFF: ${gatewayHealth.status} - ${JSON.stringify(gatewayHealth.data)}`);
    
    return profileHealth.status === 200 && gatewayHealth.status === 200;
  } catch (error) {
    console.log(`  ❌ 健康检查失败: ${error.message}`);
    return false;
  }
}

// 测试 2: Onboarding 流程
async function testOnboarding() {
  console.log('\n2️⃣ 测试用户注册流程');
  
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: process.env.PROFILE_ONBOARDING_PORT || 8001,
      path: '/v1/onboarding',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, testData);
    
    console.log(`  📊 响应状态: ${result.status}`);
    console.log(`  📋 响应数据: ${JSON.stringify(result.data, null, 2)}`);
    
    if (result.status === 200 || result.status === 201) {
      console.log('  ✅ 用户注册流程测试通过');
      return true;
    } else {
      console.log('  ❌ 用户注册流程测试失败');
      return false;
    }
  } catch (error) {
    console.log(`  ❌ 用户注册流程测试失败: ${error.message}`);
    return false;
  }
}

// 测试 3: 服务间通信
async function testServiceCommunication() {
  console.log('\n3️⃣ 测试服务间通信');
  
  try {
    // 通过 Gateway BFF 访问 Profile Onboarding
    const result = await makeRequest({
      hostname: 'localhost',
      port: process.env.GATEWAY_BFF_PORT || 8000,
      path: '/api/v1/onboarding',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, testData);
    
    console.log(`  📊 Gateway 响应状态: ${result.status}`);
    console.log(`  📋 Gateway 响应数据: ${JSON.stringify(result.data, null, 2)}`);
    
    if (result.status === 200 || result.status === 201) {
      console.log('  ✅ 服务间通信测试通过');
      return true;
    } else {
      console.log('  ❌ 服务间通信测试失败');
      return false;
    }
  } catch (error) {
    console.log(`  ❌ 服务间通信测试失败: ${error.message}`);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始运行测试套件...\n');
  
  const results = [];
  
  results.push(await testHealthChecks());
  results.push(await testOnboarding());
  results.push(await testServiceCommunication());
  
  console.log('\n📊 测试结果汇总');
  console.log('================');
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ 通过: ${passed}/${total}`);
  console.log(`❌ 失败: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 所有测试通过！声明式配置工作正常！');
  } else {
    console.log('\n⚠️  部分测试失败，需要进一步调试');
  }
  
  return passed === total;
}

// 运行测试
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});

