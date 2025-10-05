"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FatigueAssessmentModal } from '@/components/ui/FatigueAssessmentModal';

export default function DashboardPage() {
  const router = useRouter();
  
  // 使用 state 控制 modal 的顯示與隱藏
  const [isFatigueModalOpen, setIsFatigueModalOpen] = useState(false);

  // 模擬當日訓練 Session ID
  const todayWorkoutSessionId = 'session_12345';

  const handleStartWorkoutClick = () => {
    // 點擊按鈕時，打開疲勞評估 modal
    setIsFatigueModalOpen(true);
  };

  /**
   * 處理用戶提交的疲勞評分
   * @param score - 用戶選擇的 1-5 分數
   */
  const handleFatigueScoreSubmit = (score: number) => {
    // Fatigue score logging removed - use proper state management instead
    
    // 在此處，我們可以將分數與 WorkoutSession 模型關聯，並發送到後端或狀態管理器
    // 例如: updateWorkoutSession(todayWorkoutSessionId, { fatigueScore: score });

    // 關閉 modal
    setIsFatigueModalOpen(false);

    // 導航到實際的訓練頁面
    router.push(`/workout/${todayWorkoutSessionId}`);
  };

  return (
    <>
      {/* 在頁面中渲染 Modal 組件 */}
      <FatigueAssessmentModal
        isOpen={isFatigueModalOpen}
        onClose={() => setIsFatigueModalOpen(false)}
        onSubmit={handleFatigueScoreSubmit}
      />

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome Back, Alex</h1>
        <p className="text-lg text-gray-400 mb-12">Ready to train? Let&apos;s get started.</p>

        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Today&apos;s Workout</h2>
          <p className="text-blue-400 mb-6">Upper Body Strength - Day 1</p>

          <button
            onClick={handleStartWorkoutClick}
            className="w-full px-8 py-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
          >
            Start Today&apos;s Workout
          </button>
        </div>
      </div>
    </>
  );
}
