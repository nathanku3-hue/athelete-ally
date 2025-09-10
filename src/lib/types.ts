// src/lib/types.ts

/**
 * 定義單個訓練動作的數據結構
 */
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  /**
   * 標記此動作是否為核心複合動作。
   * true: 核心動作 (如深蹲)，需要在最後一組後記錄 RPE。
   * false: 輔助動作，無需記錄 RPE。
   */
  isCoreLift: boolean;
}

/**
 * 定義單個訓練組的數據結構
 */
export interface Set {
  setNumber: number;
  reps: number | null;
  weight: number | null;
  rpe: number | null; // 只有核心動作的最後一組才需要
  isComplete: boolean;
}

/**
 * 定義一個完整的訓練日計畫
 */
export interface WorkoutSession {
  id: string;
  date: string;
  fatigueScore: number | null;
  sessionRPE: number | null;
  exercises: {
    exerciseId: string;
    sets: Set[];
  }[];
}
