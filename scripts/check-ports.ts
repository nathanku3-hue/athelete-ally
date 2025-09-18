#!/usr/bin/env tsx
// 端口冲突检测脚本
// 检查所有服务端口是否可用

import { createServer } from 'net';
import { SERVICE_PORTS, getMicroservicePorts, getFrontendPorts, getInfrastructurePorts } from '../packages/shared/src/config/ports.js';

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

    // 检查微服务端口
    console.log('📦 Microservices:');
    for (const port of getMicroservicePorts()) {
      const service = Object.keys(SERVICE_PORTS).find(key => SERVICE_PORTS[key as keyof typeof SERVICE_PORTS] === port) || 'Unknown';
      await this.checkPort(port, service);
    }

    // 检查前端端口
    console.log('\n🌐 Frontend:');
    for (const port of getFrontendPorts()) {
      const service = Object.keys(SERVICE_PORTS).find(key => SERVICE_PORTS[key as keyof typeof SERVICE_PORTS] === port) || 'Unknown';
      await this.checkPort(port, service);
    }

    // 检查基础设施端口
    console.log('\n🏗️ Infrastructure:');
    for (const port of getInfrastructurePorts()) {
      const service = Object.keys(SERVICE_PORTS).find(key => SERVICE_PORTS[key as keyof typeof SERVICE_PORTS] === port) || 'Unknown';
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
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
