import { z } from 'zod';

// RPE数据提交Schema
export const RPEDataSubmissionSchema = z.object({
  exerciseId: z.string().min(1, 'Exercise ID is required'),
  setNumber: z.number().int().min(1, 'Set number must be at least 1'),
  reps: z.number().int().min(1, 'Reps must be at least 1'),
  weight: z.number().positive('Weight must be positive'),
  rpe: z.number().min(1, 'RPE must be at least 1').max(10, 'RPE must be at most 10'),
  userId: z.string().uuid('Invalid user ID format').optional(),
  sessionId: z.string().optional(),
  notes: z.string().max(500).optional(),
  timestamp: z.string().datetime().optional(),
});

// RPE数据查询Schema
export const RPEDataQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format').optional(),
  exerciseId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

// 用户偏好Schema
export const UserPreferencesSchema = z.object({
  unit: z.enum(['lbs', 'kg'], { 
    errorMap: () => ({ message: 'Unit must be either "lbs" or "kg"' })
  }),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  notifications: z.boolean().optional(),
  language: z.string().length(2).optional(), // ISO 639-1 language code
  timezone: z.string().optional(),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
  weightUnit: z.enum(['lbs', 'kg']).optional(),
  distanceUnit: z.enum(['miles', 'kilometers']).optional(),
});

// 用户偏好更新Schema（部分更新）
export const UserPreferencesUpdateSchema = UserPreferencesSchema.partial();

// 导出类型
export type RPEDataSubmission = z.infer<typeof RPEDataSubmissionSchema>;
export type RPEDataQuery = z.infer<typeof RPEDataQuerySchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UserPreferencesUpdate = z.infer<typeof UserPreferencesUpdateSchema>;

// 安全解析函数
export function safeParseRPEDataSubmission(data: unknown): {
  success: boolean;
  data?: RPEDataSubmission;
  error?: z.ZodError;
} {
  const result = RPEDataSubmissionSchema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      error: result.error,
    };
  }
}

export function safeParseRPEDataQuery(data: unknown): {
  success: boolean;
  data?: RPEDataQuery;
  error?: z.ZodError;
} {
  const result = RPEDataQuerySchema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      error: result.error,
    };
  }
}

export function safeParseUserPreferencesUpdate(data: unknown): {
  success: boolean;
  data?: UserPreferencesUpdate;
  error?: z.ZodError;
} {
  const result = UserPreferencesUpdateSchema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      error: result.error,
    };
  }
}
