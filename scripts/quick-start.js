#!/usr/bin/env node

/**
 * ?? ????????
 * ??: ????
 * ??: 1.0.0
 * 
 * ??:
 * - ????????
 * - ????????
 * - ????????
 */

const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ????
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

// ????
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

// ?????????
function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => resolve(false));
    });
    server.on('error', () => resolve(true));
  });
}

// ????????
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

// ??????
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

// ??Docker??
function startDockerServices() {
  return new Promise((resolve, reject) => {
    console.log(colorize('?? ??Docker??...', 'blue'));
    
    const dockerProcess = spawn('docker', [
      'compose', '-f', 'docker/compose/preview.yml', 'up', '--build', '-d'
    ], {
      stdio: 'inherit',
      shell: true
    });
    
    dockerProcess.on('close', (code) => {
      if (code === 0) {
        console.log(colorize('? Docker??????', 'green'));
        resolve();
      } else {
        console.log(colorize('? Docker??????', 'red'));
        reject(new Error(`Docker????????: ${code}`));
      }
    });
    
    dockerProcess.on('error', (error) => {
      console.log(colorize(`? Docker????: ${error.message}`, 'red'));
      reject(error);
    });
  });
}

// ????????
async function checkAllServices() {
  console.log(colorize('\n?? ??????...', 'blue'));
  
  const results = [];
  
  for (const service of SERVICES) {
    const isPortOpen = await checkPort(service.port);
    const isHealthy = isPortOpen ? await checkServiceHealth(service) : false;
    
    const status = isHealthy ? 'UP' : isPortOpen ? 'STARTING' : 'DOWN';
    const statusColor = isHealthy ? 'green' : isPortOpen ? 'yellow' : 'red';
    const statusIcon = isHealthy ? '?' : isPortOpen ? '?' : '?';
    
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

// ????????
function showServiceInfo() {
  console.log(colorize('\n?? ??????:', 'bold'));
  console.log('=' .repeat(50));
  console.log(`?? ????: ${colorize('http://localhost:3000', 'cyan')}`);
  console.log(`?? API??: ${colorize('http://localhost:4000', 'cyan')}`);
  console.log(`?? ????: ${colorize('http://localhost:9090', 'cyan')}`);
  console.log(`?? ???: ${colorize('http://localhost:3001', 'cyan')}`);
  console.log(`?? ????: ${colorize('http://localhost:16686', 'cyan')}`);
  console.log('');
  console.log(colorize('?? ??:', 'yellow'));
  console.log('   - ?? Ctrl+C ??????');
  console.log('   - ????: npm run dev:logs');
  console.log('   - ????: npm run services:health-check');
  console.log('   - ????: npm run dev:restart');
}

// ???
async function main() {
  console.log(colorize('?? Athlete Ally ????', 'bold'));
  console.log(colorize('========================', 'cyan'));
  
  try {
    // 1. ????
    console.log(colorize('\n?? ??????...', 'blue'));
    const envCheck = spawn('npm', ['run', 'env:validate'], { stdio: 'inherit' });
    await new Promise((resolve, reject) => {
      envCheck.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('????????'));
      });
    });
    
    // 2. ??Docker??
    await startDockerServices();
    
    // 3. ??????
    console.log(colorize('\n? ??????...', 'blue'));
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 4. ??????
    const serviceResults = await checkAllServices();
    
    // 5. ????
    const healthyServices = serviceResults.filter(s => s.healthy).length;
    const totalServices = serviceResults.length;
    
    console.log(colorize(`\n?? ????: ${healthyServices}/${totalServices} ????`, 'bold'));
    
    if (healthyServices === totalServices) {
      console.log(colorize('?? ?????????', 'green'));
      showServiceInfo();
    } else {
      console.log(colorize('??  ???????????...', 'yellow'));
      console.log(colorize('?? ??????????: npm run services:health-check', 'yellow'));
    }
    
  } catch (error) {
    console.error(colorize(`? ????: ${error.message}`, 'red'));
    console.log(colorize('\n?? ??????:', 'yellow'));
    console.log('   1. ??Docker??????');
    console.log('   2. ?????????');
    console.log('   3. ??????: npm run dev:logs');
    console.log('   4. ????: npm run dev:clean');
    process.exit(1);
  }
}

// ?????
if (require.main === module) {
  main();
}

module.exports = { checkAllServices, startDockerServices };

