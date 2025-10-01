#!/usr/bin/env node

/**
 * 🏥 全服务健康检查脚本
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 检查所有微服务健康状态
 * - 验证数据库连接
 * - 检查Redis和NATS连接
 * - 生成健康报告
 */

const http = require('http');
const https = require('https');
const { promisify } = require('util');

// 服务配置
const SERVICES = [
  { name: 'Frontend', url: 'http://localhost:3000', port: 3000 },
  { name: 'Gateway BFF', url: 'http://localhost:4000/health', port: 4000 },
  { name: 'Profile Onboarding', url: 'http://localhost:4101/health', port: 4101 },
  { name: 'Planning Engine', url: 'http://localhost:4102/health', port: 4102 },
  { name: 'Exercises Service', url: 'http://localhost:4103/health', port: 4103 },
  { name: 'Fatigue Service', url: 'http://localhost:4104/health', port: 4104 },
  { name: 'Workouts Service', url: 'http://localhost:4105/health', port: 4105 },
  { name: 'Analytics Service', url: 'http://localhost:4106/health', port: 4106 },
];

const INFRASTRUCTURE = [
  { name: 'PostgreSQL', host: 'localhost', port: 5432, type: 'postgres' },
  { name: 'Redis', host: 'localhost', port: 6379, type: 'redis' },
  { name: 'NATS', host: 'localhost', port: 4223, type: 'nats' },
];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// HTTP请求包装器
function makeRequest(url, timeout = 5000) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, error: null });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, error: null });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ status: null, data: null, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: null, data: null, error: 'Request timeout' });
    });
  });
}

// 检查端口是否开放
function checkPort(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeout);
    
    socket.connect(port, host, () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

// 检查服务健康状态
async function checkServiceHealth(service) {
  const startTime = Date.now();
  
  try {
    // 首先检查端口是否开放
    const portOpen = await checkPort('localhost', service.port);
    if (!portOpen) {
      return {
        name: service.name,
        status: 'DOWN',
        responseTime: null,
        error: 'Port not accessible',
        details: null
      };
    }
    
    // 检查HTTP端点
    const response = await makeRequest(service.url);
    const responseTime = Date.now() - startTime;
    
    if (response.error) {
      return {
        name: service.name,
        status: 'ERROR',
        responseTime,
        error: response.error,
        details: null
      };
    }
    
    if (response.status >= 200 && response.status < 300) {
      return {
        name: service.name,
        status: 'UP',
        responseTime,
        error: null,
        details: response.data
      };
    } else {
      return {
        name: service.name,
        status: 'WARN',
        responseTime,
        error: `HTTP ${response.status}`,
        details: response.data
      };
    }
    
  } catch (error) {
    return {
      name: service.name,
      status: 'ERROR',
      responseTime: Date.now() - startTime,
      error: error.message,
      details: null
    };
  }
}

// 检查基础设施
async function checkInfrastructure(infra) {
  const startTime = Date.now();
  
  try {
    const isOpen = await checkPort(infra.host, infra.port);
    const responseTime = Date.now() - startTime;
    
    return {
      name: infra.name,
      status: isOpen ? 'UP' : 'DOWN',
      responseTime: isOpen ? responseTime : null,
      error: isOpen ? null : 'Connection refused',
      details: `${infra.host}:${infra.port}`
    };
    
  } catch (error) {
    return {
      name: infra.name,
      status: 'ERROR',
      responseTime: Date.now() - startTime,
      error: error.message,
      details: `${infra.host}:${infra.port}`
    };
  }
}

// 生成健康报告
function generateReport(serviceResults, infraResults) {
  const totalServices = serviceResults.length;
  const upServices = serviceResults.filter(s => s.status === 'UP').length;
  const downServices = serviceResults.filter(s => s.status === 'DOWN').length;
  const errorServices = serviceResults.filter(s => s.status === 'ERROR').length;
  const warnServices = serviceResults.filter(s => s.status === 'WARN').length;
  
  const totalInfra = infraResults.length;
  const upInfra = infraResults.filter(i => i.status === 'UP').length;
  const downInfra = infraResults.filter(i => i.status === 'DOWN').length;
  
  const overallHealth = (upServices + upInfra) / (totalServices + totalInfra);
  
  return {
    overall: {
      health: overallHealth,
      status: overallHealth >= 0.8 ? 'HEALTHY' : overallHealth >= 0.5 ? 'DEGRADED' : 'UNHEALTHY',
      services: { total: totalServices, up: upServices, down: downServices, error: errorServices, warn: warnServices },
      infrastructure: { total: totalInfra, up: upInfra, down: downInfra }
    },
    services: serviceResults,
    infrastructure: infraResults,
    timestamp: new Date().toISOString()
  };
}

// 打印结果
function printResults(report) {
  console.log(colorize('\n🏥 Athlete Ally 健康检查报告', 'bold'));
  console.log(colorize('================================', 'cyan'));
  
  // 总体状态
  const statusColor = report.overall.status === 'HEALTHY' ? 'green' : 
                     report.overall.status === 'DEGRADED' ? 'yellow' : 'red';
  console.log(colorize(`\n📊 总体状态: ${report.overall.status}`, statusColor));
  console.log(`   健康度: ${(report.overall.health * 100).toFixed(1)}%`);
  console.log(`   服务: ${report.overall.services.up}/${report.overall.services.total} 运行中`);
  console.log(`   基础设施: ${report.overall.infrastructure.up}/${report.overall.infrastructure.total} 运行中`);
  
  // 服务状态
  console.log(colorize('\n🔧 微服务状态:', 'bold'));
  report.services.forEach(service => {
    const statusColor = service.status === 'UP' ? 'green' : 
                       service.status === 'WARN' ? 'yellow' : 'red';
    const statusIcon = service.status === 'UP' ? '✅' : 
                      service.status === 'WARN' ? '⚠️' : '❌';
    
    console.log(`   ${statusIcon} ${service.name}: ${colorize(service.status, statusColor)}`);
    if (service.responseTime) {
      console.log(`      响应时间: ${service.responseTime}ms`);
    }
    if (service.error) {
      console.log(`      错误: ${colorize(service.error, 'red')}`);
    }
    if (service.details && typeof service.details === 'object') {
      console.log(`      详情: ${JSON.stringify(service.details, null, 2).split('\n').join('\n      ')}`);
    }
  });
  
  // 基础设施状态
  console.log(colorize('\n🏗️  基础设施状态:', 'bold'));
  report.infrastructure.forEach(infra => {
    const statusColor = infra.status === 'UP' ? 'green' : 'red';
    const statusIcon = infra.status === 'UP' ? '✅' : '❌';
    
    console.log(`   ${statusIcon} ${infra.name}: ${colorize(infra.status, statusColor)}`);
    if (infra.responseTime) {
      console.log(`      响应时间: ${infra.responseTime}ms`);
    }
    if (infra.error) {
      console.log(`      错误: ${colorize(infra.error, 'red')}`);
    }
    console.log(`      地址: ${infra.details}`);
  });
  
  // 建议
  if (report.overall.status !== 'HEALTHY') {
    console.log(colorize('\n💡 建议:', 'yellow'));
    if (report.overall.services.down > 0) {
      console.log('   - 检查未运行的服务');
    }
    if (report.overall.infrastructure.down > 0) {
      console.log('   - 检查数据库和消息队列连接');
    }
    if (report.overall.services.error > 0) {
      console.log('   - 查看服务日志排查错误');
    }
  }
  
  console.log(colorize(`\n⏰ 检查时间: ${report.timestamp}`, 'cyan'));
}

// 主函数
async function main() {
  console.log(colorize('🔍 开始健康检查...', 'blue'));
  
  try {
    // 检查所有服务
    const servicePromises = SERVICES.map(service => checkServiceHealth(service));
    const serviceResults = await Promise.all(servicePromises);
    
    // 检查基础设施
    const infraPromises = INFRASTRUCTURE.map(infra => checkInfrastructure(infra));
    const infraResults = await Promise.all(infraPromises);
    
    // 生成报告
    const report = generateReport(serviceResults, infraResults);
    
    // 打印结果
    printResults(report);
    
    // 根据健康状态设置退出码
    if (report.overall.status === 'UNHEALTHY') {
      process.exit(1);
    } else if (report.overall.status === 'DEGRADED') {
      process.exit(2);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    console.error(colorize(`❌ 健康检查失败: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { checkServiceHealth, checkInfrastructure, generateReport };
