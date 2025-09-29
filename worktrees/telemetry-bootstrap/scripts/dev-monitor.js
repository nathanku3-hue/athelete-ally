#!/usr/bin/env node

/**
 * ?? ??????????
 * ??: ????
 * ??: 1.0.0
 * 
 * ??:
 * - ????????
 * - ?????????
 * - ??????
 */

const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');

// ????
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

// ????
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

// ????
let monitoring = true;
let serviceStats = new Map();
let restartAttempts = new Map();

// ????????
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

// ????
async function restartService(service) {
  const attempts = restartAttempts.get(service.name) || 0;
  
  if (attempts >= 3) {
    console.log(colorize(`?? ${service.name} ???????????`, 'red'));
    return false;
  }
  
  console.log(colorize(`?? ?? ${service.name}...`, 'yellow'));
  
  try {
    // ????
    await new Promise((resolve) => {
      exec(`docker compose -f docker-compose/preview.yml stop ${service.name.toLowerCase().replace(/\s+/g, '-')}`, (error) => {
        resolve();
      });
    });
    
    // ??2?
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // ????
    await new Promise((resolve, reject) => {
      exec(`docker compose -f docker-compose/preview.yml up -d ${service.name.toLowerCase().replace(/\s+/g, '-')}`, (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    
    restartAttempts.set(service.name, attempts + 1);
    console.log(colorize(`? ${service.name} ????`, 'green'));
    return true;
    
  } catch (error) {
    console.log(colorize(`? ${service.name} ????: ${error.message}`, 'red'));
    return false;
  }
}

// ??????
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
    restartAttempts.delete(service.name); // ??????
  } else {
    stats.consecutiveFailures++;
  }
  
  // ????????
  stats.avgResponseTime = (stats.avgResponseTime * (stats.totalChecks - 1) + health.responseTime) / stats.totalChecks;
  
  serviceStats.set(service.name, stats);
}

// ??????
function displayServiceStatus(service, health) {
  const stats = serviceStats.get(service.name);
  const healthRate = stats ? (stats.healthyChecks / stats.totalChecks * 100).toFixed(1) : '0.0';
  
  const statusIcon = health.healthy ? '?' : '?';
  const statusColor = health.healthy ? 'green' : 'red';
  const criticalIcon = service.critical ? '??' : '??';
  
  const responseTime = health.responseTime ? `${health.responseTime}ms` : 'N/A';
  const healthRateText = `(${healthRate}%)`;
  
  console.log(`   ${statusIcon} ${criticalIcon} ${service.name}: ${colorize(health.healthy ? 'UP' : 'DOWN', statusColor)} ${responseTime} ${healthRateText}`);
  
  if (!health.healthy && health.error) {
    console.log(`      ${colorize(`??: ${health.error}`, 'red')}`);
  }
}

// ??????
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
  
  console.log(colorize('\n?? ????:', 'bold'));
  console.log(`   ?????: ${healthPercentage}% (${healthyServices}/${totalServices})`);
  console.log(`   ???????: ${criticalHealthPercentage}% (${healthyCriticalServices}/${criticalServices})`);
  
  // ??????
  console.log(colorize('\n? ????:', 'bold'));
  for (const [serviceName, stats] of serviceStats) {
    if (stats.totalChecks > 0) {
      console.log(`   ${serviceName}: ?????? ${stats.avgResponseTime.toFixed(0)}ms`);
    }
  }
}

// ????
async function monitorLoop() {
  console.log(colorize('\n?? ??????...', 'blue'));
  
  for (const service of SERVICES) {
    const health = await checkServiceHealth(service);
    updateServiceStats(service, health);
    displayServiceStatus(service, health);
    
    // ??????????????????
    if (!health.healthy && service.critical) {
      const stats = serviceStats.get(service.name);
      if (stats && stats.consecutiveFailures >= 3) {
        await restartService(service);
      }
    }
  }
  
  displayOverallStats();
}

// ??????
function showHelp() {
  console.log(colorize('\n?? ????:', 'bold'));
  console.log('   Ctrl+C: ????');
  console.log('   h: ????');
  console.log('   s: ????');
  console.log('   r: ??????');
  console.log('   c: ????');
  console.log('');
}

// ??????
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
        console.log(colorize('?? ??????...', 'yellow'));
        exec('docker compose -f docker-compose/preview.yml restart');
        break;
      case 'c':
        console.log(colorize('?? ????...', 'yellow'));
        exec('docker compose -f docker-compose/preview.yml down -v');
        break;
      default:
        if (command) {
          console.log(colorize('??????? h ????', 'yellow'));
        }
    }
  });
}

// ???
async function main() {
  console.log(colorize('?? Athlete Ally ??????', 'bold'));
  console.log(colorize('================================', 'cyan'));
  
  showHelp();
  
  // ??????
  setupInputHandling();
  
  // ??????
  process.on('SIGINT', () => {
    console.log(colorize('\n?? ????...', 'yellow'));
    monitoring = false;
    process.exit(0);
  });
  
  // ??????
  while (monitoring) {
    await monitorLoop();
    
    if (monitoring) {
      console.log(colorize('\n? ??30??????...', 'blue'));
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
}

// ?????
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { monitorLoop, checkServiceHealth, restartService };

