#!/usr/bin/env tsx

/**
 * 集成测试运行脚本
 * 启动环境并运行集成测试
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
 * 检查Docker是否运行
 */
async function checkDocker(): Promise<boolean> {
  try {
    await execAsync('docker --version');
    await execAsync('docker compose version');
    return true;
  } catch (error) {
    console.error('❌ Docker 或 Docker Compose 未安装或未运行');
    return false;
  }
}

/**
 * 检查端口是否被占用
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
 * 启动Docker环境
 */
async function startDockerEnvironment(): Promise<TestResult> {
  console.log('🐳 启动Docker环境...');
  
  return new Promise((resolve) => {
    const process = spawn('docker', ['compose', '-f', 'preview.compose.yaml', 'up', '--build', '-d'], {
      stdio: 'pipe',
      shell: true,
    });

    let output = '';
    let error = '';

    process.stdout?.on('data', (data) => {
      const message = data.toString();
      output += message;
      console.log(message.trim());
    });

    process.stderr?.on('data', (data) => {
      const message = data.toString();
      error += message;
      console.error(message.trim());
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Docker环境启动成功');
        resolve({ success: true, output });
      } else {
        console.error('❌ Docker环境启动失败');
        resolve({ success: false, output, error });
      }
    });

    // 设置超时
    setTimeout(() => {
      process.kill();
      resolve({ success: false, output, error: '启动超时' });
    }, 120000); // 2分钟超时
  });
}

/**
 * 等待服务启动
 */
async function waitForServices(): Promise<boolean> {
  console.log('⏳ 等待服务启动...');
  
  const services = [
    { name: 'Frontend', port: 3000, url: 'http://localhost:3000' },
    { name: 'Gateway BFF', port: 4000, url: 'http://localhost:4000' },
  ];

  for (const service of services) {
    console.log(`检查 ${service.name} 服务...`);
    
    let attempts = 0;
    const maxAttempts = 30; // 最多等待5分钟
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${service.url}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          console.log(`✅ ${service.name} 服务已启动`);
          break;
        }
      } catch (error) {
        // 忽略错误，继续重试
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        console.log(`⏳ 等待 ${service.name} 服务启动... (${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // 等待10秒
      } else {
        console.error(`❌ ${service.name} 服务启动超时`);
        return false;
      }
    }
  }
  
  return true;
}

/**
 * 运行集成测试
 */
async function runIntegrationTests(): Promise<TestResult> {
  console.log('🧪 运行集成测试...');
  
  return new Promise((resolve) => {
    const process = spawn('npm', ['run', 'test:integration'], {
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

    process.stdout?.on('data', (data) => {
      const message = data.toString();
      output += message;
      console.log(message.trim());
    });

    process.stderr?.on('data', (data) => {
      const message = data.toString();
      error += message;
      console.error(message.trim());
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 集成测试通过');
        resolve({ success: true, output });
      } else {
        console.error('❌ 集成测试失败');
        resolve({ success: false, output, error });
      }
    });
  });
}

/**
 * 停止Docker环境
 */
async function stopDockerEnvironment(): Promise<void> {
  console.log('🛑 停止Docker环境...');
  
  try {
    await execAsync('docker compose -f preview.compose.yaml down -v');
    console.log('✅ Docker环境已停止');
  } catch (error) {
    console.error('❌ 停止Docker环境时出错:', error);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始集成测试流程\n');
  
  try {
    // 1. 检查Docker
    console.log('1. 检查Docker环境...');
    if (!(await checkDocker())) {
      process.exit(1);
    }
    console.log('✅ Docker环境检查通过\n');

    // 2. 启动Docker环境
    console.log('2. 启动Docker环境...');
    const startResult = await startDockerEnvironment();
    if (!startResult.success) {
      console.error('❌ 无法启动Docker环境');
      process.exit(1);
    }
    console.log('✅ Docker环境启动成功\n');

    // 3. 等待服务启动
    console.log('3. 等待服务启动...');
    if (!(await waitForServices())) {
      console.error('❌ 服务启动失败');
      await stopDockerEnvironment();
      process.exit(1);
    }
    console.log('✅ 所有服务已启动\n');

    // 4. 运行集成测试
    console.log('4. 运行集成测试...');
    const testResult = await runIntegrationTests();
    if (!testResult.success) {
      console.error('❌ 集成测试失败');
      await stopDockerEnvironment();
      process.exit(1);
    }
    console.log('✅ 集成测试通过\n');

    // 5. 清理环境
    console.log('5. 清理环境...');
    await stopDockerEnvironment();
    console.log('✅ 环境清理完成\n');

    console.log('🎉 集成测试流程完成！');
    process.exit(0);

  } catch (error) {
    console.error('❌ 集成测试流程失败:', error);
    await stopDockerEnvironment();
    process.exit(1);
  }
}

// 处理进程信号
process.on('SIGINT', async () => {
  console.log('\n🛑 收到中断信号，正在清理环境...');
  await stopDockerEnvironment();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 收到终止信号，正在清理环境...');
  await stopDockerEnvironment();
  process.exit(0);
});

if (require.main === module) {
  main();
}
