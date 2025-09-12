/**
 * Protocol权限管理组件
 * 提供协议权限设置、分享管理和权限状态显示功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Protocol, ProtocolShare, Permission } from '@athlete-ally/protocol-types';
import { useProtocolStore, useProtocolActions } from '@/stores/protocolStore';
import { useProtocols } from '@/hooks/useProtocols';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Share2, 
  Eye, 
  Edit, 
  Play, 
  Share, 
  Settings, 
  UserPlus, 
  UserMinus,
  Clock,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

interface ProtocolPermissionsManagerProps {
  protocol: Protocol;
  onPermissionChange?: (permissions: Permission[]) => void;
  onShareChange?: (shares: ProtocolShare[]) => void;
  className?: string;
}

interface ShareDialogProps {
  protocol: Protocol;
  onShare: (shareData: ShareData) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareData {
  sharedWith: string;
  permissions: Permission[];
  expiresAt?: Date;
  message?: string;
}

interface PermissionIndicatorProps {
  permissions: Permission[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

// 权限指示器组件
const PermissionIndicator: React.FC<PermissionIndicatorProps> = ({ 
  permissions, 
  size = 'md', 
  showLabels = true 
}) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
  
  const permissionConfig = {
    read: { icon: Eye, label: '查看', color: 'text-blue-600' },
    write: { icon: Edit, label: '编辑', color: 'text-green-600' },
    execute: { icon: Play, label: '执行', color: 'text-purple-600' },
    share: { icon: Share, label: '分享', color: 'text-orange-600' }
  };
  
  return (
    <div className="flex items-center gap-2">
      {Object.entries(permissionConfig).map(([permission, config]) => {
        const Icon = config.icon;
        const hasPermission = permissions.includes(permission as Permission);
        
        return (
          <div key={permission} className="flex items-center gap-1">
            <Icon 
              className={`${iconSize} ${hasPermission ? config.color : 'text-gray-400'}`}
            />
            {showLabels && (
              <span className={`${textSize} ${hasPermission ? 'text-gray-900' : 'text-gray-400'}`}>
                {config.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// 分享对话框组件
const ShareDialog: React.FC<ShareDialogProps> = ({ protocol, onShare, isOpen, onClose }) => {
  const [shareData, setShareData] = useState<ShareData>({
    sharedWith: '',
    permissions: ['read'],
    expiresAt: undefined,
    message: ''
  });
  
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleUserSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // 在实际实现中，这里应该调用用户搜索API
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('User search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setShareData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }));
  };
  
  const handleShare = () => {
    if (!shareData.sharedWith || shareData.permissions.length === 0) {
      return;
    }
    
    onShare(shareData);
    onClose();
    setShareData({
      sharedWith: '',
      permissions: ['read'],
      expiresAt: undefined,
      message: ''
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享协议: {protocol.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 用户搜索 */}
          <div className="space-y-2">
            <Label htmlFor="user-search">选择用户</Label>
            <Input
              id="user-search"
              placeholder="搜索用户邮箱或姓名..."
              value={shareData.sharedWith}
              onChange={(e) => {
                setShareData(prev => ({ ...prev, sharedWith: e.target.value }));
                handleUserSearch(e.target.value);
              }}
            />
            {isSearching && (
              <div className="text-sm text-gray-500">搜索中...</div>
            )}
            {searchResults.length > 0 && (
              <div className="space-y-1">
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => setShareData(prev => ({ ...prev, sharedWith: user.email }))}
                  >
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 权限选择 */}
          <div className="space-y-2">
            <Label>权限设置</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['read', 'write', 'execute', 'share'] as Permission[]).map(permission => (
                <div key={permission} className="flex items-center space-x-2">
                  <Switch
                    id={permission}
                    checked={shareData.permissions.includes(permission)}
                    onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
                  />
                  <Label htmlFor={permission} className="text-sm">
                    {permissionConfig[permission].label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* 过期时间 */}
          <div className="space-y-2">
            <Label htmlFor="expires-at">过期时间（可选）</Label>
            <Input
              id="expires-at"
              type="datetime-local"
              value={shareData.expiresAt ? shareData.expiresAt.toISOString().slice(0, 16) : ''}
              onChange={(e) => setShareData(prev => ({
                ...prev,
                expiresAt: e.target.value ? new Date(e.target.value) : undefined
              }))}
            />
          </div>
          
          {/* 消息 */}
          <div className="space-y-2">
            <Label htmlFor="message">消息（可选）</Label>
            <Input
              id="message"
              placeholder="添加分享消息..."
              value={shareData.message}
              onChange={(e) => setShareData(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={handleShare}
            disabled={!shareData.sharedWith || shareData.permissions.length === 0}
          >
            分享
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// 主权限管理组件
const ProtocolPermissionsManager: React.FC<ProtocolPermissionsManagerProps> = ({
  protocol,
  onPermissionChange,
  onShareChange,
  className = ''
}) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shares, setShares] = useState<ProtocolShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setSelectedProtocol } = useProtocolActions();
  const { data: protocolShares, isLoading: sharesLoading } = useProtocols();
  
  // 加载分享数据
  useEffect(() => {
    const loadShares = async () => {
      setIsLoading(true);
      try {
        // 在实际实现中，这里应该调用API获取分享数据
        const sharesData = await fetchProtocolShares(protocol.id);
        setShares(sharesData);
      } catch (err) {
        setError('加载分享数据失败');
        console.error('Failed to load shares:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadShares();
  }, [protocol.id]);
  
  // 处理分享
  const handleShare = useCallback(async (shareData: ShareData) => {
    try {
      // 在实际实现中，这里应该调用API创建分享
      const newShare = await createProtocolShare({
        protocolId: protocol.id,
        ...shareData
      });
      
      setShares(prev => [...prev, newShare]);
      onShareChange?.(shares);
    } catch (err) {
      setError('分享失败');
      console.error('Failed to share protocol:', err);
    }
  }, [protocol.id, shares, onShareChange]);
  
  // 处理权限修改
  const handlePermissionUpdate = useCallback(async (shareId: string, permissions: Permission[]) => {
    try {
      // 在实际实现中，这里应该调用API更新权限
      await updateProtocolShare(shareId, { permissions });
      
      setShares(prev => prev.map(share => 
        share.id === shareId ? { ...share, permissions } : share
      ));
      onShareChange?.(shares);
    } catch (err) {
      setError('权限更新失败');
      console.error('Failed to update permissions:', err);
    }
  }, [shares, onShareChange]);
  
  // 处理分享撤销
  const handleRevokeShare = useCallback(async (shareId: string) => {
    try {
      // 在实际实现中，这里应该调用API撤销分享
      await revokeProtocolShare(shareId);
      
      setShares(prev => prev.filter(share => share.id !== shareId));
      onShareChange?.(shares);
    } catch (err) {
      setError('撤销分享失败');
      console.error('Failed to revoke share:', err);
    }
  }, [shares, onShareChange]);
  
  // 处理公开状态切换
  const handlePublicToggle = useCallback(async (isPublic: boolean) => {
    try {
      // 在实际实现中，这里应该调用API更新公开状态
      await updateProtocol(protocol.id, { isPublic });
      
      // 更新本地状态
      setSelectedProtocol({ ...protocol, isPublic });
    } catch (err) {
      setError('公开状态更新失败');
      console.error('Failed to update public status:', err);
    }
  }, [protocol, setSelectedProtocol]);
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">加载权限信息...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">权限管理</h3>
            <Button
              size="sm"
              onClick={() => setIsShareDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              分享协议
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="sharing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sharing">分享设置</TabsTrigger>
              <TabsTrigger value="permissions">权限详情</TabsTrigger>
              <TabsTrigger value="public">公开设置</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sharing" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="public-toggle" className="text-base font-medium">
                    公开协议
                  </Label>
                  <Switch
                    id="public-toggle"
                    checked={protocol.isPublic}
                    onCheckedChange={handlePublicToggle}
                  />
                </div>
                
                {protocol.isPublic && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-800">
                        此协议已公开，所有用户都可以查看和复制
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">分享列表</h4>
                {shares.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>还没有分享给其他用户</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {shares.map(share => (
                      <div key={share.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{share.sharedWith}</div>
                            <div className="text-sm text-gray-500">
                              {share.acceptedAt ? '已接受' : '待接受'}
                            </div>
                          </div>
                          <PermissionIndicator 
                            permissions={share.permissions} 
                            size="sm" 
                            showLabels={false}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePermissionUpdate(share.id, share.permissions)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevokeShare(share.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">您的权限</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <PermissionIndicator 
                    permissions={['read', 'write', 'execute', 'share']} 
                    size="md" 
                    showLabels={true}
                  />
                </div>
                
                <h4 className="font-medium">权限说明</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span>查看：可以查看协议内容和详细信息</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-green-600" />
                    <span>编辑：可以修改协议内容和设置</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-purple-600" />
                    <span>执行：可以开始和执行协议训练</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share className="h-4 w-4 text-orange-600" />
                    <span>分享：可以将协议分享给其他用户</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="public" className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">公开协议注意事项</span>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 公开协议可以被所有用户查看和复制</li>
                    <li>• 其他用户无法修改您的原始协议</li>
                    <li>• 您可以随时将协议设置为私有</li>
                    <li>• 公开协议会显示您的姓名作为创建者</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="public-toggle" className="text-base font-medium">
                    将此协议设为公开
                  </Label>
                  <Switch
                    id="public-toggle"
                    checked={protocol.isPublic}
                    onCheckedChange={handlePublicToggle}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        {error && (
          <CardFooter>
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <X className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardFooter>
        )}
      </Card>
      
      <ShareDialog
        protocol={protocol}
        onShare={handleShare}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </div>
  );
};

export default ProtocolPermissionsManager;
export { PermissionIndicator, ShareDialog };
