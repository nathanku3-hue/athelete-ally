/**
 * V3 協議引擎單元測試
 * 全面測試 RPE 觸發決策和適應性規則
 */

import { V3ProtocolEngine, ProtocolType, TrainingContext } from '../v3-protocol-engine';

describe('V3ProtocolEngine', () => {
  let engine: V3ProtocolEngine;

  beforeEach(() => {
    engine = new V3ProtocolEngine();
  });

  describe('RPE 觸發決策器測試', () => {
    describe('場景 A: 常規訓練 (STANDARD 協議)', () => {
      it('應該在核心動作的最後一組觸發 RPE', () => {
        const context: TrainingContext = {
          exerciseId: 'squat_1',
          exerciseType: 'squat',
          isCoreLift: true,
          isKeySet: false,
          setNumber: 3,
          totalSets: 3,
          timeElapsed: 120,
          previousRpes: [7, 8]
        };

        const decision = engine.shouldTriggerRPE('standard_protocol', context);

        expect(decision.shouldTrigger).toBe(true);
        expect(decision.reason).toBe('核心動作最後一組');
        expect(decision.priority).toBe(1);
        expect(decision.coachSuggestion).toContain('完成得很好');
      });

      it('不應該在核心動作的非最後一組觸發 RPE', () => {
        const context: TrainingContext = {
          exerciseId: 'squat_1',
          exerciseType: 'squat',
          isCoreLift: true,
          isKeySet: false,
          setNumber: 2,
          totalSets: 3,
          timeElapsed: 90,
          previousRpes: [7]
        };

        const decision = engine.shouldTriggerRPE('standard_protocol', context);

        expect(decision.shouldTrigger).toBe(false);
        expect(decision.priority).toBe(0);
      });

      it('不應該在輔助動作觸發 RPE', () => {
        const context: TrainingContext = {
          exerciseId: 'bicep_curl_1',
          exerciseType: 'bicep_curl',
          isCoreLift: false,
          isKeySet: false,
          setNumber: 3,
          totalSets: 3,
          timeElapsed: 60,
          previousRpes: [6, 7]
        };

        const decision = engine.shouldTriggerRPE('standard_protocol', context);

        expect(decision.shouldTrigger).toBe(false);
        expect(decision.priority).toBe(0);
      });

      it('不應該在非核心動作類型觸發 RPE', () => {
        const context: TrainingContext = {
          exerciseId: 'lateral_raise_1',
          exerciseType: 'lateral_raise',
          isCoreLift: true,
          isKeySet: false,
          setNumber: 3,
          totalSets: 3,
          timeElapsed: 120,
          previousRpes: [6, 7]
        };

        const decision = engine.shouldTriggerRPE('standard_protocol', context);

        expect(decision.shouldTrigger).toBe(false);
        expect(decision.priority).toBe(0);
      });
    });

    describe('場景 B: 頂峰組訓練 (TOP_SET_AMRAP 協議)', () => {
      it('應該在關鍵組觸發 RPE', () => {
        const context: TrainingContext = {
          exerciseId: 'squat_1',
          exerciseType: 'squat',
          isCoreLift: true,
          isKeySet: true,
          setNumber: 2,
          totalSets: 4,
          timeElapsed: 180,
          previousRpes: [7]
        };

        const decision = engine.shouldTriggerRPE('top_set_amrap_protocol', context);

        expect(decision.shouldTrigger).toBe(true);
        expect(decision.reason).toBe('關鍵組');
        expect(decision.priority).toBe(1);
        expect(decision.coachSuggestion).toContain('頂峰組表現');
      });

      it('不應該在非關鍵組觸發 RPE', () => {
        const context: TrainingContext = {
          exerciseId: 'squat_1',
          exerciseType: 'squat',
          isCoreLift: true,
          isKeySet: false,
          setNumber: 1,
          totalSets: 4,
          timeElapsed: 120,
          previousRpes: []
        };

        const decision = engine.shouldTriggerRPE('top_set_amrap_protocol', context);

        expect(decision.shouldTrigger).toBe(false);
        expect(decision.priority).toBe(0);
      });

      it('不應該在輔助動作的關鍵組觸發 RPE', () => {
        const context: TrainingContext = {
          exerciseId: 'bicep_curl_1',
          exerciseType: 'bicep_curl',
          isCoreLift: false,
          isKeySet: true,
          setNumber: 2,
          totalSets: 3,
          timeElapsed: 90,
          previousRpes: [6]
        };

        const decision = engine.shouldTriggerRPE('top_set_amrap_protocol', context);

        expect(decision.shouldTrigger).toBe(false);
        expect(decision.priority).toBe(0);
      });
    });

    describe('場景 C: 最大力量測試 (MAX_STRENGTH_TEST 協議)', () => {
      it('應該在每次試舉都觸發 RPE', () => {
        const context: TrainingContext = {
          exerciseId: 'squat_1',
          exerciseType: 'squat',
          isCoreLift: true,
          isKeySet: false,
          setNumber: 1,
          totalSets: 5,
          timeElapsed: 30,
          previousRpes: []
        };

        const decision = engine.shouldTriggerRPE('max_strength_test_protocol', context);

        expect(decision.shouldTrigger).toBe(true);
        expect(decision.reason).toBe('每次試舉');
        expect(decision.priority).toBe(1);
        expect(decision.coachSuggestion).toContain('記錄這次試舉');
      });

      it('應該在每次試舉都觸發 RPE，無論組數', () => {
        const context: TrainingContext = {
          exerciseId: 'squat_1',
          exerciseType: 'squat',
          isCoreLift: true,
          isKeySet: false,
          setNumber: 5,
          totalSets: 5,
          timeElapsed: 300,
          previousRpes: [8, 9, 9, 10]
        };

        const decision = engine.shouldTriggerRPE('max_strength_test_protocol', context);

        expect(decision.shouldTrigger).toBe(true);
        expect(decision.reason).toBe('每次試舉');
        expect(decision.priority).toBe(1);
      });

      it('應該在輔助動作也觸發 RPE', () => {
        const context: TrainingContext = {
          exerciseId: 'squat_1',
          exerciseType: 'squat',
          isCoreLift: false,
          isKeySet: false,
          setNumber: 1,
          totalSets: 3,
          timeElapsed: 30,
          previousRpes: []
        };

        const decision = engine.shouldTriggerRPE('max_strength_test_protocol', context);

        expect(decision.shouldTrigger).toBe(true);
        expect(decision.reason).toBe('每次試舉');
        expect(decision.priority).toBe(1);
      });
    });

    describe('邊界情況測試', () => {
      it('應該處理無效的協議 ID', () => {
        const context: TrainingContext = {
          exerciseId: 'squat_1',
          exerciseType: 'squat',
          isCoreLift: true,
          isKeySet: false,
          setNumber: 3,
          totalSets: 3,
          timeElapsed: 120,
          previousRpes: [7, 8]
        };

        const decision = engine.shouldTriggerRPE('invalid_protocol', context);

        expect(decision.shouldTrigger).toBe(false);
        expect(decision.priority).toBe(0);
      });

      it('應該處理空上下文', () => {
        const context: TrainingContext = {
          exerciseId: '',
          exerciseType: '',
          isCoreLift: false,
          isKeySet: false,
          setNumber: 0,
          totalSets: 0,
          timeElapsed: 0,
          previousRpes: []
        };

        const decision = engine.shouldTriggerRPE('standard_protocol', context);

        expect(decision.shouldTrigger).toBe(false);
        expect(decision.priority).toBe(0);
      });

      it('應該處理高強度組觸發條件', () => {
        const context: TrainingContext = {
          exerciseId: 'squat_1',
          exerciseType: 'squat',
          isCoreLift: true,
          isKeySet: false,
          setNumber: 2,
          totalSets: 4,
          timeElapsed: 90, // 超過 60 秒
          previousRpes: [7]
        };

        // 需要添加高強度組規則到標準協議
        const decision = engine.shouldTriggerRPE('standard_protocol', context);

        // 標準協議沒有高強度組規則，所以不應該觸發
        expect(decision.shouldTrigger).toBe(false);
      });
    });
  });

  describe('適應性規則引擎測試', () => {
    describe('場景 A: 進展順利', () => {
      it('應該在力量持續增長時建議增加強度', () => {
        const context = {
          rpeData: [
            { rpe: 7, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            { rpe: 7, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
            { rpe: 7, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
          ],
          fatigueLevel: 6.0,
          plateauScore: 0.3, // 低平台期分數表示進展良好
          volumeIncrease: 0.05
        };

        const suggestions = engine.evaluateAdaptiveRules('standard_protocol', context);

        // 應該沒有負面建議
        const negativeSuggestions = suggestions.filter(s => 
          s.type === 'load_adjustment' && 
          s.implementation.adjustmentPercentage < 0
        );
        expect(negativeSuggestions).toHaveLength(0);
      });
    });

    describe('場景 B: 遇到阻力', () => {
      it('應該在 RPE 趨勢上升時建議降低負荷', () => {
        const context = {
          rpeData: [
            { rpe: 7, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            { rpe: 8, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
            { rpe: 9, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
          ],
          fatigueLevel: 7.5,
          plateauScore: 0.6,
          volumeIncrease: 0.1
        };

        const suggestions = engine.evaluateAdaptiveRules('standard_protocol', context);

        const loadAdjustmentSuggestions = suggestions.filter(s => s.type === 'load_adjustment');
        expect(loadAdjustmentSuggestions.length).toBeGreaterThan(0);
        
        const negativeAdjustment = loadAdjustmentSuggestions.find(s => 
          s.implementation.adjustmentPercentage < 0
        );
        expect(negativeAdjustment).toBeDefined();
        expect(negativeAdjustment?.description).toContain('降低負荷');
      });

      it('應該在高疲勞水平時建議休息', () => {
        const context = {
          rpeData: [],
          fatigueLevel: 8.5, // 高疲勞
          plateauScore: 0.4,
          volumeIncrease: 0.05
        };

        const suggestions = engine.evaluateAdaptiveRules('standard_protocol', context);

        const restSuggestions = suggestions.filter(s => s.type === 'rest_recommendation');
        expect(restSuggestions.length).toBeGreaterThan(0);
        
        const restSuggestion = restSuggestions[0];
        expect(restSuggestion.description).toContain('增加休息');
        expect(restSuggestion.implementation.additionalRestDays).toBe(1);
      });
    });

    describe('場景 C: 減載協議', () => {
      it('應該在滿足減載條件時建議減載', () => {
        const context = {
          rpeData: [
            { rpe: 7, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
            { rpe: 8, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            { rpe: 9, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
            { rpe: 9, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
          ],
          fatigueLevel: 8.5,
          plateauScore: 0.8, // 高平台期分數
          volumeIncrease: 0.15,
          timeElapsed: 120
        };

        const suggestions = engine.evaluateAdaptiveRules('standard_protocol', context);

        // 應該有負荷調整建議
        const loadAdjustmentSuggestions = suggestions.filter(s => s.type === 'load_adjustment');
        expect(loadAdjustmentSuggestions.length).toBeGreaterThan(0);

        // 應該有休息建議
        const restSuggestions = suggestions.filter(s => s.type === 'rest_recommendation');
        expect(restSuggestions.length).toBeGreaterThan(0);
      });
    });

    describe('邊界情況測試', () => {
      it('應該處理空上下文', () => {
        const context = {};

        const suggestions = engine.evaluateAdaptiveRules('standard_protocol', context);

        expect(suggestions).toHaveLength(0);
      });

      it('應該處理無效的協議 ID', () => {
        const context = {
          rpeData: [
            { rpe: 7, timestamp: new Date() },
            { rpe: 8, timestamp: new Date() },
            { rpe: 9, timestamp: new Date() }
          ],
          fatigueLevel: 8.0
        };

        const suggestions = engine.evaluateAdaptiveRules('invalid_protocol', context);

        expect(suggestions).toHaveLength(0);
      });

      it('應該處理不完整的 RPE 數據', () => {
        const context = {
          rpeData: [
            { rpe: 7, timestamp: new Date() }
          ],
          fatigueLevel: 6.0
        };

        const suggestions = engine.evaluateAdaptiveRules('standard_protocol', context);

        // 不完整的數據不應該觸發 RPE 趨勢規則
        const trendSuggestions = suggestions.filter(s => 
          s.title.includes('RPE 趨勢')
        );
        expect(trendSuggestions).toHaveLength(0);
      });
    });
  });

  describe('協議管理測試', () => {
    it('應該獲取所有協議', () => {
      const protocols = engine.getAllProtocols();

      expect(protocols).toHaveLength(3);
      expect(protocols.map(p => p.type)).toContain(ProtocolType.STANDARD);
      expect(protocols.map(p => p.type)).toContain(ProtocolType.TOP_SET_AMRAP);
      expect(protocols.map(p => p.type)).toContain(ProtocolType.MAX_STRENGTH_TEST);
    });

    it('應該根據 ID 獲取特定協議', () => {
      const standardProtocol = engine.getProtocol('standard_protocol');
      expect(standardProtocol).toBeDefined();
      expect(standardProtocol?.type).toBe(ProtocolType.STANDARD);

      const topSetProtocol = engine.getProtocol('top_set_amrap_protocol');
      expect(topSetProtocol).toBeDefined();
      expect(topSetProtocol?.type).toBe(ProtocolType.TOP_SET_AMRAP);

      const maxStrengthProtocol = engine.getProtocol('max_strength_test_protocol');
      expect(maxStrengthProtocol).toBeDefined();
      expect(maxStrengthProtocol?.type).toBe(ProtocolType.MAX_STRENGTH_TEST);
    });

    it('應該根據訓練日類型獲取協議', () => {
      const regularProtocol = engine.getProtocolForTrainingDay('regular');
      expect(regularProtocol.type).toBe(ProtocolType.STANDARD);

      const hypertrophyProtocol = engine.getProtocolForTrainingDay('hypertrophy');
      expect(hypertrophyProtocol.type).toBe(ProtocolType.TOP_SET_AMRAP);

      const maxEffortProtocol = engine.getProtocolForTrainingDay('max_effort');
      expect(maxEffortProtocol.type).toBe(ProtocolType.MAX_STRENGTH_TEST);
    });
  });

  describe('性能測試', () => {
    it('應該快速處理 RPE 觸發決策', () => {
      const context: TrainingContext = {
        exerciseId: 'squat_1',
        exerciseType: 'squat',
        isCoreLift: true,
        isKeySet: false,
        setNumber: 3,
        totalSets: 3,
        timeElapsed: 120,
        previousRpes: [7, 8]
      };

      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        engine.shouldTriggerRPE('standard_protocol', context);
      }
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(100); // 應該在 100ms 內完成 1000 次決策
    });

    it('應該快速處理適應性規則評估', () => {
      const context = {
        rpeData: [
          { rpe: 7, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          { rpe: 8, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
          { rpe: 9, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
        ],
        fatigueLevel: 8.0,
        plateauScore: 0.6,
        volumeIncrease: 0.1
      };

      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        engine.evaluateAdaptiveRules('standard_protocol', context);
      }
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(200); // 應該在 200ms 內完成 1000 次評估
    });
  });
});
