/**
 * Protocol卡片组件
 * 优化的数据驱动组件，支持多种显示模式
 */

import React, { memo, useCallback } from 'react';
import { Protocol, ProtocolSummary } from '@athlete-ally/protocol-types';
import { useProtocolStore, useProtocolActions } from '@/stores/protocolStore';
import { useProtocol } from '@/hooks/useProtocols';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  MoreVertical, 
  Play, 
  Edit, 
  Copy, 
  Trash2,
  ChevronRight
} from 'lucide-react';

interface ProtocolCardProps {
  protocol: Protocol | ProtocolSummary;
  variant?: 'summary' | 'full';
  showActions?: boolean;
  onSelect?: (protocol: Protocol | ProtocolSummary) => void;
  onEdit?: (protocol: Protocol | ProtocolSummary) => void;
  onDuplicate?: (protocol: Protocol | ProtocolSummary) => void;
  onDelete?: (protocol: Protocol | ProtocolSummary) => void;
  onStart?: (protocol: Protocol | ProtocolSummary) => void;
  className?: string;
}

// 协议元数据组件
const ProtocolMeta = memo(({ protocol }: { protocol: Protocol | ProtocolSummary }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Badge variant="secondary" className="text-xs">
      {protocol.category}
    </Badge>
    <Badge variant="outline" className="text-xs">
      {protocol.difficulty}
    </Badge>
    {protocol.duration && (
      <div className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        <span>{protocol.duration}周</span>
      </div>
    )}
    {protocol.frequency && (
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{protocol.frequency}次/周</span>
      </div>
    )}
  </div>
));

ProtocolMeta.displayName = 'ProtocolMeta';

// 协议统计组件
const ProtocolStats = memo(({ protocol }: { protocol: Protocol | ProtocolSummary }) => {
  const isFull = 'blocks' in protocol;
  const blockCount = isFull ? protocol.blocks?.length || 0 : 0;
  
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        <span>{blockCount}个阶段</span>
      </div>
      {isFull && 'executions' in protocol && (
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          <span>{protocol.executions?.length || 0}次执行</span>
        </div>
      )}
    </div>
  );
});

ProtocolStats.displayName = 'ProtocolStats';

// 协议操作按钮组件
const ProtocolActions = memo(({ 
  protocol, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onStart 
}: { 
  protocol: Protocol | ProtocolSummary;
  onEdit?: (protocol: Protocol | ProtocolSummary) => void;
  onDuplicate?: (protocol: Protocol | ProtocolSummary) => void;
  onDelete?: (protocol: Protocol | ProtocolSummary) => void;
  onStart?: (protocol: Protocol | ProtocolSummary) => void;
}) => (
  <div className="flex items-center gap-1">
    {onStart && (
      <Button
        size="sm"
        onClick={() => onStart(protocol)}
        className="h-8 px-3"
      >
        <Play className="h-3 w-3 mr-1" />
        开始
      </Button>
    )}
    {onEdit && (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEdit(protocol)}
        className="h-8 px-2"
      >
        <Edit className="h-3 w-3" />
      </Button>
    )}
    {onDuplicate && (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onDuplicate(protocol)}
        className="h-8 px-2"
      >
        <Copy className="h-3 w-3" />
      </Button>
    )}
    {onDelete && (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onDelete(protocol)}
        className="h-8 px-2 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    )}
  </div>
));

ProtocolActions.displayName = 'ProtocolActions';

// 协议卡片骨架屏
const ProtocolCardSkeleton = memo(() => (
  <Card className="p-4">
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  </Card>
));

ProtocolCardSkeleton.displayName = 'ProtocolCardSkeleton';

// 主协议卡片组件
const ProtocolCard = memo<ProtocolCardProps>(({
  protocol,
  variant = 'summary',
  showActions = true,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onStart,
  className = '',
}) => {
  const { setSelectedProtocol } = useProtocolActions();
  const isFull = variant === 'full' && 'blocks' in protocol;
  
  // 如果是summary模式，尝试获取完整数据
  const { data: fullProtocol, isLoading } = useProtocol(
    protocol.id, 
    variant === 'full'
  );
  
  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(protocol);
    } else {
      setSelectedProtocol(protocol.id);
    }
  }, [protocol, onSelect, setSelectedProtocol]);
  
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(protocol);
    }
  }, [protocol, onEdit]);
  
  const handleDuplicate = useCallback(() => {
    if (onDuplicate) {
      onDuplicate(protocol);
    }
  }, [protocol, onDuplicate]);
  
  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(protocol);
    }
  }, [protocol, onDelete]);
  
  const handleStart = useCallback(() => {
    if (onStart) {
      onStart(protocol);
    }
  }, [protocol, onStart]);
  
  if (isLoading) {
    return <ProtocolCardSkeleton />;
  }
  
  const displayProtocol = isFull && fullProtocol ? fullProtocol : protocol;
  
  return (
    <Card 
      className={`group hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={handleSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg leading-tight">
                {displayProtocol.name}
              </h3>
              {displayProtocol.isPublic && (
                <Badge variant="default" className="text-xs">
                  公开
                </Badge>
              )}
            </div>
            {'description' in displayProtocol && displayProtocol.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {displayProtocol.description}
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-3">
        <div className="space-y-3">
          <ProtocolMeta protocol={displayProtocol} />
          <ProtocolStats protocol={displayProtocol} />
          
          {isFull && 'principles' in displayProtocol && displayProtocol.principles.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">核心原则:</p>
              <div className="flex flex-wrap gap-1">
                {displayProtocol.principles.slice(0, 3).map((principle, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {principle}
                  </Badge>
                ))}
                {displayProtocol.principles.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{displayProtocol.principles.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelect}
              className="text-muted-foreground hover:text-foreground"
            >
              查看详情
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
            <ProtocolActions
              protocol={displayProtocol}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onStart={handleStart}
            />
          </div>
        </CardFooter>
      )}
    </Card>
  );
});

ProtocolCard.displayName = 'ProtocolCard';

export default ProtocolCard;
export { ProtocolCardSkeleton, ProtocolMeta, ProtocolStats, ProtocolActions };
