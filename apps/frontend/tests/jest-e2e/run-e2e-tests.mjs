#!/usr/bin/env node

/**
 * E2E 測試執行腳本
 * 用於運行所有可自動化的端到端測試
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 測試配置
const TEST_CONFIG = {
  timeout: 300000, // 5 分鐘超時
  maxWorkers: 2, // 限制並發數
  verbose: true,
  coverage: true
};

// 測試套件
const TEST_SUITES = [
  {
    name: 'Onboarding Data Persistence',
    file: 'onboarding-data-persistence.test.ts',
    description: '測試 Onboarding 數據持久性和流程完整性'
  },
  {
    name: 'Weight Conversion',
    file: 'weight-conversion.test.ts',
    description: '測試科學化重量單位轉換邏輯'
  },
  {
    name: 'RPE Trigger Logic',
    file: 'rpe-trigger-logic.test.ts',
    description: '測試條件觸發式 RPE 評分邏輯'
  },
  {
    name: 'Responsive Layout',
    file: 'responsive-layout.test.ts',
    description: '測試響應式佈局和加載狀態'
  }
];

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logTestResult(suite, result) {
  const status = result.success ? '✅ PASS' : '❌ FAIL';
  const color = result.success ? 'green' : 'red';
  
  log(`\n${status} ${suite.name}`, color);
  log(`   描述: ${suite.description}`, 'blue');
  
  if (result.success) {
    log(`   執行時間: ${result.duration}ms`, 'yellow');
    log(`   測試數量: ${result.testCount}`, 'yellow');
  } else {
    log(`   錯誤: ${result.error}`, 'red');
  }
}

// 檢查測試環境
function checkTestEnvironment() {
  logHeader('檢查測試環境');
  
  // 檢查 Node.js 版本
  const nodeVersion = process.version;
  log(`Node.js 版本: ${nodeVersion}`, 'blue');
  
  // 檢查 Jest 是否安裝
  try {
    execSync('npx jest --version', { stdio: 'pipe' });
    log('Jest 已安裝', 'green');
  } catch {
    log('Jest 未安裝，正在安裝...', 'yellow');
    execSync('npm install --save-dev jest @types/jest ts-jest', { stdio: 'inherit' });
  }
  
  // 檢查測試文件是否存在
  const testDir = __dirname; // 當前目錄就是測試目錄
  if (!fs.existsSync(testDir)) {
    log('測試目錄不存在，創建中...', 'yellow');
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  log('測試環境檢查完成', 'green');
}

// 運行單個測試套件
function runTestSuite(suite) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const testFile = path.join(__dirname, suite.file);
    
    if (!fs.existsSync(testFile)) {
      resolve({
        success: false,
        error: `測試文件不存在: ${suite.file}`,
        duration: 0,
        testCount: 0
      });
      return;
    }
    
    try {
      const command = `npx jest "${testFile}" --config="${path.join(__dirname, 'jest.config.js')}" --verbose --no-coverage`;
      const output = execSync(command, { 
        encoding: 'utf8',
        timeout: TEST_CONFIG.timeout,
        cwd: process.cwd()
      });
      
      const duration = Date.now() - startTime;
      const testCount = (output.match(/✓/g) || []).length;
      const failedCount = (output.match(/×/g) || []).length;
      
      // 檢查是否有失敗的測試
      const hasFailures = failedCount > 0 || output.includes('FAIL');
      
      resolve({
        success: !hasFailures,
        duration,
        testCount,
        failedCount,
        output,
        error: hasFailures ? `有 ${failedCount} 個測試失敗` : null
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        error: error.message,
        duration,
        testCount: 0,
        failedCount: 0
      });
    }
  });
}

// 運行所有測試
async function runAllTests() {
  logHeader('開始運行 E2E 自動化測試');
  
  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  let totalDuration = 0;
  
  for (const suite of TEST_SUITES) {
    log(`\n正在運行: ${suite.name}`, 'blue');
    const result = await runTestSuite(suite);
    results.push({ suite, result });
    
    logTestResult(suite, result);
    
    totalTests += result.testCount;
    if (result.success) {
      passedTests += result.testCount;
    }
    totalDuration += result.duration;
  }
  
  // 顯示總結
  logHeader('測試結果總結');
  log(`總測試套件: ${TEST_SUITES.length}`, 'blue');
  log(`總測試數量: ${totalTests}`, 'blue');
  log(`通過測試: ${passedTests}`, 'green');
  log(`失敗測試: ${totalTests - passedTests}`, 'red');
  log(`總執行時間: ${totalDuration}ms`, 'yellow');
  
  const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
  log(`成功率: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
  
  // 顯示失敗的測試
  const failedTests = results.filter(r => !r.result.success);
  if (failedTests.length > 0) {
    logHeader('失敗的測試套件');
    failedTests.forEach(({ suite, result }) => {
      log(`❌ ${suite.name}: ${result.error}`, 'red');
    });
  }
  
  return {
    totalSuites: TEST_SUITES.length,
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    successRate: parseFloat(successRate),
    totalDuration,
    results
  };
}

// 生成測試報告
function generateTestReport(summary) {
  const report = {
    timestamp: new Date().toISOString(),
    summary,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
  
  const reportFile = path.join(__dirname, 'e2e-test-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  log(`\n測試報告已生成: ${reportFile}`, 'cyan');
}

// 主函數
async function main() {
  try {
    logHeader('Athlete Ally E2E 自動化測試');
    log('開始時間: ' + new Date().toLocaleString(), 'blue');
    
    checkTestEnvironment();
    
    const summary = await runAllTests();
    generateTestReport(summary);
    
    if (summary.successRate >= 80) {
      log('\n🎉 測試通過！可以繼續 V3 開發', 'green');
      process.exit(0);
    } else {
      log('\n⚠️ 測試失敗率過高，請修復問題後重試', 'red');
      process.exit(1);
    }
  } catch (error) {
    log(`\n💥 測試執行出錯: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 如果直接運行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  runAllTests,
  runTestSuite,
  checkTestEnvironment,
  generateTestReport
};
