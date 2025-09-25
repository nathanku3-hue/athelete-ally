"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EXERCISE_DATABASE } from '@/lib/exercises';
import { Haptics } from '@/lib/haptics';
import { Exercise, Set } from '@/lib/types';
import { SessionRatingModal } from '@/components/ui/SessionRatingModal';

// --- 模擬從後端或狀態管理器獲取的當日訓練計畫 ---
const MOCK_WORKOUT_PLAN = {
  id: 'session_12345',
  exercises: [
    {
      exerciseId: 'squat', // 核心動作
      sets: [
        { setNumber: 1, reps: 5, weight: 100, isComplete: false, rpe: null as number | null },
        { setNumber: 2, reps: 5, weight: 100, isComplete: false, rpe: null as number | null },
        { setNumber: 3, reps: 5, weight: 100, isComplete: false, rpe: null as number | null },
      ],
    },
    {
      exerciseId: 'leg_press', // 輔助動作
      sets: [
        { setNumber: 1, reps: 10, weight: 200, isComplete: false, rpe: null as number | null },
        { setNumber: 2, reps: 10, weight: 200, isComplete: false, rpe: null as number | null },
      ],
    },
    {
      exerciseId: 'bicep_curl', // 輔助動作
      sets: [
        { setNumber: 1, reps: 12, weight: 30, isComplete: false, rpe: null as number | null },
        { setNumber: 2, reps: 12, weight: 30, isComplete: false, rpe: null as number | null },
      ],
    },
  ],
};
const REST_DURATION_SECONDS = 60; // 固定的休息時長
// ----------------------------------------------------

// RPE 評分彈窗組件
const RPEModal = ({ onSubmit, onSkip }: { onSubmit: (rpe: number) => void; onSkip: () => void; }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
      <h3 className="text-2xl font-bold mb-4">Rate Your Effort (RPE)</h3>
      <p className="text-gray-400 mb-6">How difficult was that last set? (10 = Max Effort)</p>
      <div className="grid grid-cols-5 gap-3 mb-6">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(rpe => (
          <button
            key={rpe}
            onClick={() => onSubmit(rpe)}
            className="p-3 text-lg font-bold rounded-md border-2 border-gray-600 hover:border-blue-500 hover:bg-blue-500/10 transition-all"
          >
            {rpe}
          </button>
        ))}
      </div>
      <button onClick={onSkip} className="text-gray-500 hover:text-white">Skip RPE</button>
    </div>
  </div>
);

// 休息計時器覆蓋層
const RestTimer = ({ onFinish }: { onFinish: () => void; }) => {
  const [timeLeft, setTimeLeft] = useState(REST_DURATION_SECONDS);

  useEffect(() => {
    Haptics.trigger('light'); // 休息開始時震動
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          Haptics.trigger('notification'); // 休息結束時震動
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-40">
      <p className="text-xl text-gray-400 mb-4">REST</p>
      <p className="text-8xl font-bold">{timeLeft}</p>
    </div>
  );
};

// 疲勞評估 Modal
const FatigueAssessmentModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (score: number) => void; }) => {
  if (!isOpen) return null;

  const handleScoreSelect = (score: number) => {
    onSubmit(score);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-sm w-full text-center shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">現在感覺如何？</h2>
        <p className="text-gray-400 mb-8">(1 = 非常疲勞, 5 = 精力充沛)</p>
        
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => handleScoreSelect(score)}
              className="w-12 h-12 flex items-center justify-center text-xl font-bold rounded-full border-2 border-gray-600 hover:border-blue-500 hover:bg-blue-500/10 transition-all transform hover:scale-110"
            >
              {score}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
};

export default function WorkoutSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [workoutState, setWorkoutState] = useState(MOCK_WORKOUT_PLAN);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isFatigueModalOpen, setIsFatigueModalOpen] = useState(false);
  const [fatigueScore, setFatigueScore] = useState<number | null>(null);
  const [showRPEModal, setShowRPEModal] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showSessionRatingModal, setShowSessionRatingModal] = useState(false);

  // 從數據庫獲取當前動作的詳細信息
  const currentExerciseInfo = EXERCISE_DATABASE.find(ex => ex.id === workoutState.exercises[currentExerciseIndex].exerciseId);
  const currentExercisePlan = workoutState.exercises[currentExerciseIndex];
  const currentSet = currentExercisePlan.sets[currentSetIndex];

  // 檢查是否為核心動作
  const isCoreLift = currentExerciseInfo?.isCoreLift || false;

  const finishWorkout = () => {
    console.log("Workout finished. Navigating to dashboard.");
    router.push('/dashboard');
  };

  const moveToNext = () => {
    const isLastSet = currentSetIndex === currentExercisePlan.sets.length - 1;
    const isLastExercise = currentExerciseIndex === workoutState.exercises.length - 1;

    // 更新：當訓練完成時，不再直接導航，而是觸發 Session Rating Modal
    if (isLastSet && isLastExercise) {
      setShowSessionRatingModal(true);
      return;
    }

    if (isLastSet) {
      // 移至下一個動作的第一組
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
      } else {
      // 移至當前動作的下一組
      setCurrentSetIndex(prev => prev + 1);
    }
  };
  
  const handleSetComplete = () => {
    // 更新當前組的完成狀態
    const updatedWorkout = { ...workoutState };
    updatedWorkout.exercises[currentExerciseIndex].sets[currentSetIndex].isComplete = true;
    setWorkoutState(updatedWorkout);

    const isLastSet = currentSetIndex === currentExercisePlan.sets.length - 1;
    
    // **任務 3.2: 條件觸發式 RPE**
    if (isCoreLift && isLastSet) {
      setShowRPEModal(true);
    } else {
      setIsResting(true);
    }
  };

  const handleRpeSubmit = (rpe: number) => {
    const updatedWorkout = { ...workoutState };
    if (updatedWorkout.exercises[currentExerciseIndex]?.sets[currentSetIndex]) {
      updatedWorkout.exercises[currentExerciseIndex].sets[currentSetIndex].rpe = rpe;
    }
    setWorkoutState(updatedWorkout);
    setShowRPEModal(false);
    setIsResting(true);
  };
  
  const handleRestFinish = () => {
    setIsResting(false);
    moveToNext();
  };

  // **任務 3.1: 「預填寫」日誌邏輯**
  const getPrefilledValue = (field: 'reps' | 'weight') => {
    if (currentSetIndex > 0) {
      return workoutState.exercises[currentExerciseIndex].sets[currentSetIndex - 1][field];
    }
    return currentSet[field];
  };

  // 疲勞評估相關函數
  const handleStartWorkoutClick = () => {
    if (fatigueScore === null) {
      setIsFatigueModalOpen(true);
      return;
    }
    setSessionStarted(true);
  };

  const handleFatigueScoreSubmit = (score: number) => {
    setFatigueScore(score);
    setIsFatigueModalOpen(false);
    setSessionStarted(true);
  };

  // 新增 Handler 用於處理 sRPE 提交
  const handleSessionRpeSubmit = (sRpe: number) => {
    console.log(`Session RPE recorded: ${sRpe}.`);
    // 在此處可將 sRPE 保存到後端或全局狀態
    setShowSessionRatingModal(false);
    finishWorkout();
  };
  
  // 新增 Handler 用於處理跳過 sRPE
  const handleSessionRatingSkip = () => {
    console.log("Session RPE skipped.");
    setShowSessionRatingModal(false);
    finishWorkout();
  };

  // 如果還沒有開始訓練，顯示開始界面
  if (!sessionStarted) {
    return (
      <>
        <FatigueAssessmentModal
          isOpen={isFatigueModalOpen}
          onClose={() => setIsFatigueModalOpen(false)}
          onSubmit={handleFatigueScoreSubmit}
        />
        
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
          
          {/* 返回按鈕 */}
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 text-white bg-gray-800/50 hover:bg-gray-700/70 p-2 rounded-full transition-colors z-10"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-4xl font-bold mb-4">準備開始訓練</h1>
          <p className="text-lg text-gray-400 mb-12">讓我們先評估一下你的狀態</p>

          <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-2">今日訓練計畫</h2>
            <p className="text-blue-400 mb-6">力量訓練 - 第1天</p>
            <div className="mb-6">
              <p className="text-gray-300 mb-2">訓練動作：</p>
              <ul className="text-sm text-gray-400 space-y-1">
                {workoutState.exercises.map((exercise, index) => {
                  const exerciseInfo = EXERCISE_DATABASE.find(ex => ex.id === exercise.exerciseId);
    return (
                    <li key={index}>
                      • {exerciseInfo?.name} ({exercise.sets.length} 組)
                      {exerciseInfo?.isCoreLift && <span className="text-yellow-400 ml-2">[核心動作]</span>}
                    </li>
                  );
                })}
              </ul>
        </div>

          <button
              onClick={handleStartWorkoutClick}
              className="w-full px-8 py-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
          >
              {fatigueScore === null ? '開始疲勞評估' : '開始訓練'}
          </button>
        </div>
        </div>
      </>
    );
  }

  if (!currentExerciseInfo) return <div>Loading exercise...</div>;

  return (
    <>
      {showRPEModal && <RPEModal onSubmit={handleRpeSubmit} onSkip={() => { setShowRPEModal(false); setIsResting(true); }}/>}
      {isResting && <RestTimer onFinish={handleRestFinish} />}
      {/* 在頁面中渲染新的 Session Rating Modal */}
      <SessionRatingModal 
        isOpen={showSessionRatingModal}
        onSubmit={handleSessionRpeSubmit}
        onSkip={handleSessionRatingSkip}
      />
      
      <div className="relative flex flex-col items-center min-h-screen bg-gray-900 text-white p-4 pt-16">
        
        {/* 返回按鈕 */}
            <button
              onClick={() => router.back()}
          className="absolute top-6 left-6 text-white bg-gray-800/50 hover:bg-gray-700/70 p-2 rounded-full transition-colors z-10"
          aria-label="Go back"
            >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
            </button>

        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">{currentExerciseInfo.name}</h1>
            <p className="text-2xl text-gray-400">Set {currentSetIndex + 1} of {currentExercisePlan.sets.length}</p>
            {isCoreLift && (
              <p className="text-yellow-400 text-sm mt-2">⭐ 核心動作 - 最後一組需要記錄 RPE</p>
            )}
            </div>
            
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Weight (lbs)</label>
                <input 
                  type="number"
                  placeholder="Weight"
                  defaultValue={getPrefilledValue('weight') ?? ''}
                  className="w-full px-4 py-3 bg-gray-700 text-white text-2xl font-bold text-center rounded-md border border-gray-600"
                />
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Reps</label>
                <input 
                  type="number"
                  placeholder="Reps"
                  defaultValue={getPrefilledValue('reps') ?? ''}
                  className="w-full px-4 py-3 bg-gray-700 text-white text-2xl font-bold text-center rounded-md border border-gray-600"
                />
              </div>
            </div>

            <button
              onClick={handleSetComplete}
              className="w-full py-4 bg-blue-600 text-white rounded-md font-semibold text-lg hover:bg-blue-700"
            >
              Complete Set
            </button>
          </div>
          
          {/* 顯示下一個動作 */}
          {currentExerciseIndex + 1 < workoutState.exercises.length && (
            <div className="mt-8 text-center text-gray-500">
              <p>Next Up: {EXERCISE_DATABASE.find(ex => ex.id === workoutState.exercises[currentExerciseIndex + 1].exerciseId)?.name}</p>
            </div>
          )}

          {/* 顯示進度 */}
          <div className="mt-8 bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">訓練進度</h3>
            <div className="space-y-2">
              {workoutState.exercises.map((exercise, exerciseIndex) => {
                const exerciseInfo = EXERCISE_DATABASE.find(ex => ex.id === exercise.exerciseId);
                const isCurrentExercise = exerciseIndex === currentExerciseIndex;
                const isCompleted = exercise.sets.every(set => set.isComplete);
                
                return (
                  <div 
                    key={exerciseIndex}
                    className={`p-3 rounded-lg ${
                      isCurrentExercise 
                        ? 'bg-blue-600/20 border border-blue-500' 
                        : isCompleted 
                        ? 'bg-green-600/20 border border-green-500' 
                        : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {exerciseInfo?.name}
                        {exerciseInfo?.isCoreLift && <span className="text-yellow-400 ml-2">⭐</span>}
                      </span>
                      <span className="text-sm text-gray-400">
                        {exercise.sets.filter(set => set.isComplete).length}/{exercise.sets.length} 組
                      </span>
              </div>
            </div>
                );
              })}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
