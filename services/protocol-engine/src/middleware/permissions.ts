import { Request, Response, NextFunction } from 'express';
import { permissionService, Permission } from '../services/permissions';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    tenantId?: string;
  };
}

/**
 * 权限验证中间件工厂
 * 创建需要特定权限的中间件
 */
export const requirePermission = (permission: Permission) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { protocolId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      if (!protocolId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Protocol ID is required'
        });
      }

      // 检查权限
      const hasPermission = await permissionService.checkPermission({
        userId,
        protocolId,
        requiredPermission: permission
      });

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Insufficient permissions. Required: ${permission}`,
          requiredPermission: permission
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * 所有者权限中间件
 * 只有协议所有者可以访问
 */
export const requireOwnership = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { protocolId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    if (!protocolId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Protocol ID is required'
      });
    }

    // 检查所有权
    const isOwner = await permissionService.isOwner(userId, protocolId);

    if (!isOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only protocol owner can perform this action'
      });
    }

    next();
  } catch (error) {
    console.error('Ownership middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Ownership check failed'
    });
  }
};

/**
 * 多权限验证中间件
 * 用户需要具有任意一个指定权限
 */
export const requireAnyPermission = (permissions: Permission[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { protocolId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      if (!protocolId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Protocol ID is required'
        });
      }

      // 检查是否有任意一个权限
      const permissionChecks = await Promise.all(
        permissions.map(permission =>
          permissionService.checkPermission({
            userId,
            protocolId,
            requiredPermission: permission
          })
        )
      );

      const hasAnyPermission = permissionChecks.some(hasPermission => hasPermission);

      if (!hasAnyPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Insufficient permissions. Required one of: ${permissions.join(', ')}`,
          requiredPermissions: permissions
        });
      }

      next();
    } catch (error) {
      console.error('Any permission middleware error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * 租户隔离中间件
 * 确保用户只能访问自己租户的数据
 */
export const requireTenantAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication and tenant information required'
      });
    }

    // 这里可以添加额外的租户验证逻辑
    // 例如检查用户是否属于该租户
    
    next();
  } catch (error) {
    console.error('Tenant access middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Tenant access check failed'
    });
  }
};

/**
 * 权限信息附加中间件
 * 将用户权限信息附加到请求对象
 */
export const attachPermissions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { protocolId } = req.params;
    const userId = req.user?.id;

    if (userId && protocolId) {
      const permissions = await permissionService.getUserPermissions(userId, protocolId);
      (req as any).permissions = permissions;
    }

    next();
  } catch (error) {
    console.error('Attach permissions middleware error:', error);
    // 不阻止请求，只是不附加权限信息
    next();
  }
};
