#!/usr/bin/env tsx

/**
 * 环境验证脚本
 * 全面验证开发环境配置和依赖
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 加载环境变量
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
 * 检查Node.js版本
 */
async function checkNodeVersion(): Promise<{ status: 'pass' | 'fail' | 'warning'; message: string }> {
  try {
    const { stdout } = await execAsync('node --version');
    const version = stdout.trim().replace('v', '');
    const majorVersion = parseInt(version.split('.')[0]);
    
    if (majorVersion >= 18) {
      return { status: 'pass', message: `Node.js ${version} (推荐版本)` };
    } else if (majorVersion >= 16) {
      return { status: 'warning', message: `Node.js ${version} (最低支持版本，建议升级到18+)` };
    } else {
      return { status: 'fail', message: `Node.js ${version} (版本过低，需要16+)` };
    }
  } catch (error) {
    return { status: 'fail', message: 'Node.js 未安装' };
  }
}

/**
 * 检查npm版本
 */
async function checkNpmVersion(): Promise<{ status: 'pass' | 'fail' | 'warning'; message: string }> {
  try {
    const { stdout } = await execAsync('npm --version');
    const version = stdout.trim();
    return { status: 'pass', message: `npm ${version}` };
  } catch (error) {
    return { status: 'fail', message: 'npm 未安装' };
  }
}

/**
 * 检查Docker
 */
async function checkDocker(): Promise<{ status: 'pass' | 'fail' | 'warning'; message: string }> {
  try {
    const { stdout } = await execAsync('docker --version');
    const version = stdout.trim();
    return { status: 'pass', message: `Docker ${version}` };
  } catch (error) {
    return { status: 'fail', message: 'Docker 未安装或未运行' };
  }
}

/**
 * 检查Docker Compose
 */
async function checkDockerCompose(): Promise<{ status: 'pass' | 'fail' | 'warning'; message: string }> {
  try {
    const { stdout } = await execAsync('docker compose version');
    const version = stdout.trim();
    return { status: 'pass', message: `Docker Compose ${version}` };
  } catch (error) {
    return { status: 'fail', message: 'Docker Compose 未安装' };
  }
}

/**
 * 检查端口占用
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
      // 端口未被占用
    }
  }
  
  if (occupiedPorts.length === 0) {
    return { status: 'pass', message: '所有必需端口都可用' };
  } else {
    return { 
      status: 'warning', 
      message: `以下端口被占用: ${occupiedPorts.join(', ')}`,
      details: { occupiedPorts }
    };
  }
}

/**
 * 检查环境变量
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
      message: `缺少必需的环境变量: ${missingVars.join(', ')}`,
      details: { missingVars }
    };
  }
  
  if (placeholderVars.length > 0) {
    return { 
      status: 'warning', 
      message: `环境变量包含占位符: ${placeholderVars.join(', ')}`,
      details: { placeholderVars }
    };
  }
  
  return { status: 'pass', message: '环境变量配置正确' };
}

/**
 * 检查文件结构
 */
function checkFileStructure(): { status: 'pass' | 'fail' | 'warning'; message: string; details?: any } {
  const requiredFiles = [
    'package.json',
    'next.config.mjs',
    'tsconfig.json',
    'tailwind.config.mjs',
    'preview.compose.yaml',
    'env.example',
    'src/app/layout.tsx',
    'src/app/page.tsx',
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
      message: `缺少必需的文件: ${missingFiles.join(', ')}`,
      details: { missingFiles }
    };
  }
  
  return { status: 'pass', message: '文件结构完整' };
}

/**
 * 检查依赖安装
 */
async function checkDependencies(): Promise<{ status: 'pass' | 'fail' | 'warning'; message: string; details?: any }> {
  try {
    if (!existsSync('node_modules')) {
      return { status: 'fail', message: '依赖未安装，请运行 npm install' };
    }
    
    // 检查关键依赖
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
        message: `缺少关键依赖: ${missingDeps.join(', ')}`,
        details: { missingDeps }
      };
    }
    
    return { status: 'pass', message: '依赖安装完整' };
  } catch (error) {
    return { status: 'fail', message: '无法检查依赖状态' };
  }
}

/**
 * 检查TypeScript配置
 */
function checkTypeScriptConfig(): { status: 'pass' | 'fail' | 'warning'; message: string; details?: any } {
  try {
    const tsconfig = require('./tsconfig.json');
    
    const issues: string[] = [];
    
    if (!tsconfig.compilerOptions) {
      issues.push('缺少 compilerOptions');
    }
    
    if (!tsconfig.compilerOptions.strict) {
      issues.push('建议启用 strict 模式');
    }
    
    if (!tsconfig.compilerOptions.paths) {
      issues.push('缺少路径映射配置');
    }
    
    if (issues.length > 0) {
      return { 
        status: 'warning', 
        message: `TypeScript配置问题: ${issues.join(', ')}`,
        details: { issues }
      };
    }
    
    return { status: 'pass', message: 'TypeScript配置正确' };
  } catch (error) {
    return { status: 'fail', message: '无法读取TypeScript配置' };
  }
}

/**
 * 检查Next.js配置
 */
function checkNextConfig(): { status: 'pass' | 'fail' | 'warning'; message: string; details?: any } {
  try {
    const nextConfig = require('./next.config.mjs');
    
    const issues: string[] = [];
    
    if (!nextConfig.experimental?.serverComponentsExternalPackages?.includes('@prisma/client')) {
      issues.push('缺少 Prisma 外部包配置');
    }
    
    if (!nextConfig.env?.GATEWAY_BFF_URL) {
      issues.push('缺少 Gateway BFF URL 环境变量');
    }
    
    if (!nextConfig.rewrites) {
      issues.push('缺少 API 代理配置');
    }
    
    if (issues.length > 0) {
      return { 
        status: 'warning', 
        message: `Next.js配置问题: ${issues.join(', ')}`,
        details: { issues }
      };
    }
    
    return { status: 'pass', message: 'Next.js配置正确' };
  } catch (error) {
    return { status: 'fail', message: '无法读取Next.js配置' };
  }
}

/**
 * 执行所有验证检查
 */
async function validateEnvironment(): Promise<EnvironmentStatus> {
  console.log('🔍 开始环境验证...\n');
  
  const results: ValidationResult[] = [];
  
  // 1. 系统环境检查
  console.log('1. 检查系统环境...');
  const systemChecks = [
    { name: 'Node.js版本', check: await checkNodeVersion() },
    { name: 'npm版本', check: await checkNpmVersion() },
    { name: 'Docker', check: await checkDocker() },
    { name: 'Docker Compose', check: await checkDockerCompose() },
    { name: '端口占用', check: await checkPorts() },
  ];
  
  results.push({
    category: '系统环境',
    checks: systemChecks.map(c => ({ name: c.name, ...c.check }))
  });
  
  // 2. 项目配置检查
  console.log('2. 检查项目配置...');
  const configChecks = [
    { name: '环境变量', check: checkEnvironmentVariables() },
    { name: '文件结构', check: checkFileStructure() },
    { name: '依赖安装', check: await checkDependencies() },
    { name: 'TypeScript配置', check: checkTypeScriptConfig() },
    { name: 'Next.js配置', check: checkNextConfig() },
  ];
  
  results.push({
    category: '项目配置',
    checks: configChecks.map(c => ({ name: c.name, ...c.check }))
  });
  
  // 计算统计信息
  const allChecks = results.flatMap(r => r.checks);
  const summary = {
    total: allChecks.length,
    passed: allChecks.filter(c => c.status === 'pass').length,
    failed: allChecks.filter(c => c.status === 'fail').length,
    warnings: allChecks.filter(c => c.status === 'warning').length,
  };
  
  // 确定整体状态
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
 * 打印验证结果
 */
function printResults(status: EnvironmentStatus) {
  console.log('\n📊 验证结果汇总\n');
  
  // 打印整体状态
  const statusEmoji = {
    healthy: '✅',
    warning: '⚠️',
    unhealthy: '❌',
  };
  
  console.log(`${statusEmoji[status.overall]} 整体状态: ${status.overall.toUpperCase()}`);
  console.log(`📈 统计: ${status.summary.passed} 通过, ${status.summary.warnings} 警告, ${status.summary.failed} 失败\n`);
  
  // 打印详细结果
  for (const result of status.results) {
    console.log(`📁 ${result.category}`);
    
    for (const check of result.checks) {
      const emoji = {
        pass: '✅',
        warning: '⚠️',
        fail: '❌',
      };
      
      console.log(`  ${emoji[check.status]} ${check.name}: ${check.message}`);
      
      if (check.details) {
        console.log(`    详情: ${JSON.stringify(check.details, null, 2)}`);
      }
    }
    console.log('');
  }
  
  // 打印建议
  if (status.overall !== 'healthy') {
    console.log('💡 建议:');
    
    if (status.summary.failed > 0) {
      console.log('  - 请修复所有失败项后再继续开发');
    }
    
    if (status.summary.warnings > 0) {
      console.log('  - 建议修复警告项以获得最佳开发体验');
    }
    
    console.log('  - 运行 npm run validate-env 重新验证');
    console.log('  - 运行 npm run preview:up 启动开发环境');
  } else {
    console.log('🎉 环境验证通过！可以开始开发了');
    console.log('💡 运行 npm run preview:up 启动开发环境');
  }
}

/**
 * 主函数
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
    console.error('❌ 环境验证失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { validateEnvironment };
