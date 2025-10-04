"use client";

import React from 'react';

// 定義組件接收的 props 類型
interface FatigueAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number) => void;
}

export const FatigueAssessmentModal: React.FC<FatigueAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // 如果 modal 不是開啟狀態，則不渲染任何內容
  if (!isOpen) {
    return null;
  }

  const handleScoreSelect = (score: number) => {
    onSubmit(score);
  };

  return (
    // 覆蓋層容器
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-sm w-full text-center shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">現在感覺如何？</h2>
        <p className="text-gray-400 mb-8">(1 = 非常疲勞, 5 = 精力充沛)</p>
        
        {/* 1-5 評分選項 */}
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

        {/* 關閉按鈕 */}
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
