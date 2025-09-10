# Pre-build Technical Plan for US-003: Define Competitive Season & Goal

## 功能概述
**用户故事**: 作为竞技运动员 (Alex)，我希望定义我当前的训练阶段并设置我的比赛开始日期，以便 AI 可以反向工程一个长期的分期计划。

**优先级**: Must-Have  
**依赖项**: US-001 (训练目的选择)

## 技术实现计划

### 1. 新增文件

#### 前端组件
- `src/app/(onboarding)/season/page.tsx` - 赛季和比赛目标选择页面
- `src/components/ui/SeasonCard.tsx` - 可重用的赛季选择卡片组件
- `src/components/ui/CompetitionDatePicker.tsx` - 比赛日期选择器组件
- `src/lib/constants/season.ts` - 赛季定义和比赛类型常量

#### 状态管理
- 扩展现有的 `OnboardingContext` 支持赛季和比赛日期

### 2. 修改现有文件

#### 前端路由和导航
- `src/app/(onboarding)/layout.tsx` - 更新进度指示器
- `src/app/(onboarding)/proficiency/page.tsx` - 更新"继续"按钮导航
- `src/contexts/OnboardingContext.tsx` - 添加赛季和比赛日期状态管理

### 3. 核心逻辑和组件设计

#### 赛季定义 (`src/lib/constants/season.ts`)
```typescript
export interface SeasonPhase {
  id: 'offseason' | 'preseason' | 'inseason';
  title: string;
  description: string;
  duration: string;
  trainingFocus: string;
  icon: string;
  characteristics: string[];
  competitionDistance: string;
}

export const SEASON_PHASES: SeasonPhase[] = [
  {
    id: 'offseason',
    title: '休赛期',
    description: '比赛结束后的恢复和基础建设阶段',
    duration: '3-6个月',
    trainingFocus: '基础力量建设和技术改进',
    icon: '🏗️',
    characteristics: [
      '重点发展基础力量',
      '技术动作改进',
      '体能基础建设',
      '伤病预防和恢复'
    ],
    competitionDistance: '距离比赛 > 6个月'
  },
  {
    id: 'preseason',
    title: '赛前准备期',
    description: '比赛前的专项准备和强度提升阶段',
    duration: '2-4个月',
    trainingFocus: '专项能力提升和比赛模拟',
    icon: '⚡',
    characteristics: [
      '专项力量提升',
      '比赛强度训练',
      '心理准备',
      '战术演练'
    ],
    competitionDistance: '距离比赛 2-6个月'
  },
  {
    id: 'inseason',
    title: '赛季中',
    description: '比赛期间的维持和微调阶段',
    duration: '比赛期间',
    trainingFocus: '状态维持和比赛表现',
    icon: '🏆',
    characteristics: [
      '状态维持',
      '比赛恢复',
      '战术执行',
      '心理调整'
    ],
    competitionDistance: '正在比赛期间'
  }
];

export const COMPETITION_TYPES = [
  { id: 'basketball', name: '篮球', icon: '🏀' },
  { id: 'football', name: '足球', icon: '⚽' },
  { id: 'tennis', name: '网球', icon: '🎾' },
  { id: 'swimming', name: '游泳', icon: '🏊' },
  { id: 'running', name: '跑步', icon: '🏃' },
  { id: 'cycling', name: '自行车', icon: '🚴' },
  { id: 'weightlifting', name: '举重', icon: '🏋️' },
  { id: 'other', name: '其他', icon: '🎯' }
];
```

#### 赛季选择页面 (`src/app/(onboarding)/season/page.tsx`)
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { SEASON_PHASES, COMPETITION_TYPES } from '@/lib/constants/season';
import SeasonCard from '@/components/ui/SeasonCard';
import CompetitionDatePicker from '@/components/ui/CompetitionDatePicker';
import { ArrowLeft, ArrowRight, Calendar, Target } from 'lucide-react';
import Link from 'next/link';

export default function SeasonPage() {
  const { state, updateData, validateStep } = useOnboarding();
  const [selectedSeason, setSelectedSeason] = useState<string | null>(
    state.data.season || null
  );
  const [competitionDate, setCompetitionDate] = useState<string>(
    state.data.competitionDate || ''
  );
  const [competitionType, setCompetitionType] = useState<string>('');

  const handleSeasonSelect = (seasonId: string) => {
    setSelectedSeason(seasonId);
    updateData({ season: seasonId as any });
  };

  const handleDateChange = (date: string) => {
    setCompetitionDate(date);
    updateData({ competitionDate: date });
  };

  const isStepValid = validateStep(3);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">1</span>
                </div>
                <span className="text-sm text-gray-400">目的</span>
              </div>
              <div className="w-8 h-0.5 bg-blue-600"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">2</span>
                </div>
                <span className="text-sm text-gray-400">水平</span>
              </div>
              <div className="w-8 h-0.5 bg-blue-600"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">3</span>
                </div>
                <span className="text-sm text-blue-400 font-medium">赛季</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">定义你的训练阶段</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              告诉我们你当前的训练阶段和比赛目标，这将帮助 AI 为你制定最合适的分期计划。
            </p>
          </div>

          {/* Season Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">选择当前训练阶段</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {SEASON_PHASES.map((phase) => (
                <SeasonCard
                  key={phase.id}
                  phase={phase}
                  isSelected={selectedSeason === phase.id}
                  onSelect={() => handleSeasonSelect(phase.id)}
                />
              ))}
            </div>
          </div>

          {/* Competition Date Selection */}
          {selectedSeason && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-center">设置比赛目标</h2>
              <CompetitionDatePicker
                value={competitionDate}
                onChange={handleDateChange}
                seasonPhase={selectedSeason}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Link
              href="/onboarding/proficiency"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回上一步</span>
            </Link>

            <Link
              href={isStepValid ? "/onboarding/availability" : "#"}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isStepValid
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>继续下一步</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 赛季卡片组件 (`src/components/ui/SeasonCard.tsx`)
```typescript
'use client';

import { SeasonPhase } from '@/lib/constants/season';
import { CheckCircle, Clock, Target, Zap } from 'lucide-react';

interface SeasonCardProps {
  phase: SeasonPhase;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export default function SeasonCard({ 
  phase, 
  isSelected, 
  onSelect,
  className = ''
}: SeasonCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 group ${
        isSelected
          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
          : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-750'
      } ${className}`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 animate-pulse">
          <CheckCircle className="w-6 h-6 text-blue-500" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl mb-2">{phase.icon}</div>
        {isSelected && (
          <div className="flex items-center space-x-1 text-yellow-400">
            <Target className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">已选择</span>
          </div>
        )}
      </div>

      {/* Title and Duration */}
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-1">{phase.title}</h3>
        <p className="text-sm text-gray-400 font-medium flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {phase.duration}
        </p>
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-4 leading-relaxed">{phase.description}</p>

      {/* Training Focus */}
      <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-gray-300">训练重点</span>
        </div>
        <p className="text-sm text-blue-400 font-medium">{phase.trainingFocus}</p>
      </div>

      {/* Competition Distance */}
      <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold text-gray-300">比赛距离</span>
        </div>
        <p className="text-sm text-green-400 font-medium">{phase.competitionDistance}</p>
      </div>

      {/* Characteristics */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-300">阶段特点</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          {phase.characteristics.map((char, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-400 mr-2 mt-0.5">✓</span>
              <span>{char}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Hover Effect Overlay */}
      <div className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${
        isSelected 
          ? 'bg-blue-500/5' 
          : 'bg-transparent group-hover:bg-white/5'
      }`} />
    </div>
  );
}
```

### 4. 状态管理更新

#### OnboardingContext 扩展
```typescript
// 在 OnboardingData 接口中已包含：
season?: 'offseason' | 'preseason' | 'inseason' | null;
competitionDate?: string;

// 在验证逻辑中添加：
case 3:
  // Allow null season (when skipped) or valid season values
  isValid = data.season !== undefined;
  break;
```

### 5. 测试计划

#### 手动测试清单
- [ ] 页面正确加载和显示三个赛季阶段选项
- [ ] 卡片选择状态正确更新
- [ ] 选择赛季后显示比赛日期选择器
- [ ] 日期选择器功能正常
- [ ] 选择后"继续"按钮启用
- [ ] 未选择时"继续"按钮禁用
- [ ] 返回按钮正确导航到上一步
- [ ] 继续按钮正确导航到下一步
- [ ] 状态正确保存到 OnboardingContext
- [ ] 页面刷新后选择状态保持

### 6. 设计规范

#### UI/UX 要求
- 响应式设计，支持移动端和桌面端
- 清晰的视觉层次和选择状态指示
- 流暢的动画和过渡效果
- 无障碍访问支持

#### 性能要求
- 页面加载时间 < 2秒
- 组件渲染时间 < 100ms
- 无内存泄漏

---

**预估开发时间**: 2-3 天  
**预估测试时间**: 1 天  
**总预估时间**: 3-4 天
