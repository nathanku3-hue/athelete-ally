"use client";

import React from 'react';

interface SessionRatingModalProps {
  isOpen: boolean;
  onSkip: () => void; // 用戶跳過評分
  onSubmit: (sRpe: number) => void; // 用戶提交評分
}

export const SessionRatingModal: React.FC<SessionRatingModalProps> = ({
  isOpen,
  onSkip,
  onSubmit,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center shadow-2xl">
        <h2 className="text-3xl font-bold mb-2">Workout Complete ✓</h2>
        <p className="text-gray-400 mb-6">Great work! You've finished your session.</p>
        
        <div className="border-t border-gray-700 my-6"></div>

        <h3 className="text-xl font-semibold mb-4">本次訓練的整體感覺如何？</h3>
        <p className="text-sm text-gray-500 mb-6">(可選 Optional)</p>
        
        {/* RPE 評分選項 (1-10) */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(sRpe => (
            <button
              key={sRpe}
              onClick={() => onSubmit(sRpe)}
              className="p-3 text-lg font-bold rounded-md border-2 border-gray-600 hover:border-blue-500 hover:bg-blue-500/10 transition-all"
            >
              {sRpe}
            </button>
          ))}
        </div>

        {/* 跳過按鈕 */}
        <button
          onClick={onSkip}
          className="w-full py-3 bg-gray-700 text-white rounded-md font-semibold hover:bg-gray-600 transition-colors"
        >
          Skip & Finish
        </button>
      </div>
    </div>
  );
};
