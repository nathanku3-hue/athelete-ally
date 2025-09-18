import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum AuditAction {
  // 协议相关操作
  PROTOCOL_CREATED = 'PROTOCOL_CREATED',
  PROTOCOL_UPDATED = 'PROTOCOL_UPDATED',
  PROTOCOL_DELETED = 'PROTOCOL_DELETED',
  PROTOCOL_SHARED = 'PROTOCOL_SHARED',
  PROTOCOL_UNSHARED = 'PROTOCOL_UNSHARED',
  
  // 权限相关操作
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  PERMISSION_UPDATED = 'PERMISSION_UPDATED',
  
  // 执行相关操作
  EXECUTION_STARTED = 'EXECUTION_STARTED',
  EXECUTION_COMPLETED = 'EXECUTION_COMPLETED',
  EXECUTION_PAUSED = 'EXECUTION_PAUSED',
  EXECUTION_CANCELLED = 'EXECUTION_CANCELLED',
  
  // 数据访问操作
  DATA_ACCESSED = 'DATA_ACCESSED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_MODIFIED = 'DATA_MODIFIED',
  
  // 安全相关操作
  AUTHENTICATION_SUCCESS = 'AUTHENTICATION_SUCCESS',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_DENIED = 'AUTHORIZATION_DENIED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AuditLogEntry {
  action: AuditAction;
  userId: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any>;
  severity: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  tenantId?: string;
}

export interface AuditQuery {
  userId?: string;
  action?: AuditAction;
  resourceType?: string;
  resourceId?: string;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  tenantId?: string;
  limit?: number;
  offset?: number;
}

/**
 * 审计日志服务
 * 负责记录和查询系统操作日志
 */
export class AuditService {
  /**
   * 记录审计日志
   */
  async log(entry: AuditLogEntry): Promise<boolean> {
    try {
      await prisma.auditLog.create({
        data: {
          action: entry.action,
          userId: entry.userId,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          details: entry.details || {},
          severity: entry.severity,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          tenantId: entry.tenantId,
          timestamp: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('Audit logging failed:', error);
      return false;
    }
  }

  /**
   * 查询审计日志
   */
  async query(query: AuditQuery): Promise<Array<{
    id: string;
    action: string;
    userId: string;
    resourceType: string;
    resourceId: string;
    details: any;
    severity: string;
    ipAddress?: string;
    userAgent?: string;
    tenantId?: string;
    timestamp: Date;
  }>> {
    try {
      const where: any = {};

      if (query.userId) where.userId = query.userId;
      if (query.action) where.action = query.action;
      if (query.resourceType) where.resourceType = query.resourceType;
      if (query.resourceId) where.resourceId = query.resourceId;
      if (query.severity) where.severity = query.severity;
      if (query.tenantId) where.tenantId = query.tenantId;
      
      if (query.startDate || query.endDate) {
        where.timestamp = {};
        if (query.startDate) where.timestamp.gte = query.startDate;
        if (query.endDate) where.timestamp.lte = query.endDate;
      }

      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: query.limit || 100,
        skip: query.offset || 0
      });

      return logs;
    } catch (error) {
      console.error('Audit query failed:', error);
      return [];
    }
  }

  /**
   * 记录协议创建
   */
  async logProtocolCreated(
    userId: string,
    protocolId: string,
    protocolName: string,
    ipAddress?: string,
    userAgent?: string,
    tenantId?: string
  ): Promise<boolean> {
    return this.log({
      action: AuditAction.PROTOCOL_CREATED,
      userId,
      resourceType: 'Protocol',
      resourceId: protocolId,
      details: { protocolName },
      severity: AuditSeverity.MEDIUM,
      ipAddress,
      userAgent,
      tenantId
    });
  }

  /**
   * 记录权限授予
   */
  async logPermissionGranted(
    userId: string,
    protocolId: string,
    targetUserId: string,
    role: string,
    permissions: string[],
    ipAddress?: string,
    userAgent?: string,
    tenantId?: string
  ): Promise<boolean> {
    return this.log({
      action: AuditAction.PERMISSION_GRANTED,
      userId,
      resourceType: 'Protocol',
      resourceId: protocolId,
      details: {
        targetUserId,
        role,
        permissions
      },
      severity: AuditSeverity.HIGH,
      ipAddress,
      userAgent,
      tenantId
    });
  }

  /**
   * 记录权限撤销
   */
  async logPermissionRevoked(
    userId: string,
    protocolId: string,
    targetUserId: string,
    ipAddress?: string,
    userAgent?: string,
    tenantId?: string
  ): Promise<boolean> {
    return this.log({
      action: AuditAction.PERMISSION_REVOKED,
      userId,
      resourceType: 'Protocol',
      resourceId: protocolId,
      details: { targetUserId },
      severity: AuditSeverity.HIGH,
      ipAddress,
      userAgent,
      tenantId
    });
  }

  /**
   * 记录数据访问
   */
  async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    accessType: string,
    ipAddress?: string,
    userAgent?: string,
    tenantId?: string
  ): Promise<boolean> {
    return this.log({
      action: AuditAction.DATA_ACCESSED,
      userId,
      resourceType,
      resourceId,
      details: { accessType },
      severity: AuditSeverity.LOW,
      ipAddress,
      userAgent,
      tenantId
    });
  }

  /**
   * 记录认证失败
   */
  async logAuthenticationFailed(
    userId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
    tenantId?: string
  ): Promise<boolean> {
    return this.log({
      action: AuditAction.AUTHENTICATION_FAILED,
      userId,
      resourceType: 'Authentication',
      resourceId: userId,
      details: { reason },
      severity: AuditSeverity.MEDIUM,
      ipAddress,
      userAgent,
      tenantId
    });
  }

  /**
   * 记录授权拒绝
   */
  async logAuthorizationDenied(
    userId: string,
    resourceType: string,
    resourceId: string,
    requiredPermission: string,
    ipAddress?: string,
    userAgent?: string,
    tenantId?: string
  ): Promise<boolean> {
    return this.log({
      action: AuditAction.AUTHORIZATION_DENIED,
      userId,
      resourceType,
      resourceId,
      details: { requiredPermission },
      severity: AuditSeverity.HIGH,
      ipAddress,
      userAgent,
      tenantId
    });
  }

  /**
   * 记录可疑活动
   */
  async logSuspiciousActivity(
    userId: string,
    activity: string,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
    tenantId?: string
  ): Promise<boolean> {
    return this.log({
      action: AuditAction.SUSPICIOUS_ACTIVITY,
      userId,
      resourceType: 'Security',
      resourceId: userId,
      details: { activity, ...details },
      severity: AuditSeverity.CRITICAL,
      ipAddress,
      userAgent,
      tenantId
    });
  }

  /**
   * 获取用户活动摘要
   */
  async getUserActivitySummary(
    userId: string,
    days: number = 30
  ): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    recentActivity: Array<{
      action: string;
      resourceType: string;
      timestamp: Date;
    }>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await this.query({
        userId,
        startDate,
        limit: 1000
      });

      const actionsByType: Record<string, number> = {};
      logs.forEach(log => {
        actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      });

      const recentActivity = logs.slice(0, 10).map(log => ({
        action: log.action,
        resourceType: log.resourceType,
        timestamp: log.timestamp
      }));

      return {
        totalActions: logs.length,
        actionsByType,
        recentActivity
      };
    } catch (error) {
      console.error('Get user activity summary failed:', error);
      return {
        totalActions: 0,
        actionsByType: {},
        recentActivity: []
      };
    }
  }

  /**
   * 清理旧审计日志
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await prisma.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        }
      });

      return result.count;
    } catch (error) {
      console.error('Cleanup old audit logs failed:', error);
      return 0;
    }
  }
}

export const auditService = new AuditService();
