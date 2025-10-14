// services/optimization/src/QueryOptimizationService.ts
import { PrismaClient } from '@prisma/client';

export interface QueryMetrics {
  query: string;
  executionTime: number;
  rowsExamined: number;
  rowsReturned: number;
  indexUsed: boolean;
  cacheHit: boolean;
  timestamp: Date;
}

export interface OptimizationRecommendation {
  query: string;
  currentPerformance: number;
  recommendedIndex: string;
  expectedImprovement: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

export class QueryOptimizationService {
  private prisma: PrismaClient;
  private cache: any; // ProtocolCacheService;
  private queryMetrics: QueryMetrics[] = [];
  private readonly MAX_METRICS_HISTORY = 1000;
  
  constructor(prisma: PrismaClient, cache: any) {
    this.prisma = prisma;
    this.cache = cache;
  }
  
  // ===========================================
  // 权限检查查询优化
  // ===========================================
  
  async checkProtocolAccessOptimized(
    protocolId: string, 
    userId: string, 
    tenantId: string
  ): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // 首先检查缓存
      const cachedPermissions = await this.cache.getProtocolPermissions(protocolId, userId);
      if (cachedPermissions) {
        const hasAccess = cachedPermissions.length > 0;
        this.recordQueryMetrics({
          query: 'checkProtocolAccessOptimized (cached)',
          executionTime: Date.now() - startTime,
          rowsExamined: 0,
          rowsReturned: 1,
          indexUsed: false,
          cacheHit: true,
          timestamp: new Date()
        });
        return hasAccess;
      }
      
      // 使用优化的数据库查询
      const result = await this.prisma.$queryRaw<Array<{ has_access: boolean }>>`
        SELECT EXISTS(
          SELECT 1 FROM protocols p
          WHERE p.id = ${protocolId}
          AND p.tenant_id = ${tenantId}
          AND (
            p.owner_id = ${userId}
            OR EXISTS (
              SELECT 1 FROM protocol_permissions pp
              WHERE pp.protocol_id = p.id
              AND pp.user_id = ${userId}
              AND pp.is_active = true
              AND (pp.expires_at IS NULL OR pp.expires_at > NOW())
            )
            OR (p.visibility = 'PUBLIC' AND p.is_public = true)
          )
        ) as has_access
      `;
      
      const hasAccess = result[0]?.has_access || false;
      
      // 缓存结果
      if (hasAccess) {
        await this.cache.setProtocolPermissions(protocolId, userId, ['read']);
      }
      
      this.recordQueryMetrics({
        query: 'checkProtocolAccessOptimized',
        executionTime: Date.now() - startTime,
        rowsExamined: 1,
        rowsReturned: 1,
        indexUsed: true,
        cacheHit: false,
        timestamp: new Date()
      });
      
      return hasAccess;
    } catch (error) {
      console.error('Error checking protocol access:', error);
      return false;
    }
  }
  
  // ===========================================
  // 用户协议列表查询优化
  // ===========================================
  
  async getUserProtocolsOptimized(
    userId: string, 
    tenantId: string,
    options: {
      limit?: number;
      offset?: number;
      category?: string;
      difficulty?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<{
    protocols: any[];
    total: number;
    hasMore: boolean;
  }> {
    const startTime = Date.now();
    
    try {
      // 检查缓存
      const cached = await this.cache.getUserProtocols(userId, tenantId);
      if (cached && !options.category && !options.difficulty && !options.isPublic) {
        const { limit = 20, offset = 0 } = options;
        const paginated = cached.slice(offset, offset + limit);
        
        this.recordQueryMetrics({
          query: 'getUserProtocolsOptimized (cached)',
          executionTime: Date.now() - startTime,
          rowsExamined: 0,
          rowsReturned: paginated.length,
          indexUsed: false,
          cacheHit: true,
          timestamp: new Date()
        });
        
        return {
          protocols: paginated,
          total: cached.length,
          hasMore: offset + limit < cached.length
        };
      }
      
      // 构建优化的查询
      const whereClause = this.buildUserProtocolsWhereClause(userId, tenantId, options);
      const { limit = 20, offset = 0 } = options;
      
      // 使用物化视图或优化的查询
      const [protocols, totalResult] = await Promise.all([
        this.prisma.protocol.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            difficulty: true,
            duration: true,
            frequency: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
            ownerId: true,
            tenantId: true
          },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          skip: offset
        }),
        this.prisma.protocol.count({ where: whereClause })
      ]);
      
      // 缓存结果（仅当没有过滤条件时）
      if (!options.category && !options.difficulty && !options.isPublic) {
        await this.cache.setUserProtocols(userId, tenantId, protocols);
      }
      
      this.recordQueryMetrics({
        query: 'getUserProtocolsOptimized',
        executionTime: Date.now() - startTime,
        rowsExamined: totalResult,
        rowsReturned: protocols.length,
        indexUsed: true,
        cacheHit: false,
        timestamp: new Date()
      });
      
      return {
        protocols,
        total: totalResult,
        hasMore: offset + limit < totalResult
      };
    } catch (error) {
      console.error('Error getting user protocols:', error);
      return { protocols: [], total: 0, hasMore: false };
    }
  }
  
  // ===========================================
  // 公开协议查询优化
  // ===========================================
  
  async getPublicProtocolsOptimized(options: {
    limit?: number;
    offset?: number;
    category?: string;
    difficulty?: string;
    search?: string;
  } = {}): Promise<{
    protocols: any[];
    total: number;
    hasMore: boolean;
  }> {
    const startTime = Date.now();
    
    try {
      // 检查缓存
      const cached = await this.cache.getPublicProtocols();
      if (cached && !options.category && !options.difficulty && !options.search) {
        const { limit = 20, offset = 0 } = options;
        const paginated = cached.slice(offset, offset + limit);
        
        this.recordQueryMetrics({
          query: 'getPublicProtocolsOptimized (cached)',
          executionTime: Date.now() - startTime,
          rowsExamined: 0,
          rowsReturned: paginated.length,
          indexUsed: false,
          cacheHit: true,
          timestamp: new Date()
        });
        
        return {
          protocols: paginated,
          total: cached.length,
          hasMore: offset + limit < cached.length
        };
      }
      
      // 构建优化的查询
      const whereClause = this.buildPublicProtocolsWhereClause(options);
      const { limit = 20, offset = 0 } = options;
      
      const [protocols, totalResult] = await Promise.all([
        this.prisma.protocol.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            difficulty: true,
            duration: true,
            frequency: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
            ownerId: true,
            tenantId: true
          },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          skip: offset
        }),
        this.prisma.protocol.count({ where: whereClause })
      ]);
      
      // 缓存结果（仅当没有过滤条件时）
      if (!options.category && !options.difficulty && !options.search) {
        await this.cache.setPublicProtocols(protocols);
      }
      
      this.recordQueryMetrics({
        query: 'getPublicProtocolsOptimized',
        executionTime: Date.now() - startTime,
        rowsExamined: totalResult,
        rowsReturned: protocols.length,
        indexUsed: true,
        cacheHit: false,
        timestamp: new Date()
      });
      
      return {
        protocols,
        total: totalResult,
        hasMore: offset + limit < totalResult
      };
    } catch (error) {
      console.error('Error getting public protocols:', error);
      return { protocols: [], total: 0, hasMore: false };
    }
  }
  
  // ===========================================
  // 协议详情查询优化
  // ===========================================
  
  async getProtocolDetailsOptimized(protocolId: string, userId: string, tenantId: string): Promise<any | null> {
    const startTime = Date.now();
    
    try {
      // 检查缓存
      const cached = await this.cache.getProtocolDetails(protocolId);
      if (cached) {
        this.recordQueryMetrics({
          query: 'getProtocolDetailsOptimized (cached)',
          executionTime: Date.now() - startTime,
          rowsExamined: 0,
          rowsReturned: 1,
          indexUsed: false,
          cacheHit: true,
          timestamp: new Date()
        });
        return cached;
      }
      
      // 首先检查权限
      const hasAccess = await this.checkProtocolAccessOptimized(protocolId, userId, tenantId);
      if (!hasAccess) {
        return null;
      }
      
      // 使用优化的查询获取协议详情
      const protocol = await this.prisma.protocol.findUnique({
        where: { id: protocolId },
        include: {
          blocks: {
            orderBy: { order: 'asc' },
            include: {
              sessions: {
                orderBy: { order: 'asc' }
              }
            }
          },
          permissions: {
            where: { isActive: true },
            include: { user: { select: { id: true, name: true, email: true } } }
          },
          shares: {
            where: { isActive: true },
            include: { 
              sharedWithUser: { select: { id: true, name: true, email: true } },
              sharedByUser: { select: { id: true, name: true, email: true } }
            }
          }
        }
      });
      
      if (protocol) {
        // 缓存结果
        await this.cache.setProtocolDetails(protocolId, protocol);
      }
      
      this.recordQueryMetrics({
        query: 'getProtocolDetailsOptimized',
        executionTime: Date.now() - startTime,
        rowsExamined: 1,
        rowsReturned: protocol ? 1 : 0,
        indexUsed: true,
        cacheHit: false,
        timestamp: new Date()
      });
      
      return protocol;
    } catch (error) {
      console.error('Error getting protocol details:', error);
      return null;
    }
  }
  
  // ===========================================
  // 查询构建辅助方法
  // ===========================================
  
  private buildUserProtocolsWhereClause(userId: string, tenantId: string, options: any) {
    const baseWhere = {
      tenantId,
      isActive: true,
      OR: [
        { ownerId: userId },
        {
          permissions: {
            some: {
              userId,
              isActive: true,
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ]
            }
          }
        },
        { visibility: 'PUBLIC', isPublic: true }
      ]
    };
    
    // 添加过滤条件
    if (options.category) {
      (baseWhere as any).category = options.category;
    }
    
    if (options.difficulty) {
      (baseWhere as any).difficulty = options.difficulty;
    }
    
    if (options.isPublic !== undefined) {
      (baseWhere as any).isPublic = options.isPublic;
    }
    
    return baseWhere;
  }
  
  private buildPublicProtocolsWhereClause(options: any) {
    const baseWhere = {
      visibility: 'PUBLIC',
      isPublic: true,
      isActive: true
    };
    
    // 添加过滤条件
    if (options.category) {
      (baseWhere as any).category = options.category;
    }
    
    if (options.difficulty) {
      (baseWhere as any).difficulty = options.difficulty;
    }
    
    if (options.search) {
      (baseWhere as any).OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } }
      ];
    }
    
    return baseWhere;
  }
  
  // ===========================================
  // 查询性能监控
  // ===========================================
  
  private recordQueryMetrics(metrics: QueryMetrics): void {
    this.queryMetrics.push(metrics);
    
    // 保持历史记录在限制范围内
    if (this.queryMetrics.length > this.MAX_METRICS_HISTORY) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS_HISTORY);
    }
  }
  
  async getQueryPerformanceReport(): Promise<{
    totalQueries: number;
    averageExecutionTime: number;
    slowQueries: QueryMetrics[];
    cacheHitRate: number;
    recommendations: OptimizationRecommendation[];
  }> {
    const totalQueries = this.queryMetrics.length;
    const averageExecutionTime = this.queryMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries;
    const slowQueries = this.queryMetrics.filter(m => m.executionTime > 1000); // 超过1秒的查询
    const cacheHitRate = this.queryMetrics.filter(m => m.cacheHit).length / totalQueries;
    
    const recommendations = await this.generateOptimizationRecommendations();
    
    return {
      totalQueries,
      averageExecutionTime,
      slowQueries,
      cacheHitRate,
      recommendations
    };
  }
  
  private async generateOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];
    
    // 分析慢查询
    const slowQueries = this.queryMetrics.filter(m => m.executionTime > 1000);
    
    for (const query of slowQueries) {
      if (query.query.includes('getUserProtocols') && !query.cacheHit) {
        recommendations.push({
          query: query.query,
          currentPerformance: query.executionTime,
          recommendedIndex: 'idx_protocols_tenant_owner_permissions',
          expectedImprovement: 0.7,
          priority: 'HIGH',
          reason: '用户协议查询缺少复合索引'
        });
      }
      
      if (query.query.includes('checkProtocolAccess') && !query.cacheHit) {
        recommendations.push({
          query: query.query,
          currentPerformance: query.executionTime,
          recommendedIndex: 'idx_protocol_permissions_user_active',
          expectedImprovement: 0.8,
          priority: 'HIGH',
          reason: '权限检查查询缺少用户权限索引'
        });
      }
    }
    
    return recommendations;
  }
  
  // ===========================================
  // 索引优化建议
  // ===========================================
  
  async getIndexOptimizationScripts(): Promise<string[]> {
    return [
      `-- 用户协议查询优化索引
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_protocols_tenant_owner_permissions 
      ON protocols(tenant_id, owner_id, visibility, is_public, is_active) 
      WHERE is_active = true;`,
      
      `-- 权限检查优化索引
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_protocol_permissions_user_active 
      ON protocol_permissions(user_id, is_active, expires_at) 
      WHERE is_active = true;`,
      
      `-- 公开协议查询优化索引
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_protocols_public_optimized 
      ON protocols(visibility, is_public, is_active, updated_at) 
      WHERE visibility = 'PUBLIC' AND is_public = true AND is_active = true;`,
      
      `-- 协议搜索优化索引
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_protocols_search 
      ON protocols USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));`,
      
      `-- 复合权限查询索引
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_protocol_permissions_composite 
      ON protocol_permissions(protocol_id, user_id, is_active, expires_at) 
      WHERE is_active = true;`
    ];
  }
  
  // ===========================================
  // 清理和重置
  // ===========================================
  
  clearMetrics(): void {
    this.queryMetrics = [];
  }
  
  async resetCache(): Promise<void> {
    await this.cache.clearAllCaches();
  }
}
