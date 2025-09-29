#!/usr/bin/env tsx

/**
 * ????????
 * ???????????
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

interface TestResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * ??Docker????
 */
async function checkDocker(): Promise<boolean> {
  try {
    await execAsync('docker --version');
    await execAsync('docker compose version');
    return true;
  } catch (error) {
    console.error('? Docker ? Docker Compose ???????');
    return false;
  }
}

/**
 * ?????????
 */
async function checkPort(port: number): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`netstat -an | grep :${port}`);
    return stdout.includes(`:${port}`);
  } catch (error) {
    return false;
  }
}

/**
 * ??Docker??
 */
async function startDockerEnvironment(): Promise<TestResult> {
  console.log('?? ??Docker??...');
  
  return new Promise((resolve) => {
    const testProcess = spawn('docker', ['compose', '-f', 'docker-compose/preview.yml', 'up', '--build', '-d'], {
      stdio: 'pipe',
      shell: true,
    });

    let output = '';
    let error = '';

    testProcess.stdout?.on('data', (data: any) => {
      const message = data.toString();
      output += message;
      console.log(message.trim());
    });

    testProcess.stderr?.on('data', (data: any) => {
      const message = data.toString();
      error += message;
      console.error(message.trim());
    });

    testProcess.on('close', (code: any) => {
      if (code === 0) {
        console.log('? Docker??????');
        resolve({ success: true, output });
      } else {
        console.error('? Docker??????');
        resolve({ success: false, output, error });
      }
    });

    // ????
    setTimeout(() => {
      testProcess.kill();
      resolve({ success: false, output, error: '????' });
    }, 120000); // 2????
  });
}

/**
 * ??????
 */
async function waitForServices(): Promise<boolean> {
  console.log('? ??????...');
  
  const services = [
    { name: 'Frontend', port: 3000, url: 'http://localhost:3000' },
    { name: 'Gateway BFF', port: 4000, url: 'http://localhost:4000' },
  ];

  for (const service of services) {
    console.log(`?? ${service.name} ??...`);
    
    let attempts = 0;
    const maxAttempts = 30; // ????5??
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${service.url}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          console.log(`? ${service.name} ?????`);
          break;
        }
      } catch (error) {
        // ?????????
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        console.log(`? ?? ${service.name} ????... (${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // ??10?
      } else {
        console.error(`? ${service.name} ??????`);
        return false;
      }
    }
  }
  
  return true;
}

/**
 * ??????
 */
async function runIntegrationTests(): Promise<TestResult> {
  console.log('?? ??????...');
  
  return new Promise((resolve) => {
    const testProcess = spawn('npm', ['run', 'test:integration'], {
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        FRONTEND_URL: 'http://localhost:3000',
        GATEWAY_BFF_URL: 'http://localhost:4000',
      },
    });

    let output = '';
    let error = '';

    testProcess.stdout?.on('data', (data: any) => {
      const message = data.toString();
      output += message;
      console.log(message.trim());
    });

    testProcess.stderr?.on('data', (data: any) => {
      const message = data.toString();
      error += message;
      console.error(message.trim());
    });

    testProcess.on('close', (code: any) => {
      if (code === 0) {
        console.log('? ??????');
        resolve({ success: true, output });
      } else {
        console.error('? ??????');
        resolve({ success: false, output, error });
      }
    });
  });
}

/**
 * ??Docker??
 */
async function stopDockerEnvironment(): Promise<void> {
  console.log('?? ??Docker??...');
  
  try {
    await execAsync('docker compose -f docker-compose/preview.yml down -v');
    console.log('? Docker?????');
  } catch (error) {
    console.error('? ??Docker?????:', error);
  }
}

/**
 * ???
 */
async function main() {
  console.log('?? ????????\n');
  
  try {
    // 1. ??Docker
    console.log('1. ??Docker??...');
    if (!(await checkDocker())) {
      process.exit(1);
    }
    console.log('? Docker??????\n');

    // 2. ??Docker??
    console.log('2. ??Docker??...');
    const startResult = await startDockerEnvironment();
    if (!startResult.success) {
      console.error('? ????Docker??');
      process.exit(1);
    }
    console.log('? Docker??????\n');

    // 3. ??????
    console.log('3. ??????...');
    if (!(await waitForServices())) {
      console.error('? ??????');
      await stopDockerEnvironment();
      process.exit(1);
    }
    console.log('? ???????\n');

    // 4. ??????
    console.log('4. ??????...');
    const testResult = await runIntegrationTests();
    if (!testResult.success) {
      console.error('? ??????');
      await stopDockerEnvironment();
      process.exit(1);
    }
    console.log('? ??????\n');

    // 5. ????
    console.log('5. ????...');
    await stopDockerEnvironment();
    console.log('? ??????\n');

    console.log('?? ?????????');
    process.exit(0);

  } catch (error) {
    console.error('? ????????:', error);
    await stopDockerEnvironment();
    process.exit(1);
  }
}

// ??????
testProcess.on('SIGINT', async () => {
  console.log('\n?? ?????????????...');
  await stopDockerEnvironment();
  process.exit(0);
});

testProcess.on('SIGTERM', async () => {
  console.log('\n?? ?????????????...');
  await stopDockerEnvironment();
  process.exit(0);
});

if (require.main === module) {
  main();
}

