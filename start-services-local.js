// 本地服务启动脚本 - 使用声明式环境配置
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

console.log('🚀 启动 Athlete Ally 服务栈 (本地模式)');
console.log('=====================================');

// 服务配置
const services = [
  {
    name: 'profile-onboarding',
    cwd: path.join(__dirname, 'services', 'profile-onboarding'),
    command: 'npm',
    args: ['run', 'dev'],
    port: process.env.PROFILE_ONBOARDING_PORT || 8001
  },
  {
    name: 'planning-engine', 
    cwd: path.join(__dirname, 'services', 'planning-engine'),
    command: 'npm',
    args: ['run', 'dev'],
    port: process.env.PLANNING_ENGINE_PORT || 8002
  },
  {
    name: 'gateway-bff',
    cwd: path.join(__dirname, 'apps', 'gateway-bff'),
    command: 'npm',
    args: ['run', 'dev'],
    port: process.env.GATEWAY_BFF_PORT || 8000
  }
];

// 启动服务
const processes = [];

services.forEach(service => {
  console.log(`\n🔧 启动 ${service.name} 服务 (端口: ${service.port})`);
  
  const proc = spawn('cmd', ['/c', service.command, ...service.args], {
    cwd: service.cwd,
    env: {
      ...process.env,
      PORT: service.port
    },
    stdio: 'pipe'
  });

  proc.stdout.on('data', (data) => {
    console.log(`[${service.name}] ${data.toString().trim()}`);
  });

  proc.stderr.on('data', (data) => {
    console.error(`[${service.name}] ERROR: ${data.toString().trim()}`);
  });

  proc.on('close', (code) => {
    console.log(`[${service.name}] 进程退出，代码: ${code}`);
  });

  processes.push({ name: service.name, process: proc, port: service.port });
});

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭所有服务...');
  processes.forEach(({ name, process: proc }) => {
    console.log(`关闭 ${name} 服务...`);
    proc.kill('SIGTERM');
  });
  process.exit(0);
});

console.log('\n✅ 所有服务已启动！');
console.log('📋 服务状态:');
processes.forEach(({ name, port }) => {
  console.log(`  ${name}: http://localhost:${port}`);
});

console.log('\n按 Ctrl+C 停止所有服务');
