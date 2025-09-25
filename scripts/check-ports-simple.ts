#!/usr/bin/env tsx
// 简化版端口冲突检测脚本

import { createServer } from 'net';

// 直接定义端口配置，避免模块导入问题
const SERVICE_PORTS = {
  GATEWAY_BFF: 8000,
  PROFILE_ONBOARDING: 8001,
  PLANNING_ENGINE: 8002,
  WORKOUTS: 8003,
  FATIGUE: 8004,
  EXERCISES: 8005,
  NATS: 9001,
  REDIS: 9002,
  POSTGRES: 9003,
} as const;

interface PortCheckResult {
  port: number;
  service: string;
  available: boolean;
  error?: string;
}

class PortChecker {
  private results: PortCheckResult[] = [];

  async checkPort(port: number, service: string): Promise<boolean> {
    return new Promise((resolve) => {
      const server = createServer();
      
      server.listen(port, () => {
        server.close(() => {
          this.results.push({ port, service, available: true });
          resolve(true);
        });
      });

      server.on('error', (err: any) => {
        this.results.push({ 
          port, 
          service, 
          available: false, 
          error: err.code === 'EADDRINUSE' ? 'Port already in use' : err.message 
        });
        resolve(false);
      });
    });
  }

  async checkAllPorts(): Promise<void> {
    console.log('🔍 Checking port availability...\n');

    // 检查所有端口
    const portsToCheck = Object.entries(SERVICE_PORTS);
    
    for (const [service, port] of portsToCheck) {
      await this.checkPort(port, service);
    }

    this.printResults();
  }

  private printResults(): void {
    console.log('\n📊 Port Check Results:');
    console.log('=' .repeat(50));

    const available = this.results.filter(r => r.available);
    const unavailable = this.results.filter(r => !r.available);

    if (available.length > 0) {
      console.log('\n✅ Available ports:');
      available.forEach(result => {
        console.log(`  ✓ Port ${result.port} (${result.service})`);
      });
    }

    if (unavailable.length > 0) {
      console.log('\n❌ Unavailable ports:');
      unavailable.forEach(result => {
        console.log(`  ✗ Port ${result.port} (${result.service}) - ${result.error}`);
      });
      
      console.log('\n🚨 Action required:');
      console.log('  - Stop services using these ports');
      console.log('  - Or update port configuration');
      console.log('  - Run: taskkill /f /im node.exe (Windows)');
      
      process.exit(1);
    } else {
      console.log('\n🎉 All ports are available!');
      console.log('✅ Ready to start all services');
    }
  }
}

// 主函数
async function main() {
  const checker = new PortChecker();
  await checker.checkAllPorts();
}

// 运行检查
main().catch(console.error);
