"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// 引入新的重量转换服务
import { formatWeight } from '@/lib/weightConverter';
import { Button } from '@/components/ui/button';
import { TimeCrunchModal } from '@/components/training/TimeCrunchModal';
import { TimeCrunchSummary } from '@/components/training/TimeCrunchSummary';
import { useTrainingAPI } from '@/hooks/useTrainingAPI';
import { Loader2 } from 'lucide-react';

// ============================================================================
// Mock Data & Types
// ============================================================================

type Unit = 'lbs' | 'kg';
type Cue = 'Slow & Controlled' | 'Fast & Explosive' | 'Heavy & Focused';

interface ExerciseDetail {
  id: string;
  name: string;
  sets: number;
  reps: number;
  plannedWeight: number;
  cue: Cue;
  description: string;
  videoThumbnailUrl: string;
}

interface TrainingDay {
  day: string;
  title: string;
  estimatedTime: string;
  exercises: ExerciseDetail[];
  sessionId?: string;
}

interface WeeklyPlan {
  id?: string;
  weekNumber: number;
  theme: string;
  volume: 'Low' | 'Mid' | 'High';
  fatigue: { status: 'low' | 'moderate' | 'high'; details: string; };
  trainingDays: TrainingDay[];
}

const MOCK_PLAN_V2: WeeklyPlan = {
  id: 'mock-plan',
  weekNumber: 1,
  theme: 'Foundation',
  volume: 'Mid',
  fatigue: { status: 'high', details: 'High Fatigue: 8.5/10' },
  trainingDays: [
    {
      day: 'Monday',
      title: 'Upper Body Strength',
      estimatedTime: '60 min',
      sessionId: 'session_mock_monday',
      exercises: [
        { id: 'ex1', name: 'Bench Press', sets: 4, reps: 8, plannedWeight: 135, cue: 'Heavy & Focused', description: 'Primary horizontal pushing movement.', videoThumbnailUrl: 'https://placehold.co/100x100/1E293B/FFFFFF/png?text=AA' },
        { id: 'ex2', name: 'Pull Ups', sets: 4, reps: 10, plannedWeight: 0, cue: 'Slow & Controlled', description: 'Vertical pulling movement for lats and biceps.', videoThumbnailUrl: 'https://placehold.co/100x100/1E293B/FFFFFF/png?text=AA' },
        { id: 'ex3', name: 'Dumbbell Rows', sets: 3, reps: 12, plannedWeight: 45, cue: 'Slow & Controlled', description: 'Horizontal pulling for back thickness.', videoThumbnailUrl: 'https://placehold.co/100x100/1E293B/FFFFFF/png?text=AA' },
      ],
    },
    {
      day: 'Wednesday',
      title: 'Lower Body Power',
      estimatedTime: '75 min',
      sessionId: 'session_mock_wednesday',
      exercises: [
        {
          id: 'ex4',
          name: 'Barbell Squat',
          sets: 5,
          reps: 5,
          plannedWeight: 225,
          cue: 'Heavy & Focused',
          description: 'The king of lower body exercises.',
          videoThumbnailUrl: 'https://placehold.co/100x100/1E293B/FFFFFF/png?text=AA',
        },
      ],
    },
    {
      day: 'Friday',
      title: 'Full Body Hypertrophy',
      estimatedTime: '70 min',
      sessionId: 'session_mock_friday',
      exercises: [
        {
          id: 'ex7',
          name: 'Deadlift',
          sets: 3,
          reps: 5,
          plannedWeight: 275,
          cue: 'Heavy & Focused',
          description: 'Full-body strength builder.',
          videoThumbnailUrl: 'https://placehold.co/100x100/1E293B/FFFFFF/png?text=AA',
        },
      ],
    },
    {
      day: 'Saturday',
      title: 'Active Recovery',
      estimatedTime: '30 min',
      sessionId: 'session_mock_saturday',
      exercises: [],
    },
  ],
};

const ALL_DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface NormalizedTimeCrunchState {
    flagEnabled: boolean;
    uiFlagEnabled: boolean;
    summary: string | null;
    minutes: number | null;
    diff: {
        removedExercises: Array<{
            id: string;
            name: string;
            estimatedMinutes: number;
            priority: 'low' | 'medium';
        }>;
        reducedExercises: Array<{
            id: string;
            name: string;
            fromSets: number;
            toSets: number;
            priority: 'medium' | 'high';
            minutesSaved: number;
        }>;
        totalMinutesSaved: number;
        originalDuration: number;
        achievedDuration: number;
        targetDuration: number;
    } | null;
    status: string | null;
}

const emptyTimeCrunchState: NormalizedTimeCrunchState = {
    flagEnabled: false,
    uiFlagEnabled: false,
    summary: null,
    minutes: null,
    diff: null,
    status: null,
};

function normalizeTimeCrunchResponse(data: any): NormalizedTimeCrunchState {
    if (!data || typeof data !== 'object') {
        return emptyTimeCrunchState;
    }

    const uiFlagEnabled = data.uiFlagEnabled !== undefined ? Boolean(data.uiFlagEnabled) : true;
    const flagEnabled = data.flagEnabled !== undefined ? Boolean(data.flagEnabled) : true;

    if (data.timeCrunch) {
        const tc = data.timeCrunch ?? {};
        return {
            flagEnabled,
            uiFlagEnabled,
            summary: tc.summary ?? null,
            minutes: tc.minutes ?? null,
            diff: tc.diff ?? null,
            status: tc.isActive ? 'compressed' : 'idle',
        };
    }

    return {
        flagEnabled,
        uiFlagEnabled,
        summary: data.summary ?? null,
        minutes: data.targetMinutes ?? data.achievedMinutes ?? null,
        diff: data.diff ?? null,
        status: data.status ?? null,
    };
}

// ============================================================================
// UI Components
// ============================================================================

const HeaderSkeleton = () => (
    <div className="flex justify-between items-center mb-8 p-4 animate-pulse">
        <div>
            <div className="h-6 w-32 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-20 bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
            <div className="h-8 w-20 bg-gray-700 rounded-md"></div>
            <div className="h-8 w-24 bg-gray-700 rounded-md"></div>
        </div>
    </div>
);

const StatusDot = ({ status, details }: { status: 'low' | 'moderate' | 'high'; details: string }) => (
    <div className="relative group">
        <div className={`w-3 h-3 rounded-full ${status === 'high' ? 'bg-red-500' : status === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{details}</div>
    </div>
);

const Header = ({ plan, unit, onUnitChange, onModifyPlan }: { plan: WeeklyPlan | null; unit: Unit; onUnitChange: (unit: Unit) => void; onModifyPlan: () => void; }) => {
    const router = useRouter();
    
    // 如果plan还在加载中，显示加载状态
    if (!plan) {
        return (
            <div className="flex justify-between items-center mb-8 p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse"></div>
                    <div>
                        <h1 className="text-2xl font-bold">Loading...</h1>
                        <p className="text-sm text-gray-400">Please wait</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex p-1 bg-gray-700 rounded-md">
                        <button onClick={() => onUnitChange('lbs')} className={`px-3 py-1 text-sm font-semibold rounded ${unit === 'lbs' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>LBS</button>
                        <button onClick={() => onUnitChange('kg')} className={`px-3 py-1 text-sm font-semibold rounded ${unit === 'kg' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>KG</button>
                    </div>
                    <button onClick={onModifyPlan} className="px-3 py-1.5 border border-gray-600 text-gray-300 rounded-md text-sm font-semibold hover:bg-gray-700 hover:border-gray-500 transition-colors">Modify Plan</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex justify-between items-center mb-8 p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
                <StatusDot status={plan.fatigue.status} details={plan.fatigue.details} />
                <div>
                    <h1 className="text-2xl font-bold">Week {plan.weekNumber}: {plan.theme}</h1>
                    <p className="text-sm text-gray-400">Volume: {plan.volume}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex p-1 bg-gray-700 rounded-md">
                    <button onClick={() => onUnitChange('lbs')} className={`px-3 py-1 text-sm font-semibold rounded ${unit === 'lbs' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>LBS</button>
                    <button onClick={() => onUnitChange('kg')} className={`px-3 py-1 text-sm font-semibold rounded ${unit === 'kg' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>KG</button>
                </div>
                <button onClick={onModifyPlan} className="px-3 py-1.5 border border-gray-600 text-gray-300 rounded-md text-sm font-semibold hover:bg-gray-700 hover:border-gray-500 transition-colors">Modify Plan</button>
            </div>
        </div>
    );
};

const ExerciseCard = ({ exercise, unit }: { exercise: ExerciseDetail; unit: Unit; }) => {
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    
    // 使用新的 formatWeight 函数来显示经过科学取整的重量
    const displayWeight = formatWeight(exercise.plannedWeight, unit);

    return (
        <div className="relative">
            <div onClick={() => setIsPopoverVisible(!isPopoverVisible)} className="bg-gray-800 p-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-700/50">
                <p className="font-bold text-lg">{exercise.name}</p>
                <p className="text-gray-400">{exercise.sets} sets x {exercise.reps} reps @ {displayWeight} {unit}</p>
                <p className="text-xs text-blue-400 mt-2 font-semibold">{exercise.cue}</p>
            </div>
            {isPopoverVisible && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-gray-700 p-4 rounded-lg shadow-lg z-10 animate-fade-in">
                    <div className="flex items-start gap-4">
                        <img src={exercise.videoThumbnailUrl} alt={`${exercise.name} thumbnail`} className="w-16 h-16 object-cover rounded-md bg-gray-600" />
                        <div>
                            <h4 className="font-bold mb-1">{exercise.name}</h4>
                            <p className="text-sm text-gray-300">{exercise.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// Main Page Component
// ============================================================================
export default function TrainingPlanPageV2_Fixed() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [unit, setUnit] = useState<Unit>('lbs');
    const [selectedDay, setSelectedDay] = useState(ALL_DAYS_OF_WEEK[new Date().getDay() -1] || "Monday");
    const [plan, setPlan] = useState<WeeklyPlan | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [planId, setPlanId] = useState<string | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [timeCrunchModalOpen, setTimeCrunchModalOpen] = useState(false);
    const [timeCrunchState, setTimeCrunchState] = useState<NormalizedTimeCrunchState>(emptyTimeCrunchState);
    const [timeCrunchLoading, setTimeCrunchLoading] = useState(false);
    const [timeCrunchError, setTimeCrunchError] = useState<string | null>(null);
    const { loadTimeCrunchStatus, compressSession } = useTrainingAPI();

    // 加载用户偏好
    useEffect(() => {
        const fetchUserPreferences = async () => {
            try {
                const response = await fetch('/api/v1/user/preferences');
                if (response.ok) {
                    const preferences = await response.json();
                    setUnit(preferences.unit || 'lbs');
                }
            } catch (error) {
                // Log error for debugging (in development)
                if (process.env.NODE_ENV === 'development') {
                    console.error('Failed to fetch user preferences:', error);
                }
                // 使用默认值，不阻塞页面加载
            }
        };

        fetchUserPreferences();
    }, []);

    // 加载训练计划数据
    useEffect(() => {
        const fetchPlanData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Log for debugging (in development)
                if (process.env.NODE_ENV === 'development') {
                    console.log('Fetching plan data from /api/v1/plans/current...');
                }
                const response = await fetch('/api/v1/plans/current');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const planData: WeeklyPlan = await response.json();
                // Log for debugging (in development)
                if (process.env.NODE_ENV === 'development') {
                    console.log('Plan data received:', { 
                        weekNumber: planData.weekNumber, 
                        theme: planData.theme,
                        trainingDaysCount: planData.trainingDays.length 
                    });
                }
                
                setPlan(planData);
                setPlanId(planData.id || null);

                // 设置默认选中的日期
                const today = ALL_DAYS_OF_WEEK[new Date().getDay() - 1] || "Monday";
                const todayPlan = planData.trainingDays.find(d => d.day === today);
                setSelectedDay(todayPlan?.day || planData.trainingDays[0]?.day || today);
                setSelectedSessionId(todayPlan?.sessionId || planData.trainingDays[0]?.sessionId || null);
                setTimeCrunchState(emptyTimeCrunchState);
                
            } catch (error) {
                // Log error for debugging (in development)
                if (process.env.NODE_ENV === 'development') {
                    console.error('Failed to fetch plan data:', error);
                }
                setError(error instanceof Error ? error.message : 'Failed to load plan');
                
                // 降级到模拟数据
                // Log for debugging (in development)
                if (process.env.NODE_ENV === 'development') {
                    console.log('Falling back to mock data...');
                }
                setPlan(MOCK_PLAN_V2);
                setPlanId(MOCK_PLAN_V2.id || 'mock-plan');
                
                const today = ALL_DAYS_OF_WEEK[new Date().getDay() - 1] || "Monday";
                const fallbackTodayPlan = MOCK_PLAN_V2.trainingDays.find(d => d.day === today);
                setSelectedDay(fallbackTodayPlan?.day || MOCK_PLAN_V2.trainingDays[0]?.day || today);
                setSelectedSessionId(fallbackTodayPlan?.sessionId || MOCK_PLAN_V2.trainingDays[0]?.sessionId || null);
                setTimeCrunchState(emptyTimeCrunchState);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlanData();
    }, []);

    useEffect(() => {
        if (!planId || !selectedSessionId) {
            return;
        }

        let cancelled = false;
        setTimeCrunchState(emptyTimeCrunchState);
        const fetchStatus = async () => {
            try {
                setTimeCrunchLoading(true);
                setTimeCrunchError(null);
                const result = await loadTimeCrunchStatus(planId, selectedSessionId);
                if (cancelled) {
                    return;
                }
                const normalized = normalizeTimeCrunchResponse(result);
                setTimeCrunchState(normalized);
            } catch (err) {
                if (cancelled) {
                    return;
                }
                setTimeCrunchError(err instanceof Error ? err.message : 'Unable to load Time Crunch status');
                setTimeCrunchState(emptyTimeCrunchState);
            } finally {
                if (!cancelled) {
                    setTimeCrunchLoading(false);
                }
            }
        };

        fetchStatus();

        return () => {
            cancelled = true;
        };
    }, [planId, selectedSessionId, loadTimeCrunchStatus]);

    // 处理单位切换并保存偏好
    const handleUnitChange = async (newUnit: Unit) => {
        setUnit(newUnit);
        
        try {
            const response = await fetch('/api/v1/user/preferences', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ unit: newUnit }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            // Log for debugging (in development)
            if (process.env.NODE_ENV === 'development') {
                console.log('User preference updated:', result);
            }
            
        } catch (error) {
            // Log error for debugging (in development)
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to save user preference:', error);
            }
            // 即使保存失败，也保持前端状态更新
        }
    };

    // 处理修改计划按钮点击
    const handleModifyPlan = () => {
        // Log for debugging (in development)
        if (process.env.NODE_ENV === 'development') {
            console.log('Modify Plan clicked - redirecting to summary page');
        }
        // 跳转到 summary 页面，讓用戶修改現有計劃
        router.push('/onboarding/summary');
    };

    const handleRestDayClick = (day: string) => {
        alert(`Add custom workout for ${day}? (Modal/Navigation would be triggered here)`);
    };

    const todayString = ALL_DAYS_OF_WEEK[new Date().getDay() -1] || "Monday";

    const handleOpenTimeCrunch = () => {
        setTimeCrunchError(null);
        setTimeCrunchModalOpen(true);
    };

    const handleTimeCrunchSubmit = async (minutes: number) => {
        if (!planId || !selectedSessionId) {
            return;
        }

        try {
            setTimeCrunchLoading(true);
            setTimeCrunchError(null);
            const result = await compressSession(planId, {
                sessionId: selectedSessionId,
                targetMinutes: minutes,
                source: 'cta',
            });
            const normalized = normalizeTimeCrunchResponse(result);
            setTimeCrunchState(normalized);
            setTimeCrunchModalOpen(false);
        } catch (err) {
            setTimeCrunchError(err instanceof Error ? err.message : 'Time Crunch Mode request failed');
        } finally {
            setTimeCrunchLoading(false);
        }
    };

    // 错误状态处理
    if (error && !plan) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-400">Failed to Load Plan</h1>
                    <p className="text-gray-400 mb-8">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
        <TimeCrunchModal
            open={timeCrunchModalOpen}
            onClose={() => setTimeCrunchModalOpen(false)}
            onSubmit={handleTimeCrunchSubmit}
            defaultMinutes={timeCrunchState.minutes ?? 30}
        />
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {isLoading ? (
                    <HeaderSkeleton />
                ) : plan ? (
                    <Header plan={plan} unit={unit} onUnitChange={handleUnitChange} onModifyPlan={handleModifyPlan} />
                ) : (
                    <HeaderSkeleton />
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <div className="space-y-3">
                            {ALL_DAYS_OF_WEEK.map(day => {
                                const trainingDay = plan?.trainingDays.find(d => d.day === day);
                                return trainingDay ? (
                                    <button
                                        key={day}
                                        onClick={() => {
                                            setSelectedDay(day);
                                            setSelectedSessionId(trainingDay.sessionId || null);
                                        }}
                                        className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${selectedDay === day ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 hover:bg-gray-700'}`}
                                    >
                                        <p className="font-bold flex justify-between items-center">{day} {day === todayString && <span className="text-xs font-semibold bg-yellow-400 text-black px-2 py-0.5 rounded-full">Today</span>}</p>
                                        <p className="text-sm">{trainingDay.title}</p>
                                    </button>
                                ) : (
                                    <div
                                        key={day}
                                        onClick={() => {
                                            handleRestDayClick(day);
                                            setSelectedSessionId(null);
                                        }}
                                        className="w-full text-left p-4 rounded-lg bg-gray-800/50 opacity-60 cursor-pointer transition-all duration-200 hover:opacity-100 hover:bg-gray-700/50"
                                    >
                                        <p className="font-bold flex justify-between items-center text-gray-400">{day} {day === todayString && <span className="text-xs font-semibold bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">Today</span>}</p>
                                        <p className="text-sm text-gray-500">Rest</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        {(() => {
                            const dayDetails = plan?.trainingDays.find(d => d.day === selectedDay);
                            return dayDetails ? (
                                <div className="bg-gray-800/50 p-6 rounded-lg">
                                    <h2 className="text-2xl font-bold mb-1">{dayDetails.title}</h2>
                                    <p className="text-gray-400 mb-6">Estimated Time: {dayDetails.estimatedTime}</p>
                                    {selectedSessionId && timeCrunchState.uiFlagEnabled ? (
                                        <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm text-blue-200/80">Short on Time?</p>
                                                    <h3 className="text-lg font-semibold text-blue-100">Time Crunch Mode 保留核心動作並自動壓縮課表</h3>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant={timeCrunchState.flagEnabled ? 'default' : 'outline'}
                                                    onClick={handleOpenTimeCrunch}
                                                    disabled={timeCrunchLoading || !timeCrunchState.flagEnabled}
                                                >
                                                    {timeCrunchLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    {timeCrunchState.flagEnabled ? '壓縮課表' : '暫不可用'}
                                                </Button>
                                            </div>
                                            {timeCrunchError && (
                                                <p className="mt-2 text-sm text-red-300">{timeCrunchError}</p>
                                            )}
                                            {timeCrunchLoading && !timeCrunchState.summary && !timeCrunchError ? (
                                                <p className="mt-3 flex items-center gap-2 text-sm text-blue-200/80">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    載入壓縮建議中...
                                                </p>
                                            ) : timeCrunchState.flagEnabled && timeCrunchState.summary ? (
                                                <div className="mt-4">
                                                    <TimeCrunchSummary
                                                        summary={timeCrunchState.summary}
                                                        minutes={timeCrunchState.minutes}
                                                        diff={timeCrunchState.diff}
                                                    />
                                                </div>
                                            ) : (
                                                <p className="mt-3 text-sm text-blue-200/80">
                                                    AI 會保留核心訓練，移除低優先度動作並調整組數，讓你在有限時間內仍能完成關鍵訓練。
                                                </p>
                                            )}
                                        </div>
                                    ) : null}
                                    <div className="space-y-4">
                                        {dayDetails.exercises.map(ex => <ExerciseCard key={ex.id} exercise={ex} unit={unit} />)}
                                    </div>
                                </div>
                            ) : <div className="bg-gray-800/50 p-6 rounded-lg text-center"><h2 className="text-2xl font-bold">Rest Day</h2><p className="text-gray-400 mt-2">Time for recovery and growth.</p></div>;
                        })()}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
