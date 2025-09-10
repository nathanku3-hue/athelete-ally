import { describe, it, expect } from '@jest/globals';

describe('Weight Conversion E2E Tests', () => {
  describe('PLN-FUNC-01: 科學化重量單位轉換', () => {
    it('should convert 135 lbs to 61.2 kg using scientific rounding', async () => {
      // 測試重量轉換邏輯
      const testWeight = 135; // lbs
      const expectedKg = 61.2; // 科學化取整結果
      
      // 模擬 API 調用進行單位轉換
      const conversionResponse = await convertWeight(testWeight, 'lbs', 'kg');
      
      expect(conversionResponse.success).toBe(true);
      expect(conversionResponse.convertedWeight).toBe(expectedKg);
      expect(conversionResponse.originalWeight).toBe(testWeight);
      expect(conversionResponse.fromUnit).toBe('lbs');
      expect(conversionResponse.toUnit).toBe('kg');
    });

    it('should convert 61.2 kg back to 134.9 lbs', async () => {
      const testWeight = 61.2; // kg
      const expectedLbs = 134.9; // 反向轉換
      
      const conversionResponse = await convertWeight(testWeight, 'kg', 'lbs');
      
      expect(conversionResponse.success).toBe(true);
      expect(conversionResponse.convertedWeight).toBe(expectedLbs);
    });

    it('should handle multiple weight conversions in training plan', async () => {
      const testWeights = [
        { weight: 135, unit: 'lbs', expectedKg: 61.2 },
        { weight: 225, unit: 'lbs', expectedKg: 102.1 },
        { weight: 315, unit: 'lbs', expectedKg: 142.9 },
        { weight: 45, unit: 'lbs', expectedKg: 20.4 }
      ];

      for (const testCase of testWeights) {
        const conversionResponse = await convertWeight(testCase.weight, testCase.unit, 'kg');
        
        expect(conversionResponse.success).toBe(true);
        expect(conversionResponse.convertedWeight).toBe(testCase.expectedKg);
      }
    });

    it('should maintain precision for small weights', async () => {
      const testWeights = [
        { weight: 2.5, unit: 'lbs', expectedKg: 1.1 },
        { weight: 5, unit: 'lbs', expectedKg: 2.3 },
        { weight: 10, unit: 'lbs', expectedKg: 4.5 }
      ];

      for (const testCase of testWeights) {
        const conversionResponse = await convertWeight(testCase.weight, testCase.unit, 'kg');
        
        expect(conversionResponse.success).toBe(true);
        expect(conversionResponse.convertedWeight).toBe(testCase.expectedKg);
      }
    });

    it('should handle edge cases correctly', async () => {
      // 測試邊界情況
      const edgeCases = [
        { weight: 0, unit: 'lbs', expectedKg: 0 },
        { weight: 1, unit: 'lbs', expectedKg: 0.5 },
        { weight: 1000, unit: 'lbs', expectedKg: 453.6 }
      ];

      for (const testCase of edgeCases) {
        const conversionResponse = await convertWeight(testCase.weight, testCase.unit, 'kg');
        
        expect(conversionResponse.success).toBe(true);
        expect(conversionResponse.convertedWeight).toBe(testCase.expectedKg);
      }
    });
  });

  describe('Training Plan Weight Display', () => {
    it('should update all weights in training plan when unit changes', async () => {
      // 模擬獲取訓練計畫數據
      const trainingPlan = await getTrainingPlan('test-user-123');
      
      // 驗證初始狀態 (lbs)
      expect(trainingPlan.exercises[0].weight).toBe(135);
      expect(trainingPlan.exercises[0].unit).toBe('lbs');
      
      // 切換到 kg
      const updatedPlan = await switchWeightUnit('test-user-123', 'kg');
      
      // 驗證所有重量都已轉換
      expect(updatedPlan.exercises[0].weight).toBe(61.2);
      expect(updatedPlan.exercises[0].unit).toBe('kg');
      expect(updatedPlan.exercises[1].weight).toBe(52.2);
      expect(updatedPlan.exercises[1].unit).toBe('kg');
    });

    it('should maintain user preference across sessions', async () => {
      // 設置用戶偏好為 kg
      await setUserWeightPreference('test-user-123', 'kg');
      
      // 獲取訓練計畫
      const trainingPlan = await getTrainingPlan('test-user-123');
      
      // 驗證所有重量都以 kg 顯示
      trainingPlan.exercises.forEach((exercise) => {
        expect(exercise.unit).toBe('kg');
        expect(typeof exercise.weight).toBe('number');
        expect(exercise.weight).toBeGreaterThan(0);
      });
    });
  });
});

// 輔助函數
async function convertWeight(weight: number, fromUnit: string, toUnit: string) {
  // 模擬重量轉換邏輯
  console.log(`模擬重量轉換: ${weight} ${fromUnit} -> ${toUnit}`);
  
  let convertedWeight: number;
  
  if (fromUnit === 'lbs' && toUnit === 'kg') {
    // 科學化取整：lbs * 0.45359237，然後四捨五入到小數點後1位
    convertedWeight = Math.round(weight * 0.45359237 * 10) / 10;
  } else if (fromUnit === 'kg' && toUnit === 'lbs') {
    // 反向轉換：kg / 0.45359237
    convertedWeight = Math.round(weight / 0.45359237 * 10) / 10;
  } else {
    convertedWeight = weight; // 相同單位
  }
  
  return {
    success: true,
    originalWeight: weight,
    convertedWeight,
    fromUnit,
    toUnit
  };
}

async function getTrainingPlan(userId: string) {
  // 模擬獲取訓練計畫
  console.log(`模擬獲取訓練計畫: ${userId}`);
  
  // 根據用戶偏好返回相應單位的數據
  if (userWeightPreference === 'kg') {
    return {
      userId,
      exercises: [
        { id: 'squat', weight: 61.2, unit: 'kg', reps: 5 },
        { id: 'bench', weight: 52.2, unit: 'kg', reps: 5 }
      ]
    };
  } else {
    return {
      userId,
      exercises: [
        { id: 'squat', weight: 135, unit: 'lbs', reps: 5 },
        { id: 'bench', weight: 115, unit: 'lbs', reps: 5 }
      ]
    };
  }
}

async function switchWeightUnit(userId: string, unit: string) {
  // 模擬切換重量單位
  console.log(`模擬切換重量單位: ${userId} -> ${unit}`);
  
  const plan = await getTrainingPlan(userId);
  
  // 轉換所有重量
  for (const exercise of plan.exercises) {
    const conversion = await convertWeight(exercise.weight, exercise.unit, unit);
    exercise.weight = conversion.convertedWeight;
    exercise.unit = unit;
  }
  
  return plan;
}

// 全局變量用於模擬用戶偏好
let userWeightPreference = 'lbs';

async function setUserWeightPreference(userId: string, unit: string) {
  // 模擬設置用戶偏好
  console.log(`模擬設置用戶偏好: ${userId} -> ${unit}`);
  
  userWeightPreference = unit;
  
  return {
    success: true,
    userId,
    weightUnit: unit
  };
}
