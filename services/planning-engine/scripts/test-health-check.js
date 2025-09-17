/**
 * 🧪 健康检查系统测试脚本
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 测试所有健康检查端点
 * - 验证响应格式
 * - 检查服务状态
 */

import http from 'http';

const BASE_URL = 'http://localhost:4102';

// 测试端点列表
const endpoints = [
  { path: '/health', name: '基础健康检查' },
  { path: '/health/detailed', name: '详细健康检查' },
  { path: '/health/ready', name: '就绪检查' },
  { path: '/health/live', name: '存活检查' },
  { path: '/health/cache', name: '缓存状态检查' },
  { path: '/health/rate-limit', name: '限流状态检查' },
  { path: '/health/system', name: '系统信息检查' },
  { path: '/metrics', name: 'Prometheus指标' },
  { path: '/rate-limit/status', name: '限流状态' }
];

// 发送HTTP请求
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4102,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev-token' // 开发环境token
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// 测试单个端点
async function testEndpoint(endpoint) {
  try {
    console.log(`\n🔍 测试 ${endpoint.name} (${endpoint.path})`);
    
    const response = await makeRequest(endpoint.path);
    
    console.log(`   状态码: ${response.statusCode}`);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`   ✅ 成功`);
      
      // 显示关键信息
      if (response.data.status) {
        console.log(`   状态: ${response.data.status}`);
      }
      
      if (response.data.timestamp) {
        console.log(`   时间戳: ${response.data.timestamp}`);
      }
      
      if (response.data.uptime) {
        console.log(`   运行时间: ${response.data.uptime}秒`);
      }
      
      if (response.data.checks) {
        const checks = response.data.checks;
        const healthyCount = Object.values(checks).filter(c => c.status === 'healthy').length;
        const totalCount = Object.keys(checks).length;
        console.log(`   检查结果: ${healthyCount}/${totalCount} 健康`);
      }
      
      if (response.data.summary) {
        const summary = response.data.summary;
        console.log(`   摘要: 总计${summary.total}, 健康${summary.healthy}, 不健康${summary.unhealthy}, 降级${summary.degraded}`);
      }
      
    } else {
      console.log(`   ❌ 失败`);
      console.log(`   错误: ${JSON.stringify(response.data, null, 2)}`);
    }
    
  } catch (error) {
    console.log(`   ❌ 错误: ${error.message}`);
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始健康检查系统测试');
  console.log(`📡 测试服务器: ${BASE_URL}`);
  console.log('=' * 50);
  
  // 测试所有端点
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n' + '=' * 50);
  console.log('✅ 健康检查系统测试完成');
  
  // 测试限流功能
  console.log('\n🛡️ 测试限流功能');
  try {
    console.log('发送多个请求测试限流...');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(makeRequest('/health'));
    }
    
    const responses = await Promise.all(promises);
    const rateLimited = responses.filter(r => r.statusCode === 429).length;
    
    if (rateLimited > 0) {
      console.log(`✅ 限流功能正常工作 (${rateLimited} 个请求被限制)`);
    } else {
      console.log('⚠️ 限流功能可能未生效');
    }
    
  } catch (error) {
    console.log(`❌ 限流测试失败: ${error.message}`);
  }
}

// 运行测试
runTests().catch(console.error);
