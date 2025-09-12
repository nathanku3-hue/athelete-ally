/**
 * 权限系统API客户端
 * 提供Protocol和Block权限管理的API接口
 */

import { Protocol, ProtocolShare, Permission, Block } from '@athlete-ally/protocol-types';

// API配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// 权限相关类型
export interface PermissionCheck {
  resourceId: string;
  resourceType: 'protocol' | 'block' | 'session';
  permission: Permission;
  userId: string;
}

export interface ShareRequest {
  protocolId: string;
  sharedWith: string;
  permissions: Permission[];
  expiresAt?: Date;
  message?: string;
}

export interface ShareUpdate {
  permissions?: Permission[];
  expiresAt?: Date;
  isActive?: boolean;
}

export interface PermissionResponse {
  hasPermission: boolean;
  permissions: Permission[];
  reason?: string;
}

export interface ShareResponse {
  id: string;
  protocolId: string;
  sharedBy: string;
  sharedWith: string;
  permissions: Permission[];
  expiresAt?: Date;
  isActive: boolean;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API错误类
class PermissionAPIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`Permission API Error: ${status} ${statusText}`);
    this.name = 'PermissionAPIError';
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
    
    throw new PermissionAPIError(response.status, response.statusText, errorData);
  }
  
  // 处理空响应
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

// 权限API客户端类
export class PermissionsAPIClient {
  /**
   * 检查用户权限
   */
  async checkPermission(
    resourceId: string,
    resourceType: 'protocol' | 'block' | 'session',
    permission: Permission,
    token: string
  ): Promise<PermissionResponse> {
    return request<PermissionResponse>(`/permissions/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: {
        resourceId,
        resourceType,
        permission,
      },
    });
  }
  
  /**
   * 获取用户对资源的所有权限
   */
  async getUserPermissions(
    resourceId: string,
    resourceType: 'protocol' | 'block' | 'session',
    token: string
  ): Promise<Permission[]> {
    return request<Permission[]>(`/permissions/${resourceType}/${resourceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  /**
   * 获取协议的所有分享
   */
  async getProtocolShares(protocolId: string, token: string): Promise<ShareResponse[]> {
    return request<ShareResponse[]>(`/protocols/${protocolId}/shares`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  /**
   * 分享协议给其他用户
   */
  async shareProtocol(shareData: ShareRequest, token: string): Promise<ShareResponse> {
    return request<ShareResponse>(`/protocols/${shareData.protocolId}/shares`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: shareData,
    });
  }
  
  /**
   * 更新分享权限
   */
  async updateProtocolShare(
    shareId: string,
    updateData: ShareUpdate,
    token: string
  ): Promise<ShareResponse> {
    return request<ShareResponse>(`/protocols/shares/${shareId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: updateData,
    });
  }
  
  /**
   * 撤销协议分享
   */
  async revokeProtocolShare(shareId: string, token: string): Promise<void> {
    return request<void>(`/protocols/shares/${shareId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  /**
   * 接受协议分享
   */
  async acceptProtocolShare(shareId: string, token: string): Promise<ShareResponse> {
    return request<ShareResponse>(`/protocols/shares/${shareId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  /**
   * 拒绝协议分享
   */
  async rejectProtocolShare(shareId: string, token: string): Promise<void> {
    return request<void>(`/protocols/shares/${shareId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  /**
   * 获取用户收到的分享邀请
   */
  async getReceivedShares(token: string): Promise<ShareResponse[]> {
    return request<ShareResponse[]>(`/protocols/shares/received`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  /**
   * 获取用户发送的分享邀请
   */
  async getSentShares(token: string): Promise<ShareResponse[]> {
    return request<ShareResponse[]>(`/protocols/shares/sent`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  /**
   * 设置协议公开状态
   */
  async setProtocolPublic(
    protocolId: string,
    isPublic: boolean,
    token: string
  ): Promise<Protocol> {
    return request<Protocol>(`/protocols/${protocolId}/public`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: { isPublic },
    });
  }
  
  /**
   * 复制公开协议
   */
  async copyPublicProtocol(
    protocolId: string,
    name: string,
    token: string
  ): Promise<Protocol> {
    return request<Protocol>(`/protocols/${protocolId}/copy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: { name },
    });
  }
  
  /**
   * 获取公开协议列表
   */
  async getPublicProtocols(params?: {
    category?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    protocols: Protocol[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return request<{
      protocols: Protocol[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/protocols/public`, {
      method: 'GET',
      params,
    });
  }
  
  /**
   * 设置块权限
   */
  async setBlockPermissions(
    blockId: string,
    permissions: {
      sharedWith: string;
      permissions: Permission[];
      expiresAt?: Date;
    },
    token: string
  ): Promise<void> {
    return request<void>(`/blocks/${blockId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: permissions,
    });
  }
  
  /**
   * 获取块权限
   */
  async getBlockPermissions(blockId: string, token: string): Promise<{
    permissions: Permission[];
    shares: ShareResponse[];
  }> {
    return request<{
      permissions: Permission[];
      shares: ShareResponse[];
    }>(`/blocks/${blockId}/permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  /**
   * 搜索用户
   */
  async searchUsers(query: string, token: string): Promise<Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>> {
    return request<Array<{
      id: string;
      name: string;
      email: string;
      avatar?: string;
    }>>(`/users/search`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: { q: query },
    });
  }
  
  /**
   * 获取权限变更历史
   */
  async getPermissionHistory(
    resourceId: string,
    resourceType: 'protocol' | 'block',
    token: string
  ): Promise<Array<{
    id: string;
    action: 'granted' | 'revoked' | 'modified';
    permission: Permission;
    userId: string;
    timestamp: Date;
    reason?: string;
  }>> {
    return request<Array<{
      id: string;
      action: 'granted' | 'revoked' | 'modified';
      permission: Permission;
      userId: string;
      timestamp: Date;
      reason?: string;
    }>>(`/permissions/${resourceType}/${resourceId}/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  /**
   * 批量检查权限
   */
  async batchCheckPermissions(
    checks: PermissionCheck[],
    token: string
  ): Promise<Array<{
    resourceId: string;
    resourceType: string;
    permission: Permission;
    hasPermission: boolean;
  }>> {
    return request<Array<{
      resourceId: string;
      resourceType: string;
      permission: Permission;
      hasPermission: boolean;
    }>>(`/permissions/batch-check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: { checks },
    });
  }
  
  /**
   * 获取权限统计
   */
  async getPermissionStats(token: string): Promise<{
    totalProtocols: number;
    sharedProtocols: number;
    publicProtocols: number;
    receivedShares: number;
    sentShares: number;
    pendingShares: number;
  }> {
    return request<{
      totalProtocols: number;
      sharedProtocols: number;
      publicProtocols: number;
      receivedShares: number;
      sentShares: number;
      pendingShares: number;
    }>(`/permissions/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

// 创建API客户端实例
export const permissionsAPI = new PermissionsAPIClient();

// 导出错误类
export { PermissionAPIError };

// 导出类型
export type { PermissionCheck, ShareRequest, ShareUpdate, PermissionResponse, ShareResponse };
