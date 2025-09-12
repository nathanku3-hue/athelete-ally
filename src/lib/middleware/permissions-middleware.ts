/**
 * 权限验证中间件
 * 提供Protocol和Block的权限验证功能
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { Protocol, Block, Permission } from '@athlete-ally/protocol-types';

// 权限验证上下文
interface PermissionContext {
  userId: string;
  resourceId: string;
  resourceType: 'protocol' | 'block' | 'session';
  permission: Permission;
  timestamp: number;
}

// 权限验证结果
interface PermissionResult {
  hasPermission: boolean;
  reason?: string;
  permissions?: Permission[];
}

// 权限验证错误
class PermissionError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public resourceId: string,
    public permission: Permission
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}

// 权限验证中间件
export class PermissionsMiddleware {
  private static instance: PermissionsMiddleware;
  private permissionCache = new Map<string, PermissionResult>();
  private cacheExpiry = 5 * 60 * 1000; // 5分钟缓存

  static getInstance(): PermissionsMiddleware {
    if (!PermissionsMiddleware.instance) {
      PermissionsMiddleware.instance = new PermissionsMiddleware();
    }
    return PermissionsMiddleware.instance;
  }

  /**
   * 检查用户权限
   */
  async checkPermission(
    userId: string,
    resourceId: string,
    resourceType: 'protocol' | 'block' | 'session',
    permission: Permission
  ): Promise<PermissionResult> {
    const cacheKey = `${userId}:${resourceType}:${resourceId}:${permission}`;
    
    // 检查缓存
    const cached = this.permissionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached;
    }

    try {
      // 获取资源信息
      const resource = await this.getResource(resourceId, resourceType);
      if (!resource) {
        return {
          hasPermission: false,
          reason: 'Resource not found'
        };
      }

      // 检查所有权
      if (this.isOwner(userId, resource)) {
        const result = {
          hasPermission: true,
          permissions: ['read', 'write', 'execute', 'share'] as Permission[]
        };
        this.permissionCache.set(cacheKey, result);
        return result;
      }

      // 检查分享权限
      const sharePermissions = await this.getSharePermissions(userId, resourceId, resourceType);
      if (sharePermissions.length > 0) {
        const hasPermission = sharePermissions.includes(permission);
        const result = {
          hasPermission,
          permissions: sharePermissions,
          reason: hasPermission ? undefined : `Missing ${permission} permission`
        };
        this.permissionCache.set(cacheKey, result);
        return result;
      }

      // 检查公开权限
      if (resourceType === 'protocol' && (resource as Protocol).isPublic) {
        const publicPermissions = ['read'] as Permission[];
        const hasPermission = publicPermissions.includes(permission);
        const result = {
          hasPermission,
          permissions: publicPermissions,
          reason: hasPermission ? undefined : 'Public protocols only support read permission'
        };
        this.permissionCache.set(cacheKey, result);
        return result;
      }

      // 无权限
      const result = {
        hasPermission: false,
        reason: 'No permission granted'
      };
      this.permissionCache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Permission check failed:', error);
      return {
        hasPermission: false,
        reason: 'Permission check failed'
      };
    }
  }

  /**
   * 权限验证中间件工厂
   */
  createPermissionMiddleware(
    resourceType: 'protocol' | 'block' | 'session',
    permission: Permission,
    resourceIdExtractor: (request: FastifyRequest) => string
  ) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // 获取用户ID
        const userId = this.getUserIdFromRequest(request);
        if (!userId) {
          throw new PermissionError(401, 'User not authenticated', '', permission);
        }

        // 获取资源ID
        const resourceId = resourceIdExtractor(request);
        if (!resourceId) {
          throw new PermissionError(400, 'Resource ID not found', '', permission);
        }

        // 检查权限
        const result = await this.checkPermission(userId, resourceId, resourceType, permission);
        
        if (!result.hasPermission) {
          throw new PermissionError(403, result.reason || 'Access denied', resourceId, permission);
        }

        // 将权限信息添加到请求上下文
        (request as any).permissions = result.permissions;
        (request as any).resourceId = resourceId;
        (request as any).resourceType = resourceType;

      } catch (error) {
        if (error instanceof PermissionError) {
          reply.code(error.statusCode).send({
            error: 'permission_denied',
            message: error.message,
            resourceId: error.resourceId,
            permission: error.permission,
            timestamp: new Date().toISOString()
          });
        } else {
          reply.code(500).send({
            error: 'internal_error',
            message: 'Permission check failed'
          });
        }
      }
    };
  }

  /**
   * 批量权限验证
   */
  async batchCheckPermissions(
    userId: string,
    checks: Array<{
      resourceId: string;
      resourceType: 'protocol' | 'block' | 'session';
      permission: Permission;
    }>
  ): Promise<Array<{
    resourceId: string;
    resourceType: string;
    permission: Permission;
    hasPermission: boolean;
    reason?: string;
  }>> {
    const results = await Promise.all(
      checks.map(async (check) => {
        const result = await this.checkPermission(
          userId,
          check.resourceId,
          check.resourceType,
          check.permission
        );
        
        return {
          resourceId: check.resourceId,
          resourceType: check.resourceType,
          permission: check.permission,
          hasPermission: result.hasPermission,
          reason: result.reason
        };
      })
    );

    return results;
  }

  /**
   * 清除权限缓存
   */
  clearCache(userId?: string, resourceId?: string): void {
    if (userId && resourceId) {
      // 清除特定用户的特定资源缓存
      const keysToDelete = Array.from(this.permissionCache.keys()).filter(key => 
        key.startsWith(`${userId}:`) && key.includes(resourceId)
      );
      keysToDelete.forEach(key => this.permissionCache.delete(key));
    } else if (userId) {
      // 清除特定用户的所有缓存
      const keysToDelete = Array.from(this.permissionCache.keys()).filter(key => 
        key.startsWith(`${userId}:`)
      );
      keysToDelete.forEach(key => this.permissionCache.delete(key));
    } else {
      // 清除所有缓存
      this.permissionCache.clear();
    }
  }

  /**
   * 获取资源信息
   */
  private async getResource(
    resourceId: string,
    resourceType: 'protocol' | 'block' | 'session'
  ): Promise<Protocol | Block | null> {
    // 在实际实现中，这里应该从数据库获取资源
    // 这里使用模拟数据
    switch (resourceType) {
      case 'protocol':
        return await this.getProtocol(resourceId);
      case 'block':
        return await this.getBlock(resourceId);
      case 'session':
        return await this.getSession(resourceId);
      default:
        return null;
    }
  }

  /**
   * 检查所有权
   */
  private isOwner(userId: string, resource: Protocol | Block): boolean {
    if ('createdBy' in resource) {
      return resource.createdBy === userId;
    }
    return false;
  }

  /**
   * 获取分享权限
   */
  private async getSharePermissions(
    userId: string,
    resourceId: string,
    resourceType: 'protocol' | 'block' | 'session'
  ): Promise<Permission[]> {
    // 在实际实现中，这里应该从数据库查询分享权限
    // 这里使用模拟数据
    return [];
  }

  /**
   * 从请求中获取用户ID
   */
  private getUserIdFromRequest(request: FastifyRequest): string | null {
    // 从JWT token或session中获取用户ID
    const user = (request as any).user;
    return user?.userId || null;
  }

  /**
   * 获取协议信息（模拟）
   */
  private async getProtocol(protocolId: string): Promise<Protocol | null> {
    // 在实际实现中，这里应该从数据库获取
    return null;
  }

  /**
   * 获取块信息（模拟）
   */
  private async getBlock(blockId: string): Promise<Block | null> {
    // 在实际实现中，这里应该从数据库获取
    return null;
  }

  /**
   * 获取会话信息（模拟）
   */
  private async getSession(sessionId: string): Promise<any | null> {
    // 在实际实现中，这里应该从数据库获取
    return null;
  }
}

// 权限验证装饰器
export function RequirePermission(
  resourceType: 'protocol' | 'block' | 'session',
  permission: Permission,
  resourceIdExtractor: (request: FastifyRequest) => string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const middleware = PermissionsMiddleware.getInstance().createPermissionMiddleware(
      resourceType,
      permission,
      resourceIdExtractor
    );

    descriptor.value = async function (request: FastifyRequest, reply: FastifyReply) {
      await middleware(request, reply);
      if (reply.sent) return;
      
      return method.call(this, request, reply);
    };
  };
}

// 权限验证工具函数
export class PermissionUtils {
  /**
   * 检查用户是否有权限
   */
  static async hasPermission(
    userId: string,
    resourceId: string,
    resourceType: 'protocol' | 'block' | 'session',
    permission: Permission
  ): Promise<boolean> {
    const middleware = PermissionsMiddleware.getInstance();
    const result = await middleware.checkPermission(userId, resourceId, resourceType, permission);
    return result.hasPermission;
  }

  /**
   * 获取用户的所有权限
   */
  static async getUserPermissions(
    userId: string,
    resourceId: string,
    resourceType: 'protocol' | 'block' | 'session'
  ): Promise<Permission[]> {
    const middleware = PermissionsMiddleware.getInstance();
    const result = await middleware.checkPermission(userId, resourceId, resourceType, 'read');
    return result.permissions || [];
  }

  /**
   * 验证权限并抛出错误
   */
  static async requirePermission(
    userId: string,
    resourceId: string,
    resourceType: 'protocol' | 'block' | 'session',
    permission: Permission
  ): Promise<void> {
    const hasPermission = await PermissionUtils.hasPermission(
      userId,
      resourceId,
      resourceType,
      permission
    );

    if (!hasPermission) {
      throw new PermissionError(403, 'Access denied', resourceId, permission);
    }
  }
}

// 导出单例实例
export const permissionsMiddleware = PermissionsMiddleware.getInstance();

// 导出错误类
export { PermissionError };
