import { describe, it, expect } from '@jest/globals';
import { OnboardingPayloadSchema, safeParseOnboardingPayload, validateOnboardingStep, getStepProgress } from '@athlete-ally/shared-types';

describe('Onboarding合同统一测试', () => {
  describe('OnboardingPayloadSchema验证', () => {
    it('应该接受有效的onboarding数据', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        purpose: 'general_fitness',
        proficiency: 'intermediate',
        season: 'offseason',
        availabilityDays: 3,
        weeklyGoalDays: 4,
        equipment: ['bodyweight', 'dumbbells'],
        recoveryHabits: ['stretching', 'massage']
      };

      const result = safeParseOnboardingPayload(validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('应该拒绝无效的userId格式', () => {
      const invalidData = {
        userId: 'invalid-uuid',
        proficiency: 'intermediate',
        availabilityDays: 3
      };

      const result = safeParseOnboardingPayload(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0].message).toContain('Invalid user ID format');
    });

    it('应该拒绝无效的availabilityDays值', () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        proficiency: 'intermediate',
        availabilityDays: 8 // 超出范围
      };

      const result = safeParseOnboardingPayload(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0].message).toContain('Number must be less than or equal to 7');
    });

    it('应该拒绝无效的proficiency值', () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        proficiency: 'expert', // 无效值
        availabilityDays: 3
      };

      const result = safeParseOnboardingPayload(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0].message).toContain('Invalid enum value');
    });

    it('应该接受可选的字段', () => {
      const minimalData = {
        userId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = safeParseOnboardingPayload(minimalData);
      expect(result.success).toBe(true);
      expect(result.data?.userId).toBe(minimalData.userId);
    });
  });

  describe('availabilityDays类型统一', () => {
    it('availabilityDays应该是数字类型', () => {
      const data = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        availabilityDays: 3
      };

      const result = safeParseOnboardingPayload(data);
      expect(result.success).toBe(true);
      expect(typeof result.data?.availabilityDays).toBe('number');
    });

    it('应该拒绝字符串数组类型的availabilityDays', () => {
      const data = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        availabilityDays: ['monday', 'tuesday', 'wednesday'] // 错误的类型
      };

      const result = safeParseOnboardingPayload(data);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0].message).toContain('Expected number, received array');
    });

    it('availabilityDays应该在1-7范围内', () => {
      const testCases = [
        { value: 0, shouldPass: false },
        { value: 1, shouldPass: true },
        { value: 3, shouldPass: true },
        { value: 7, shouldPass: true },
        { value: 8, shouldPass: false }
      ];

      testCases.forEach(({ value, shouldPass }) => {
        const data = {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          availabilityDays: value
        };

        const result = safeParseOnboardingPayload(data);
        expect(result.success).toBe(shouldPass);
      });
    });
  });

  describe('步骤验证功能', () => {
    it('应该正确验证步骤1（目的和目标）', () => {
      const step1Data = {
        purpose: 'general_fitness' as const,
        purposeDetails: 'I want to get in shape'
      };

      expect(validateOnboardingStep(1, step1Data)).toBe(true);
      expect(validateOnboardingStep(1, { purpose: 'general_fitness' })).toBe(false); // 缺少purposeDetails
    });

    it('应该正确验证步骤2（技能水平）', () => {
      const step2Data = {
        proficiency: 'intermediate' as const
      };

      expect(validateOnboardingStep(2, step2Data)).toBe(true);
      expect(validateOnboardingStep(2, {})).toBe(false);
    });

    it('应该正确验证步骤3（赛季和目标）', () => {
      const step3Data = {
        season: 'offseason' as const,
        competitionDate: '2024-06-01T00:00:00Z'
      };

      expect(validateOnboardingStep(3, step3Data)).toBe(true);
      expect(validateOnboardingStep(3, { season: 'offseason' })).toBe(false); // 缺少competitionDate
    });

    it('应该正确验证步骤4（可用性）', () => {
      const step4Data = {
        availabilityDays: 3,
        weeklyGoalDays: 4
      };

      expect(validateOnboardingStep(4, step4Data)).toBe(true);
      expect(validateOnboardingStep(4, { availabilityDays: 3 })).toBe(false); // 缺少weeklyGoalDays
    });

    it('应该正确验证步骤5（设备）', () => {
      const step5Data = {
        equipment: ['bodyweight', 'dumbbells']
      };

      expect(validateOnboardingStep(5, step5Data)).toBe(true);
      expect(validateOnboardingStep(5, { equipment: [] })).toBe(false); // 空数组
    });

    it('应该正确验证步骤6（恢复习惯）', () => {
      const step6Data = {
        recoveryHabits: ['stretching', 'massage']
      };

      expect(validateOnboardingStep(6, step6Data)).toBe(true);
      expect(validateOnboardingStep(6, { recoveryHabits: [] })).toBe(false); // 空数组
    });
  });

  describe('进度计算功能', () => {
    it('应该正确计算步骤进度', () => {
      const emptyData = {};
      const progress = getStepProgress(emptyData);
      expect(progress.current).toBe(0);
      expect(progress.total).toBe(6);
      expect(progress.percentage).toBe(0);

      const partialData = {
        purpose: 'general_fitness' as const,
        purposeDetails: 'I want to get in shape',
        proficiency: 'intermediate' as const
      };
      const partialProgress = getStepProgress(partialData);
      expect(partialProgress.current).toBe(2);
      expect(partialProgress.percentage).toBe(33);

      const completeData = {
        purpose: 'general_fitness' as const,
        purposeDetails: 'I want to get in shape',
        proficiency: 'intermediate' as const,
        season: 'offseason' as const,
        competitionDate: '2024-06-01T00:00:00Z',
        availabilityDays: 3,
        weeklyGoalDays: 4,
        equipment: ['bodyweight'],
        recoveryHabits: ['stretching']
      };
      const completeProgress = getStepProgress(completeData);
      expect(completeProgress.current).toBe(6);
      expect(completeProgress.percentage).toBe(100);
    });
  });

  describe('合同兼容性测试', () => {
    it('应该与前端API路由兼容', () => {
      const frontendData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        proficiency: 'intermediate',
        availabilityDays: 3
      };

      const result = safeParseOnboardingPayload(frontendData);
      expect(result.success).toBe(true);
    });

    it('应该与Gateway BFF兼容', () => {
      const gatewayData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        purpose: 'general_fitness',
        proficiency: 'intermediate',
        season: 'offseason',
        availabilityDays: 3,
        weeklyGoalDays: 4,
        equipment: ['bodyweight']
      };

      const result = safeParseOnboardingPayload(gatewayData);
      expect(result.success).toBe(true);
    });

    it('应该与Profile Onboarding服务兼容', () => {
      const serviceData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        purpose: 'general_fitness',
        purposeDetails: 'I want to get in shape',
        proficiency: 'intermediate',
        season: 'offseason',
        competitionDate: '2024-06-01T00:00:00Z',
        availabilityDays: 3,
        weeklyGoalDays: 4,
        equipment: ['bodyweight', 'dumbbells'],
        fixedSchedules: [
          { day: 'monday', start: '09:00', end: '10:00' }
        ],
        recoveryHabits: ['stretching', 'massage'],
        onboardingStep: 6,
        isOnboardingComplete: true
      };

      const result = safeParseOnboardingPayload(serviceData);
      expect(result.success).toBe(true);
    });
  });

  describe('错误处理测试', () => {
    it('应该提供详细的验证错误信息', () => {
      const invalidData = {
        userId: 'invalid-uuid',
        proficiency: 'expert',
        availabilityDays: 10
      };

      const result = safeParseOnboardingPayload(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.errors).toHaveLength(3);
      
      const errorMessages = result.error?.errors.map(e => e.message);
      expect(errorMessages).toContain('Invalid user ID format');
      expect(errorMessages.some(msg => msg.includes('Invalid enum value. Expected'))).toBe(true);
      expect(errorMessages).toContain('Number must be less than or equal to 7');
    });

    it('应该处理空数据', () => {
      const result = safeParseOnboardingPayload(null);
      expect(result.success).toBe(false);
    });

    it('应该处理非对象数据', () => {
      const result = safeParseOnboardingPayload('invalid');
      expect(result.success).toBe(false);
    });
  });
});
