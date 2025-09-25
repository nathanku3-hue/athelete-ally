/**
 * 权限API测试
 * 测试权限API客户端的各种功能
 */

import { PermissionsAPIClient, PermissionAPIError } from '@/lib/api/permissions-api';
import { Permission } from '@athlete-ally/protocol-types';
import { JWTTestUtils } from '@athlete-ally/shared';

// 模拟fetch
global.fetch = jest.fn();

describe('PermissionsAPIClient', () => {
  let apiClient: PermissionsAPIClient;
  const mockToken = JWTTestUtils.generateTestToken('test-user-123');

  beforeEach(() => {
    apiClient = new PermissionsAPIClient();
    (fetch as jest.Mock).mockClear();
  });

  describe('checkPermission', () => {
    it('应该正确检查用户权限', async () => {
      const mockResponse = {
        hasPermission: true,
        permissions: ['read', 'write'],
        reason: 'User has required permissions'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.checkPermission(
        'protocol-1',
        'protocol',
        'read',
        mockToken
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/permissions/check'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            resourceId: 'protocol-1',
            resourceType: 'protocol',
            permission: 'read'
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('应该处理权限检查失败', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ error: 'Insufficient permissions' })
      });

      await expect(
        apiClient.checkPermission('protocol-1', 'protocol', 'write', mockToken)
      ).rejects.toThrow(PermissionAPIError);
    });
  });

  describe('getUserPermissions', () => {
    it('应该正确获取用户权限', async () => {
      const mockPermissions: Permission[] = ['read', 'write', 'execute'];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPermissions)
      });

      const result = await apiClient.getUserPermissions(
        'protocol-1',
        'protocol',
        mockToken
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/permissions/protocol/protocol-1'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );

      expect(result).toEqual(mockPermissions);
    });
  });

  describe('getProtocolShares', () => {
    it('应该正确获取协议分享列表', async () => {
      const mockShares = [
        {
          id: 'share-1',
          protocolId: 'protocol-1',
          sharedBy: 'user-1',
          sharedWith: 'user-2@example.com',
          permissions: ['read', 'write'],
          isActive: true,
          acceptedAt: new Date('2024-01-02'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockShares)
      });

      const result = await apiClient.getProtocolShares('protocol-1', mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/protocols/protocol-1/shares'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );

      expect(result).toEqual(mockShares);
    });
  });

  describe('shareProtocol', () => {
    it('应该正确分享协议', async () => {
      const shareData = {
        protocolId: 'protocol-1',
        sharedWith: 'user-2@example.com',
        permissions: ['read', 'write'] as Permission[],
        expiresAt: new Date('2024-12-31'),
        message: '请查看这个协议'
      };

      const mockResponse = {
        id: 'share-1',
        ...shareData,
        sharedBy: 'user-1',
        isActive: true,
        acceptedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.shareProtocol(shareData, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/protocols/protocol-1/shares'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(shareData)
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateProtocolShare', () => {
    it('应该正确更新分享权限', async () => {
      const updateData = {
        permissions: ['read'] as Permission[],
        isActive: false
      };

      const mockResponse = {
        id: 'share-1',
        protocolId: 'protocol-1',
        sharedBy: 'user-1',
        sharedWith: 'user-2@example.com',
        permissions: ['read'],
        isActive: false,
        acceptedAt: new Date('2024-01-02'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.updateProtocolShare('share-1', updateData, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/protocols/shares/share-1'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(updateData)
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('revokeProtocolShare', () => {
    it('应该正确撤销分享', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      await apiClient.revokeProtocolShare('share-1', mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/protocols/shares/share-1'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
    });
  });

  describe('acceptProtocolShare', () => {
    it('应该正确接受分享', async () => {
      const mockResponse = {
        id: 'share-1',
        protocolId: 'protocol-1',
        sharedBy: 'user-1',
        sharedWith: 'user-2@example.com',
        permissions: ['read', 'write'],
        isActive: true,
        acceptedAt: new Date('2024-01-02'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.acceptProtocolShare('share-1', mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/protocols/shares/share-1/accept'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('rejectProtocolShare', () => {
    it('应该正确拒绝分享', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      await apiClient.rejectProtocolShare('share-1', mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/protocols/shares/share-1/reject'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
    });
  });

  describe('getReceivedShares', () => {
    it('应该正确获取收到的分享', async () => {
      const mockShares = [
        {
          id: 'share-1',
          protocolId: 'protocol-1',
          sharedBy: 'user-1',
          sharedWith: 'user-2@example.com',
          permissions: ['read', 'write'],
          isActive: true,
          acceptedAt: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockShares)
      });

      const result = await apiClient.getReceivedShares(mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/protocols/shares/received'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );

      expect(result).toEqual(mockShares);
    });
  });

  describe('getSentShares', () => {
    it('应该正确获取发送的分享', async () => {
      const mockShares = [
        {
          id: 'share-1',
          protocolId: 'protocol-1',
          sharedBy: 'user-1',
          sharedWith: 'user-2@example.com',
          permissions: ['read', 'write'],
          isActive: true,
          acceptedAt: new Date('2024-01-02'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockShares)
      });

      const result = await apiClient.getSentShares(mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/protocols/shares/sent'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );

      expect(result).toEqual(mockShares);
    });
  });

  describe('setProtocolPublic', () => {
    it('应该正确设置协议公开状态', async () => {
      const mockProtocol = {
        id: 'protocol-1',
        name: '测试协议',
        isPublic: true,
        // ... 其他属性
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProtocol)
      });

      const result = await apiClient.setProtocolPublic('protocol-1', true, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/protocols/protocol-1/public'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ isPublic: true })
        })
      );

      expect(result).toEqual(mockProtocol);
    });
  });

  describe('copyPublicProtocol', () => {
    it('应该正确复制公开协议', async () => {
      const mockProtocol = {
        id: 'protocol-2',
        name: '复制的协议',
        isPublic: false,
        // ... 其他属性
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProtocol)
      });

      const result = await apiClient.copyPublicProtocol('protocol-1', '复制的协议', mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/protocols/protocol-1/copy'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ name: '复制的协议' })
        })
      );

      expect(result).toEqual(mockProtocol);
    });
  });

  describe('getPublicProtocols', () => {
    it('应该正确获取公开协议列表', async () => {
      const mockResponse = {
        protocols: [
          {
            id: 'protocol-1',
            name: '公开协议1',
            isPublic: true,
            // ... 其他属性
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.getPublicProtocols({
        category: 'strength',
        difficulty: 'intermediate',
        page: 1,
        limit: 20
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/protocols/public'),
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchUsers', () => {
    it('应该正确搜索用户', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: '张三',
          email: 'zhangsan@example.com',
          avatar: 'https://example.com/avatar1.jpg'
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers)
      });

      const result = await apiClient.searchUsers('张三', mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/search'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );

      expect(result).toEqual(mockUsers);
    });
  });

  describe('getPermissionStats', () => {
    it('应该正确获取权限统计', async () => {
      const mockStats = {
        totalProtocols: 10,
        sharedProtocols: 5,
        publicProtocols: 2,
        receivedShares: 3,
        sentShares: 5,
        pendingShares: 1
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats)
      });

      const result = await apiClient.getPermissionStats(mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/permissions/stats'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );

      expect(result).toEqual(mockStats);
    });
  });

  describe('错误处理', () => {
    it('应该正确处理网络错误', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        apiClient.checkPermission('protocol-1', 'protocol', 'read', mockToken)
      ).rejects.toThrow('Network error');
    });

    it('应该正确处理API错误响应', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Server error' })
      });

      await expect(
        apiClient.checkPermission('protocol-1', 'protocol', 'read', mockToken)
      ).rejects.toThrow(PermissionAPIError);
    });

    it('应该正确处理空响应', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      const result = await apiClient.revokeProtocolShare('share-1', mockToken);
      expect(result).toEqual({});
    });
  });
});
