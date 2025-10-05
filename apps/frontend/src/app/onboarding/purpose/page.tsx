"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/contexts/OnboardingContext";

// 資料結構已更新，增加了 'status' 屬性並修改了 'body_recomposition' 的文案
interface Purpose {
    id: 'general_fitness' | 'sport_performance' | 'body_recomposition' | 'muscle_building' | 'weight_loss' | 'rehabilitation';
    title: string;
    description: string;
    commitment: string;
    frequency: string;
    status?: 'coming_soon';
}

const purposes: Purpose[] = [
  {
    id: "general_fitness",
    title: "General Fitness",
    description: "Improve overall health, strength, and well-being.",
    commitment: "Low Commitment",
    frequency: "2-3 days/week",
  },
  {
    id: "sport_performance",
    title: "Sport Performance",
    description: "Enhance performance in a specific sport or activity.",
    commitment: "High Commitment",
    frequency: "4-6 days/week",
  },
  {
    id: "body_recomposition",
    title: "Gain Muscle / Lose Fat", // V4 更新
    description: "Build muscle and burn fat simultaneously.", // V4 更新
    commitment: "Medium Commitment",
    frequency: "3-5 days/week",
  },
  {
    id: "rehabilitation",
    title: "Rehabilitation",
    description: "Recover from injury and rebuild strength safely.",
    commitment: "High Commitment",
    frequency: "3-4 days/week",
    status: "coming_soon", // V4 新增狀態
  },
];

// 輔助函數保持不變
const getCommitmentColors = (commitment: string) => {
  switch (commitment) {
    case "Low Commitment":
      return "bg-green-500/10 text-green-400";
    case "Medium Commitment":
      return "bg-yellow-500/10 text-yellow-400";
    case "High Commitment":
      return "bg-red-500/10 text-red-400";
    default:
      return "bg-gray-500/10 text-gray-400";
  }
};

// "Coming Soon" 功能的通知彈窗組件
const NotificationModal = ({ onClose }: { onClose: () => void }) => {
    const [showEmailInput, setShowEmailInput] = useState(false);

    const handleNotifyMeClick = () => {
        setShowEmailInput(true);
    };
    
    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Email submitted for notification.");
        onClose(); // 提交後關閉彈窗
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 max-w-sm w-full text-center shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">Rehabilitation is Coming Soon</h2>
                <p className="text-gray-400 mb-6">
                    We&apos;re working with physical therapists to create safe and effective recovery plans. Want to be the first to know when it&apos;s ready?
                </p>
                
                {!showEmailInput ? (
                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={handleNotifyMeClick}
                            className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold transition-transform transform hover:scale-105"
                        >
                            Notify Me
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-700 text-white rounded-md font-semibold transition-transform transform hover:scale-105"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleEmailSubmit} className="flex flex-col space-y-4">
                        <input 
                            type="email"
                            placeholder="Enter your email"
                            required
                            className="px-4 py-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold transition-transform transform hover:scale-105"
                        >
                            Submit
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default function PurposePage() {
  const { state, updateData, setStep } = useOnboarding();
  const { data } = state;
  const [selectedPurpose, setSelectedPurpose] = useState<'general_fitness' | 'sport_performance' | 'body_recomposition' | 'muscle_building' | 'weight_loss' | 'rehabilitation' | null>(data.purpose || null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const router = useRouter();

  // 设置当前步骤
  useEffect(() => {
    setStep(1);
  }, [setStep]);

  const handleCardClick = (purpose: (typeof purposes)[0]) => {
    if (purpose.status === "coming_soon") {
      setIsNotificationModalOpen(true);
      return;
    }
    setSelectedPurpose(purpose.id);
  };

  const handleContinue = () => {
    if (selectedPurpose) {
      // 在导航前，先更新全局状态
      updateData({ purpose: selectedPurpose });
      // 導航到下一步
      router.push("/onboarding/proficiency");
    }
  };

  return (
    <>
      {isNotificationModalOpen && <NotificationModal onClose={() => setIsNotificationModalOpen(false)} />}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="w-full max-w-4xl flex flex-col">
          <div className="text-center mb-10">
            {/* 更新：顯示為 Step 2 of 5 */}
            <p className="text-blue-400 font-semibold mb-2">Step 2 of 5</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              What&apos;s Your Training Purpose?
            </h1>
            <p className="text-lg text-gray-400">Your goal defines your plan.</p>
        </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {purposes.map((purpose) => (
              <div
              key={purpose.id}
                onClick={() => handleCardClick(purpose)}
                className={`cursor-pointer p-6 rounded-lg border-2 flex flex-col justify-between transition-all transform hover:scale-105 relative ${
                  selectedPurpose === purpose.id
                    ? "border-blue-500 bg-blue-500/10 scale-105"
                    : "border-gray-700 hover:border-blue-500/50"
                } ${
                  purpose.status === 'coming_soon' ? 'opacity-50 grayscale-[80%]' : ''
                }`}
              >
                {purpose.status === 'coming_soon' && (
                    <div className="absolute top-3 right-3 bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Coming Soon
                    </div>
                )}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl">
                        {purpose.id === 'body_recomposition' ? 
                            <>
                                <span className="font-semibold">Gain Muscle</span>
                                <span className="font-normal text-gray-400"> / </span>
                                <span className="font-semibold">Lose Fat</span>
                            </>
                            : 
                            <span className="font-semibold">{purpose.title}</span>
                        }
                    </h2>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getCommitmentColors(
                        purpose.commitment
                      )}`}
                    >
                      {purpose.commitment}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4">{purpose.description}</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">{purpose.frequency}</p>
              </div>
          ))}
        </div>

          <div className="flex justify-center items-center mt-8 space-x-4">
          <button
                onClick={() => router.back()}
                // 核心修復：移除禁用邏輯，此按鈕永遠可用
                className="px-8 py-3 bg-gray-700 text-white rounded-md font-semibold transition-transform transform hover:scale-105"
          >
                &larr; Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedPurpose}
              className="px-8 py-3 bg-blue-600 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
          >
              Continue &rarr;
          </button>
        </div>
      </div>
      </div>
    </>
  );
}