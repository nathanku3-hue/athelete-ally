#!/usr/bin/env node

// Jest配置验证脚本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 验证Jest配置...\n');

// 检查Jest配置文件
function checkJestConfig() {
  console.log('📋 检查Jest配置文件...');
  
  const jestConfigPath = path.join(process.cwd(), 'jest.config.js');
  if (!fs.existsSync(jestConfigPath)) {
    console.error('❌ jest.config.js 文件不存在');
    return false;
  }
  
  try {
    const jestConfig = require(jestConfigPath);
    
    // 检查关键配置
    const requiredConfigs = [
      'preset',
      'testEnvironment',
      'extensionsToTreatAsEsm',
      'globals',
      'moduleNameMapper',
      'transform'
    ];
    
    for (const config of requiredConfigs) {
      if (!jestConfig[config]) {
        console.error(`❌ 缺少必需配置: ${config}`);
        return false;
      }
    }
    
    // 检查ES模块支持
    if (!jestConfig.extensionsToTreatAsEsm?.includes('.ts')) {
      console.error('❌ 缺少TypeScript ES模块支持');
      return false;
    }
    
    // 检查模块映射
    if (!jestConfig.moduleNameMapper['^@/(.*)$']) {
      console.error('❌ 缺少路径映射配置');
      return false;
    }
    
    console.log('✅ Jest配置文件验证通过');
    return true;
    
  } catch (error) {
    console.error('❌ Jest配置文件解析失败:', error.message);
    return false;
  }
}

// 检查测试设置文件
function checkTestSetup() {
  console.log('📋 检查测试设置文件...');
  
  const setupPath = path.join(process.cwd(), 'src/__tests__/setup.ts');
  if (!fs.existsSync(setupPath)) {
    console.error('❌ 测试设置文件不存在');
    return false;
  }
  
  const setupContent = fs.readFileSync(setupPath, 'utf8');
  
  // 检查关键设置
  const requiredSettings = [
    '@testing-library/jest-dom',
    'next/router',
    'next/image',
    'next/link',
    'global.fetch',
    'global.localStorage',
    'global.sessionStorage'
  ];
  
  for (const setting of requiredSettings) {
    if (!setupContent.includes(setting)) {
      console.error(`❌ 缺少测试设置: ${setting}`);
      return false;
    }
  }
  
  console.log('✅ 测试设置文件验证通过');
  return true;
}

// 检查测试文件
function checkTestFiles() {
  console.log('📋 检查测试文件...');
  
  const testFiles = [
    'src/__tests__/setup.ts',
    'src/lib/api-test-utils.ts',
    'src/__tests__/integration/api-integration.test.ts',
    'src/__tests__/e2e/frontend-e2e.test.ts'
  ];
  
  for (const testFile of testFiles) {
    const filePath = path.join(process.cwd(), testFile);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ 测试文件不存在: ${testFile}`);
      return false;
    }
  }
  
  console.log('✅ 测试文件验证通过');
  return true;
}

// 检查依赖包
function checkDependencies() {
  console.log('📋 检查测试依赖包...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json 文件不存在');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const devDependencies = packageJson.devDependencies || {};
  
  const requiredDeps = [
    'jest',
    '@testing-library/jest-dom',
    '@testing-library/react',
    'ts-jest',
    '@types/jest'
  ];
  
  for (const dep of requiredDeps) {
    if (!devDependencies[dep]) {
      console.error(`❌ 缺少测试依赖: ${dep}`);
      return false;
    }
  }
  
  console.log('✅ 测试依赖包验证通过');
  return true;
}

// 运行Jest测试
function runJestTest() {
  console.log('📋 运行Jest测试...');
  
  try {
    // 运行一个简单的测试来验证配置
    execSync('npm run test -- --passWithNoTests --verbose', { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    console.log('✅ Jest测试运行成功');
    return true;
    
  } catch (error) {
    console.error('❌ Jest测试运行失败:', error.message);
    return false;
  }
}

// 主函数
function main() {
  console.log('🎯 Jest配置验证器');
  console.log('='.repeat(50));
  
  const checks = [
    { name: 'Jest配置文件', fn: checkJestConfig },
    { name: '测试设置文件', fn: checkTestSetup },
    { name: '测试文件', fn: checkTestFiles },
    { name: '测试依赖包', fn: checkDependencies },
    { name: 'Jest测试运行', fn: runJestTest }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    console.log(`\n🔍 ${check.name}:`);
    if (!check.fn()) {
      allPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 所有检查通过！Jest配置正确');
    process.exit(0);
  } else {
    console.log('💥 部分检查失败，请修复配置');
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { 
  checkJestConfig, 
  checkTestSetup, 
  checkTestFiles, 
  checkDependencies, 
  runJestTest 
};


