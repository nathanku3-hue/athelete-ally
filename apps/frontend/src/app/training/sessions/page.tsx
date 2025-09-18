'use client';

import { useEffect, useState } from 'react';
import { useTrainingStore } from '@/stores/trainingStore';
import { useTrainingAPI } from '@/hooks/useTrainingAPI';
import { TrainingSession } from '@/components/training/TrainingSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';

export default function TrainingSessionsPage() {
  const { sessions, loading, error } = useTrainingStore();
  const { loadSessions, startSession, completeSession, completeExercise } = useTrainingAPI();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStartSession = async (sessionId: string) => {
    try {
      await startSession(sessionId);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await completeSession(sessionId);
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  const handleCompleteExercise = async (sessionId: string, exerciseId: string) => {
    try {
      await completeExercise(sessionId, exerciseId);
    } catch (error) {
      console.error('Failed to complete exercise:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => loadSessions()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">训练会话</h1>
          <p className="text-muted-foreground">管理你的训练会话</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建会话
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索训练会话..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="all">全部状态</option>
            <option value="pending">待开始</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="skipped">已跳过</option>
          </select>
        </div>
      </div>

      {/* 会话列表 */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">没有找到训练会话</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' ? '尝试调整搜索条件' : '开始创建你的第一个训练会话'}
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建会话
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSessions.map((session) => (
            <TrainingSession
              key={session.id}
              session={session}
              onStart={handleStartSession}
              onComplete={handleCompleteSession}
              onCompleteExercise={handleCompleteExercise}
            />
          ))}
        </div>
      )}
    </div>
  );
}



