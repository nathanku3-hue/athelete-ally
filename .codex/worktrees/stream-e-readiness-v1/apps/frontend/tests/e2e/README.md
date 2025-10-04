# E2E 自動化測試套件

本目錄包含 Athlete Ally 專案的端到端自動化測試，用於驗證核心功能的正確性和穩定性。

## 測試分類

### ✅ 可自動化的測試

| 測試案例 | 描述 | 自動化程度 | 測試文件 |
|---------|------|-----------|----------|
| **ONB-E2E-01** | 數據持久性與流程完整性 | 100% | `onboarding-data-persistence.test.ts` |
| **ONB-SUM-01** | Summary 頁面數據顯示 | 100% | `onboarding-data-persistence.test.ts` |
| **PLN-FUNC-01** | 科學化重量單位轉換 | 100% | `weight-conversion.test.ts` |
| **WKO-IN-02** | 條件觸發式 RPE | 100% | `rpe-trigger-logic.test.ts` |
| **WKO-IN-01** | 日誌預填寫 | 100% | `rpe-trigger-logic.test.ts` |
| **PLN-UI-01** | 響應式佈局 | 100% | `responsive-layout.test.ts` |

### ❌ 不可自動化的測試 (需要手動執行)

| 測試案例 | 描述 | 原因 | 建議 |
|---------|------|------|------|
| **ONB-P1-01** | Proficiency 頁面 UI 佈局 | 需要視覺驗證 | 使用瀏覽器手動測試 |
| **ONB-P2-01** | Purpose 頁面 "Coming Soon" 狀態 | 需要視覺驗證 | 使用瀏覽器手動測試 |
| **ONB-P3-01** | Season 頁面 Skip 按鈕 | 需要手動點擊 | 使用瀏覽器手動測試 |
| **ONB-P4-01** | Availability 頁面交互 | 需要手動選擇 | 使用瀏覽器手動測試 |
| **ONB-P5-01** | Equipment 頁面動畫效果 | 需要視覺驗證 | 使用瀏覽器手動測試 |
| **WKO-PRE-01** | 疲勞評估 Modal | 需要手動交互 | 使用瀏覽器手動測試 |
| **WKO-POST-01** | 訓練後 sRPE Modal | 需要手動交互 | 使用瀏覽器手動測試 |
| **PLN-INT-01** | 動作詳情交互 | 需要手動點擊 | 使用瀏覽器手動測試 |

## 快速開始

### 1. 安裝依賴

```bash
npm install --save-dev jest @types/jest ts-jest
```

### 2. 運行所有自動化測試

```bash
# 使用自動化腳本
node tests/e2e/run-e2e-tests.js

# 或使用 Jest 直接運行
npx jest tests/e2e --config=tests/e2e/jest.config.js
```

### 3. 運行特定測試套件

```bash
# 只運行 Onboarding 測試
npx jest tests/e2e/onboarding-data-persistence.test.ts

# 只運行重量轉換測試
npx jest tests/e2e/weight-conversion.test.ts

# 只運行 RPE 邏輯測試
npx jest tests/e2e/rpe-trigger-logic.test.ts

# 只運行響應式佈局測試
npx jest tests/e2e/responsive-layout.test.ts
```

## 測試環境要求

### 服務依賴

確保以下服務正在運行：

- **Web 應用**: `http://localhost:3000`
- **Gateway BFF**: `http://localhost:3001`
- **Planning Engine**: `http://localhost:3002`
- **Profile Onboarding**: `http://localhost:3003`
- **Workouts Service**: `http://localhost:3004`
- **Fatigue Service**: `http://localhost:3005`
- **Exercises Service**: `http://localhost:3006`

### 啟動所有服務

```bash
# 使用專案提供的腳本
npm run dev:check

# 或手動啟動
npm run dev
```

## 測試結構

```
tests/e2e/
├── README.md                           # 本文檔
├── jest.config.js                      # Jest 配置
├── setup.ts                           # 測試設置
├── run-e2e-tests.js                   # 自動化測試執行腳本
├── onboarding-data-persistence.test.ts # Onboarding 數據持久性測試
├── weight-conversion.test.ts           # 重量轉換測試
├── rpe-trigger-logic.test.ts          # RPE 觸發邏輯測試
├── responsive-layout.test.ts           # 響應式佈局測試
└── e2e-test-report.json               # 測試報告 (自動生成)
```

## 測試報告

測試完成後會生成詳細的測試報告：

- **控制台輸出**: 實時顯示測試進度和結果
- **JSON 報告**: `e2e-test-report.json` 包含詳細的測試數據
- **成功率統計**: 顯示通過率和失敗原因

## 手動測試指南

對於無法自動化的測試，請按照以下步驟進行手動驗證：

### 1. Onboarding 流程測試

1. 打開瀏覽器無痕模式
2. 訪問 `http://localhost:3000`
3. 按照測試計畫中的步驟逐一驗證

### 2. 訓練體驗測試

1. 完成 Onboarding 流程
2. 進入訓練計畫頁面
3. 開始訓練並驗證各項功能

### 3. 響應式佈局測試

1. 調整瀏覽器窗口大小
2. 測試不同螢幕尺寸下的佈局
3. 驗證觸控設備的交互

## 故障排除

### 常見問題

1. **服務未運行**: 確保所有微服務都已啟動
2. **端口衝突**: 檢查端口是否被其他程序佔用
3. **數據庫連接**: 確保數據庫服務正常運行
4. **測試超時**: 增加 Jest 的 timeout 設置

### 調試模式

```bash
# 啟用詳細日誌
DEBUG=true npx jest tests/e2e --verbose

# 運行單個測試並保持輸出
npx jest tests/e2e/onboarding-data-persistence.test.ts --verbose --no-coverage
```

## 持續集成

這些測試可以集成到 CI/CD 流程中：

```yaml
# GitHub Actions 示例
- name: Run E2E Tests
  run: |
    npm run dev:check &
    sleep 30
    node tests/e2e/run-e2e-tests.js
```

## 貢獻指南

添加新的自動化測試時：

1. 在對應的測試文件中添加測試案例
2. 更新 `run-e2e-tests.js` 中的測試套件列表
3. 更新本文檔的測試分類表格
4. 確保測試具有適當的錯誤處理和清理邏輯
