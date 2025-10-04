/**
 * 权限管理Hook
 * 提供权限检查、分享管理、用户搜索等功能
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { permissionsAPI, PermissionCheck, ShareRequest, ShareUpdate, PermissionResponse, ShareResponse } from '@/lib/api/permissions-api';
import { Permission } from '@athlete-ally/protocol-types';

// 权限检查Hook
export const usePermissionCheck = (
  resourceId: string,
  resourceType: 'protocol' | 'block' | 'session',
  permission: Permission,
  token: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['permission', resourceId, resourceType, permission],
    queryFn: () => permissionsAPI.checkPermission(resourceId, resourceType, permission, token),
    enabled: enabled && !!resourceId && !!token,
    staleTime: 2 * 60 * 1000, // 2分钟缓存
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// 获取用户权限Hook
export const useUserPermissions = (
  resourceId: string,
  resourceType: 'protocol' | 'block' | 'session',
  token: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['permissions', resourceId, resourceType],
    queryFn: () => permissionsAPI.getUserPermissions(resourceId, resourceType, token),
    enabled: enabled && !!resourceId && !!token,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// 获取协议分享列表Hook
export const useProtocolShares = (protocolId: string, token: string, enabled = true) => {
  return useQuery({
    queryKey: ['protocol-shares', protocolId],
    queryFn: () => permissionsAPI.getProtocolShares(protocolId, token),
    enabled: enabled && !!protocolId && !!token,
    staleTime: 1 * 60 * 1000, // 1分钟缓存
    gcTime: 5 * 60 * 1000,
  });
};

// 分享协议Hook
export const useShareProtocol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ shareData, token }: { shareData: ShareRequest; token: string }) =>
      permissionsAPI.shareProtocol(shareData, token),
    onSuccess: (newShare, { shareData }) => {
      // 更新协议分享列表缓存
      queryClient.setQueryData(['protocol-shares', shareData.protocolId], (old: ShareResponse[] | undefined) => {
        if (!old) return [newShare];
        return [...old, newShare];
      });
      
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['protocol-shares', shareData.protocolId] });
      queryClient.invalidateQueries({ queryKey: ['permissions', shareData.protocolId] });
    },
    onError: (error) => {
      console.error('Failed to share protocol:', error);
    },
  });
};

// 更新分享权限Hook
export const useUpdateProtocolShare = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ shareId, updateData, token }: { shareId: string; updateData: ShareUpdate; token: string }) =>
      permissionsAPI.updateProtocolShare(shareId, updateData, token),
    onSuccess: (updatedShare, { shareId }) => {
      // 更新分享列表缓存
      queryClient.setQueryData(['protocol-shares', updatedShare.protocolId], (old: ShareResponse[] | undefined) => {
        if (!old) return old;
        return old.map(share => share.id === shareId ? updatedShare : share);
      });
      
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['protocol-shares', updatedShare.protocolId] });
      queryClient.invalidateQueries({ queryKey: ['permissions', updatedShare.protocolId] });
    },
    onError: (error) => {
      console.error('Failed to update protocol share:', error);
    },
  });
};

// 撤销分享Hook
export const useRevokeProtocolShare = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ shareId, token }: { shareId: string; token: string }) =>
      permissionsAPI.revokeProtocolShare(shareId, token),
    onSuccess: (_, { shareId }) => {
      // 从所有相关缓存中移除
      queryClient.setQueriesData({ queryKey: ['protocol-shares'] }, (old: ShareResponse[] | undefined) => {
        if (!old) return old;
        return old.filter(share => share.id !== shareId);
      });
      
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['protocol-shares'] });
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
    onError: (error) => {
      console.error('Failed to revoke protocol share:', error);
    },
  });
};

// 接受分享Hook
export const useAcceptProtocolShare = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ shareId, token }: { shareId: string; token: string }) =>
      permissionsAPI.acceptProtocolShare(shareId, token),
    onSuccess: (acceptedShare) => {
      // 更新分享状态
      queryClient.setQueryData(['protocol-shares', acceptedShare.protocolId], (old: ShareResponse[] | undefined) => {
        if (!old) return old;
        return old.map(share => share.id === acceptedShare.id ? acceptedShare : share);
      });
      
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['protocol-shares'] });
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['protocols'] }); // 刷新协议列表
    },
    onError: (error) => {
      console.error('Failed to accept protocol share:', error);
    },
  });
};

// 拒绝分享Hook
export const useRejectProtocolShare = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ shareId, token }: { shareId: string; token: string }) =>
      permissionsAPI.rejectProtocolShare(shareId, token),
    onSuccess: (_, { shareId }) => {
      // 从缓存中移除
      queryClient.setQueriesData({ queryKey: ['protocol-shares'] }, (old: ShareResponse[] | undefined) => {
        if (!old) return old;
        return old.filter(share => share.id !== shareId);
      });
      
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['protocol-shares'] });
    },
    onError: (error) => {
      console.error('Failed to reject protocol share:', error);
    },
  });
};

// 获取收到的分享Hook
export const useReceivedShares = (token: string, enabled = true) => {
  return useQuery({
    queryKey: ['received-shares'],
    queryFn: () => permissionsAPI.getReceivedShares(token),
    enabled: enabled && !!token,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// 获取发送的分享Hook
export const useSentShares = (token: string, enabled = true) => {
  return useQuery({
    queryKey: ['sent-shares'],
    queryFn: () => permissionsAPI.getSentShares(token),
    enabled: enabled && !!token,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// 设置协议公开状态Hook
export const useSetProtocolPublic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ protocolId, isPublic, token }: { protocolId: string; isPublic: boolean; token: string }) =>
      permissionsAPI.setProtocolPublic(protocolId, isPublic, token),
    onSuccess: (updatedProtocol) => {
      // 更新协议缓存
      queryClient.setQueryData(['protocol', updatedProtocol.id], updatedProtocol);
      
      // 更新协议列表缓存
      queryClient.setQueryData(['protocols'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((p: any) => p.id === updatedProtocol.id ? updatedProtocol : p),
        };
      });
      
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
      queryClient.invalidateQueries({ queryKey: ['protocol', updatedProtocol.id] });
    },
    onError: (error) => {
      console.error('Failed to set protocol public status:', error);
    },
  });
};

// 复制公开协议Hook
export const useCopyPublicProtocol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ protocolId, name, token }: { protocolId: string; name: string; token: string }) =>
      permissionsAPI.copyPublicProtocol(protocolId, name, token),
    onSuccess: (newProtocol) => {
      // 添加到协议列表缓存
      queryClient.setQueryData(['protocols'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: [newProtocol, ...old.data],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          },
        };
      });
      
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
    onError: (error) => {
      console.error('Failed to copy public protocol:', error);
    },
  });
};

// 获取公开协议列表Hook
export const usePublicProtocols = (params?: {
  category?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['public-protocols', params],
    queryFn: () => permissionsAPI.getPublicProtocols(params),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000,
  });
};

// 搜索用户Hook
export const useSearchUsers = (query: string, token: string, enabled = true) => {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => permissionsAPI.searchUsers(query, token),
    enabled: enabled && query.length > 2 && !!token,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// 获取权限统计Hook
export const usePermissionStats = (token: string, enabled = true) => {
  return useQuery({
    queryKey: ['permission-stats'],
    queryFn: () => permissionsAPI.getPermissionStats(token),
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

// 批量权限检查Hook
export const useBatchPermissionCheck = () => {
  return useMutation({
    mutationFn: ({ checks, token }: { checks: PermissionCheck[]; token: string }) =>
      permissionsAPI.batchCheckPermissions(checks, token),
    onError: (error) => {
      console.error('Failed to batch check permissions:', error);
    },
  });
};

// 权限预加载Hook
export const usePermissionPreload = () => {
  const queryClient = useQueryClient();
  
  const preloadPermissions = useCallback((resourceId: string, resourceType: 'protocol' | 'block' | 'session', token: string) => {
    queryClient.prefetchQuery({
      queryKey: ['permissions', resourceId, resourceType],
      queryFn: () => permissionsAPI.getUserPermissions(resourceId, resourceType, token),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);
  
  const preloadShares = useCallback((protocolId: string, token: string) => {
    queryClient.prefetchQuery({
      queryKey: ['protocol-shares', protocolId],
      queryFn: () => permissionsAPI.getProtocolShares(protocolId, token),
      staleTime: 1 * 60 * 1000,
    });
  }, [queryClient]);
  
  return { preloadPermissions, preloadShares };
};

// 权限工具Hook
export const usePermissionUtils = () => {
  const hasPermission = useCallback((permissions: Permission[], requiredPermission: Permission): boolean => {
    return permissions.includes(requiredPermission);
  }, []);
  
  const hasAnyPermission = useCallback((permissions: Permission[], requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  }, []);
  
  const hasAllPermissions = useCallback((permissions: Permission[], requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  }, []);
  
  const getPermissionLevel = useCallback((permissions: Permission[]): 'none' | 'read' | 'write' | 'admin' | 'owner' => {
    if (permissions.includes('DELETE' as Permission)) return 'owner';
    if (permissions.includes('SHARE' as Permission)) return 'admin';
    if (permissions.includes('WRITE' as Permission)) return 'write';
    if (permissions.includes('READ' as Permission)) return 'read';
    return 'none';
  }, []);
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissionLevel,
  };
};
