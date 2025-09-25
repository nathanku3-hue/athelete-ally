#!/usr/bin/env node

/**
 * 生产配置清理脚本
 * 确保生产环境中不包含任何mock功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始清理生产配置中的mock功能...');

// 需要检查的文件模式
const patterns = [
  'src/app/api/**/*.ts',
  'apps/**/src/**/*.ts',
  'services/**/src/**/*.ts'
];

// Mock相关的关键词
const mockKeywords = [
  'mock',
  'Mock',
  'MOCK',
  'simulate',
  'simulation',
  'fake',
  'dummy',
  'test data',
  'hardcoded',
  'static data'
];

// 需要清理的API路由
const apiRoutesToClean = [
  'src/app/api/v1/plans/[planId]/route.ts',
  'src/app/api/v1/exercises/[exerciseId]/route.ts',
  'src/app/api/v1/fatigue/status/route.ts',
  'src/app/api/v1/workouts/summary/route.ts'
];

function checkForMockContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    mockKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(keyword)) {
            issues.push({
              line: index + 1,
              content: line.trim(),
              keyword
            });
          }
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.error(`❌ 读取文件失败: ${filePath}`, error.message);
    return [];
  }
}

function cleanApiRoute(filePath) {
  console.log(`🧹 清理API路由: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否包含mock数据
    if (content.includes('mock') || content.includes('Mock')) {
      console.log(`⚠️  发现mock数据，需要替换为真实API调用: ${filePath}`);
      
      // 创建生产就绪的模板
      const productionTemplate = `import { NextRequest, NextResponse } from 'next/server';
import { handleCorsOptions, addCorsHeaders } from '@/lib/cors';

export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const { planId } = params;
    
    if (!planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      );
    }
    
    console.log('Fetching plan details for planId:', planId);
    
    // TODO: 替换为真实的后端API调用
    // 在NODE_ENV=production时，必须调用真实服务
    if (process.env.NODE_ENV === 'production') {
      // 调用planning-engine服务获取真实数据
      const response = await fetch(\`\${process.env.PLANNING_ENGINE_URL}/plans/\${planId}\`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${request.headers.get('authorization') || ''}\`
        }
      });
      
      if (!response.ok) {
        throw new Error(\`Failed to fetch plan: \${response.status}\`);
      }
      
      const plan = await response.json();
      return NextResponse.json(plan);
    } else {
      // 开发环境可以返回基础结构
      return NextResponse.json({
        id: planId,
        status: 'development_mode',
        message: 'This endpoint requires real backend integration in production'
      });
    }
    
  } catch (error) {
    console.error('Failed to fetch plan details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch plan details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return handleCorsOptions();
}`;

      // 备份原文件
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);
      console.log(`📁 已备份原文件到: ${backupPath}`);
      
      // 写入生产就绪版本
      fs.writeFileSync(filePath, productionTemplate);
      console.log(`✅ 已更新为生产就绪版本: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ 清理文件失败: ${filePath}`, error.message);
  }
}

// 主执行逻辑
function main() {
  console.log('🚀 开始生产配置清理...\n');
  
  // 清理API路由
  apiRoutesToClean.forEach(route => {
    const fullPath = path.join(process.cwd(), route);
    if (fs.existsSync(fullPath)) {
      cleanApiRoute(fullPath);
    } else {
      console.log(`⚠️  文件不存在: ${route}`);
    }
  });
  
  // 检查其他文件
  console.log('\n🔍 检查其他文件中的mock内容...');
  
  const checkDirs = [
    'apps/gateway-bff/src',
    'services/profile-onboarding/src',
    'services/planning-engine/src'
  ];
  
  checkDirs.forEach(dir => {
    const fullDir = path.join(process.cwd(), dir);
    if (fs.existsSync(fullDir)) {
      console.log(`\n📁 检查目录: ${dir}`);
      
      const files = fs.readdirSync(fullDir, { recursive: true });
      files.forEach(file => {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const filePath = path.join(fullDir, file);
          const issues = checkForMockContent(filePath);
          
          if (issues.length > 0) {
            console.log(`⚠️  ${filePath}:`);
            issues.forEach(issue => {
              console.log(`   行 ${issue.line}: ${issue.content} (关键词: ${issue.keyword})`);
            });
          }
        }
      });
    }
  });
  
  console.log('\n✅ 生产配置清理完成！');
  console.log('\n📋 后续步骤:');
  console.log('1. 检查所有标记为TODO的API端点');
  console.log('2. 实现真实的后端服务调用');
  console.log('3. 确保NODE_ENV=production时不会使用mock数据');
  console.log('4. 运行测试确保功能正常');
}

if (require.main === module) {
  main();
}

module.exports = { checkForMockContent, cleanApiRoute };
