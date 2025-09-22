// 測試設置文件
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// 全局測試設置
beforeAll(async () => {
  console.log('🚀 開始 V3 功能集測試套件');
  
  // 設置測試數據庫連接
  // await setupTestDatabase();
  
  // 設置測試服務
  // await setupTestServices();
});

afterAll(async () => {
  console.log('✅ V3 功能集測試套件完成');
  
  // 清理測試數據庫
  // await cleanupTestDatabase();
  
  // 清理測試服務
  // await cleanupTestServices();
});

beforeEach(() => {
  // 每個測試前的設置
  // 重置測試數據
  // 設置測試環境變量
});

afterEach(() => {
  // 每個測試後的清理
  // 清理測試數據
  // 重置模擬
});

// 測試輔助函數
export const testHelpers = {
  // 創建測試用戶
  createTestUser: (overrides = {}) => ({
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    ...overrides
  }),

  // 創建測試計劃
  createTestPlan: (overrides = {}) => ({
    id: 'test-plan-123',
    userId: 'test-user-123',
    name: 'Test Plan',
    status: 'active',
    ...overrides
  }),

  // 創建測試週回顧數據
  createTestWeeklyReview: (overrides = {}) => ({
    userId: 'test-user-123',
    planId: 'test-plan-123',
    weekNumber: 1,
    coreLiftData: [
      {
        exerciseId: 'squat',
        actualRpeValues: [7, 8, 8],
        targetRpeRange: { min: 7, max: 9 }
      }
    ],
    fatigueScores: [3, 4, 3, 2],
    trainingLoadData: {
      sessionRpe: 8,
      trainingDuration: 60
    },
    ...overrides
  }),

  // 等待異步操作
  waitFor: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // 模擬 API 響應
  mockApiResponse: (data: unknown, status = 200) => ({
    status,
    data,
    headers: {},
    config: {}
  }),

  // 模擬錯誤響應
  mockErrorResponse: (message: string, status = 400) => ({
    status,
    error: {
      message,
      code: 'TEST_ERROR'
    }
  })
};

// 測試常量
export const testConstants = {
  VALID_USER_ID: 'test-user-123',
  VALID_PLAN_ID: 'test-plan-123',
  VALID_SESSION_ID: 'test-session-123',
  VALID_EXERCISE_ID: 'squat',
  VALID_RPE_RANGE: { min: 7, max: 9 },
  VALID_FATIGUE_SCORES: [3, 4, 3, 2],
  TEST_TIMEOUT: 30000
};

// 測試數據工廠
export const testDataFactory = {
  // 創建多週訓練數據
  createMultiWeekData: (weeks: number) => {
    return Array.from({ length: weeks }, (_, i) => ({
      weekNumber: i + 1,
      weeklyTrainingLoad: 400 + (i * 50),
      weeklyFatigueAverage: 3.0 + (i * 0.1),
      coreLiftTonnage: [
        {
          exerciseId: 'squat',
          weeklyTonnage: 4500 + (i * 500)
        }
      ]
    }));
  },

  // 創建核心動作數據
  createCoreLiftData: (exerciseId: string, weeks: number) => {
    return Array.from({ length: weeks }, (_, i) => ({
      exerciseId,
      actualRpeValues: [7, 8, 8],
      targetRpeRange: { min: 7, max: 9 },
      weekNumber: i + 1
    }));
  }
};
