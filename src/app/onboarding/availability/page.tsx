"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressIndicator from '@/components/ui/ProgressIndicator';
import { useOnboarding } from '@/contexts/OnboardingContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];



export default function AvailabilityPage() {
  const router = useRouter();
  const { state, updateData, setStep, validateStep } = useOnboarding();
  const { data } = state;
  
  // 本地状态，用于管理UI，并从全局状态初始化
  const [selectedDays, setSelectedDays] = useState<string[]>(data.availabilityDays || []);
  const [weeklyGoalDays, setWeeklyGoalDays] = useState<number>(data.weeklyGoalDays || 3);

  // Set current step on mount
  useEffect(() => {
    setStep(4);
    // 确保userId已初始化
    if (!data.userId) {
      updateData({ userId: `user_${Date.now()}` });
    }
  }, []); // 移除依赖项，只在组件挂载时执行一次

  // 当从其他页面返回时，确保UI状态与全局数据同步
  useEffect(() => {
    setSelectedDays(data.availabilityDays || []);
    setWeeklyGoalDays(data.weeklyGoalDays || 3);
  }, [data.availabilityDays, data.weeklyGoalDays]);

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };




  const handleContinue = () => {
    
    if (selectedDays.length > 0) {
      // 准备要更新和验证的数据
      const newAvailabilityData = {
        availabilityDays: selectedDays,
        weeklyGoalDays: weeklyGoalDays
      };
      
      
      // 1. 将本地选择的数据更新到全局Context
      updateData(newAvailabilityData);
      
      // 2. 使用最新的数据进行验证
      const isValid = validateStep(4, newAvailabilityData);
      
      if (isValid) {
        router.push('/onboarding/equipment');
      } else {
        alert('Please make sure you have selected at least one day and set your weekly goal');
      }
    } else {
      alert('Please select at least one day to continue');
    }
  };

  const handleBack = () => {
    router.push('/onboarding/season');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <ProgressIndicator 
          currentStep={data.currentStep || 1}
          totalSteps={5}
          percentage={Math.round(((data.currentStep || 1) / 5) * 100)}
        />

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">When Can You Train?</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Help us create a schedule that fits your lifestyle
          </p>
        </div>

        {/* Days selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Select Available Days</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => handleDayToggle(day)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedDays.includes(day)
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-gray-600 hover:border-gray-500"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly goal days */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">How Many Days Per Week?</h2>
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setWeeklyGoalDays(Math.max(1, weeklyGoalDays - 1))}
                className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
              >
                -
              </button>
              <div className="text-3xl font-bold min-w-[60px] text-center">
                {weeklyGoalDays}
              </div>
              <button
                onClick={() => setWeeklyGoalDays(Math.min(7, weeklyGoalDays + 1))}
                className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-center text-gray-400 mt-2">
              {weeklyGoalDays === 1 ? '1 day per week' : `${weeklyGoalDays} days per week`}
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-8 py-4 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={selectedDays.length === 0}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    </main>
  );
}
