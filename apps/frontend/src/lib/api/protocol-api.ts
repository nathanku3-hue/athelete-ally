/**
 * Protocol API客户端
 * 提供Protocol相关的API接口调用
 */

import { Protocol, ProtocolSummary, CreateProtocolRequest, UpdateProtocolRequest, ProtocolFilters, PaginatedResponse, Block, BlockSession } from '@athlete-ally/protocol-types';

// API配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// 请求配置接口
interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

// API错误类
class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'APIError';
  }
}

// 基础请求函数
async function request<T>(endpoint: string, config: RequestConfig): Promise<T> {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  // 添加查询参数
  if (config.params) {
    Object.entries(config.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  const response = await fetch(url.toString(), {
    method: config.method,
    headers: {
      ...DEFAULT_HEADERS,
      ...config.headers,
    },
    body: config.body ? JSON.stringify(config.body) : undefined,
  });
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    
    throw new APIError(response.status, response.statusText, errorData);
  }
  
  // 处理空响应
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

// Protocol API客户端类
export class ProtocolAPIClient {
  /**
   * 获取协议列表
   */
  async getProtocols(filters: ProtocolFilters = {}): Promise<PaginatedResponse<ProtocolSummary>> {
    return request<PaginatedResponse<ProtocolSummary>>('/protocols', {
      method: 'GET',
      params: filters,
    });
  }
  
  /**
   * 获取单个协议详情
   */
  async getProtocol(id: string, includeBlocks = false): Promise<Protocol> {
    return request<Protocol>(`/protocols/${id}`, {
      method: 'GET',
      params: { includeBlocks },
    });
  }
  
  /**
   * 创建协议
   */
  async createProtocol(data: CreateProtocolRequest): Promise<Protocol> {
    return request<Protocol>('/protocols', {
      method: 'POST',
      body: data,
    });
  }
  
  /**
   * 更新协议
   */
  async updateProtocol(id: string, data: UpdateProtocolRequest): Promise<Protocol> {
    return request<Protocol>(`/protocols/${id}`, {
      method: 'PUT',
      body: data,
    });
  }
  
  /**
   * 删除协议
   */
  async deleteProtocol(id: string): Promise<void> {
    return request<void>(`/protocols/${id}`, {
      method: 'DELETE',
    });
  }
  
  /**
   * 搜索协议
   */
  async searchProtocols(query: string, filters: ProtocolFilters = {}): Promise<ProtocolSummary[]> {
    return request<ProtocolSummary[]>('/protocols/search', {
      method: 'GET',
      params: { q: query, ...filters },
    });
  }
  
  /**
   * 批量删除协议
   */
  async batchDeleteProtocols(ids: string[]): Promise<{ deleted: string[]; failed: string[] }> {
    return request<{ deleted: string[]; failed: string[] }>('/protocols/batch', {
      method: 'DELETE',
      body: { ids },
    });
  }
  
  /**
   * 批量更新协议
   */
  async batchUpdateProtocols(updates: Array<{ id: string; data: UpdateProtocolRequest }>): Promise<{ updated: string[]; failed: string[] }> {
    return request<{ updated: string[]; failed: string[] }>('/protocols/batch', {
      method: 'PUT',
      body: { updates },
    });
  }
  
  /**
   * 复制协议
   */
  async duplicateProtocol(id: string, name?: string): Promise<Protocol> {
    return request<Protocol>(`/protocols/${id}/duplicate`, {
      method: 'POST',
      body: { name },
    });
  }
  
  /**
   * 获取协议统计信息
   */
  async getProtocolStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    recent: ProtocolSummary[];
  }> {
    return request<{
      total: number;
      byCategory: Record<string, number>;
      byDifficulty: Record<string, number>;
      recent: ProtocolSummary[];
    }>('/protocols/stats', {
      method: 'GET',
    });
  }
  
  /**
   * 获取协议的执行历史
   */
  async getProtocolExecutions(protocolId: string): Promise<Array<{
    id: string;
    userId: string;
    startedAt: string;
    completedAt?: string;
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    progress: number;
  }>> {
    return request<Array<{
      id: string;
      userId: string;
      startedAt: string;
      completedAt?: string;
      status: 'active' | 'completed' | 'paused' | 'cancelled';
      progress: number;
    }>>(`/protocols/${protocolId}/executions`, {
      method: 'GET',
    });
  }
  
  /**
   * 开始执行协议
   */
  async startProtocolExecution(protocolId: string, userId: string): Promise<{
    executionId: string;
    status: 'active';
    startedAt: string;
  }> {
    return request<{
      executionId: string;
      status: 'active';
      startedAt: string;
    }>(`/protocols/${protocolId}/executions`, {
      method: 'POST',
      body: { userId },
    });
  }
  
  /**
   * 更新协议执行状态
   */
  async updateProtocolExecution(executionId: string, data: {
    status?: 'active' | 'completed' | 'paused' | 'cancelled';
    progress?: number;
    notes?: string;
  }): Promise<{
    executionId: string;
    status: string;
    progress: number;
    updatedAt: string;
  }> {
    return request<{
      executionId: string;
      status: string;
      progress: number;
      updatedAt: string;
    }>(`/protocols/executions/${executionId}`, {
      method: 'PATCH',
      body: data,
    });
  }
  
  /**
   * 获取协议的所有块
   */
  async getProtocolBlocks(protocolId: string): Promise<Block[]> {
    return request<Block[]>(`/protocols/${protocolId}/blocks`, {
      method: 'GET',
    });
  }
  
  /**
   * 重新排序协议块
   */
  async reorderProtocolBlocks(protocolId: string, blockIds: string[]): Promise<void> {
    return request<void>(`/protocols/${protocolId}/blocks/reorder`, {
      method: 'PUT',
      body: { blockIds },
    });
  }
}

// Block API客户端类
export class BlockAPIClient {
  /**
   * 获取块详情
   */
  async getBlock(id: string, includeSessions = false): Promise<Block> {
    return request<Block>(`/blocks/${id}`, {
      method: 'GET',
      params: { includeSessions },
    });
  }
  
  /**
   * 创建块
   */
  async createBlock(protocolId: string, data: {
    name: string;
    description?: string;
    duration: number;
    phase: string;
    intensity: string;
    volume: string;
    parameters?: any;
    rules?: any;
  }): Promise<Block> {
    return request<Block>(`/protocols/${protocolId}/blocks`, {
      method: 'POST',
      body: data,
    });
  }
  
  /**
   * 更新块
   */
  async updateBlock(id: string, data: {
    name?: string;
    description?: string;
    duration?: number;
    phase?: string;
    intensity?: string;
    volume?: string;
    parameters?: any;
    rules?: any;
  }): Promise<Block> {
    return request<Block>(`/blocks/${id}`, {
      method: 'PUT',
      body: data,
    });
  }
  
  /**
   * 删除块
   */
  async deleteBlock(id: string): Promise<void> {
    return request<void>(`/blocks/${id}`, {
      method: 'DELETE',
    });
  }
  
  /**
   * 获取块的所有会话
   */
  async getBlockSessions(blockId: string): Promise<BlockSession[]> {
    return request<BlockSession[]>(`/blocks/${blockId}/sessions`, {
      method: 'GET',
    });
  }
  
  /**
   * 创建块会话
   */
  async createBlockSession(blockId: string, data: {
    name: string;
    dayOfWeek: number;
    order: number;
    exercises: any[];
    duration?: number;
    notes?: string;
    intensity?: number;
    volume?: number;
    rpe?: number;
  }): Promise<BlockSession> {
    return request<BlockSession>(`/blocks/${blockId}/sessions`, {
      method: 'POST',
      body: data,
    });
  }
  
  /**
   * 更新块会话
   */
  async updateBlockSession(id: string, data: {
    name?: string;
    dayOfWeek?: number;
    order?: number;
    exercises?: any[];
    duration?: number;
    notes?: string;
    intensity?: number;
    volume?: number;
    rpe?: number;
  }): Promise<BlockSession> {
    return request<BlockSession>(`/blocks/sessions/${id}`, {
      method: 'PUT',
      body: data,
    });
  }
  
  /**
   * 删除块会话
   */
  async deleteBlockSession(id: string): Promise<void> {
    return request<void>(`/blocks/sessions/${id}`, {
      method: 'DELETE',
    });
  }
}

// 创建API客户端实例
export const protocolAPI = new ProtocolAPIClient();
export const blockAPI = new BlockAPIClient();

// 导出错误类
export { APIError };

// 导出类型
export type { RequestConfig };
