#!/usr/bin/env node

/**
 * 📊 开发环境状态监控脚本
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 实时监控服务状态
 * - 自动重启失败的服务
 * - 提供性能指标
 */

const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 服务配置
const SERVICES = [
  { name: 'Frontend', port: 3000, url: 'http://localhost:3000', critical: true },
  { name: 'Gateway BFF', port: 4000, url: 'http://localhost:4000', critical: true },
  { name: 'Profile Onboarding', port: 4101, url: 'http://localhost:4101', critical: false },
  { name: 'Planning Engine', port: 4102, url: 'http://localhost:4102', critical: true },
  { name: 'Exercises', port: 4103, url: 'http://localhost:4103', critical: false },
  { name: 'Fatigue', port: 4104, url: 'http://localhost:4104', critical: false },
  { name: 'Workouts', port: 4105, url: 'http://localhost:4105', critical: false },
  { name: 'Analytics', port: 4106, url: 'http://localhost:4106', critical: false },
];

// 监控状态
let monitoring = true;
let serviceStats = new Map();
let restartAttempts = new Map();

// 检查服务健康状态
async function checkServiceHealth(service) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${service.url}/health`, {
      method: 'GET',
      timeout: 3000,
    });
    
    const responseTime = Date.now() - startTime;
    const isHealthy = response.ok;
    
    return {
      healthy: isHealthy,
      responseTime,
      status: response.status,
      error: null
    };
  } catch (error) {
    return {
      healthy: false,
      responseTime: Date.now() - startTime,
      status: null,
      error: error.message
    };
  }
}

// 重启服务
async function restartService(service) {
  const attempts = restartAttempts.get(service.name) || 0;
  
  if (attempts >= 3) {
    console.log(colorize(`🚨 ${service.name} 重启次数过多，跳过重启`, 'red'));
    return false;
  }
  
  console.log(colorize(`🔄 重启 ${service.name}...`, 'yellow'));
  
  try {
    // 停止服务
    await new Promise((resolve) => {
      exec(`docker compose -f preview.compose.yaml stop ${service.name.toLowerCase().replace(/\s+/g, '-')}`, (error) => {
        resolve();
      });
    });
    
    // 等待2秒
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 启动服务
    await new Promise((resolve, reject) => {
      exec(`docker compose -f preview.compose.yaml up -d ${service.name.toLowerCase().replace(/\s+/g, '-')}`, (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    
    restartAttempts.set(service.name, attempts + 1);
    console.log(colorize(`✅ ${service.name} 重启完成`, 'green'));
    return true;
    
  } catch (error) {
    console.log(colorize(`❌ ${service.name} 重启失败: ${error.message}`, 'red'));
    return false;
  }
}

// 更新服务统计
function updateServiceStats(service, health) {
  const stats = serviceStats.get(service.name) || {
    totalChecks: 0,
    healthyChecks: 0,
    avgResponseTime: 0,
    lastCheck: null,
    consecutiveFailures: 0,
    lastHealthy: null
  };
  
  stats.totalChecks++;
  stats.lastCheck = new Date();
  
  if (health.healthy) {
    stats.healthyChecks++;
    stats.consecutiveFailures = 0;
    stats.lastHealthy = new Date();
    restartAttempts.delete(service.name); // 重置重启计数
  } else {
    stats.consecutiveFailures++;
  }
  
  // 更新平均响应时间
  stats.avgResponseTime = (stats.avgResponseTime * (stats.totalChecks - 1) + health.responseTime) / stats.totalChecks;
  
  serviceStats.set(service.name, stats);
}

// 显示服务状态
function displayServiceStatus(service, health) {
  const stats = serviceStats.get(service.name);
  const healthRate = stats ? (stats.healthyChecks / stats.totalChecks * 100).toFixed(1) : '0.0';
  
  const statusIcon = health.healthy ? '✅' : '❌';
  const statusColor = health.healthy ? 'green' : 'red';
  const criticalIcon = service.critical ? '🔴' : '🟡';
  
  const responseTime = health.responseTime ? `${health.responseTime}ms` : 'N/A';
  const healthRateText = `(${healthRate}%)`;
  
  console.log(`   ${statusIcon} ${criticalIcon} ${service.name}: ${colorize(health.healthy ? 'UP' : 'DOWN', statusColor)} ${responseTime} ${healthRateText}`);
  
  if (!health.healthy && health.error) {
    console.log(`      ${colorize(`错误: ${health.error}`, 'red')}`);
  }
}

// 显示总体统计
function displayOverallStats() {
  const totalServices = SERVICES.length;
  const healthyServices = Array.from(serviceStats.values()).filter(s => s.consecutiveFailures === 0).length;
  const criticalServices = SERVICES.filter(s => s.critical).length;
  const healthyCriticalServices = SERVICES.filter(s => s.critical).filter(s => {
    const stats = serviceStats.get(s.name);
    return stats && stats.consecutiveFailures === 0;
  }).length;
  
  const healthPercentage = (healthyServices / totalServices * 100).toFixed(1);
  const criticalHealthPercentage = (healthyCriticalServices / criticalServices * 100).toFixed(1);
  
  console.log(colorize('\n📊 总体统计:', 'bold'));
  console.log(`   服务健康率: ${healthPercentage}% (${healthyServices}/${totalServices})`);
  console.log(`   关键服务健康率: ${criticalHealthPercentage}% (${healthyCriticalServices}/${criticalServices})`);
  
  // 显示性能指标
  console.log(colorize('\n⚡ 性能指标:', 'bold'));
  for (const [serviceName, stats] of serviceStats) {
    if (stats.totalChecks > 0) {
      console.log(`   ${serviceName}: 平均响应时间 ${stats.avgResponseTime.toFixed(0)}ms`);
    }
  }
}

// 监控循环
async function monitorLoop() {
  console.log(colorize('\n🔍 检查服务状态...', 'blue'));
  
  for (const service of SERVICES) {
    const health = await checkServiceHealth(service);
    updateServiceStats(service, health);
    displayServiceStatus(service, health);
    
    // 如果服务不健康且是关键服务，尝试重启
    if (!health.healthy && service.critical) {
      const stats = serviceStats.get(service.name);
      if (stats && stats.consecutiveFailures >= 3) {
        await restartService(service);
      }
    }
  }
  
  displayOverallStats();
}

// 显示帮助信息
function showHelp() {
  console.log(colorize('\n📋 监控命令:', 'bold'));
  console.log('   Ctrl+C: 停止监控');
  console.log('   h: 显示帮助');
  console.log('   s: 显示状态');
  console.log('   r: 重启所有服务');
  console.log('   c: 清理环境');
  console.log('');
}

// 处理用户输入
function setupInputHandling() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.on('line', (input) => {
    const command = input.trim().toLowerCase();
    
    switch (command) {
      case 'h':
        showHelp();
        break;
      case 's':
        displayOverallStats();
        break;
      case 'r':
        console.log(colorize('🔄 重启所有服务...', 'yellow'));
        exec('docker compose -f preview.compose.yaml restart');
        break;
      case 'c':
        console.log(colorize('🧹 清理环境...', 'yellow'));
        exec('docker compose -f preview.compose.yaml down -v');
        break;
      default:
        if (command) {
          console.log(colorize('未知命令，输入 h 查看帮助', 'yellow'));
        }
    }
  });
}

// 主函数
async function main() {
  console.log(colorize('📊 Athlete Ally 开发环境监控', 'bold'));
  console.log(colorize('================================', 'cyan'));
  
  showHelp();
  
  // 设置输入处理
  setupInputHandling();
  
  // 设置退出处理
  process.on('SIGINT', () => {
    console.log(colorize('\n👋 停止监控...', 'yellow'));
    monitoring = false;
    process.exit(0);
  });
  
  // 开始监控循环
  while (monitoring) {
    await monitorLoop();
    
    if (monitoring) {
      console.log(colorize('\n⏳ 等待30秒后再次检查...', 'blue'));
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { monitorLoop, checkServiceHealth, restartService };
