// E2E 測試設置文件
import { beforeAll, afterAll, beforeEach } from '@jest/globals';

// 全局測試設置
beforeAll(async () => {
  console.log('🚀 開始 E2E 測試套件');
  
  // 確保測試環境已啟動
  await ensureTestEnvironment();
  
  // 設置測試數據庫
  await setupTestDatabase();
});

afterAll(async () => {
  console.log('🏁 完成 E2E 測試套件');
  
  // 清理測試數據
  await cleanupTestData();
  
  // 關閉測試環境
  await teardownTestEnvironment();
});

beforeEach(async () => {
  // 每個測試前的設置
  await resetTestState();
});

// 輔助函數
async function ensureTestEnvironment() {
  // 檢查服務是否運行
  const services = [
    'http://localhost:3000', // Web 應用
    'http://localhost:3001', // Gateway BFF
    'http://localhost:3002', // Planning Engine
    'http://localhost:3003', // Profile Onboarding
    'http://localhost:3004', // Workouts Service
    'http://localhost:3005', // Fatigue Service
    'http://localhost:3006', // Exercises Service
  ];

  for (const service of services) {
    try {
      const response = await fetch(`${service}/health`);
      if (!response.ok) {
        throw new Error(`Service ${service} is not healthy`);
      }
    } catch (error) {
      console.warn(`⚠️ 服務 ${service} 未運行，某些測試可能會失敗`);
    }
  }
}

async function setupTestDatabase() {
  // 設置測試數據庫
  try {
    await fetch('http://localhost:3001/api/test/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ environment: 'test' })
    });
  } catch (error) {
    console.warn('⚠️ 無法設置測試數據庫');
  }
}

async function cleanupTestData() {
  // 清理所有測試數據
  try {
    await fetch('http://localhost:3001/api/test/cleanup', {
      method: 'DELETE'
    });
  } catch (error) {
    console.warn('⚠️ 無法清理測試數據');
  }
}

async function teardownTestEnvironment() {
  // 關閉測試環境
  console.log('🧹 清理測試環境');
}

async function resetTestState() {
  // 重置測試狀態
  // 這裡可以添加每個測試前的重置邏輯
}

// 全局測試工具函數
export const testUtils = {
  // 創建測試用戶
  async createTestUser(userData: any = {}) {
    const defaultUser = {
      id: `test-user-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      ...userData
    };

    const response = await fetch('http://localhost:3001/api/test/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultUser)
    });

    return await response.json();
  },

  // 創建測試訓練計畫
  async createTestTrainingPlan(userId: string, planData: any = {}) {
    const defaultPlan = {
      userId,
      name: 'Test Training Plan',
      exercises: [
        {
          id: 'squat',
          name: 'Squat',
          isCoreLift: true,
          sets: [
            { setNumber: 1, reps: 5, weight: 135, unit: 'lbs' },
            { setNumber: 2, reps: 5, weight: 135, unit: 'lbs' }
          ]
        }
      ],
      ...planData
    };

    const response = await fetch('http://localhost:3001/api/test/training-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultPlan)
    });

    return await response.json();
  },

  // 等待條件滿足
  async waitFor(condition: () => Promise<boolean>, timeout: number = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`條件在 ${timeout}ms 內未滿足`);
  },

  // 模擬用戶交互
  async simulateUserInteraction(interaction: any) {
    const response = await fetch('http://localhost:3001/api/test/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interaction)
    });

    return await response.json();
  }
};
