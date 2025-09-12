/**
 * Protocol权限系统测试用例
 * 测试Protocol和Block的权限管理功能
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { Protocol, Block, ProtocolShare, Permission } from '@athlete-ally/protocol-types';
import { ProtocolAPIClient } from '../../src/lib/api/protocol-api';
import { createTestUser, createTestProtocol, createTestShare } from '../helpers/test-data';

// 测试数据
let userA: { id: string; email: string; name: string };
let userB: { id: string; email: string; name: string };
let userC: { id: string; email: string; name: string };
let protocolA: Protocol;
let protocolB: Protocol;
let apiClient: ProtocolAPIClient;

describe('Protocol Permissions System', () => {
  beforeEach(async () => {
    // 创建测试用户
    userA = await createTestUser('userA@test.com', 'User A');
    userB = await createTestUser('userB@test.com', 'User B');
    userC = await createTestUser('userC@test.com', 'User C');
    
    // 创建测试协议
    protocolA = await createTestProtocol('Protocol A', userA.id);
    protocolB = await createTestProtocol('Protocol B', userB.id);
    
    // 创建API客户端
    apiClient = new ProtocolAPIClient();
  });

  afterEach(async () => {
    // 清理测试数据
    await cleanupTestData();
  });

  describe('Protocol Ownership', () => {
    test('US-001: 用户应该能够创建协议并获得所有权', async () => {
      // Given: 用户A已登录
      const tokenA = generateTestToken(userA.id);
      
      // When: 用户A创建新协议
      const newProtocol = await apiClient.createProtocol({
        name: '5/3/1 Strength Program',
        description: 'A proven strength training program',
        category: 'strength',
        difficulty: 'intermediate',
        duration: 12,
        frequency: 3,
        principles: ['Progressive overload', 'Periodization'],
        requirements: ['Barbell', 'Plates', 'Squat rack']
      }, tokenA);
      
      // Then: 协议创建成功
      expect(newProtocol.id).toBeDefined();
      expect(newProtocol.name).toBe('5/3/1 Strength Program');
      expect(newProtocol.createdBy).toBe(userA.id);
      expect(newProtocol.isPublic).toBe(false);
      
      // And: 用户A获得所有权限
      const permissions = await apiClient.getProtocolPermissions(newProtocol.id, tokenA);
      expect(permissions).toContain('read');
      expect(permissions).toContain('write');
      expect(permissions).toContain('execute');
      expect(permissions).toContain('share');
    });

    test('US-002: 用户应该只能访问自己的协议', async () => {
      // Given: 用户A创建了协议，用户B尝试访问
      const tokenA = generateTestToken(userA.id);
      const tokenB = generateTestToken(userB.id);
      
      // When: 用户B尝试访问用户A的协议
      const response = await apiClient.getProtocol(protocolA.id, tokenB);
      
      // Then: 返回403 Forbidden错误
      expect(response.status).toBe(403);
      expect(response.error).toBe('forbidden');
      expect(response.message).toBe('您没有访问此协议的权限');
    });

    test('US-002: 用户应该能够访问自己的协议', async () => {
      // Given: 用户A创建了协议
      const tokenA = generateTestToken(userA.id);
      
      // When: 用户A访问自己的协议
      const protocol = await apiClient.getProtocol(protocolA.id, tokenA);
      
      // Then: 返回协议数据
      expect(protocol.id).toBe(protocolA.id);
      expect(protocol.name).toBe(protocolA.name);
      expect(protocol.createdBy).toBe(userA.id);
    });
  });

  describe('Protocol Sharing', () => {
    test('US-003: 协议所有者应该能够分享协议', async () => {
      // Given: 用户A有协议的所有权限
      const tokenA = generateTestToken(userA.id);
      
      // When: 用户A分享协议给用户B
      const share = await apiClient.shareProtocol({
        protocolId: protocolA.id,
        sharedWith: userB.id,
        permissions: ['read', 'execute'],
        message: '请查看这个训练协议'
      }, tokenA);
      
      // Then: 分享创建成功
      expect(share.id).toBeDefined();
      expect(share.protocolId).toBe(protocolA.id);
      expect(share.sharedBy).toBe(userA.id);
      expect(share.sharedWith).toBe(userB.id);
      expect(share.permissions).toEqual(['read', 'execute']);
      expect(share.isActive).toBe(true);
      
      // And: 用户B收到分享通知
      const notifications = await apiClient.getNotifications(userB.id);
      expect(notifications).toContainEqual(expect.objectContaining({
        type: 'protocol_shared',
        protocolId: protocolA.id,
        sharedBy: userA.id
      }));
    });

    test('US-003: 被分享用户应该能够访问协议', async () => {
      // Given: 用户A分享了协议给用户B
      const tokenA = generateTestToken(userA.id);
      const tokenB = generateTestToken(userB.id);
      
      await apiClient.shareProtocol({
        protocolId: protocolA.id,
        sharedWith: userB.id,
        permissions: ['read', 'execute']
      }, tokenA);
      
      // When: 用户B访问协议
      const protocol = await apiClient.getProtocol(protocolA.id, tokenB);
      
      // Then: 用户B可以查看协议
      expect(protocol.id).toBe(protocolA.id);
      expect(protocol.name).toBe(protocolA.name);
      
      // And: 用户B可以执行协议
      const execution = await apiClient.startProtocolExecution(protocolA.id, tokenB);
      expect(execution.status).toBe('active');
      
      // But: 用户B无法修改协议
      const updateResponse = await apiClient.updateProtocol(protocolA.id, {
        name: 'Modified Protocol'
      }, tokenB);
      expect(updateResponse.status).toBe(403);
    });

    test('US-004: 协议所有者应该能够管理分享', async () => {
      // Given: 用户A分享了协议给用户B和用户C
      const tokenA = generateTestToken(userA.id);
      
      const shareB = await apiClient.shareProtocol({
        protocolId: protocolA.id,
        sharedWith: userB.id,
        permissions: ['read']
      }, tokenA);
      
      const shareC = await apiClient.shareProtocol({
        protocolId: protocolA.id,
        sharedWith: userC.id,
        permissions: ['read', 'write']
      }, tokenA);
      
      // When: 用户A查看分享管理页面
      const shares = await apiClient.getProtocolShares(protocolA.id, tokenA);
      
      // Then: 显示所有分享
      expect(shares).toHaveLength(2);
      expect(shares).toContainEqual(expect.objectContaining({
        id: shareB.id,
        sharedWith: userB.id,
        permissions: ['read']
      }));
      expect(shares).toContainEqual(expect.objectContaining({
        id: shareC.id,
        sharedWith: userC.id,
        permissions: ['read', 'write']
      }));
    });

    test('US-004: 协议所有者应该能够修改分享权限', async () => {
      // Given: 用户A分享了协议给用户B，权限为read
      const tokenA = generateTestToken(userA.id);
      const tokenB = generateTestToken(userB.id);
      
      const share = await apiClient.shareProtocol({
        protocolId: protocolA.id,
        sharedWith: userB.id,
        permissions: ['read']
      }, tokenA);
      
      // When: 用户A修改权限为read和write
      await apiClient.updateProtocolShare(share.id, {
        permissions: ['read', 'write']
      }, tokenA);
      
      // Then: 权限更新成功
      const updatedShare = await apiClient.getProtocolShare(share.id, tokenA);
      expect(updatedShare.permissions).toEqual(['read', 'write']);
      
      // And: 用户B可以修改协议
      const updateResponse = await apiClient.updateProtocol(protocolA.id, {
        name: 'Modified by User B'
      }, tokenB);
      expect(updateResponse.status).toBe(200);
    });

    test('US-004: 协议所有者应该能够撤销分享', async () => {
      // Given: 用户A分享了协议给用户B
      const tokenA = generateTestToken(userA.id);
      const tokenB = generateTestToken(userB.id);
      
      const share = await apiClient.shareProtocol({
        protocolId: protocolA.id,
        sharedWith: userB.id,
        permissions: ['read']
      }, tokenA);
      
      // When: 用户A撤销分享
      await apiClient.revokeProtocolShare(share.id, tokenA);
      
      // Then: 分享被撤销
      const updatedShare = await apiClient.getProtocolShare(share.id, tokenA);
      expect(updatedShare.isActive).toBe(false);
      
      // And: 用户B无法访问协议
      const accessResponse = await apiClient.getProtocol(protocolA.id, tokenB);
      expect(accessResponse.status).toBe(403);
    });
  });

  describe('Block Permissions', () => {
    test('US-005: 块权限应该继承自协议权限', async () => {
      // Given: 用户A有协议的read权限
      const tokenA = generateTestToken(userA.id);
      const tokenB = generateTestToken(userB.id);
      
      await apiClient.shareProtocol({
        protocolId: protocolA.id,
        sharedWith: userB.id,
        permissions: ['read']
      }, tokenA);
      
      // When: 用户B查看协议详情
      const protocol = await apiClient.getProtocol(protocolA.id, tokenB, true);
      
      // Then: 可以查看所有块
      expect(protocol.blocks).toBeDefined();
      expect(protocol.blocks.length).toBeGreaterThan(0);
      
      // But: 无法修改任何块
      const block = protocol.blocks[0];
      const updateResponse = await apiClient.updateBlock(block.id, {
        name: 'Modified Block'
      }, tokenB);
      expect(updateResponse.status).toBe(403);
    });

    test('US-006: 块应该支持独立权限设置', async () => {
      // Given: 用户A有协议的所有权限
      const tokenA = generateTestToken(userA.id);
      const tokenB = generateTestToken(userB.id);
      
      // 创建块
      const block = await apiClient.createBlock(protocolA.id, {
        name: 'Strength Block',
        description: 'A strength-focused training block',
        duration: 4,
        phase: 'build',
        intensity: 'high',
        volume: 'moderate'
      }, tokenA);
      
      // When: 用户A为块设置独立权限
      await apiClient.setBlockPermissions(block.id, {
        sharedWith: userB.id,
        permissions: ['read', 'write']
      }, tokenA);
      
      // Then: 用户B可以修改该块
      const updateResponse = await apiClient.updateBlock(block.id, {
        name: 'Modified by User B'
      }, tokenB);
      expect(updateResponse.status).toBe(200);
      
      // But: 无法修改其他块
      const otherBlock = await apiClient.createBlock(protocolA.id, {
        name: 'Other Block',
        duration: 2,
        phase: 'deload',
        intensity: 'low',
        volume: 'low'
      }, tokenA);
      
      const otherUpdateResponse = await apiClient.updateBlock(otherBlock.id, {
        name: 'Modified Other Block'
      }, tokenB);
      expect(otherUpdateResponse.status).toBe(403);
    });
  });

  describe('Public Protocol Management', () => {
    test('US-007: 用户应该能够浏览公开协议', async () => {
      // Given: 系统中有公开协议
      const tokenA = generateTestToken(userA.id);
      await apiClient.updateProtocol(protocolA.id, {
        isPublic: true
      }, tokenA);
      
      // When: 用户B访问公开协议页面
      const publicProtocols = await apiClient.getPublicProtocols();
      
      // Then: 显示公开协议
      expect(publicProtocols).toContainEqual(expect.objectContaining({
        id: protocolA.id,
        name: protocolA.name,
        isPublic: true
      }));
    });

    test('US-007: 用户应该能够复制公开协议', async () => {
      // Given: 用户A有公开协议
      const tokenA = generateTestToken(userA.id);
      const tokenB = generateTestToken(userB.id);
      
      await apiClient.updateProtocol(protocolA.id, {
        isPublic: true
      }, tokenA);
      
      // When: 用户B复制协议
      const copiedProtocol = await apiClient.copyProtocol(protocolA.id, {
        name: 'My Copy of Protocol A'
      }, tokenB);
      
      // Then: 复制成功
      expect(copiedProtocol.id).toBeDefined();
      expect(copiedProtocol.name).toBe('My Copy of Protocol A');
      expect(copiedProtocol.createdBy).toBe(userB.id);
      expect(copiedProtocol.isPublic).toBe(false);
      
      // And: 用户B获得所有权限
      const permissions = await apiClient.getProtocolPermissions(copiedProtocol.id, tokenB);
      expect(permissions).toContain('read');
      expect(permissions).toContain('write');
      expect(permissions).toContain('execute');
      expect(permissions).toContain('share');
    });

    test('US-008: 协议所有者应该能够管理公开状态', async () => {
      // Given: 用户A有私有协议
      const tokenA = generateTestToken(userA.id);
      
      // When: 用户A设置协议为公开
      await apiClient.updateProtocol(protocolA.id, {
        isPublic: true
      }, tokenA);
      
      // Then: 协议变为公开
      const protocol = await apiClient.getProtocol(protocolA.id, tokenA);
      expect(protocol.isPublic).toBe(true);
      
      // And: 所有用户都可以查看
      const publicProtocols = await apiClient.getPublicProtocols();
      expect(publicProtocols).toContainEqual(expect.objectContaining({
        id: protocolA.id
      }));
      
      // When: 用户A设置协议为私有
      await apiClient.updateProtocol(protocolA.id, {
        isPublic: false
      }, tokenA);
      
      // Then: 协议变为私有
      const updatedProtocol = await apiClient.getProtocol(protocolA.id, tokenA);
      expect(updatedProtocol.isPublic).toBe(false);
      
      // And: 只有授权用户可以看到
      const updatedPublicProtocols = await apiClient.getPublicProtocols();
      expect(updatedPublicProtocols).not.toContainEqual(expect.objectContaining({
        id: protocolA.id
      }));
    });
  });

  describe('Permission Validation', () => {
    test('US-009: 系统应该验证每个请求的权限', async () => {
      // Given: 用户A有协议，用户B没有权限
      const tokenA = generateTestToken(userA.id);
      const tokenB = generateTestToken(userB.id);
      
      // When: 用户B尝试访问协议
      const response = await apiClient.getProtocol(protocolA.id, tokenB);
      
      // Then: 权限验证失败
      expect(response.status).toBe(403);
      expect(response.error).toBe('forbidden');
      expect(response.message).toBe('您没有访问此协议的权限');
    });

    test('US-009: 系统应该允许有权限的用户访问', async () => {
      // Given: 用户A有协议权限
      const tokenA = generateTestToken(userA.id);
      
      // When: 用户A访问协议
      const response = await apiClient.getProtocol(protocolA.id, tokenA);
      
      // Then: 权限验证通过
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(protocolA.id);
    });

    test('US-010: 系统应该返回清晰的错误信息', async () => {
      // Given: 用户A没有协议权限
      const tokenA = generateTestToken(userA.id);
      
      // When: 用户A尝试修改其他用户的协议
      const response = await apiClient.updateProtocol(protocolB.id, {
        name: 'Modified Protocol'
      }, tokenA);
      
      // Then: 返回清晰的错误信息
      expect(response.status).toBe(403);
      expect(response.error).toBe('forbidden');
      expect(response.message).toBe('您没有修改此协议的权限');
      expect(response.requestId).toBeDefined();
      expect(response.suggestion).toBe('请联系协议所有者获取权限');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle invalid permission types', async () => {
      // Given: 用户A尝试分享协议
      const tokenA = generateTestToken(userA.id);
      
      // When: 使用无效权限类型
      const response = await apiClient.shareProtocol({
        protocolId: protocolA.id,
        sharedWith: userB.id,
        permissions: ['invalid_permission'] as Permission[]
      }, tokenA);
      
      // Then: 返回验证错误
      expect(response.status).toBe(400);
      expect(response.error).toBe('validation_error');
      expect(response.message).toBe('无效的权限类型: invalid_permission');
    });

    test('should handle expired shares', async () => {
      // Given: 用户A分享了协议，设置了过期时间
      const tokenA = generateTestToken(userA.id);
      const tokenB = generateTestToken(userB.id);
      
      const share = await apiClient.shareProtocol({
        protocolId: protocolA.id,
        sharedWith: userB.id,
        permissions: ['read'],
        expiresAt: new Date(Date.now() + 1000) // 1秒后过期
      }, tokenA);
      
      // When: 等待过期时间
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Then: 分享自动失效
      const expiredShare = await apiClient.getProtocolShare(share.id, tokenA);
      expect(expiredShare.isActive).toBe(false);
      
      // And: 用户B无法访问协议
      const accessResponse = await apiClient.getProtocol(protocolA.id, tokenB);
      expect(accessResponse.status).toBe(403);
    });

    test('should handle concurrent permission changes', async () => {
      // Given: 用户A分享了协议给用户B
      const tokenA = generateTestToken(userA.id);
      const tokenB = generateTestToken(userB.id);
      
      const share = await apiClient.shareProtocol({
        protocolId: protocolA.id,
        sharedWith: userB.id,
        permissions: ['read']
      }, tokenA);
      
      // When: 同时修改权限和撤销分享
      const [updateResult, revokeResult] = await Promise.allSettled([
        apiClient.updateProtocolShare(share.id, {
          permissions: ['read', 'write']
        }, tokenA),
        apiClient.revokeProtocolShare(share.id, tokenA)
      ]);
      
      // Then: 至少一个操作成功
      expect(updateResult.status === 'fulfilled' || revokeResult.status === 'fulfilled').toBe(true);
      
      // And: 最终状态一致
      const finalShare = await apiClient.getProtocolShare(share.id, tokenA);
      expect(finalShare.isActive).toBe(false);
    });
  });
});

// 辅助函数
function generateTestToken(userId: string): string {
  // 在实际实现中，这里应该生成真实的JWT token
  return `test-token-${userId}`;
}

async function cleanupTestData(): Promise<void> {
  // 清理测试数据
  // 在实际实现中，这里应该清理数据库中的测试数据
}
