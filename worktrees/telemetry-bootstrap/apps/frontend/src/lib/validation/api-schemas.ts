import { z } from 'zod';

/**
 * API響應數據驗證Schema
 * 用於確保後端API響應的數據結構符合前端預期
 */

// 基礎響應結構
export const BaseApiResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

// 錯誤響應
export const ErrorResponse = BaseApiResponse.extend({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
  }),
});

// 成功響應
export const SuccessResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  BaseApiResponse.extend({
    success: z.literal(true),
    data: dataSchema,
  });

// 訓練計劃相關Schema
export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['squat', 'bench', 'deadlift', 'overhead_press', 'accessory']),
  isCoreLift: z.boolean(),
  muscleGroups: z.array(z.string()),
  equipment: z.array(z.string()),
  instructions: z.array(z.string()).optional(),
});

export const SetSchema = z.object({
  id: z.string(),
  reps: z.number().int().positive(),
  weight: z.number().positive(),
  rpe: z.number().min(1).max(10).optional(),
  restTime: z.number().int().positive().optional(),
  completed: z.boolean().default(false),
});

export const WorkoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string().datetime(),
  exercises: z.array(ExerciseSchema),
  sets: z.array(SetSchema),
  duration: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const TrainingPlanSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  duration: z.number().int().positive(), // 週數
  workouts: z.array(WorkoutSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 用戶偏好Schema
export const UserPreferencesSchema = z.object({
  weightUnit: z.enum(['lbs', 'kg']),
  distanceUnit: z.enum(['miles', 'km']),
  temperatureUnit: z.enum(['fahrenheit', 'celsius']),
  timezone: z.string(),
  notifications: z.object({
    workoutReminders: z.boolean(),
    progressUpdates: z.boolean(),
    systemUpdates: z.boolean(),
  }),
});

// 用戶資料Schema
export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  preferences: UserPreferencesSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// RPE數據Schema
export const RPEDataSchema = z.object({
  id: z.string(),
  userId: z.string(),
  exerciseId: z.string(),
  setNumber: z.number().int().positive(),
  rpe: z.number().min(1).max(10),
  weight: z.number().positive(),
  reps: z.number().int().positive(),
  timestamp: z.string().datetime(),
  notes: z.string().optional(),
});

// 疲勞評估Schema
export const FatigueAssessmentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  score: z.number().min(1).max(10),
  factors: z.object({
    sleep: z.number().min(1).max(10),
    stress: z.number().min(1).max(10),
    soreness: z.number().min(1).max(10),
    motivation: z.number().min(1).max(10),
  }),
  timestamp: z.string().datetime(),
  notes: z.string().optional(),
});

// API端點響應Schema
export const GetTrainingPlanResponse = SuccessResponse(TrainingPlanSchema);
export const GetUserProfileResponse = SuccessResponse(UserProfileSchema);
export const GetRPEDataResponse = SuccessResponse(z.array(RPEDataSchema));
export const GetFatigueAssessmentResponse = SuccessResponse(FatigueAssessmentSchema);

// 通用列表響應
export const ListResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  SuccessResponse(z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().optional(),
  }));

// 類型導出
export type BaseApiResponse = z.infer<typeof BaseApiResponse>;
export type ErrorResponse = z.infer<typeof ErrorResponse>;
export type SuccessResponse<T> = BaseApiResponse & {
  success: true;
  data: T;
};
export type Exercise = z.infer<typeof ExerciseSchema>;
export type Set = z.infer<typeof SetSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type TrainingPlan = z.infer<typeof TrainingPlanSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type RPEData = z.infer<typeof RPEDataSchema>;
export type FatigueAssessment = z.infer<typeof FatigueAssessmentSchema>;









