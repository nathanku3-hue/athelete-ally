'use client';

import { useState, useMemo } from 'react';
import { usePlans, useCreatePlan, useDeletePlan } from '@/hooks/useTrainingQueries';
import { PlanCard } from '@/components/training/PlanCard';
import { AdvancedSearch } from '@/components/ui/advanced-search';
import { PlanCardSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TrainingPlansPage() {
  const { data: plans = [], isLoading, error, refetch } = usePlans();
  const createPlanMutation = useCreatePlan();
  const deletePlanMutation = useDeletePlan();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const filteredPlans = useMemo(() => {
    return (plans as any[]).filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return true;
        
        switch (key) {
          case 'difficulty':
            return Array.isArray(value) ? value.includes(plan.difficulty) : plan.difficulty === value;
          case 'category':
            return Array.isArray(value) ? value.includes(plan.category) : plan.category === value;
          case 'duration':
            if (value.min && plan.duration < value.min) return false;
            if (value.max && plan.duration > value.max) return false;
            return true;
          default:
            return true;
        }
      });
      
      return matchesSearch && matchesFilters;
    });
  }, [plans, searchQuery, filters]);

  const handleSearch = (query: string, newFilters: Record<string, any>) => {
    setSearchQuery(query);
    setFilters(newFilters);
  };

  const handleClear = () => {
    setSearchQuery('');
    setFilters({});
  };

  const handleCreatePlan = async () => {
    // 这里可以打开创建计划的模态框
    console.log('Create plan clicked');
  };

  const handleSelectPlan = (planId: string) => {
    console.log('Selected plan:', planId);
  };

  const handleEditPlan = (planId: string) => {
    console.log('Edit plan:', planId);
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('确定要删除这个训练计划吗？')) {
      try {
        await deletePlanMutation.mutateAsync(planId);
      } catch (error) {
        console.error('Failed to delete plan:', error);
      }
    }
  };

  const filterOptions = [
    {
      key: 'difficulty',
      label: '难度',
      type: 'multiselect' as const,
      options: [
        { value: 'beginner', label: '初级' },
        { value: 'intermediate', label: '中级' },
        { value: 'advanced', label: '高级' },
      ],
    },
    {
      key: 'category',
      label: '类别',
      type: 'multiselect' as const,
      options: [
        { value: '力量训练', label: '力量训练' },
        { value: '有氧训练', label: '有氧训练' },
        { value: '柔韧性训练', label: '柔韧性训练' },
        { value: '功能性训练', label: '功能性训练' },
      ],
    },
    {
      key: 'duration',
      label: '持续时间',
      type: 'range' as const,
      min: 1,
      max: 52,
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">加载失败</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : '无法加载训练计划'}
          </p>
          <Button onClick={() => refetch()}>重试</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">训练计划</h1>
          <p className="text-muted-foreground">选择或创建你的训练计划</p>
        </div>
        <Button onClick={handleCreatePlan}>
          <Plus className="mr-2 h-4 w-4" />
          创建计划
        </Button>
      </div>

      {/* 高级搜索 */}
      <AdvancedSearch
        onSearch={handleSearch}
        onClear={handleClear}
        filters={filterOptions}
        placeholder="搜索训练计划..."
        className="mb-8"
      />

      {/* 计划列表 */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">没有找到训练计划</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || Object.keys(filters).length > 0 ? '尝试调整搜索条件' : '开始创建你的第一个训练计划'}
          </p>
          <Button onClick={handleCreatePlan}>
            <Plus className="mr-2 h-4 w-4" />
            创建计划
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelectPlan}
              onEdit={handleEditPlan}
            />
          ))}
        </div>
      )}
    </div>
  );
}
