"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressIndicator from '@/components/ui/ProgressIndicator';
import { useOnboarding } from '@/contexts/OnboardingContext';

// 可複用的 Checkbox 組件，用於家庭設備清單
const CheckboxItem = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void; }) => (
    <label className="flex items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500"
        />
        <span className="ml-4 text-white font-medium">{label}</span>
    </label>
);

export default function EquipmentPage() {
  const router = useRouter();
  const { state, updateData, setStep, validateStep } = useOnboarding();
  const { data } = state;
  
    // 1. State Management: 兩個核心 state
    const [accessType, setAccessType] = useState<'full_gym' | 'home_gym' | null>(null);
    const [homeEquipment, setHomeEquipment] = useState({
        yogaMat: true,   // 推薦項默認為 true
        dumbbells: false,
        bands: false,
        pullUpBar: false
    });

  // Set current step on mount
  useEffect(() => {
    setStep(5);
  }, [setStep]);

    const handleHomeEquipmentChange = (item: keyof typeof homeEquipment) => {
        setHomeEquipment(prev => ({
            ...prev,
            [item]: !prev[item]
        }));
  };

  const handleContinue = () => {
        if (accessType) {
            const finalEquipmentData = accessType === 'full_gym' 
                ? { equipment: ['full_gym'] } 
                : { 
                    equipment: Object.entries(homeEquipment)
                        .filter(([_, selected]) => selected)
                        .map(([key, _]) => key)
                  };
    
    // Update context with equipment data
            updateData(finalEquipmentData);
    
    // 使用最新的数据进行验证
            if (validateStep(5, finalEquipmentData)) {
      router.push('/onboarding/summary');
    } else {
      alert('Please select at least one piece of equipment to continue');
            }
    }
  };

  const handleBack = () => {
    router.push('/onboarding/availability');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-6xl">
        <ProgressIndicator 
                    currentStep={data.currentStep || 1}
          totalSteps={5}
                    percentage={Math.round(((data.currentStep || 1) / 5) * 100)}
        />

        <div className="text-center mb-12">
                    <p className="text-blue-400 font-semibold mb-2">Step 5 of 5</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                        Where do you train?
                    </h1>
                    <p className="text-lg text-gray-400">This determines the exercises in your plan.</p>
        </div>

                {/* 2. Component Logic: 雙路徑選項卡 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div
                        onClick={() => setAccessType('full_gym')}
                        className={`cursor-pointer p-8 rounded-lg border-2 text-center transition-all transform hover:scale-105 ${
                            accessType === 'full_gym'
                            ? "border-blue-500 bg-blue-500/10 scale-105"
                            : "border-gray-700 hover:border-blue-500/50"
                        }`}
                    >
                        <h2 className="text-2xl font-semibold">Full Gym Access</h2>
                    </div>
                    <div
                        onClick={() => setAccessType('home_gym')}
                        className={`cursor-pointer p-8 rounded-lg border-2 text-center transition-all transform hover:scale-105 ${
                            accessType === 'home_gym'
                            ? "border-blue-500 bg-blue-500/10 scale-105"
                            : "border-gray-700 hover:border-blue-500/50"
                        }`}
                    >
                        <h2 className="text-2xl font-semibold">Home Gym / Bodyweight</h2>
              </div>
            </div>

                {/* 3. Home Equipment Checklist: 條件渲染 */}
                {accessType === 'home_gym' && (
                    <div className="bg-gray-800/50 p-6 rounded-lg animate-fade-in mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-center">Select Your Equipment</h3>
                        
                        <div className="mb-6">
                            <p className="font-bold text-gray-400 mb-3">Recommended Essentials</p>
                            <CheckboxItem 
                                label="Yoga Mat"
                                checked={homeEquipment.yogaMat}
                                onChange={() => handleHomeEquipmentChange('yogaMat')}
                            />
        </div>

                        <div>
                            <p className="font-bold text-gray-400 mb-3">Available Equipment</p>
                            <div className="space-y-3">
                                <CheckboxItem 
                                    label="Dumbbells (Pair)"
                                    checked={homeEquipment.dumbbells}
                                    onChange={() => handleHomeEquipmentChange('dumbbells')}
                                />
                                <CheckboxItem 
                                    label="Resistance Bands"
                                    checked={homeEquipment.bands}
                                    onChange={() => handleHomeEquipmentChange('bands')}
                                />
                                <CheckboxItem 
                                    label="Pull-up Bar"
                                    checked={homeEquipment.pullUpBar}
                                    onChange={() => handleHomeEquipmentChange('pullUpBar')}
                                />
                            </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-8 py-4 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
                        disabled={!accessType} // 只有在選擇了任一 accessType 後才啟用
                        className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Review & Submit →
          </button>
        </div>
      </div>
    </main>
  );
}