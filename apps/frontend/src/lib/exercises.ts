// src/lib/exercises.ts

import { Exercise } from './types';

/**
 * 模擬的訓練動作數據庫。
 * 每個動作都包含了 isCoreLift 字段以區分核心和輔助動作。
 */
export const EXERCISE_DATABASE: Exercise[] = [
  // 核心複合動作 (isCoreLift: true)
  {
    id: 'squat',
    name: 'Barbell Squat',
    muscleGroup: 'Legs',
    isCoreLift: true,
  },
  {
    id: 'bench_press',
    name: 'Bench Press',
    muscleGroup: 'Chest',
    isCoreLift: true,
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'Back',
    isCoreLift: true,
  },
  {
    id: 'overhead_press',
    name: 'Overhead Press',
    muscleGroup: 'Shoulders',
    isCoreLift: true,
  },

  // 輔助/孤立動作 (isCoreLift: false)
  {
    id: 'leg_press',
    name: 'Leg Press',
    muscleGroup: 'Legs',
    isCoreLift: false,
  },
  {
    id: 'bicep_curl',
    name: 'Bicep Curl',
    muscleGroup: 'Arms',
    isCoreLift: false,
  },
  {
    id: 'tricep_extension',
    name: 'Tricep Extension',
    muscleGroup: 'Arms',
    isCoreLift: false,
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    isCoreLift: false,
  },
];
