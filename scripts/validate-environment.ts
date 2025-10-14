#!/usr/bin/env tsx

/**
 * ??????
 * ?????????????
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ??????
config();

interface ValidationResult {
  category: string;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    details?: any;
  }[];
}

interface EnvironmentStatus {
  overall: 'healthy' | 'unhealthy' | 'warning';
  results: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

/**
 * ??Node.js??
 */
async function checkNodeVersion(): Promise<{ status: 'pass' | 'fail' | 'warning'; message: string }> {
  try {
    const { stdout } = await execAsync('node --version');
    const version = stdout.trim().replace('v', '');
    const majorVersion = parseInt(version.split('.')[0]);
    
    if (majorVersion >= 18) {
      return { status: 'pass', message: `Node.js ${version} (????)` };
    } else if (majorVersion >= 16) {
      return { status: 'warning', message: `Node.js ${version} (????????????18+)` };
    } else {
      return { status: 'fail', message: `Node.js ${version} (???????16+)` };
    }
  } catch (error) {
    return { status: 'fail', message: 'Node.js ???' };
  }
}

/**
 * ??npm??
 */
async function checkNpmVersion(): Promise<{ status: 'pass' | 'fail' | 'warning'; message: string }> {
  try {
    const { stdout } = await execAsync('npm --version');
    const version = stdout.trim();
    return { status: 'pass', message: `npm ${version}` };
  } catch (error) {
    return { status: 'fail', message: 'npm ???' };
  }
}

/**
 * ??Docker
 */
async function checkDocker(): Promise<{ status: 'pass' | 'fail' | 'warning'; message: string }> {
  try {
    const { stdout } = await execAsync('docker --version');
    const version = stdout.trim();
    return { status: 'pass', message: `Docker ${version}` };
  } catch (error) {
    return { status: 'fail', message: 'Docker ???????' };
  }
}

/**
 * ??Docker Compose
 */
async function checkDockerCompose(): Promise<{ status: 'pass' | 'fail' | 'warning'; message: string }> {
  try {
    const { stdout } = await execAsync('docker compose version');
    const version = stdout.trim();
    return { status: 'pass', message: `Docker Compose ${version}` };
  } catch (error) {
    return { status: 'fail', message: 'Docker Compose ???' };
  }
}

/**
 * ??????
 */
async function checkPorts(): Promise<{ status: 'pass' | 'fail' | 'warning'; message: string; details?: any }> {
  const ports = [3000, 4000, 5432, 6379, 4222];
  const occupiedPorts: number[] = [];
  
  for (const port of ports) {
    try {
      const { stdout } = await execAsync(`netstat -an | grep :${port}`);
      if (stdout.includes(`:${port}`)) {
        occupiedPorts.push(port);
      }
    } catch (error) {
      // ??????
    }
  }
  
  if (occupiedPorts.length === 0) {
    return { status: 'pass', message: '?????????' };
  } else {
    return { 
      status: 'warning', 
      message: `???????: ${occupiedPorts.join(', ')}`,
      details: { occupiedPorts }
    };
  }
}

/**
 * ??????
 */
function checkEnvironmentVariables(): { status: 'pass' | 'fail' | 'warning'; message: string; details?: any } {
  const requiredVars = [
    'NODE_ENV',
    'GATEWAY_BFF_URL',
  ];
  
  const missingVars: string[] = [];
  const placeholderVars: string[] = [];
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else if (value.includes('YOUR_') || value.includes('PLACEHOLDER')) {
      placeholderVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    return { 
      status: 'fail', 
      message: `?????????: ${missingVars.join(', ')}`,
      details: { missingVars }
    };
  }
  
  if (placeholderVars.length > 0) {
    return { 
      status: 'warning', 
      message: `?????????: ${placeholderVars.join(', ')}`,
      details: { placeholderVars }
    };
  }
  
  return { status: 'pass', message: '????????' };
}

/**
 * ??????
 */
function checkFileStructure(): { status: 'pass' | 'fail' | 'warning'; message: string; details?: any } {
  const requiredFiles = [
    'package.json',
    'apps/frontend/next.config.mjs',
    'apps/frontend/tsconfig.json',
    'apps/frontend/tailwind.config.mjs',
    'docker/compose/preview.yml',
    'docs/examples/env.example',
    'apps/frontend/src/app/layout.tsx',
    'apps/frontend/src/app/page.tsx',
    'packages/shared/src/index.ts',
  ];
  
  const missingFiles: string[] = [];
  
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    return { 
      status: 'fail', 
      message: `???????: ${missingFiles.join(', ')}`,
      details: { missingFiles }
    };
  }
  
  return { status: 'pass', message: '??????' };
}

/**
 * ??????
 */
async function checkDependencies(): Promise<{ status: 'pass' | 'fail' | 'warning'; message: string; details?: any }> {
  try {
    if (!existsSync('node_modules')) {
      return { status: 'fail', message: '????????? npm install' };
    }
    
    // ??????
    const keyDependencies = [
      'next',
      'react',
      'react-dom',
      'typescript',
      'tailwindcss',
      '@athlete-ally/shared',
    ];
    
    const missingDeps: string[] = [];
    
    for (const dep of keyDependencies) {
      const depPath = join('node_modules', dep);
      if (!existsSync(depPath)) {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length > 0) {
      return { 
        status: 'warning', 
        message: `??????: ${missingDeps.join(', ')}`,
        details: { missingDeps }
      };
    }
    
    return { status: 'pass', message: '??????' };
  } catch (error) {
    return { status: 'fail', message: '????????' };
  }
}

/**
 * ??TypeScript??
 */
function checkTypeScriptConfig(): { status: 'pass' | 'fail' | 'warning'; message: string; details?: any } {
  try {
    const tsconfig = require('./apps/frontend/tsconfig.json');
    
    const issues: string[] = [];
    
    if (!tsconfig.compilerOptions) {
      issues.push('?? compilerOptions');
    }
    
    if (!tsconfig.compilerOptions.strict) {
      issues.push('???? strict ??');
    }
    
    if (!tsconfig.compilerOptions.paths) {
      issues.push('????????');
    }
    
    if (issues.length > 0) {
      return { 
        status: 'warning', 
        message: `TypeScript????: ${issues.join(', ')}`,
        details: { issues }
      };
    }
    
    return { status: 'pass', message: 'TypeScript????' };
  } catch (error) {
    return { status: 'fail', message: '????TypeScript??' };
  }
}

/**
 * ??Next.js??
 */
function checkNextConfig(): { status: 'pass' | 'fail' | 'warning'; message: string; details?: any } {
  try {
    const nextConfig = require('./apps/frontend/next.config.mjs');
    
    const issues: string[] = [];
    
    if (!nextConfig.experimental?.serverComponentsExternalPackages?.includes('@prisma/client')) {
      issues.push('?? Prisma ?????');
    }
    
    if (!nextConfig.env?.GATEWAY_BFF_URL) {
      issues.push('?? Gateway BFF URL ????');
    }
    
    if (!nextConfig.rewrites) {
      issues.push('?? API ????');
    }
    
    if (issues.length > 0) {
      return { 
        status: 'warning', 
        message: `Next.js????: ${issues.join(', ')}`,
        details: { issues }
      };
    }
    
    return { status: 'pass', message: 'Next.js????' };
  } catch (error) {
    return { status: 'fail', message: '????Next.js??' };
  }
}

/**
 * ????????
 */
async function validateEnvironment(): Promise<EnvironmentStatus> {
  console.log('?? ??????...\n');
  
  const results: ValidationResult[] = [];
  
  // 1. ??????
  console.log('1. ??????...');
  const systemChecks = [
    { name: 'Node.js??', check: await checkNodeVersion() },
    { name: 'npm??', check: await checkNpmVersion() },
    { name: 'Docker', check: await checkDocker() },
    { name: 'Docker Compose', check: await checkDockerCompose() },
    { name: '????', check: await checkPorts() },
  ];
  
  results.push({
    category: '????',
    checks: systemChecks.map(c => ({ name: c.name, ...c.check }))
  });
  
  // 2. ??????
  console.log('2. ??????...');
  const configChecks = [
    { name: '????', check: checkEnvironmentVariables() },
    { name: '????', check: checkFileStructure() },
    { name: '????', check: await checkDependencies() },
    { name: 'TypeScript??', check: checkTypeScriptConfig() },
    { name: 'Next.js??', check: checkNextConfig() },
  ];
  
  results.push({
    category: '????',
    checks: configChecks.map(c => ({ name: c.name, ...c.check }))
  });
  
  // ??????
  const allChecks = results.flatMap(r => r.checks);
  const summary = {
    total: allChecks.length,
    passed: allChecks.filter(c => c.status === 'pass').length,
    failed: allChecks.filter(c => c.status === 'fail').length,
    warnings: allChecks.filter(c => c.status === 'warning').length,
  };
  
  // ??????
  let overall: 'healthy' | 'unhealthy' | 'warning';
  if (summary.failed > 0) {
    overall = 'unhealthy';
  } else if (summary.warnings > 0) {
    overall = 'warning';
  } else {
    overall = 'healthy';
  }
  
  return {
    overall,
    results,
    summary,
  };
}

/**
 * ??????
 */
function printResults(status: EnvironmentStatus) {
  console.log('\n?? ??????\n');
  
  // ??????
  const statusEmoji = {
    healthy: '?',
    warning: '??',
    unhealthy: '?',
  };
  
  console.log(`${statusEmoji[status.overall]} ????: ${status.overall.toUpperCase()}`);
  console.log(`?? ??: ${status.summary.passed} ??, ${status.summary.warnings} ??, ${status.summary.failed} ??\n`);
  
  // ??????
  for (const result of status.results) {
    console.log(`?? ${result.category}`);
    
    for (const check of result.checks) {
      const emoji = {
        pass: '?',
        warning: '??',
        fail: '?',
      };
      
      console.log(`  ${emoji[check.status]} ${check.name}: ${check.message}`);
      
      if (check.details) {
        console.log(`    ??: ${JSON.stringify(check.details, null, 2)}`);
      }
    }
    console.log('');
  }
  
  // ????
  if (status.overall !== 'healthy') {
    console.log('?? ??:');
    
    if (status.summary.failed > 0) {
      console.log('  - ??????????????');
    }
    
    if (status.summary.warnings > 0) {
      console.log('  - ????????????????');
    }
    
    console.log('  - ?? npm run validate-env ????');
    console.log('  - ?? npm run preview:up ??????');
  } else {
    console.log('?? ??????????????');
    console.log('?? ?? npm run preview:up ??????');
  }
}

/**
 * ???
 */
async function main() {
  try {
    const status = await validateEnvironment();
    printResults(status);
    
    if (status.overall === 'unhealthy') {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('? ??????:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { validateEnvironment };

