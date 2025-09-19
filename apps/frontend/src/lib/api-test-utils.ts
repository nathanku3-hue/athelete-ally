// API测试工具类
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface PlanGenerationRequest {
  userId: string;
  preferences: {
    goal: string;
    experience: string;
    duration?: number;
    frequency?: number;
    equipment?: string[];
  };
}

export interface PlanGenerationResponse {
  planId: string;
  name: string;
  description: string;
  difficulty: string;
  duration: number;
  exercises: Array<{
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    restTime: number;
  }>;
}

export interface RPERequest {
  planId: string;
  exerciseId: string;
  rpe: number;
  actualReps?: number;
  actualWeight?: number;
  notes?: string;
}

export interface PerformanceRequest {
  planId: string;
  metrics: {
    volume: number;
    intensity: number;
    duration: number;
    calories?: number;
  };
  timestamp?: string;
}

export class APITestUtils {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  /**
   * 测试训练计划生成API
   */
  static async testPlanGeneration(
    userId: string, 
    preferences: PlanGenerationRequest['preferences']
  ): Promise<APIResponse<PlanGenerationResponse>> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/plans/enhanced/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getTestToken()}`
        },
        body: JSON.stringify({ userId, preferences })
      });

      const data = await response.json();
      
      // 转换数据结构以匹配测试期望
      let transformedData = data;
      if (response.ok && data.data) {
        const exercises = data.data.microcycles?.[0]?.sessions?.[0]?.exercises;
        transformedData = {
          planId: data.data.id,
          name: data.data.name,
          description: data.data.description,
          exercises: Array.isArray(exercises) ? exercises : (exercises ? [exercises] : [])
        };
      }
      
      return {
        success: response.ok,
        data: response.ok ? transformedData : undefined,
        error: response.ok ? undefined : data.message || 'Unknown error',
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  }

  /**
   * 测试RPE反馈收集API
   */
  static async testRPERequest(
    planId: string,
    exerciseId: string,
    rpe: number,
    additionalData?: Partial<RPERequest>
  ): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/plans/feedback/rpe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getTestToken()}`
        },
        body: JSON.stringify({
          planId,
          exerciseId,
          rpe,
          ...additionalData
        })
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message || 'Unknown error',
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  }

  /**
   * 测试性能指标收集API
   */
  static async testPerformanceRequest(
    planId: string,
    metrics: PerformanceRequest['metrics']
  ): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/plans/feedback/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getTestToken()}`
        },
        body: JSON.stringify({
          planId,
          metrics,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message || 'Unknown error',
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  }

  /**
   * 测试适应性调整API
   */
  static async testAdaptationsRequest(planId: string): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/plans/${planId}/adaptations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getTestToken()}`
        }
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message || 'Unknown error',
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  }

  /**
   * 测试应用调整API
   */
  static async testApplyAdaptationsRequest(
    planId: string,
    adaptationId: string
  ): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/plans/${planId}/adaptations/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getTestToken()}`
        },
        body: JSON.stringify({ adaptationId })
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message || 'Unknown error',
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  }

  /**
   * 测试健康检查API
   */
  static async testHealthCheck(): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message || 'Unknown error',
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  }

  /**
   * 测试API文档端点
   */
  static async testAPIDocs(): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/docs`);
      
      return {
        success: response.ok,
        data: response.ok ? 'API docs available' : undefined,
        error: response.ok ? undefined : 'API docs not available',
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  }

  /**
   * 测试监控指标端点
   */
  static async testMetrics(): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/metrics`);
      
      return {
        success: response.ok,
        data: response.ok ? 'Metrics available' : undefined,
        error: response.ok ? undefined : 'Metrics not available',
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  }

  /**
   * 批量测试所有API端点
   */
  static async testAllEndpoints(): Promise<{
    [key: string]: APIResponse;
  }> {
    const results: { [key: string]: APIResponse } = {};

    // 测试健康检查
    results.healthCheck = await this.testHealthCheck();

    // 测试API文档
    results.apiDocs = await this.testAPIDocs();

    // 测试监控指标
    results.metrics = await this.testMetrics();

    // 测试训练计划生成
    results.planGeneration = await this.testPlanGeneration('test_user_123', {
      goal: 'strength',
      experience: 'intermediate',
      duration: 60,
      frequency: 3,
      equipment: ['barbell', 'dumbbells']
    });

    // 如果计划生成成功，测试其他相关API
    if (results.planGeneration.success && results.planGeneration.data) {
      const planId = results.planGeneration.data.planId;
      const exerciseId = results.planGeneration.data.exercises[0]?.id;

      if (exerciseId) {
        // 测试RPE反馈
        results.rpeRequest = await this.testRPERequest(planId, exerciseId, 8, {
          actualReps: 10,
          actualWeight: 100,
          notes: 'Test feedback'
        });

        // 测试性能指标
        results.performanceRequest = await this.testPerformanceRequest(planId, {
          volume: 1000,
          intensity: 0.8,
          duration: 60,
          calories: 300
        });

        // 测试适应性调整
        results.adaptations = await this.testAdaptationsRequest(planId);
      }
    }

    return results;
  }

  /**
   * 获取测试用的认证token
   */
  private static getTestToken(): string {
    // 在实际测试中，这里应该返回有效的测试token
    return 'test_token_123';
  }

  /**
   * 验证API响应格式
   */
  static validateAPIResponse(response: APIResponse, expectedFields?: string[]): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    if (typeof response.success !== 'boolean') {
      return false;
    }

    if (typeof response.status !== 'number') {
      return false;
    }

    if (expectedFields) {
      for (const field of expectedFields) {
        if (!(field in response)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 生成测试报告
   */
  static generateTestReport(results: { [key: string]: APIResponse }): string {
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(result => result.success).length;
    const failedTests = totalTests - passedTests;

    let report = `\n=== API测试报告 ===\n`;
    report += `总测试数: ${totalTests}\n`;
    report += `通过: ${passedTests}\n`;
    report += `失败: ${failedTests}\n`;
    report += `成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%\n\n`;

    for (const [testName, result] of Object.entries(results)) {
      report += `${testName}: ${result.success ? '✅ 通过' : '❌ 失败'}\n`;
      if (!result.success) {
        report += `  错误: ${result.error}\n`;
        report += `  状态码: ${result.status}\n`;
      }
    }

    return report;
  }
}

