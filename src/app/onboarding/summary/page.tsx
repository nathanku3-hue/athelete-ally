"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProgressIndicator from '@/components/ui/ProgressIndicator';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { PURPOSE_LABELS, PROFICIENCY_LABELS, SEASON_LABELS, EQUIPMENT_LABELS } from '@/lib/constants/labels';

export default function SummaryPage() {
  const router = useRouter();
  const { state, submitData, updateData } = useOnboarding();
  const { data: onboardingData, isLoading, error } = state;
  
  // 追蹤原始數據，用於檢測變更
  const [originalData, setOriginalData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // 在組件載入時保存原始數據
  useEffect(() => {
    if (onboardingData && !originalData) {
      setOriginalData(JSON.parse(JSON.stringify(onboardingData)));
    }
  }, [onboardingData, originalData]);

  // 檢測是否有變更
  useEffect(() => {
    if (originalData && onboardingData) {
      const hasDataChanged = JSON.stringify(originalData) !== JSON.stringify(onboardingData);
      setHasChanges(hasDataChanged);
    }
  }, [originalData, onboardingData]);

  const handleSubmit = async () => {
    // 更宽松的验证：至少需要proficiency和availability数据
    if (!onboardingData.proficiency || !onboardingData.availabilityDays?.length) {
      alert('请确保至少选择了熟练程度和可用天数');
      return;
    }

    // 如果沒有變更，直接跳轉到 Plan 頁面
    if (!hasChanges) {
      router.push('/plan');
      return;
    }

    // 如果有變更，執行正常的提交流程
    try {
      const result = await submitData();
      
      if (result.success) {
        // Store the planId for future reference
        if (result.planId) {
          localStorage.setItem('planId', result.planId);
        }
        
        // Store jobId for status polling
        if (result.jobId) {
          localStorage.setItem('planGenerationJobId', result.jobId);
        }
        
        // Navigate to plan generation with jobId
        const jobId = result.jobId || 'unknown';
        router.push(`/onboarding/generating?jobId=${jobId}`);
      } else {
        console.error('提交失败:', result.error);
      }
    } catch (error) {
      console.error('提交过程中发生错误:', error);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/equipment');
  };

  const handleEdit = (step: string) => {
    switch (step) {
      case 'purpose':
        router.push('/onboarding/purpose');
        break;
      case 'proficiency':
        router.push('/onboarding/proficiency');
        break;
      case 'season':
        router.push('/onboarding/season');
        break;
      case 'availability':
        router.push('/onboarding/availability');
        break;
      case 'equipment':
        router.push('/onboarding/equipment');
        break;
    }
  };


  // 更宽松的检查：如果至少有一些关键数据存在，就显示summary
  const hasAnyData = onboardingData.purpose || onboardingData.proficiency || onboardingData.season || (onboardingData.availabilityDays?.length && onboardingData.availabilityDays.length > 0) || (onboardingData.equipment?.length && onboardingData.equipment.length > 0);
  
  // 检查是否有任何数据用于显示摘要
  
  if (!hasAnyData) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-white">Welcome to Athlete Ally</h1>
            <p className="text-gray-400 mb-2">Let's create your personalized training plan</p>
            <p className="text-sm text-gray-500">Complete the onboarding process to get started</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => router.push('/onboarding/purpose')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Onboarding
            </button>
            
            <button
              onClick={() => router.push('/plan')}
              className="w-full px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Back to Training Plan
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <ProgressIndicator 
          currentStep={onboardingData.currentStep || 1}
          totalSteps={5}
          percentage={Math.round(((onboardingData.currentStep || 1) / 5) * 100)}
        />

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Review Your Profile</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Please review your information before we create your personalized training plan
          </p>
        </div>

        {/* Summary Cards */}
        <div className="space-y-6 mb-12">
          {/* Training Purpose */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">Training Purpose</h3>
                <p className="text-gray-300">
                  {onboardingData.purpose ? (PURPOSE_LABELS[onboardingData.purpose] || onboardingData.purpose) : 'Not specified'}
                </p>
                {onboardingData.purposeDetails && (
                  <p className="text-sm text-gray-400 mt-1">{onboardingData.purposeDetails}</p>
                )}
              </div>
              <button
                onClick={() => handleEdit('purpose')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {onboardingData.purpose ? 'Edit' : 'Add'}
              </button>
            </div>
          </div>

          {/* Proficiency Level */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">Proficiency Level</h3>
                <p className="text-gray-300">
                  {onboardingData.proficiency ? PROFICIENCY_LABELS[onboardingData.proficiency] || onboardingData.proficiency : 'Not specified'}
                </p>
              </div>
              <button
                onClick={() => handleEdit('proficiency')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Training Season */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">Training Season</h3>
                <p className="text-gray-300">
                  {onboardingData.season ? (SEASON_LABELS[onboardingData.season] || onboardingData.season) : 'Not specified'}
                </p>
                {onboardingData.competitionDate && (
                  <p className="text-sm text-gray-400 mt-1">
                    Competition Date: {new Date(onboardingData.competitionDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleEdit('season')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">Training Availability</h3>
                <p className="text-gray-300 mb-2">
                  {onboardingData.availabilityDays?.length || 0} days per week
                </p>
                <p className="text-sm text-gray-400">
                  Days: {onboardingData.availabilityDays?.join(', ') || 'Not specified'}
                </p>
                <p className="text-sm text-gray-400">
                  Times: {onboardingData.timeSlots?.join(', ') || 'Not specified'}
                </p>
                <p className="text-sm text-gray-400">
                  Goal: {onboardingData.weeklyGoalDays || 3} training days per week
                </p>
              </div>
              <button
                onClick={() => handleEdit('availability')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">Available Equipment</h3>
                <p className="text-gray-300 mb-2">
                  {onboardingData.equipment?.length || 0} items selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {onboardingData.equipment?.map((equipment: string) => (
                    <span
                      key={equipment}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
                    >
                      {EQUIPMENT_LABELS[equipment] || equipment}
                    </span>
                  )) || []}
                </div>
              </div>
              <button
                onClick={() => handleEdit('equipment')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-8 py-4 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading 
              ? 'Creating Your Plan...' 
              : hasChanges 
                ? 'Update My Training Plan →' 
                : 'Continue to My Plan →'
            }
          </button>
        </div>
      </div>
    </main>
  );
}