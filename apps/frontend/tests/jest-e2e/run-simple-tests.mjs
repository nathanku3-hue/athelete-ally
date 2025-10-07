#!/usr/bin/env node

/**
 * 簡化的 E2E 測試執行腳本
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 測試套件
const TEST_SUITES = [
  'onboarding-data-persistence.test.ts',
  'weight-conversion.test.ts',
  'rpe-trigger-logic.test.ts',
  'responsive-layout.test.ts'
];

// E2E 測試開始

let totalFailed = 0;

for (const testFile of TEST_SUITES) {
  // 正在運行測試文件

  try {
    const command = `npx jest "${testFile}" --config="jest.config.js" --silent`;

    const output = execSync(command, {
      encoding: 'utf8',
      timeout: 60000,
      cwd: __dirname  // 在測試目錄下運行
    });

    // 解析測試結果
    const failedMatches = output.match(/Tests:\s+\d+\s+passed,\s+(\d+)\s+failed/g);
    const failed = failedMatches ? parseInt(failedMatches[0].match(/(\d+)/)[1]) : 0;

    totalFailed += failed;

    // 測試結果已記錄

  } catch {
    // 測試執行錯誤
    totalFailed++;
  }
}

// 測試結果總結

if (totalFailed === 0) {
  process.exit(0);
} else {
  process.exit(1);
}
