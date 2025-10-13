"use client";

import { useState, useEffect } from "react";
// eslint-disable-next-line import/no-internal-modules
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/contexts/OnboardingContext";

// --- ProficiencyLevelIndicator Component ---
interface ProficiencyLevelIndicatorProps {
  level: 1 | 2 | 3; // 1 for Beginner, 2 for Intermediate, 3 for Advanced
}

const ProficiencyLevelIndicator: React.FC<ProficiencyLevelIndicatorProps> = ({ level }) => {
  return (
    <div className="flex items-center gap-0.5">
      {/* We create an array of 3 and map over it to render the segments */}
      {[1, 2, 3].map((segment) => (
        <div
          key={segment}
          className={`h-2 w-4 rounded-sm transition-colors duration-200 ${
            segment <= level ? 'bg-teal-500' : 'bg-white/15'
          }`}
        ></div>
      ))}
    </div>
  );
};

// Data structure updated with the high-priority content changes for Jane and Alex.
interface ProficiencyLevel {
    id: 'beginner' | 'intermediate' | 'advanced';
    name: string;
    trainingAge: string;
    level: 1 | 2 | 3;
    focusPoints: string[];
}

const proficiencyLevels: ProficiencyLevel[] = [
    {
        id: 'beginner',
        name: 'John',
        trainingAge: '< 2 years',
        level: 1, // 1 of 3 segments filled
        focusPoints: [
            'Works out 2 times per week',
            'Learning squat and bench press',
            'Makes progress with a simple, repeating program',
            'Requires assistance to train with intensity'
        ]
    },
    {
        id: 'intermediate',
        name: 'Jane',
        trainingAge: '2-5 years',
        level: 2, // 2 of 3 segments filled
        focusPoints: [
            'Works out 4 times per week',
            'Has consistent technique in basic lifts',
            'Follows a workout split',
            'Occasionally includes high-intensity training'
        ]
    },
    {
        id: 'advanced',
        name: 'Alex',
        trainingAge: '5+ years',
        level: 3, // 3 of 3 segments filled
        focusPoints: [
            'Works out 6 times per week',
            'Follows a detailed, structured plan',
            'Trains with purpose: power, stability',
            'Actively manages sleep and recovery'
        ]
    }
];

export default function ProficiencyPage() {
    const { state, updateData, setStep } = useOnboarding();
    const { data } = state;
    const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(data.proficiency || null);
    const router = useRouter();

    // 设置当前步骤
    useEffect(() => {
        setStep(2);
    }, [setStep]);

    const handleContinue = () => {
        if (selectedLevel) {
            // 在导航前，先更新全局状态
            updateData({ proficiency: selectedLevel });
            router.push('/onboarding/season');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="w-full max-w-7xl flex flex-col">
                <div className="text-center mb-10">
                    <p className="text-blue-400 font-semibold mb-2">Step 2 of 5</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                        Which Athlete Are You?
                    </h1>
                    <p className="text-lg text-gray-400">This helps us tailor the complexity of your program.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 lg:items-stretch">
                    {proficiencyLevels.map((level) => (
                        <div
                            key={level.id}
                            onClick={() => setSelectedLevel(level.id)}
                            className={`cursor-pointer p-6 lg:p-8 rounded-lg border-2 flex flex-col transition-all transform hover:scale-105 min-h-[320px] w-full ${
                                selectedLevel === level.id
                                ? "border-blue-500 bg-blue-500/10 scale-105"
                                : "border-gray-700 hover:border-blue-500/50"
                            }`}
                        >
                            <div className="flex-grow">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold">{level.name}</h2>
                                        <ProficiencyLevelIndicator level={level.level as 1 | 2 | 3} />
                                    </div>
                                    <p className="text-sm text-gray-500">{level.trainingAge}</p>
                                </div>
                                <ul className="space-y-3 text-gray-400 list-disc list-inside">
                                    {level.focusPoints.map((point, index) => (
                                        <li key={index} className="leading-relaxed break-words" title={point}>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-center items-center mt-10 space-x-4">
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-gray-700 text-white rounded-md font-semibold transition-transform transform hover:scale-105"
                    >
                        &larr; Back
                    </button>
                    <button
                        onClick={handleContinue}
                        disabled={!selectedLevel}
                        className="px-8 py-3 bg-blue-600 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
                    >
                        Continue &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
}
