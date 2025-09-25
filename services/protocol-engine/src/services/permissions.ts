import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum PermissionRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
  GUEST = 'GUEST'
}

export enum Permission {
  READ = 'READ',
  WRITE = 'WRITE',
  EXECUTE = 'EXECUTE',
  SHARE = 'SHARE',
  DELETE = 'DELETE',
  ANALYTICS = 'ANALYTICS',
  EXPORT = 'EXPORT'
}

export interface PermissionCheck {
  userId: string;
  protocolId: string;
  requiredPermission: Permission;
}

export interface UserPermissions {
  role: PermissionRole;
  permissions: Permission[];
  isActive: boolean;
  expiresAt?: Date;
}

/**
 * 权限验证服务
 * 负责检查用户对协议资源的访问权限
 */
export class PermissionService {
  /**
   * 检查用户是否具有特定权限
   */
  async checkPermission({ userId, protocolId, requiredPermission }: PermissionCheck): Promise<boolean> {
    try {
      // 获取用户权限
      const userPermission = await prisma.protocolPermission.findFirst({
        where: {
          userId,
          protocolId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });

      if (!userPermission) {
        return false;
      }

      // 检查角色权限
      if (this.hasRolePermission(userPermission.role, requiredPermission)) {
        return true;
      }

      // 检查具体权限
      return userPermission.permissions.includes(requiredPermission);
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * 获取用户对协议的所有权限
   */
  async getUserPermissions(userId: string, protocolId: string): Promise<UserPermissions | null> {
    try {
      const permission = await prisma.protocolPermission.findFirst({
        where: {
          userId,
          protocolId,
          isActive: true
        }
      });

      if (!permission) {
        return null;
      }

      return {
        role: permission.role as PermissionRole,
        permissions: permission.permissions as Permission[],
        isActive: permission.isActive,
        expiresAt: permission.expiresAt
      };
    } catch (error) {
      console.error('Get user permissions failed:', error);
      return null;
    }
  }

  /**
   * 授予用户权限
   */
  async grantPermission(
    userId: string,
    protocolId: string,
    role: PermissionRole,
    permissions: Permission[],
    grantedBy: string,
    expiresAt?: Date
  ): Promise<boolean> {
    try {
      await prisma.protocolPermission.upsert({
        where: {
          protocolId_userId: {
            protocolId,
            userId
          }
        },
        update: {
          role,
          permissions,
          grantedBy,
          grantedAt: new Date(),
          expiresAt,
          isActive: true
        },
        create: {
          userId,
          protocolId,
          role,
          permissions,
          grantedBy,
          grantedAt: new Date(),
          expiresAt,
          isActive: true
        }
      });

      return true;
    } catch (error) {
      console.error('Grant permission failed:', error);
      return false;
    }
  }

  /**
   * 撤销用户权限
   */
  async revokePermission(userId: string, protocolId: string): Promise<boolean> {
    try {
      await prisma.protocolPermission.updateMany({
        where: {
          userId,
          protocolId
        },
        data: {
          isActive: false,
          expiresAt: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('Revoke permission failed:', error);
      return false;
    }
  }

  /**
   * 检查角色是否具有特定权限
   */
  private hasRolePermission(role: string, permission: Permission): boolean {
    const rolePermissions: Record<string, Permission[]> = {
      [PermissionRole.OWNER]: Object.values(Permission),
      [PermissionRole.ADMIN]: [
        Permission.READ,
        Permission.WRITE,
        Permission.EXECUTE,
        Permission.SHARE,
        Permission.ANALYTICS,
        Permission.EXPORT
      ],
      [PermissionRole.EDITOR]: [
        Permission.READ,
        Permission.WRITE,
        Permission.EXECUTE
      ],
      [PermissionRole.VIEWER]: [
        Permission.READ
      ],
      [PermissionRole.GUEST]: [
        Permission.READ
      ]
    };

    return rolePermissions[role]?.includes(permission) || false;
  }

  /**
   * 检查用户是否为协议所有者
   */
  async isOwner(userId: string, protocolId: string): Promise<boolean> {
    try {
      const protocol = await prisma.protocol.findUnique({
        where: { id: protocolId },
        select: { ownerId: true }
      });

      return protocol?.ownerId === userId;
    } catch (error) {
      console.error('Check owner failed:', error);
      return false;
    }
  }

  /**
   * 获取协议的所有权限用户
   */
  async getProtocolUsers(protocolId: string): Promise<Array<{
    userId: string;
    role: PermissionRole;
    permissions: Permission[];
    grantedBy: string;
    grantedAt: Date;
    expiresAt?: Date;
    isActive: boolean;
  }>> {
    try {
      const permissions = await prisma.protocolPermission.findMany({
        where: { protocolId },
        select: {
          userId: true,
          role: true,
          permissions: true,
          grantedBy: true,
          grantedAt: true,
          expiresAt: true,
          isActive: true
        }
      });

      return permissions.map((p: any) => ({
        userId: p.userId,
        role: p.role as PermissionRole,
        permissions: p.permissions as Permission[],
        grantedBy: p.grantedBy,
        grantedAt: p.grantedAt,
        expiresAt: p.expiresAt,
        isActive: p.isActive
      }));
    } catch (error) {
      console.error('Get protocol users failed:', error);
      return [];
    }
  }
}

export const permissionService = new PermissionService();
