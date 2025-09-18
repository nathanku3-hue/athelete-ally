/**
 * Protocol状态管理Store
 * 使用Zustand管理Protocol相关的全局状态
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Protocol, ProtocolSummary, Block, BlockSession } from '@athlete-ally/protocol-types';

// 过滤器类型
export interface ProtocolFilters {
  category?: string;
  difficulty?: string;
  search?: string;
  isActive?: boolean;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// 视图模式
export type ViewMode = 'list' | 'grid' | 'detail' | 'edit';

// 选择状态
export interface SelectionState {
  selectedProtocolId: string | null;
  selectedBlockId: string | null;
  selectedSessionId: string | null;
  selectedIds: string[]; // 多选状态
}

// UI状态
export interface UIState {
  viewMode: ViewMode;
  sidebarOpen: boolean;
  filters: ProtocolFilters;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

// 缓存状态
export interface CacheState {
  protocols: Map<string, Protocol>;
  protocolSummaries: Map<string, ProtocolSummary>;
  blocks: Map<string, Block>;
  sessions: Map<string, BlockSession>;
  lastUpdated: Map<string, number>;
}

// 状态接口
interface ProtocolStore {
  // 选择状态
  selection: SelectionState;
  
  // UI状态
  ui: UIState;
  
  // 缓存状态
  cache: CacheState;
  
  // 选择操作
  setSelectedProtocol: (id: string | null) => void;
  setSelectedBlock: (id: string | null) => void;
  setSelectedSession: (id: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  
  // UI操作
  setViewMode: (mode: ViewMode) => void;
  setSidebarOpen: (open: boolean) => void;
  setFilters: (filters: ProtocolFilters) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 缓存操作
  setProtocol: (protocol: Protocol) => void;
  setProtocolSummary: (summary: ProtocolSummary) => void;
  setBlock: (block: Block) => void;
  setSession: (session: BlockSession) => void;
  removeProtocol: (id: string) => void;
  removeBlock: (id: string) => void;
  removeSession: (id: string) => void;
  clearCache: () => void;
  
  // 批量操作
  setProtocols: (protocols: Protocol[]) => void;
  setProtocolSummaries: (summaries: ProtocolSummary[]) => void;
  setBlocks: (blocks: Block[]) => void;
  setSessions: (sessions: BlockSession[]) => void;
  
  // 工具方法
  getProtocol: (id: string) => Protocol | undefined;
  getProtocolSummary: (id: string) => ProtocolSummary | undefined;
  getBlock: (id: string) => Block | undefined;
  getSession: (id: string) => BlockSession | undefined;
  isSelected: (id: string) => boolean;
  hasSelection: () => boolean;
  getSelectedProtocol: () => Protocol | undefined;
  getSelectedBlock: () => Block | undefined;
  getSelectedSession: () => BlockSession | undefined;
}

// 初始状态
const initialSelection: SelectionState = {
  selectedProtocolId: null,
  selectedBlockId: null,
  selectedSessionId: null,
  selectedIds: [],
};

const initialUI: UIState = {
  viewMode: 'list',
  sidebarOpen: true,
  filters: {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  searchQuery: '',
  isLoading: false,
  error: null,
};

const initialCache: CacheState = {
  protocols: new Map(),
  protocolSummaries: new Map(),
  blocks: new Map(),
  sessions: new Map(),
  lastUpdated: new Map(),
};

// 创建Store
export const useProtocolStore = create<ProtocolStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        selection: initialSelection,
        ui: initialUI,
        cache: initialCache,
        
        // 选择操作
        setSelectedProtocol: (id) => set((state) => ({
          selection: {
            ...state.selection,
            selectedProtocolId: id,
            selectedBlockId: null, // 清除下级选择
            selectedSessionId: null,
          },
        })),
        
        setSelectedBlock: (id) => set((state) => ({
          selection: {
            ...state.selection,
            selectedBlockId: id,
            selectedSessionId: null, // 清除下级选择
          },
        })),
        
        setSelectedSession: (id) => set((state) => ({
          selection: {
            ...state.selection,
            selectedSessionId: id,
          },
        })),
        
        setSelectedIds: (ids) => set((state) => ({
          selection: {
            ...state.selection,
            selectedIds: ids,
          },
        })),
        
        toggleSelection: (id) => set((state) => {
          const selectedIds = state.selection.selectedIds;
          const isSelected = selectedIds.includes(id);
          
          return {
            selection: {
              ...state.selection,
              selectedIds: isSelected
                ? selectedIds.filter(selectedId => selectedId !== id)
                : [...selectedIds, id],
            },
          };
        }),
        
        clearSelection: () => set((state) => ({
          selection: {
            ...state.selection,
            selectedProtocolId: null,
            selectedBlockId: null,
            selectedSessionId: null,
            selectedIds: [],
          },
        })),
        
        // UI操作
        setViewMode: (mode) => set((state) => ({
          ui: { ...state.ui, viewMode: mode },
        })),
        
        setSidebarOpen: (open) => set((state) => ({
          ui: { ...state.ui, sidebarOpen: open },
        })),
        
        setFilters: (filters) => set((state) => ({
          ui: { ...state.ui, filters: { ...state.ui.filters, ...filters } },
        })),
        
        setSearchQuery: (query) => set((state) => ({
          ui: { ...state.ui, searchQuery: query },
        })),
        
        setLoading: (loading) => set((state) => ({
          ui: { ...state.ui, isLoading: loading },
        })),
        
        setError: (error) => set((state) => ({
          ui: { ...state.ui, error },
        })),
        
        // 缓存操作
        setProtocol: (protocol) => set((state) => {
          const newCache = { ...state.cache };
          newCache.protocols.set(protocol.id, protocol);
          newCache.lastUpdated.set(protocol.id, Date.now());
          return { cache: newCache };
        }),
        
        setProtocolSummary: (summary) => set((state) => {
          const newCache = { ...state.cache };
          newCache.protocolSummaries.set(summary.id, summary);
          newCache.lastUpdated.set(summary.id, Date.now());
          return { cache: newCache };
        }),
        
        setBlock: (block) => set((state) => {
          const newCache = { ...state.cache };
          newCache.blocks.set(block.id, block);
          newCache.lastUpdated.set(block.id, Date.now());
          return { cache: newCache };
        }),
        
        setSession: (session) => set((state) => {
          const newCache = { ...state.cache };
          newCache.sessions.set(session.id, session);
          newCache.lastUpdated.set(session.id, Date.now());
          return { cache: newCache };
        }),
        
        removeProtocol: (id) => set((state) => {
          const newCache = { ...state.cache };
          newCache.protocols.delete(id);
          newCache.protocolSummaries.delete(id);
          newCache.lastUpdated.delete(id);
          return { cache: newCache };
        }),
        
        removeBlock: (id) => set((state) => {
          const newCache = { ...state.cache };
          newCache.blocks.delete(id);
          newCache.lastUpdated.delete(id);
          return { cache: newCache };
        }),
        
        removeSession: (id) => set((state) => {
          const newCache = { ...state.cache };
          newCache.sessions.delete(id);
          newCache.lastUpdated.delete(id);
          return { cache: newCache };
        }),
        
        clearCache: () => set((state) => ({
          cache: {
            protocols: new Map(),
            protocolSummaries: new Map(),
            blocks: new Map(),
            sessions: new Map(),
            lastUpdated: new Map(),
          },
        })),
        
        // 批量操作
        setProtocols: (protocols) => set((state) => {
          const newCache = { ...state.cache };
          protocols.forEach(protocol => {
            newCache.protocols.set(protocol.id, protocol);
            newCache.lastUpdated.set(protocol.id, Date.now());
          });
          return { cache: newCache };
        }),
        
        setProtocolSummaries: (summaries) => set((state) => {
          const newCache = { ...state.cache };
          summaries.forEach(summary => {
            newCache.protocolSummaries.set(summary.id, summary);
            newCache.lastUpdated.set(summary.id, Date.now());
          });
          return { cache: newCache };
        }),
        
        setBlocks: (blocks) => set((state) => {
          const newCache = { ...state.cache };
          blocks.forEach(block => {
            newCache.blocks.set(block.id, block);
            newCache.lastUpdated.set(block.id, Date.now());
          });
          return { cache: newCache };
        }),
        
        setSessions: (sessions) => set((state) => {
          const newCache = { ...state.cache };
          sessions.forEach(session => {
            newCache.sessions.set(session.id, session);
            newCache.lastUpdated.set(session.id, Date.now());
          });
          return { cache: newCache };
        }),
        
        // 工具方法
        getProtocol: (id) => get().cache.protocols.get(id),
        
        getProtocolSummary: (id) => get().cache.protocolSummaries.get(id),
        
        getBlock: (id) => get().cache.blocks.get(id),
        
        getSession: (id) => get().cache.sessions.get(id),
        
        isSelected: (id) => get().selection.selectedIds.includes(id),
        
        hasSelection: () => get().selection.selectedIds.length > 0,
        
        getSelectedProtocol: () => {
          const { selectedProtocolId } = get().selection;
          return selectedProtocolId ? get().cache.protocols.get(selectedProtocolId) : undefined;
        },
        
        getSelectedBlock: () => {
          const { selectedBlockId } = get().selection;
          return selectedBlockId ? get().cache.blocks.get(selectedBlockId) : undefined;
        },
        
        getSelectedSession: () => {
          const { selectedSessionId } = get().selection;
          return selectedSessionId ? get().cache.sessions.get(selectedSessionId) : undefined;
        },
      }),
      {
        name: 'protocol-store',
        partialize: (state) => ({
          ui: {
            viewMode: state.ui.viewMode,
            sidebarOpen: state.ui.sidebarOpen,
            filters: state.ui.filters,
          },
          selection: {
            selectedProtocolId: state.selection.selectedProtocolId,
            selectedBlockId: state.selection.selectedBlockId,
            selectedSessionId: state.selection.selectedSessionId,
          },
        }),
      }
    ),
    {
      name: 'protocol-store',
    }
  )
);

// 选择器Hooks
export const useSelectedProtocol = () => useProtocolStore(state => state.getSelectedProtocol());
export const useSelectedBlock = () => useProtocolStore(state => state.getSelectedBlock());
export const useSelectedSession = () => useProtocolStore(state => state.getSelectedSession());
export const useViewMode = () => useProtocolStore(state => state.ui.viewMode);
export const useFilters = () => useProtocolStore(state => state.ui.filters);
export const useSearchQuery = () => useProtocolStore(state => state.ui.searchQuery);
export const useIsLoading = () => useProtocolStore(state => state.ui.isLoading);
export const useError = () => useProtocolStore(state => state.ui.error);
export const useSelectedIds = () => useProtocolStore(state => state.selection.selectedIds);
export const useHasSelection = () => useProtocolStore(state => state.hasSelection());

// 操作Hooks
export const useProtocolActions = () => {
  const setSelectedProtocol = useProtocolStore(state => state.setSelectedProtocol);
  const setSelectedBlock = useProtocolStore(state => state.setSelectedBlock);
  const setSelectedSession = useProtocolStore(state => state.setSelectedSession);
  const setSelectedIds = useProtocolStore(state => state.setSelectedIds);
  const toggleSelection = useProtocolStore(state => state.toggleSelection);
  const clearSelection = useProtocolStore(state => state.clearSelection);
  
  return {
    setSelectedProtocol,
    setSelectedBlock,
    setSelectedSession,
    setSelectedIds,
    toggleSelection,
    clearSelection,
  };
};

export const useUIActions = () => {
  const setViewMode = useProtocolStore(state => state.setViewMode);
  const setSidebarOpen = useProtocolStore(state => state.setSidebarOpen);
  const setFilters = useProtocolStore(state => state.setFilters);
  const setSearchQuery = useProtocolStore(state => state.setSearchQuery);
  const setLoading = useProtocolStore(state => state.setLoading);
  const setError = useProtocolStore(state => state.setError);
  
  return {
    setViewMode,
    setSidebarOpen,
    setFilters,
    setSearchQuery,
    setLoading,
    setError,
  };
};

export const useCacheActions = () => {
  const setProtocol = useProtocolStore(state => state.setProtocol);
  const setProtocolSummary = useProtocolStore(state => state.setProtocolSummary);
  const setBlock = useProtocolStore(state => state.setBlock);
  const setSession = useProtocolStore(state => state.setSession);
  const removeProtocol = useProtocolStore(state => state.removeProtocol);
  const removeBlock = useProtocolStore(state => state.removeBlock);
  const removeSession = useProtocolStore(state => state.removeSession);
  const clearCache = useProtocolStore(state => state.clearCache);
  
  return {
    setProtocol,
    setProtocolSummary,
    setBlock,
    setSession,
    removeProtocol,
    removeBlock,
    removeSession,
    clearCache,
  };
};
