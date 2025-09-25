import { z } from 'zod';
import { 
  BaseApiResponse, 
  ErrorResponse, 
  GetTrainingPlanResponse,
  GetUserProfileResponse,
  GetRPEDataResponse,
  GetFatigueAssessmentResponse
} from './api-schemas';

/**
 * API客戶端驗證層
 * 提供類型安全的API調用和響應驗證
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public received: unknown,
    public expected: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 驗證API響應的通用函數
 */
export function validateApiResponse<T>(
  response: unknown,
  schema: z.ZodType<T>
): T {
  try {
    return schema.parse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        `API響應驗證失敗: ${firstError.message}`,
        firstError.path.join('.'),
        'unknown',
        'unknown'
      );
    }
    throw error;
  }
}

/**
 * 安全的API調用包裝器
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<Response>,
  responseSchema: z.ZodType<T>
): Promise<T> {
  try {
    const response = await apiCall();
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorSchema = ErrorResponse.safeParse(errorData);
      
      if (errorSchema.success) {
        const { error } = errorSchema.data;
        throw new ApiError(
          error.message,
          response.status,
          error.code,
          error.details
        );
      } else {
        throw new ApiError(
          `API請求失敗: ${response.status} ${response.statusText}`,
          response.status
        );
      }
    }
    
    const data = await response.json();
    return validateApiResponse(data, responseSchema);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `網絡請求失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      0
    );
  }
}

/**
 * 訓練計劃API客戶端
 */
export class TrainingPlanApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }
  
  async getTrainingPlan(planId: string) {
    return safeApiCall(
      () => fetch(`${this.baseUrl}/plans/${planId}`),
      GetTrainingPlanResponse
    );
  }
  
  async getCurrentTrainingPlan() {
    return safeApiCall(
      () => fetch(`${this.baseUrl}/plans/current`),
      GetTrainingPlanResponse
    );
  }
  
  async getTrainingPlanStatus(planId: string) {
    return safeApiCall(
      () => fetch(`${this.baseUrl}/plans/status?planId=${planId}`),
      BaseApiResponse
    );
  }
}

/**
 * 用戶資料API客戶端
 */
export class UserProfileApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }
  
  async getUserProfile() {
    return safeApiCall(
      () => fetch(`${this.baseUrl}/user/profile`),
      GetUserProfileResponse
    );
  }
  
  async updateUserPreferences(preferences: unknown) {
    return safeApiCall(
      () => fetch(`${this.baseUrl}/user/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      }),
      BaseApiResponse
    );
  }
}

/**
 * RPE數據API客戶端
 */
export class RPEDataApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }
  
  async getRPEData(exerciseId?: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (exerciseId) params.append('exerciseId', exerciseId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return safeApiCall(
      () => fetch(`${this.baseUrl}/rpe-data?${params}`),
      GetRPEDataResponse
    );
  }
  
  async submitRPEData(rpeData: unknown) {
    return safeApiCall(
      () => fetch(`${this.baseUrl}/rpe-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpeData),
      }),
      BaseApiResponse
    );
  }
}

/**
 * 疲勞評估API客戶端
 */
export class FatigueAssessmentApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }
  
  async getFatigueStatus() {
    return safeApiCall(
      () => fetch(`${this.baseUrl}/fatigue/status`),
      GetFatigueAssessmentResponse
    );
  }
  
  async submitFatigueAssessment(assessment: unknown) {
    return safeApiCall(
      () => fetch(`${this.baseUrl}/fatigue/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessment),
      }),
      BaseApiResponse
    );
  }
}

/**
 * 統一的API客戶端
 */
export class ApiClient {
  public trainingPlan: TrainingPlanApiClient;
  public userProfile: UserProfileApiClient;
  public rpeData: RPEDataApiClient;
  public fatigueAssessment: FatigueAssessmentApiClient;
  
  constructor(baseUrl: string = '/api/v1') {
    this.trainingPlan = new TrainingPlanApiClient(baseUrl);
    this.userProfile = new UserProfileApiClient(baseUrl);
    this.rpeData = new RPEDataApiClient(baseUrl);
    this.fatigueAssessment = new FatigueAssessmentApiClient(baseUrl);
  }
}

// 默認API客戶端實例
export const apiClient = new ApiClient();

/**
 * 錯誤處理工具函數
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ValidationError) {
    return `數據驗證錯誤: ${error.message} (字段: ${error.field})`;
  }
  
  if (error instanceof ApiError) {
    return `API錯誤: ${error.message} (狀態碼: ${error.status})`;
  }
  
  if (error instanceof Error) {
    return `未知錯誤: ${error.message}`;
  }
  
  return '發生未知錯誤';
}

/**
 * 開發環境下的調試工具
 */
export function logApiError(error: unknown, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 API錯誤${context ? ` - ${context}` : ''}`);
    console.error('錯誤詳情:', error);
    
    if (error instanceof ValidationError) {
      console.error('驗證錯誤詳情:', {
        field: error.field,
        received: error.received,
        expected: error.expected,
      });
    }
    
    if (error instanceof ApiError) {
      console.error('API錯誤詳情:', {
        status: error.status,
        code: error.code,
        details: error.details,
      });
    }
    
    console.groupEnd();
  }
}









