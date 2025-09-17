#!/usr/bin/env node

/**
 * 🚀 快速启动验证脚本
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 一键启动开发环境
 * - 自动验证所有服务
 * - 提供实时状态监控
 */

const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

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

// 服务配置
const SERVICES = [
  { name: 'Frontend', port: 3000, url: 'http://localhost:3000' },
  { name: 'Gateway BFF', port: 4000, url: 'http://localhost:4000' },
  { name: 'Profile Onboarding', port: 4101, url: 'http://localhost:4101' },
  { name: 'Planning Engine', port: 4102, url: 'http://localhost:4102' },
  { name: 'Exercises', port: 4103, url: 'http://localhost:4103' },
  { name: 'Fatigue', port: 4104, url: 'http://localhost:4104' },
  { name: 'Workouts', port: 4105, url: 'http://localhost:4105' },
  { name: 'Analytics', port: 4106, url: 'http://localhost:4106' },
];

// 检查端口是否被占用
function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => resolve(false));
    });
    server.on('error', () => resolve(true));
  });
}

// 检查服务健康状态
async function checkServiceHealth(service) {
  try {
    const response = await fetch(`${service.url}/health`, {
      method: 'GET',
      timeout: 2000,
    });
    return response.ok;
  } catch {
    return false;
  }
}

// 等待服务启动
async function waitForService(service, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const isHealthy = await checkServiceHealth(service);
    if (isHealthy) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return false;
}

// 启动Docker服务
function startDockerServices() {
  return new Promise((resolve, reject) => {
    console.log(colorize('🐳 启动Docker服务...', 'blue'));
    
    const dockerProcess = spawn('docker', [
      'compose', '-f', 'preview.compose.yaml', 'up', '--build', '-d'
    ], {
      stdio: 'inherit',
      shell: true
    });
    
    dockerProcess.on('close', (code) => {
      if (code === 0) {
        console.log(colorize('✅ Docker服务启动完成', 'green'));
        resolve();
      } else {
        console.log(colorize('❌ Docker服务启动失败', 'red'));
        reject(new Error(`Docker启动失败，退出码: ${code}`));
      }
    });
    
    dockerProcess.on('error', (error) => {
      console.log(colorize(`❌ Docker启动错误: ${error.message}`, 'red'));
      reject(error);
    });
  });
}

// 检查所有服务状态
async function checkAllServices() {
  console.log(colorize('\n🔍 检查服务状态...', 'blue'));
  
  const results = [];
  
  for (const service of SERVICES) {
    const isPortOpen = await checkPort(service.port);
    const isHealthy = isPortOpen ? await checkServiceHealth(service) : false;
    
    const status = isHealthy ? 'UP' : isPortOpen ? 'STARTING' : 'DOWN';
    const statusColor = isHealthy ? 'green' : isPortOpen ? 'yellow' : 'red';
    const statusIcon = isHealthy ? '✅' : isPortOpen ? '⏳' : '❌';
    
    console.log(`   ${statusIcon} ${service.name}: ${colorize(status, statusColor)}`);
    
    results.push({
      name: service.name,
      port: service.port,
      status,
      healthy: isHealthy
    });
  }
  
  return results;
}

// 显示服务访问信息
function showServiceInfo() {
  console.log(colorize('\n🌐 服务访问信息:', 'bold'));
  console.log('=' .repeat(50));
  console.log(`📱 前端应用: ${colorize('http://localhost:3000', 'cyan')}`);
  console.log(`🔌 API网关: ${colorize('http://localhost:4000', 'cyan')}`);
  console.log(`📊 监控面板: ${colorize('http://localhost:9090', 'cyan')}`);
  console.log(`📈 仪表板: ${colorize('http://localhost:3001', 'cyan')}`);
  console.log(`🔍 链路追踪: ${colorize('http://localhost:16686', 'cyan')}`);
  console.log('');
  console.log(colorize('💡 提示:', 'yellow'));
  console.log('   - 使用 Ctrl+C 停止所有服务');
  console.log('   - 查看日志: npm run dev:logs');
  console.log('   - 健康检查: npm run services:health-check');
  console.log('   - 重启服务: npm run dev:restart');
}

// 主函数
async function main() {
  console.log(colorize('🚀 Athlete Ally 快速启动', 'bold'));
  console.log(colorize('========================', 'cyan'));
  
  try {
    // 1. 检查环境
    console.log(colorize('\n📋 检查环境配置...', 'blue'));
    const envCheck = spawn('npm', ['run', 'env:validate'], { stdio: 'inherit' });
    await new Promise((resolve, reject) => {
      envCheck.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('环境配置验证失败'));
      });
    });
    
    // 2. 启动Docker服务
    await startDockerServices();
    
    // 3. 等待服务启动
    console.log(colorize('\n⏳ 等待服务启动...', 'blue'));
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 4. 检查服务状态
    const serviceResults = await checkAllServices();
    
    // 5. 显示结果
    const healthyServices = serviceResults.filter(s => s.healthy).length;
    const totalServices = serviceResults.length;
    
    console.log(colorize(`\n📊 启动结果: ${healthyServices}/${totalServices} 服务健康`, 'bold'));
    
    if (healthyServices === totalServices) {
      console.log(colorize('🎉 所有服务启动成功！', 'green'));
      showServiceInfo();
    } else {
      console.log(colorize('⚠️  部分服务可能还在启动中...', 'yellow'));
      console.log(colorize('💡 建议等待几分钟后运行: npm run services:health-check', 'yellow'));
    }
    
  } catch (error) {
    console.error(colorize(`❌ 启动失败: ${error.message}`, 'red'));
    console.log(colorize('\n🔧 故障排除建议:', 'yellow'));
    console.log('   1. 检查Docker是否正在运行');
    console.log('   2. 检查端口是否被占用');
    console.log('   3. 查看详细日志: npm run dev:logs');
    console.log('   4. 清理环境: npm run dev:clean');
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { checkAllServices, startDockerServices };
