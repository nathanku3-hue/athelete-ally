#!/usr/bin/env node

// 前端测试执行脚本
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始执行前端测试...\n');

// 测试配置
const tests = [
  {
    name: 'Jest配置验证',
    command: 'npm run test -- --passWithNoTests --verbose',
    description: '验证Jest配置是否正确'
  },
  {
    name: '单元测试',
    command: 'npm run test:unit',
    description: '运行所有单元测试'
  },
  {
    name: '集成测试',
    command: 'npm run test:integration',
    description: '运行API集成测试'
  },
  {
    name: '端到端测试',
    command: 'npm run test:e2e',
    description: '运行前端端到端测试'
  },
  {
    name: 'API测试',
    command: 'npm run test:api',
    description: '运行API集成测试'
  },
  {
    name: '前端测试',
    command: 'npm run test:frontend',
    description: '运行前端组件测试'
  },
  {
    name: '测试覆盖率',
    command: 'npm run test:coverage',
    description: '生成测试覆盖率报告'
  }
];

// 执行测试
async function runTests() {
  const results = [];
  
  for (const test of tests) {
    console.log(`\n📋 执行: ${test.name}`);
    console.log(`📝 描述: ${test.description}`);
    console.log(`⚡ 命令: ${test.command}`);
    console.log('─'.repeat(50));
    
    try {
      const startTime = Date.now();
      execSync(test.command, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results.push({
        name: test.name,
        status: '✅ 通过',
        duration: `${duration}ms`,
        error: null
      });
      
      console.log(`✅ ${test.name} 通过 (${duration}ms)`);
      
    } catch (error) {
      results.push({
        name: test.name,
        status: '❌ 失败',
        duration: 'N/A',
        error: error.message
      });
      
      console.log(`❌ ${test.name} 失败: ${error.message}`);
    }
  }
  
  return results;
}

// 生成测试报告
function generateReport(results) {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status.includes('✅')).length;
  const failedTests = results.filter(r => r.status.includes('❌')).length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 前端测试报告');
  console.log('='.repeat(60));
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过: ${passedTests}`);
  console.log(`失败: ${failedTests}`);
  console.log(`成功率: ${successRate}%`);
  console.log('='.repeat(60));
  
  console.log('\n📋 详细结果:');
  results.forEach(result => {
    console.log(`${result.status} ${result.name} (${result.duration})`);
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
  });
  
  // 保存报告到文件
  const reportPath = path.join(process.cwd(), 'test-results', 'frontend-test-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: parseFloat(successRate)
    },
    results: results
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 报告已保存到: ${reportPath}`);
  
  return {
    success: failedTests === 0,
    totalTests,
    passedTests,
    failedTests,
    successRate: parseFloat(successRate)
  };
}

// 检查测试环境
function checkTestEnvironment() {
  console.log('🔍 检查测试环境...');
  
  // 检查Jest配置
  const jestConfigPath = path.join(process.cwd(), 'jest.config.js');
  if (!fs.existsSync(jestConfigPath)) {
    console.error('❌ Jest配置文件不存在');
    return false;
  }
  
  // 检查测试设置文件
  const setupPath = path.join(process.cwd(), 'src/__tests__/setup.ts');
  if (!fs.existsSync(setupPath)) {
    console.error('❌ 测试设置文件不存在');
    return false;
  }
  
  // 检查API测试工具
  const apiTestUtilsPath = path.join(process.cwd(), 'src/lib/api-test-utils.ts');
  if (!fs.existsSync(apiTestUtilsPath)) {
    console.error('❌ API测试工具文件不存在');
    return false;
  }
  
  // 检查集成测试
  const integrationTestPath = path.join(process.cwd(), 'src/__tests__/integration/api-integration.test.ts');
  if (!fs.existsSync(integrationTestPath)) {
    console.error('❌ 集成测试文件不存在');
    return false;
  }
  
  // 检查端到端测试
  const e2eTestPath = path.join(process.cwd(), 'src/__tests__/e2e/frontend-e2e.test.ts');
  if (!fs.existsSync(e2eTestPath)) {
    console.error('❌ 端到端测试文件不存在');
    return false;
  }
  
  console.log('✅ 测试环境检查通过');
  return true;
}

// 主函数
async function main() {
  try {
    console.log('🎯 前端测试执行器');
    console.log('='.repeat(60));
    
    // 检查测试环境
    if (!checkTestEnvironment()) {
      console.error('❌ 测试环境检查失败，请先修复配置');
      process.exit(1);
    }
    
    // 执行测试
    const results = await runTests();
    
    // 生成报告
    const report = generateReport(results);
    
    // 根据结果设置退出码
    if (report.success) {
      console.log('\n🎉 所有测试通过！');
      process.exit(0);
    } else {
      console.log('\n💥 部分测试失败，请检查错误信息');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 测试执行过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { runTests, generateReport, checkTestEnvironment };


