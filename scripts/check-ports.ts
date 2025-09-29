#!/usr/bin/env tsx
/**
 * ????????
 * 
 * ??:
 * - ??????????? (PostgreSQL: 5432, Redis: 6379, NATS: 4222)
 * - ???????? (???????)
 * - ??????????????
 * - ????? (Windows/Linux/macOS)
 * 
 * ????:
 *   npm run check-ports                    # ??????
 *   npm run check-ports 5432 6379 4222    # ??????
 *   npx tsx scripts/check-ports.ts 5432   # ????
 */

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

      server.on('error', (err: NodeJS.ErrnoException) => {
        const errorMessage = this.getDetailedErrorMessage(err);
        this.results.push({ 
          port, 
          service, 
          available: false, 
          error: errorMessage
        });
        resolve(false);
      });
    });
  }

  private getDetailedErrorMessage(err: NodeJS.ErrnoException): string {
    switch (err.code) {
      case 'EADDRINUSE':
        return `Port already in use (${err.code}) - Container or service conflict`;
      case 'EACCES':
        return `Permission denied (${err.code}) - Insufficient privileges`;
      case 'EADDRNOTAVAIL':
        return `Address not available (${err.code}) - Network configuration issue`;
      default:
        return `${err.message} (${err.code || 'unknown'})`;
    }
  }

  async checkAllPorts(): Promise<void> {
    console.log('?? Checking port availability...\n');

    // ???????
    console.log('?? Microservices:');
    for (const port of getMicroservicePorts()) {
      const service = Object.keys(SERVICE_PORTS).find(key => SERVICE_PORTS[key as keyof typeof SERVICE_PORTS] === port) || 'Unknown';
      await this.checkPort(port, service);
    }

    // ??????
    console.log('\n?? Frontend:');
    for (const port of getFrontendPorts()) {
      const service = Object.keys(SERVICE_PORTS).find(key => SERVICE_PORTS[key as keyof typeof SERVICE_PORTS] === port) || 'Unknown';
      await this.checkPort(port, service);
    }

    // ????????
    console.log('\n??? Infrastructure:');
    for (const port of getInfrastructurePorts()) {
      const service = Object.keys(SERVICE_PORTS).find(key => SERVICE_PORTS[key as keyof typeof SERVICE_PORTS] === port) || 'Unknown';
      await this.checkPort(port, service);
    }

    this.printResults();
  }

  public printResults(): void {
    console.log('\n?? Port Check Results:');
    console.log('=' .repeat(50));

    const available = this.results.filter(r => r.available);
    const unavailable = this.results.filter(r => !r.available);

    if (available.length > 0) {
      console.log('\n? Available ports:');
      available.forEach(result => {
        console.log(`  ? Port ${result.port} (${result.service})`);
      });
    }

    if (unavailable.length > 0) {
      console.log('\n? Unavailable ports:');
      unavailable.forEach(result => {
        console.log(`  ? Port ${result.port} (${result.service}) - ${result.error}`);
      });
      
      console.log('\n?? Action required:');
      console.log('  1. Project-scoped cleanup:');
      console.log('     docker compose -f ./preview.compose.yaml down -v --remove-orphans');
      console.log('  2. Use alternative ports:');
      console.log('     POSTGRES_PORT=5433 REDIS_PORT=6380 npm run infra:up');
      console.log('  3. Check system services (last resort):');
      console.log('     Get-Service | Where-Object {$_.Name -like "*postgres*" -or $_.Name -like "*redis*"}');
      console.log('  4. Manual process termination (last resort):');
      console.log('     taskkill /f /im <process_name>.exe');
      
      process.exit(1);
    } else {
      console.log('\n?? All ports are available!');
      console.log('? Ready to start all services');
    }
  }
}

// ???
async function main() {
  const checker = new PortChecker();
  
  // ???????
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // ??????
    console.log('?? Checking specific ports...\n');
    for (const portStr of args) {
      const port = parseInt(portStr, 10);
      if (isNaN(port)) {
        console.error(`? Invalid port: ${portStr}`);
        process.exit(1);
      }
      
      const service = Object.keys(SERVICE_PORTS).find(key => SERVICE_PORTS[key as keyof typeof SERVICE_PORTS] === port) || 'Custom';
      await checker.checkPort(port, service);
    }
    
    (checker as any).printResults();
  } else {
    // ??????
    await checker.checkAllPorts();
  }
}

// ????
main().catch(console.error);

