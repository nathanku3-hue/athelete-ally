"use client";

import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, ReactNode, useRef } from 'react';
import { OnboardingData, OnboardingState, OnboardingContextType } from '@athlete-ally/shared-types';
import { 
  createOnboardingSpan, 
  traceStepStart, 
  traceStepComplete, 
  traceStepError, 
  traceStepSkip,
  tracePageLoad,
  traceApiCall,
  traceUserAction,
  traceOnboardingComplete,
  traceOnboardingAbandoned,
  sendStepEvent,
  STEP_NAMES
} from '../lib/onboarding-tracing';

// 扩展基础状态类型以包含前端特定字段
interface ExtendedOnboardingState extends OnboardingState {
  hasUnsavedChanges: boolean;
}

// 定义Action类型
type OnboardingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_DATA'; payload: Partial<OnboardingData> }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'MARK_COMPLETED' }
  | { type: 'CLEAR_DATA' }
  | { type: 'LOAD_FROM_STORAGE'; payload: OnboardingData }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean };

// 初始状态
const initialState: ExtendedOnboardingState = {
  data: {
    userId: '',
    currentStep: 1,
    isCompleted: false,
  },
  isLoading: false,
  error: null,
  hasUnsavedChanges: false,
};

// Reducer函数
function onboardingReducer(state: ExtendedOnboardingState, action: OnboardingAction): ExtendedOnboardingState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'UPDATE_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        hasUnsavedChanges: true,
        error: null,
      };
    
    case 'SET_STEP':
      return {
        ...state,
        data: { ...state.data, currentStep: action.payload },
        hasUnsavedChanges: true,
      };
    
    case 'MARK_COMPLETED':
      return {
        ...state,
        data: { ...state.data, isCompleted: true, submittedAt: Date.now() },
        hasUnsavedChanges: false,
      };
    
    case 'CLEAR_DATA':
      return {
        ...initialState,
        data: { ...initialState.data },
      };
    
    case 'LOAD_FROM_STORAGE':
      return {
        ...state,
        data: action.payload,
        hasUnsavedChanges: false,
        error: null,
      };
    
    case 'SET_UNSAVED_CHANGES':
      return {
        ...state,
        hasUnsavedChanges: action.payload,
      };
    
    default:
      return state;
  }
}

// 使用从 shared-types 导入的 OnboardingContextType

// 创建Context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Provider组件
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const onboardingSpanRef = useRef<any>(null);
  const stepSpansRef = useRef<Map<number, any>>(new Map());
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const startTimeRef = useRef<number>(Date.now());

  // 创建稳定的依赖项 - 只有在数据内容真正改变时才会变化
  const serializedData = useMemo(() => JSON.stringify(state.data), [state.data]);
  const serializedUnsavedChanges = useMemo(() => state.hasUnsavedChanges, [state.hasUnsavedChanges]);

  // 从localStorage加载数据
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('onboardingData');
      if (stored) {
        const parsedData = JSON.parse(stored);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedData });
        
        // 如果是从存储中恢复，重新开始追踪
        if (parsedData.userId) {
          initializeTracing(parsedData.userId);
        }
      }
    } catch (error) {
      console.error('Failed to load onboarding data from storage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load saved data' });
    }
  };

  // 初始化追踪
  const initializeTracing = (userId: string) => {
    if (!onboardingSpanRef.current) {
      onboardingSpanRef.current = createOnboardingSpan(userId, sessionIdRef.current);
    }
  };

  // 保存数据到localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem('onboardingData', JSON.stringify(state.data));
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
    } catch (error) {
      console.error('Failed to save onboarding data to storage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save data' });
    }
  };

  // 更新数据 - 架構級修復：同步保存到localStorage避免竞态条件
  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    // 1. 先计算出下一个状态
    const nextState = { ...state.data, ...updates };
    
    // 2. 立即、同步地将下一个状态保存到 localStorage
    try {
      localStorage.setItem('onboardingData', JSON.stringify(nextState));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
    
    // 3. 最后再用计算好的下一个状态，来更新 React 的内存状态
    dispatch({ type: 'UPDATE_DATA', payload: updates });
  }, [state.data]); // 依赖state.data以获取最新状态

  // 设置当前步骤 - 架構級修復：穩定的函數引用
  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []); // 空依賴數組，因為dispatch是穩定的

  // 标记完成 - 架構級修復：穩定的函數引用
  const markCompleted = useCallback(() => {
    dispatch({ type: 'MARK_COMPLETED' });
  }, []);

  // 清除数据 - 架構級修復：穩定的函數引用
  const clearData = useCallback(() => {
    localStorage.removeItem('onboardingData');
    dispatch({ type: 'CLEAR_DATA' });
  }, []);

  // 验证步骤数据 - 架構級修復：穩定的函數引用
  const validateStep = useCallback((step: number, dataToValidate?: Partial<OnboardingData>): boolean => {
    const data = dataToValidate || state.data; // 使用传入的数据或当前的 state
    
    let isValid = false;
    switch (step) {
      case 1:
        isValid = !!data.purpose;
        break;
      case 2:
        isValid = !!data.proficiency;
        break;
      case 3:
        // Allow null season (when skipped) or valid season values
        isValid = data.season !== undefined;
        break;
      case 4:
        // 验证可用性数据：至少选择一个日期，并且有周目标天数
        isValid = !!(data.availabilityDays && data.availabilityDays.length > 0 && 
                    data.weeklyGoalDays && data.weeklyGoalDays > 0);
        break;
      case 5:
        isValid = !!(data.equipment && data.equipment.length > 0);
        break;
      default:
        isValid = false;
    }
    
    return isValid;
  }, [state.data]); // 依賴state.data，因為函數內部使用了它

  // 获取步骤进度 - 架構級修復：穩定的函數引用
  const getStepProgress = useCallback(() => {
    const current = state.data.currentStep || 1;
    const total = 5;
    const percentage = Math.round((current / total) * 100);
    
    return { current, total, percentage };
  }, [state.data.currentStep]);

  // 提交数据到后端 - 架構級修復：穩定的函數引用
  const submitData = useCallback(async (): Promise<{ success: boolean; planId?: string; jobId?: string; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    // 追踪API调用
    const apiSpan = traceApiCall('submit_onboarding', state.data.userId);

    try {
      // 准备提交数据 - 修复数据格式问题
      const submitPayload = {
        userId: state.data.userId || `user_${Date.now()}`, // 使用现有的userId或生成新的
        purpose: state.data.purpose || 'general_fitness', // 提供默认值
        purposeDetails: state.data.purposeDetails || '',
        proficiency: state.data.proficiency || 'beginner', // 提供默认值
        season: state.data.season || 'offseason', // 提供默认值
        competitionDate: state.data.competitionDate || null,
        availabilityDays: state.data.availabilityDays || [], // 直接使用数组
        weeklyGoalDays: state.data.weeklyGoalDays || 3,
        equipment: state.data.equipment || [],
        fixedSchedules: [] // 简化fixedSchedules，暂时为空数组
      };

      const response = await fetch('/api/v1/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      // 完成API追踪
      apiSpan.setAttributes({
        'onboarding.api_success': true,
        'onboarding.api_duration_ms': Date.now() - startTimeRef.current,
      });
      apiSpan.setStatus({ code: 1 });
      apiSpan.end();

      // 完成引导流程追踪
      const totalDuration = Date.now() - startTimeRef.current;
      traceOnboardingComplete(onboardingSpanRef.current, state.data.userId, totalDuration, state.data);

      // 标记为已完成
      dispatch({ type: 'MARK_COMPLETED' });
      dispatch({ type: 'SET_LOADING', payload: false });

      return { 
        success: true, 
        planId: result.planId || result.eventId || 'plan_generated',
        jobId: result.jobId || `job_${crypto.randomUUID()}`
      };

    } catch (error) {
      console.error('提交数据失败:', error);
      const errorMessage = error instanceof Error ? error.message : '提交失败';
      
      // 追踪API错误
      apiSpan.setAttributes({
        'onboarding.api_success': false,
        'onboarding.api_error': errorMessage,
        'onboarding.api_duration_ms': Date.now() - startTimeRef.current,
      });
      apiSpan.setStatus({ code: 2, message: errorMessage });
      apiSpan.end();

      // 追踪引导流程错误
      traceOnboardingAbandoned(onboardingSpanRef.current, state.data.userId, state.data.currentStep || 1, errorMessage);

      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, [state.data]); // 依賴state.data，因為函數內部使用了它

  // 自动保存到localStorage
  useEffect(() => {
    if (state.hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        saveToStorage();
      }, 500); // 防抖，500ms后保存

      return () => clearTimeout(timeoutId);
    }
  }, [state.data, state.hasUnsavedChanges]);

  // 组件挂载时加载数据
  useEffect(() => {
    loadFromStorage();
  }, []);

  // 副作用：处理步骤变化时的追踪
  useEffect(() => {
    const currentStep = state.data.currentStep;
    const userId = state.data.userId;
    
    // 确保不是初始状态，避免在加载时就发送事件
    if (currentStep && currentStep > 0 && userId) {
      // 完成前一个步骤的追踪
      const previousStep = currentStep - 1;
      if (previousStep > 0 && stepSpansRef.current.has(previousStep)) {
        const previousSpan = stepSpansRef.current.get(previousStep);
        traceStepComplete(previousSpan, previousStep, userId, state.data);
        stepSpansRef.current.delete(previousStep);
      }
      
      // 开始新步骤的追踪
      const newSpan = traceStepStart(currentStep, userId, state.data);
      stepSpansRef.current.set(currentStep, newSpan);
      
      // 追踪页面加载
      tracePageLoad(currentStep, userId);
      
      // 发送步骤事件
      sendStepEvent({
        step: currentStep,
        stepName: STEP_NAMES[currentStep as keyof typeof STEP_NAMES] || `step_${currentStep}`,
        userId: userId,
        data: state.data,
        timestamp: Date.now(),
      });
    }
  }, [state.data.currentStep, state.data.userId]);

  // 副作用：处理数据更新时的追踪 - 使用稳定的依赖项
  useEffect(() => {
    const userId = state.data.userId;
    
    // 只在有实际用户操作时追踪，避免自动更新导致的循环
    if (userId && state.hasUnsavedChanges) {
      // 追踪用户行为
      if (!onboardingSpanRef.current) {
        initializeTracing(userId);
      }
      
      // 追踪数据更新
      traceUserAction('data_update', state.data.currentStep || 1, userId, state.data);
    }
  }, [serializedData, serializedUnsavedChanges]); // 使用稳定的依赖项

  // 架構級修復：使用useMemo確保contextValue的穩定性
  const contextValue: OnboardingContextType = useMemo(() => ({
    state,
    updateData,
    setStep,
    markCompleted,
    clearData,
    loadFromStorage,
    saveToStorage,
    validateStep,
    getStepProgress,
    submitData,
  }), [
    state,
    updateData,
    setStep,
    markCompleted,
    clearData,
    loadFromStorage,
    saveToStorage,
    validateStep,
    getStepProgress,
    submitData,
  ]);

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

// 自定义Hook
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

// 类型已从 shared-types 导入，无需重复导出
