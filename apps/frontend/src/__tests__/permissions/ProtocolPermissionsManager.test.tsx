/**
 * ProtocolPermissionsManager 组件测试
 * 测试权限管理组件的各种功能和交互
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtocolPermissionsManager from '@/components/permissions/ProtocolPermissionsManager';
import { Protocol, Permission } from '@athlete-ally/protocol-types';

// 模拟权限API
jest.mock('@/hooks/usePermissions', () => ({
  useProtocolShares: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useShareProtocol: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useUpdateProtocolShare: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useRevokeProtocolShare: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useSetProtocolPublic: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useSearchUsers: jest.fn(() => ({
    data: [],
    isLoading: false,
  })),
  usePermissionUtils: jest.fn(() => ({
    hasPermission: jest.fn((permissions: Permission[], required: Permission) => 
      permissions.includes(required)
    ),
    getPermissionLevel: jest.fn((permissions: Permission[]) => {
      if (permissions.includes('delete' as Permission)) return 'owner';
      if (permissions.includes('share' as Permission)) return 'admin';
      if (permissions.includes('write' as Permission)) return 'write';
      if (permissions.includes('read' as Permission)) return 'read';
      return 'none';
    }),
  })),
}));

// 模拟Zustand store
jest.mock('@/stores/protocolStore', () => ({
  useProtocolActions: jest.fn(() => ({
    setSelectedProtocol: jest.fn(),
  })),
}));

// 创建测试用的QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// 测试用的协议数据
const mockProtocol: Protocol = {
  id: 'test-protocol-1',
  name: '测试协议',
  version: '1.0.0',
  description: '这是一个测试协议',
  category: 'strength',
  difficulty: 'intermediate',
  isPublic: false,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  createdBy: 'user-1',
  principles: ['测试原则1', '测试原则2'],
  requirements: ['测试要求1', '测试要求2'],
  blocks: [],
};

// 测试用的分享数据
const mockShares = [
  {
    id: 'share-1',
    protocolId: 'test-protocol-1',
    sharedBy: 'user-1',
    sharedWith: 'user-2@example.com',
    permissions: ['read', 'write'] as Permission[],
    isActive: true,
    acceptedAt: new Date('2024-01-02'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

describe('ProtocolPermissionsManager', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('应该正确渲染权限管理组件', () => {
    renderWithQueryClient(
      <ProtocolPermissionsManager protocol={mockProtocol} />
    );

    expect(screen.getByText('权限管理')).toBeInTheDocument();
    expect(screen.getByText('分享协议')).toBeInTheDocument();
  });

  it('应该显示分享设置标签页', () => {
    renderWithQueryClient(
      <ProtocolPermissionsManager protocol={mockProtocol} />
    );

    expect(screen.getByText('分享设置')).toBeInTheDocument();
    expect(screen.getByText('权限详情')).toBeInTheDocument();
    expect(screen.getByText('公开设置')).toBeInTheDocument();
  });

  it('应该显示公开协议开关', () => {
    renderWithQueryClient(
      <ProtocolPermissionsManager protocol={mockProtocol} />
    );

    const publicToggle = screen.getByLabelText('公开协议');
    expect(publicToggle).toBeInTheDocument();
    expect(publicToggle).not.toBeChecked();
  });

  it('应该显示空状态当没有分享时', () => {
    renderWithQueryClient(
      <ProtocolPermissionsManager protocol={mockProtocol} />
    );

    expect(screen.getByText('还没有分享给其他用户')).toBeInTheDocument();
  });

  it('应该打开分享对话框当点击分享按钮时', async () => {
    renderWithQueryClient(
      <ProtocolPermissionsManager protocol={mockProtocol} />
    );

    const shareButton = screen.getByText('分享协议');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('分享协议: 测试协议')).toBeInTheDocument();
    });
  });

  it('应该显示权限说明', async () => {
    renderWithQueryClient(
      <ProtocolPermissionsManager protocol={mockProtocol} />
    );

    // 切换到权限详情标签页
    const permissionsTab = screen.getByText('权限详情');
    fireEvent.click(permissionsTab);

    // 等待内容渲染
    await waitFor(() => {
      expect(screen.getByText('您的权限')).toBeInTheDocument();
      expect(screen.getByText('权限说明')).toBeInTheDocument();
      expect(screen.getByText('查看：可以查看协议内容和详细信息')).toBeInTheDocument();
      expect(screen.getByText('编辑：可以修改协议内容和设置')).toBeInTheDocument();
      expect(screen.getByText('执行：可以开始和执行协议训练')).toBeInTheDocument();
      expect(screen.getByText('分享：可以将协议分享给其他用户')).toBeInTheDocument();
    });
  });

  it('应该显示公开设置说明', async () => {
    renderWithQueryClient(
      <ProtocolPermissionsManager protocol={mockProtocol} />
    );

    // 切换到公开设置标签页
    const publicTab = screen.getByText('公开设置');
    fireEvent.click(publicTab);

    // 等待内容渲染
    await waitFor(() => {
      expect(screen.getByText('公开协议注意事项')).toBeInTheDocument();
      expect(screen.getByText('• 公开协议可以被所有用户查看和复制')).toBeInTheDocument();
      expect(screen.getByText('• 其他用户无法修改您的原始协议')).toBeInTheDocument();
      expect(screen.getByText('• 您可以随时将协议设置为私有')).toBeInTheDocument();
    });
  });
});

describe('ShareDialog', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('应该正确渲染分享对话框', async () => {
    const mockOnShare = jest.fn();
    const mockOnClose = jest.fn();

    renderWithQueryClient(
      <ProtocolPermissionsManager 
        protocol={mockProtocol}
        onShareChange={mockOnShare}
      />
    );

    // 打开分享对话框
    const shareButton = screen.getByText('分享协议');
    fireEvent.click(shareButton);

    // 等待对话框内容渲染
    await waitFor(() => {
      expect(screen.getByText('分享协议: 测试协议')).toBeInTheDocument();
      expect(screen.getByLabelText('选择用户')).toBeInTheDocument();
      expect(screen.getByLabelText('权限设置')).toBeInTheDocument();
    });
  });

  it('应该允许选择权限', async () => {
    const mockOnShare = jest.fn();
    const mockOnClose = jest.fn();

    renderWithQueryClient(
      <ProtocolPermissionsManager 
        protocol={mockProtocol}
        onShareChange={mockOnShare}
      />
    );

    // 打开分享对话框
    const shareButton = screen.getByText('分享协议');
    fireEvent.click(shareButton);

    // 等待对话框内容渲染并检查权限开关
    await waitFor(() => {
      const readSwitch = screen.getByLabelText('查看');
      const writeSwitch = screen.getByLabelText('编辑');
      const executeSwitch = screen.getByLabelText('执行');
      const shareSwitch = screen.getByLabelText('分享');

      expect(readSwitch).toBeChecked(); // 默认选中
      expect(writeSwitch).not.toBeChecked();
      expect(executeSwitch).not.toBeChecked();
      expect(shareSwitch).not.toBeChecked();
    });
  });

  it('应该允许设置过期时间', () => {
    const mockOnShare = jest.fn();
    const mockOnClose = jest.fn();

    renderWithQueryClient(
      <ProtocolPermissionsManager 
        protocol={mockProtocol}
        onShareChange={mockOnShare}
      />
    );

    // 打开分享对话框
    const shareButton = screen.getByText('分享协议');
    fireEvent.click(shareButton);

    const expiresInput = screen.getByLabelText('过期时间（可选）');
    expect(expiresInput).toBeInTheDocument();
    expect(expiresInput).toHaveAttribute('type', 'datetime-local');
  });

  it('应该允许添加分享消息', () => {
    const mockOnShare = jest.fn();
    const mockOnClose = jest.fn();

    renderWithQueryClient(
      <ProtocolPermissionsManager 
        protocol={mockProtocol}
        onShareChange={mockOnShare}
      />
    );

    // 打开分享对话框
    const shareButton = screen.getByText('分享协议');
    fireEvent.click(shareButton);

    const messageInput = screen.getByLabelText('消息（可选）');
    expect(messageInput).toBeInTheDocument();
    expect(messageInput).toHaveAttribute('placeholder', '添加分享消息...');
  });
});

describe('PermissionIndicator', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('应该正确显示权限图标', async () => {
    renderWithQueryClient(
      <ProtocolPermissionsManager protocol={mockProtocol} />
    );

    // 切换到权限详情标签页
    const permissionsTab = screen.getByText('权限详情');
    fireEvent.click(permissionsTab);

    // 等待组件渲染完成并检查权限开关
    await waitFor(() => {
      // 检查权限开关是否存在 - 使用labelText选择器
      expect(screen.getByLabelText('查看')).toBeInTheDocument();
      expect(screen.getByLabelText('编辑')).toBeInTheDocument();
      expect(screen.getByLabelText('执行')).toBeInTheDocument();
      expect(screen.getByLabelText('分享')).toBeInTheDocument();
    });
  });
});
