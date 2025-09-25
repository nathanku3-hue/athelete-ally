// services/cache/src/ProtocolCacheService.ts
import { CacheService } from './CacheService';

// 协议相关类型定义
export interface ProtocolSummary {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  duration?: number;
  frequency?: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  tenantId: string;
}

export interface Protocol extends ProtocolSummary {
  overview?: string;
  principles: string[];
  requirements: string[];
  blocks: Block[];
  permissions: string[];
  shares: ProtocolShare[];
}

export interface Block {
  id: string;
  protocolId: string;
  name: string;
  description?: string;
  order: number;
  duration: number;
  phase: string;
  intensity: string;
  volume: string;
  parameters?: any;
  rules?: any;
}

export interface ProtocolShare {
  id: string;
  protocolId: string;
  sharedBy: string;
  sharedWith: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export class ProtocolCacheService {
  private cache: CacheService;
  private readonly TTL = {
    PROTOCOL_SUMMARY: 3600, // 1小时
    PROTOCOL_DETAILS: 1800, // 30分钟
    PROTOCOL_PERMISSIONS: 900, // 15分钟
    PROTOCOL_SHARES: 900, // 15分钟
    USER_PROTOCOLS: 1800, // 30分钟
    PUBLIC_PROTOCOLS: 3600, // 1小时
    PROTOCOL_BLOCKS: 1800, // 30分钟
    USER_PERMISSIONS: 900 // 15分钟
  };
  
  constructor(cache: CacheService) {
    this.cache = cache;
  }
  
  // ===========================================
  // 协议摘要缓存
  // ===========================================
  
  async getProtocolSummary(protocolId: string): Promise<ProtocolSummary | null> {
    const key = `protocol:summary:${protocolId}`;
    return await this.cache.get<ProtocolSummary>(key);
  }
  
  async setProtocolSummary(protocolId: string, summary: ProtocolSummary): Promise<void> {
    const key = `protocol:summary:${protocolId}`;
    await this.cache.set(key, summary, this.TTL.PROTOCOL_SUMMARY);
  }
  
  async invalidateProtocolSummary(protocolId: string): Promise<void> {
    const key = `protocol:summary:${protocolId}`;
    await this.cache.delete(key);
  }
  
  // ===========================================
  // 协议详情缓存
  // ===========================================
  
  async getProtocolDetails(protocolId: string): Promise<Protocol | null> {
    const key = `protocol:details:${protocolId}`;
    return await this.cache.get<Protocol>(key);
  }
  
  async setProtocolDetails(protocolId: string, protocol: Protocol): Promise<void> {
    const key = `protocol:details:${protocolId}`;
    await this.cache.set(key, protocol, this.TTL.PROTOCOL_DETAILS);
  }
  
  async invalidateProtocolDetails(protocolId: string): Promise<void> {
    const key = `protocol:details:${protocolId}`;
    await this.cache.delete(key);
  }
  
  // ===========================================
  // 用户协议列表缓存
  // ===========================================
  
  async getUserProtocols(userId: string, tenantId: string): Promise<ProtocolSummary[] | null> {
    const key = `user:protocols:${tenantId}:${userId}`;
    return await this.cache.get<ProtocolSummary[]>(key);
  }
  
  async setUserProtocols(userId: string, tenantId: string, protocols: ProtocolSummary[]): Promise<void> {
    const key = `user:protocols:${tenantId}:${userId}`;
    await this.cache.set(key, protocols, this.TTL.USER_PROTOCOLS);
  }
  
  async invalidateUserProtocols(userId: string, tenantId: string): Promise<void> {
    const key = `user:protocols:${tenantId}:${userId}`;
    await this.cache.delete(key);
  }
  
  // ===========================================
  // 公开协议列表缓存
  // ===========================================
  
  async getPublicProtocols(): Promise<ProtocolSummary[] | null> {
    const key = 'protocols:public';
    return await this.cache.get<ProtocolSummary[]>(key);
  }
  
  async setPublicProtocols(protocols: ProtocolSummary[]): Promise<void> {
    const key = 'protocols:public';
    await this.cache.set(key, protocols, this.TTL.PUBLIC_PROTOCOLS);
  }
  
  async invalidatePublicProtocols(): Promise<void> {
    const key = 'protocols:public';
    await this.cache.delete(key);
  }
  
  // ===========================================
  // 权限缓存
  // ===========================================
  
  async getProtocolPermissions(protocolId: string, userId: string): Promise<string[] | null> {
    const key = `protocol:permissions:${protocolId}:${userId}`;
    return await this.cache.get<string[]>(key);
  }
  
  async setProtocolPermissions(protocolId: string, userId: string, permissions: string[]): Promise<void> {
    const key = `protocol:permissions:${protocolId}:${userId}`;
    await this.cache.set(key, permissions, this.TTL.PROTOCOL_PERMISSIONS);
  }
  
  async invalidateProtocolPermissions(protocolId: string, userId?: string): Promise<void> {
    if (userId) {
      const key = `protocol:permissions:${protocolId}:${userId}`;
      await this.cache.delete(key);
    } else {
      // 删除该协议的所有权限缓存
      const pattern = `protocol:permissions:${protocolId}:*`;
      const keys = await this.cache.keys(pattern);
      for (const key of keys) {
        await this.cache.delete(key);
      }
    }
  }
  
  // ===========================================
  // 分享缓存
  // ===========================================
  
  async getProtocolShares(protocolId: string): Promise<ProtocolShare[] | null> {
    const key = `protocol:shares:${protocolId}`;
    return await this.cache.get<ProtocolShare[]>(key);
  }
  
  async setProtocolShares(protocolId: string, shares: ProtocolShare[]): Promise<void> {
    const key = `protocol:shares:${protocolId}`;
    await this.cache.set(key, shares, this.TTL.PROTOCOL_SHARES);
  }
  
  async invalidateProtocolShares(protocolId: string): Promise<void> {
    const key = `protocol:shares:${protocolId}`;
    await this.cache.delete(key);
  }
  
  // ===========================================
  // 块缓存
  // ===========================================
  
  async getProtocolBlocks(protocolId: string): Promise<Block[] | null> {
    const key = `protocol:blocks:${protocolId}`;
    return await this.cache.get<Block[]>(key);
  }
  
  async setProtocolBlocks(protocolId: string, blocks: Block[]): Promise<void> {
    const key = `protocol:blocks:${protocolId}`;
    await this.cache.set(key, blocks, this.TTL.PROTOCOL_BLOCKS);
  }
  
  async invalidateProtocolBlocks(protocolId: string): Promise<void> {
    const key = `protocol:blocks:${protocolId}`;
    await this.cache.delete(key);
  }
  
  // ===========================================
  // 用户权限缓存
  // ===========================================
  
  async getUserPermissions(userId: string, tenantId: string): Promise<Record<string, string[]>> {
    const key = `user:permissions:${tenantId}:${userId}`;
    return await this.cache.get<Record<string, string[]>>(key) || {};
  }
  
  async setUserPermissions(userId: string, tenantId: string, permissions: Record<string, string[]>): Promise<void> {
    const key = `user:permissions:${tenantId}:${userId}`;
    await this.cache.set(key, permissions, this.TTL.USER_PERMISSIONS);
  }
  
  async invalidateUserPermissions(userId: string, tenantId: string): Promise<void> {
    const key = `user:permissions:${tenantId}:${userId}`;
    await this.cache.delete(key);
  }
  
  // ===========================================
  // 批量操作
  // ===========================================
  
  async getMultipleProtocolSummaries(protocolIds: string[]): Promise<Map<string, ProtocolSummary | null>> {
    const keys = protocolIds.map(id => `protocol:summary:${id}`);
    const values = await this.cache.mget<ProtocolSummary>(keys);
    
    const result = new Map<string, ProtocolSummary | null>();
    protocolIds.forEach((id, index) => {
      result.set(id, values[index]);
    });
    
    return result;
  }
  
  async setMultipleProtocolSummaries(summaries: Map<string, ProtocolSummary>): Promise<void> {
    const keyValuePairs: Record<string, ProtocolSummary> = {};
    summaries.forEach((summary, id) => {
      keyValuePairs[`protocol:summary:${id}`] = summary;
    });
    
    await this.cache.mset(keyValuePairs, this.TTL.PROTOCOL_SUMMARY);
  }
  
  // ===========================================
  // 缓存失效策略
  // ===========================================
  
  async invalidateProtocol(protocolId: string): Promise<void> {
    const patterns = [
      `protocol:summary:${protocolId}`,
      `protocol:details:${protocolId}`,
      `protocol:blocks:${protocolId}`,
      `protocol:shares:${protocolId}`,
      `protocol:permissions:${protocolId}:*`
    ];
    
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        const keys = await this.cache.keys(pattern);
        for (const key of keys) {
          await this.cache.delete(key);
        }
      } else {
        await this.cache.delete(pattern);
      }
    }
  }
  
  async invalidateUserData(userId: string, tenantId: string): Promise<void> {
    const patterns = [
      `user:protocols:${tenantId}:${userId}`,
      `user:permissions:${tenantId}:${userId}`,
      `protocol:permissions:*:${userId}`
    ];
    
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        const keys = await this.cache.keys(pattern);
        for (const key of keys) {
          await this.cache.delete(key);
        }
      } else {
        await this.cache.delete(pattern);
      }
    }
  }
  
  async invalidateTenantData(tenantId: string): Promise<void> {
    const patterns = [
      `user:protocols:${tenantId}:*`,
      `user:permissions:${tenantId}:*`,
      'protocols:public'
    ];
    
    for (const pattern of patterns) {
      const keys = await this.cache.keys(pattern);
      for (const key of keys) {
        await this.cache.delete(key);
      }
    }
  }
  
  // ===========================================
  // 缓存统计和监控
  // ===========================================
  
  async getCacheStats(): Promise<{
    protocolSummaries: number;
    protocolDetails: number;
    userProtocols: number;
    publicProtocols: number;
    permissions: number;
    shares: number;
    blocks: number;
    totalKeys: number;
  }> {
    const patterns = [
      'protocol:summary:*',
      'protocol:details:*',
      'user:protocols:*',
      'protocols:public',
      'protocol:permissions:*',
      'protocol:shares:*',
      'protocol:blocks:*'
    ];
    
    const counts = await Promise.all(
      patterns.map(async (pattern) => {
        const keys = await this.cache.keys(pattern);
        return keys.length;
      })
    );
    
    const totalKeys = counts.reduce((sum, count) => sum + count, 0);
    
    return {
      protocolSummaries: counts[0],
      protocolDetails: counts[1],
      userProtocols: counts[2],
      publicProtocols: counts[3],
      permissions: counts[4],
      shares: counts[5],
      blocks: counts[6],
      totalKeys
    };
  }
  
  async clearAllCaches(): Promise<void> {
    const patterns = [
      'protocol:*',
      'user:*',
      'protocols:*'
    ];
    
    for (const pattern of patterns) {
      const keys = await this.cache.keys(pattern);
      for (const key of keys) {
        await this.cache.delete(key);
      }
    }
  }
}
