// Generic API simulation helpers
export async function simulateApiCall<T = unknown>(
  method: string, 
  endpoint: string, 
  data?: unknown
): Promise<{ status: number; data: T }> {
  // 模擬 API 調用
  const status = method === 'POST' ? 201 : 200;
  
  // 根據端點返回不同的模擬數據
  let responseData: Record<string, unknown> = {
    id: 'mock-id',
    ...(data && typeof data === 'object' ? data : {})
  };

  if (endpoint.includes('/weekly-review/') && method === 'GET') {
    responseData = {
      ...responseData,
      coreLiftAnalysis: [{ exerciseId: 'squat', averageRpe: 7.67 }],
      adjustments: [{ id: 'adj-123', type: 'intensity_increase' }]
    };
  } else if (endpoint.includes('/progress/')) {
    responseData = {
      ...responseData,
      weeklyData: [
        { weekNumber: 1, weeklyTrainingLoad: 400 },
        { weekNumber: 2, weeklyTrainingLoad: 450 }
      ],
      trends: { trainingLoadTrend: 'increasing' }
    };
  } else if (endpoint.includes('/recovery-notification/trigger')) {
    responseData = {
      ...responseData,
      notificationId: 'notif-123'
    };
  } else if (endpoint.includes('/recovery-notification/') && method === 'GET') {
    responseData = {
      ...responseData,
      notifications: [{ id: 'notif-123', type: 'carbohydrate' }]
    };
  } else if (endpoint.includes('/data-consistency/')) {
    responseData = {
      ...responseData,
      isConsistent: true
    };
  } else if (endpoint.includes('/weekly-review/') && method === 'PUT' && endpoint.includes('/apply')) {
    responseData = {
      ...responseData,
      status: 'applied'
    };
  }

  return {
    status,
    data: responseData as T
  };
}

export async function simulateServiceCall<T = unknown>(): Promise<{ status: string; data: T }> {
  // 模擬服務間通信
  return {
    status: 'success',
    data: { processed: true } as T
  };
}

export async function simulateServiceFailure<E = unknown>(): Promise<{ status: string; error: E }> {
  // 模擬服務失敗
  return {
    status: 'error',
    error: { message: 'Service temporarily unavailable' } as E
  };
}

export async function simulateRetryOperation<T = unknown>(): Promise<{ attempts: number; data: T }> {
  // 模擬重試操作
  return {
    attempts: 2,
    data: { success: true } as T
  };
}

