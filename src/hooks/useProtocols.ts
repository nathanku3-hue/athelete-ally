/**
 * Protocol数据获取和管理Hook
 * 提供Protocol相关的数据获取、缓存、状态管理功能
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Protocol, ProtocolSummary, CreateProtocolRequest, UpdateProtocolRequest, ProtocolFilters, PaginatedResponse } from '@athlete-ally/protocol-types';

// API客户端接口
interface ProtocolAPIClient {
  getProtocols: (filters: ProtocolFilters) => Promise<PaginatedResponse<ProtocolSummary>>;
  getProtocol: (id: string, includeBlocks?: boolean) => Promise<Protocol>;
  createProtocol: (data: CreateProtocolRequest) => Promise<Protocol>;
  updateProtocol: (id: string, data: UpdateProtocolRequest) => Promise<Protocol>;
  deleteProtocol: (id: string) => Promise<void>;
  searchProtocols: (query: string, filters: ProtocolFilters) => Promise<ProtocolSummary[]>;
}

// 模拟API客户端（实际项目中应该从API服务获取）
const protocolAPI: ProtocolAPIClient = {
  getProtocols: async (filters) => {
    const response = await fetch(`/api/v1/protocols?${new URLSearchParams(filters as any)}`);
    if (!response.ok) throw new Error('Failed to fetch protocols');
    return response.json();
  },
  
  getProtocol: async (id, includeBlocks = false) => {
    const response = await fetch(`/api/v1/protocols/${id}?includeBlocks=${includeBlocks}`);
    if (!response.ok) throw new Error('Failed to fetch protocol');
    return response.json();
  },
  
  createProtocol: async (data) => {
    const response = await fetch('/api/v1/protocols', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create protocol');
    return response.json();
  },
  
  updateProtocol: async (id, data) => {
    const response = await fetch(`/api/v1/protocols/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update protocol');
    return response.json();
  },
  
  deleteProtocol: async (id) => {
    const response = await fetch(`/api/v1/protocols/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete protocol');
  },
  
  searchProtocols: async (query, filters) => {
    const response = await fetch(`/api/v1/protocols/search?q=${encodeURIComponent(query)}&${new URLSearchParams(filters as any)}`);
    if (!response.ok) throw new Error('Failed to search protocols');
    return response.json();
  },
};

/**
 * 获取协议列表
 */
export const useProtocols = (filters: ProtocolFilters = {}) => {
  return useQuery({
    queryKey: ['protocols', filters],
    queryFn: () => protocolAPI.getProtocols(filters),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟缓存
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * 获取单个协议详情
 */
export const useProtocol = (id: string, includeBlocks = false) => {
  return useQuery({
    queryKey: ['protocol', id, includeBlocks],
    queryFn: () => protocolAPI.getProtocol(id, includeBlocks),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * 无限滚动获取协议列表
 */
export const useInfiniteProtocols = (filters: ProtocolFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ['protocols', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => protocolAPI.getProtocols({
      ...filters,
      page: pageParam,
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * 搜索协议
 */
export const useSearchProtocols = (query: string, filters: ProtocolFilters = {}) => {
  return useQuery({
    queryKey: ['protocols', 'search', query, filters],
    queryFn: () => protocolAPI.searchProtocols(query, filters),
    enabled: query.length > 2,
    staleTime: 2 * 60 * 1000, // 2分钟缓存
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * 创建协议
 */
export const useCreateProtocol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProtocolRequest) => protocolAPI.createProtocol(data),
    onSuccess: (newProtocol) => {
      // 更新协议列表缓存
      queryClient.setQueryData(['protocols'], (old: PaginatedResponse<ProtocolSummary> | undefined) => {
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
      console.error('Failed to create protocol:', error);
    },
  });
};

/**
 * 更新协议
 */
export const useUpdateProtocol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProtocolRequest }) => 
      protocolAPI.updateProtocol(id, data),
    onMutate: async ({ id, data }) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['protocols'] });
      await queryClient.cancelQueries({ queryKey: ['protocol', id] });
      
      // 保存之前的数据
      const previousProtocols = queryClient.getQueryData(['protocols']);
      const previousProtocol = queryClient.getQueryData(['protocol', id]);
      
      // 乐观更新
      queryClient.setQueryData(['protocols'], (old: PaginatedResponse<ProtocolSummary> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map(p => p.id === id ? { ...p, ...data } : p),
        };
      });
      
      queryClient.setQueryData(['protocol', id], (old: Protocol | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });
      
      return { previousProtocols, previousProtocol };
    },
    onError: (err, { id }, context) => {
      // 回滚更改
      if (context?.previousProtocols) {
        queryClient.setQueryData(['protocols'], context.previousProtocols);
      }
      if (context?.previousProtocol) {
        queryClient.setQueryData(['protocol', id], context.previousProtocol);
      }
    },
    onSettled: (data, error, { id }) => {
      // 重新验证查询
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
      queryClient.invalidateQueries({ queryKey: ['protocol', id] });
    },
  });
};

/**
 * 删除协议
 */
export const useDeleteProtocol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => protocolAPI.deleteProtocol(id),
    onSuccess: (_, id) => {
      // 从缓存中移除
      queryClient.setQueryData(['protocols'], (old: PaginatedResponse<ProtocolSummary> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter(p => p.id !== id),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1,
          },
        };
      });
      
      // 移除单个协议缓存
      queryClient.removeQueries({ queryKey: ['protocol', id] });
      
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
    onError: (error) => {
      console.error('Failed to delete protocol:', error);
    },
  });
};

/**
 * 协议预加载
 */
export const useProtocolPreload = () => {
  const queryClient = useQueryClient();
  
  const preloadProtocol = useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['protocol', id],
      queryFn: () => protocolAPI.getProtocol(id),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
  
  const preloadProtocols = useCallback((filters: ProtocolFilters) => {
    queryClient.prefetchQuery({
      queryKey: ['protocols', filters],
      queryFn: () => protocolAPI.getProtocols(filters),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
  
  return { preloadProtocol, preloadProtocols };
};

/**
 * 批量操作协议
 */
export const useBatchProtocolOperations = () => {
  const queryClient = useQueryClient();
  
  const batchDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const responses = await Promise.allSettled(
        ids.map(id => protocolAPI.deleteProtocol(id))
      );
      
      const failed = responses
        .map((result, index) => ({ result, id: ids[index] }))
        .filter(({ result }) => result.status === 'rejected');
      
      if (failed.length > 0) {
        throw new Error(`Failed to delete ${failed.length} protocols`);
      }
    },
    onSuccess: (_, ids) => {
      // 从缓存中移除
      queryClient.setQueryData(['protocols'], (old: PaginatedResponse<ProtocolSummary> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter(p => !ids.includes(p.id)),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - ids.length,
          },
        };
      });
      
      // 移除单个协议缓存
      ids.forEach(id => queryClient.removeQueries({ queryKey: ['protocol', id] }));
      
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });
  
  const batchUpdate = useMutation({
    mutationFn: async (updates: Array<{ id: string; data: UpdateProtocolRequest }>) => {
      const responses = await Promise.allSettled(
        updates.map(({ id, data }) => protocolAPI.updateProtocol(id, data))
      );
      
      const failed = responses
        .map((result, index) => ({ result, update: updates[index] }))
        .filter(({ result }) => result.status === 'rejected');
      
      if (failed.length > 0) {
        throw new Error(`Failed to update ${failed.length} protocols`);
      }
    },
    onSuccess: () => {
      // 使所有协议查询失效
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });
  
  return { batchDelete, batchUpdate };
};

/**
 * 协议统计信息
 */
export const useProtocolStats = () => {
  return useQuery({
    queryKey: ['protocols', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/v1/protocols/stats');
      if (!response.ok) throw new Error('Failed to fetch protocol stats');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10分钟缓存
    gcTime: 30 * 60 * 1000, // 30分钟缓存
  });
};
