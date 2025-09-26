import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { permissionService, Permission } from '../services/permissions';
import { encryptionService, DataClassification } from '../services/encryption';
import { auditService, AuditAction, AuditSeverity } from '../services/audit';
import { requirePermission, requireOwnership, AuthenticatedRequest } from '../middleware/permissions';

const router = Router();
const prisma = new PrismaClient();

/**
 * 创建新协议
 * POST /protocols
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    const {
      name,
      description,
      category,
      difficulty,
      parameters,
      adaptations,
      visibility = 'PRIVATE',
      dataClassification = 'PERSONAL'
    } = req.body;

    // 验证必填字段
    if (!name || !category || !difficulty) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name, category, and difficulty are required'
      });
    }

    // 加密敏感数据
    const encryptedParameters = encryptionService.encryptProtocolParameters(parameters);
    const encryptedAdaptations = adaptations 
      ? encryptionService.encryptUserAdaptations(adaptations)
      : null;

    // 创建协议
    const protocol = await prisma.protocol.create({
      data: {
        name,
        description,
        category,
        difficulty,
        parameters: encryptedParameters as any,
        adaptations: encryptedAdaptations as any,
        visibility: visibility as any,
        dataClassification: dataClassification as any,
        ownerId: userId,
        tenantId: tenantId || 'default',
        isActive: true
      }
    });

    // 授予所有者权限
    await permissionService.grantPermission(
      userId,
      protocol.id,
      'OWNER' as any,
      ['READ', 'WRITE', 'EXECUTE', 'SHARE', 'DELETE', 'ANALYTICS', 'EXPORT'] as any[],
      userId
    );

    // 记录审计日志
    await auditService.logProtocolCreated(
      userId,
      protocol.id,
      name,
      req.ip,
      req.get('User-Agent'),
      tenantId
    );

    res.status(201).json({
      success: true,
      data: {
        id: protocol.id,
        name: protocol.name,
        description: protocol.description,
        category: protocol.category,
        difficulty: protocol.difficulty,
        visibility: protocol.visibility,
        dataClassification: protocol.dataClassification,
        ownerId: protocol.ownerId,
        tenantId: protocol.tenantId,
        createdAt: protocol.createdAt,
        updatedAt: protocol.updatedAt
      }
    });
  } catch (error) {
    console.error('Create protocol error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create protocol'
    });
  }
});

/**
 * 获取协议列表
 * GET /protocols
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    const { page = 1, limit = 10, category, difficulty, visibility } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    const where: any = {
      tenantId: tenantId || 'default',
      isActive: true
    };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (visibility) where.visibility = visibility;

    const skip = (Number(page) - 1) * Number(limit);

    const [protocols, total] = await Promise.all([
      prisma.protocol.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          difficulty: true,
          visibility: true,
          dataClassification: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.protocol.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        protocols,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get protocols error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch protocols'
    });
  }
});

/**
 * 获取单个协议
 * GET /protocols/:id
 */
router.get('/:id', requirePermission(Permission.READ), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const protocol = await prisma.protocol.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        parameters: true,
        adaptations: true,
        visibility: true,
        dataClassification: true,
        ownerId: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!protocol) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Protocol not found'
      });
    }

    // 记录数据访问
    await auditService.logDataAccess(
      userId!,
      'Protocol',
      id,
      'READ',
      req.ip,
      req.get('User-Agent'),
      req.user?.tenantId
    );

    res.json({
      success: true,
      data: protocol
    });
  } catch (error) {
    console.error('Get protocol error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch protocol'
    });
  }
});

/**
 * 更新协议
 * PUT /protocols/:id
 */
router.put('/:id', requirePermission(Permission.WRITE), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const {
      name,
      description,
      category,
      difficulty,
      parameters,
      adaptations,
      visibility,
      dataClassification
    } = req.body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (dataClassification !== undefined) updateData.dataClassification = dataClassification;

    // 加密敏感数据
    if (parameters !== undefined) {
      updateData.parameters = encryptionService.encryptProtocolParameters(parameters) as any;
    }
    if (adaptations !== undefined) {
      updateData.adaptations = adaptations 
        ? encryptionService.encryptUserAdaptations(adaptations) as any
        : null;
    }

    const protocol = await prisma.protocol.update({
      where: { id, isActive: true },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        visibility: true,
        dataClassification: true,
        ownerId: true,
        updatedAt: true
      }
    });

    // 记录审计日志
    await auditService.log({
      action: AuditAction.PROTOCOL_UPDATED,
      userId: userId!,
      resourceType: 'Protocol',
      resourceId: id,
      details: { updatedFields: Object.keys(updateData) },
      severity: AuditSeverity.MEDIUM,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      tenantId: req.user?.tenantId
    });

    res.json({
      success: true,
      data: protocol
    });
  } catch (error) {
    console.error('Update protocol error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update protocol'
    });
  }
});

/**
 * 删除协议
 * DELETE /protocols/:id
 */
router.delete('/:id', requireOwnership, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // 软删除协议
    await prisma.protocol.update({
      where: { id },
      data: { isActive: false }
    });

    // 撤销所有权限
    await permissionService.revokePermission('*', id);

    // 记录审计日志
    await auditService.log({
      action: AuditAction.PROTOCOL_DELETED,
      userId: userId!,
      resourceType: 'Protocol',
      resourceId: id,
      details: {},
      severity: AuditSeverity.HIGH,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      tenantId: req.user?.tenantId
    });

    res.json({
      success: true,
      message: 'Protocol deleted successfully'
    });
  } catch (error) {
    console.error('Delete protocol error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete protocol'
    });
  }
});

/**
 * 获取协议权限
 * GET /protocols/:id/permissions
 */
router.get('/:id/permissions', requirePermission(Permission.READ), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const users = await permissionService.getProtocolUsers(id);

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get protocol permissions error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch protocol permissions'
    });
  }
});

/**
 * 授予协议权限
 * POST /protocols/:id/permissions
 */
router.post('/:id/permissions', requireOwnership, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { targetUserId, role, permissions, expiresAt } = req.body;

    if (!targetUserId || !role || !permissions) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'targetUserId, role, and permissions are required'
      });
    }

    const success = await permissionService.grantPermission(
      targetUserId,
      id,
      role,
      permissions,
      userId!,
      expiresAt ? new Date(expiresAt) : undefined
    );

    if (!success) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to grant permission'
      });
    }

    // 记录审计日志
    await auditService.logPermissionGranted(
      userId!,
      id,
      targetUserId,
      role,
      permissions,
      req.ip,
      req.get('User-Agent'),
      req.user?.tenantId
    );

    res.json({
      success: true,
      message: 'Permission granted successfully'
    });
  } catch (error) {
    console.error('Grant permission error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to grant permission'
    });
  }
});

/**
 * 撤销协议权限
 * DELETE /protocols/:id/permissions/:userId
 */
router.delete('/:id/permissions/:userId', requireOwnership, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const userId = req.user?.id;

    const success = await permissionService.revokePermission(targetUserId, id);

    if (!success) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to revoke permission'
      });
    }

    // 记录审计日志
    await auditService.logPermissionRevoked(
      userId!,
      id,
      targetUserId,
      req.ip,
      req.get('User-Agent'),
      req.user?.tenantId
    );

    res.json({
      success: true,
      message: 'Permission revoked successfully'
    });
  } catch (error) {
    console.error('Revoke permission error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to revoke permission'
    });
  }
});

export default router;
