#!/usr/bin/env node

/**
 * 簡化的 E2E 測試執行腳本
 */

const { execSync } = require('child_process');
const path = require('path');

// 測試套件
const TEST_SUITES = [
  'onboarding-data-persistence.test.ts',
  'weight-conversion.test.ts',
  'rpe-trigger-logic.test.ts',
  'responsive-layout.test.ts'
];

console.log('🚀 開始運行 E2E 自動化測試\n');

let totalPassed = 0;
let totalFailed = 0;
let totalTests = 0;

for (const testFile of TEST_SUITES) {
  console.log(`正在運行: ${testFile}`);
  
  try {
    const command = `npx jest "${testFile}" --config="jest.config.js" --silent`;
    
    const output = execSync(command, { 
      encoding: 'utf8',
      timeout: 60000,
      cwd: __dirname  // 在測試目錄下運行
    });
    
    // 解析測試結果
    const passedMatches = output.match(/Tests:\s+(\d+)\s+passed/g);
    const failedMatches = output.match(/Tests:\s+\d+\s+passed,\s+(\d+)\s+failed/g);
    const totalMatches = output.match(/Tests:\s+(\d+)\s+passed(?:,\s+\d+\s+failed)?/g);
    
    const passed = passedMatches ? parseInt(passedMatches[0].match(/(\d+)/)[1]) : 0;
    const failed = failedMatches ? parseInt(failedMatches[0].match(/(\d+)/)[1]) : 0;
    const total = passed + failed;
    
    totalPassed += passed;
    totalFailed += failed;
    totalTests += total;
    
    if (failed === 0) {
      console.log(`✅ 通過: ${passed} 個測試\n`);
    } else {
      console.log(`❌ 失敗: ${passed} 通過, ${failed} 失敗\n`);
    }
    
  } catch (error) {
    console.log(`❌ 錯誤: ${error.message}\n`);
    totalFailed++;
  }
}

console.log('='.repeat(50));
console.log('📊 測試結果總結');
console.log('='.repeat(50));
console.log(`總測試數量: ${totalTests}`);
console.log(`通過測試: ${totalPassed}`);
console.log(`失敗測試: ${totalFailed}`);
console.log(`成功率: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`);

if (totalFailed === 0) {
  console.log('\n🎉 所有測試通過！可以繼續 V3 開發');
  process.exit(0);
} else {
  console.log('\n⚠️ 有測試失敗，請檢查並修復');
  process.exit(1);
}
