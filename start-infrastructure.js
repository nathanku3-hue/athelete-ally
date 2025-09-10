// 启动基础设施服务
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

console.log('🏗️ 启动基础设施服务');
console.log('==================');

// 基础设施服务配置
const infrastructureServices = [
  {
    name: 'postgres',
    image: 'postgres:16-alpine',
    ports: [`${process.env.POSTGRES_PORT || 9003}:5432`],
    env: {
      POSTGRES_USER: process.env.POSTGRES_USER || 'athlete',
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'athlete',
      POSTGRES_DB: process.env.POSTGRES_DB || 'athlete'
    }
  },
  {
    name: 'redis',
    image: 'redis:7-alpine',
    ports: [`${process.env.REDIS_PORT || 9002}:6379`]
  },
  {
    name: 'nats',
    image: 'nats:2.10-alpine',
    ports: [`${process.env.NATS_PORT || 9001}:4222`, '8222:8222'],
    command: ['-js', '-m', '8222']
  }
];

// 启动 Docker 容器
async function startInfrastructure() {
  console.log('🐳 启动 Docker 基础设施服务...\n');
  
  for (const service of infrastructureServices) {
    console.log(`🔧 启动 ${service.name}...`);
    
    const args = [
      'run', '-d',
      '--name', `athlete-ally-${service.name}`,
      '--rm'
    ];
    
    // 添加端口映射
    service.ports.forEach(port => {
      args.push('-p', port);
    });
    
    // 添加环境变量
    if (service.env) {
      Object.entries(service.env).forEach(([key, value]) => {
        args.push('-e', `${key}=${value}`);
      });
    }
    
    // 添加镜像和命令
    args.push(service.image);
    if (service.command) {
      args.push(...service.command);
    }
    
    try {
      const proc = spawn('docker', args, { stdio: 'pipe' });
      
      await new Promise((resolve, reject) => {
        proc.on('close', (code) => {
          if (code === 0) {
            console.log(`  ✅ ${service.name} 启动成功`);
            resolve();
          } else {
            console.log(`  ❌ ${service.name} 启动失败 (代码: ${code})`);
            reject(new Error(`Failed to start ${service.name}`));
          }
        });
        
        proc.on('error', reject);
      });
    } catch (error) {
      console.log(`  ⚠️  ${service.name} 可能已经在运行: ${error.message}`);
    }
  }
  
  console.log('\n⏳ 等待基础设施服务启动...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n📊 基础设施服务状态:');
  const proc = spawn('docker', ['ps', '--filter', 'name=athlete-ally-'], { stdio: 'pipe' });
  
  proc.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  proc.on('close', () => {
    console.log('\n✅ 基础设施服务启动完成！');
    console.log('现在可以启动微服务了。');
  });
}

// 启动基础设施
startInfrastructure().catch(console.error);

