"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/contexts/OnboardingContext";

// Placeholder data for season options
const seasonOptions = [
    { id: 'off-season', title: 'Off-Season', description: 'Building foundational strength and skills.' },
    { id: 'pre-season', title: 'Pre-Season', description: 'Ramping up intensity and sport-specific training.' },
    { id: 'in-season', title: 'In-Season', description: 'Maintaining performance and managing fatigue.' },
];

// Month options
const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

export default function SeasonPage() {
    const { state, updateData, setStep } = useOnboarding();
    const { data } = state;
    const [trainingSeason, setTrainingSeason] = useState<string | null>(data.season || null);
    const router = useRouter();
    
    // Date selection state
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState<number | null>(null);
    const [day, setDay] = useState<number | null>(null);
    
    // 设置当前步骤
    useEffect(() => {
        setStep(3);
    }, [setStep]);
    
    const nextStepUrl = "/onboarding/availability";

    // Helper function to get days in month
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
    };

    // Generate year options (current year to current year + 5)
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i);

    // Generate day options based on selected month and year
    const getDayOptions = () => {
        if (!month) return [];
        const daysInMonth = getDaysInMonth(year, month);
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };

    // Check if continue button should be enabled
    const isContinueDisabled = !year || !month;

    const handleContinue = () => {
        if (trainingSeason) {
            // 准备要更新的数据
            const updateDataPayload: any = { season: trainingSeason };
            
            // Handle competition date for pre-season and off-season
            if ((trainingSeason === 'pre-season' || trainingSeason === 'off-season') && year && month) {
                const competitionDate = day 
                    ? new Date(year, month - 1, day).toISOString()
                    : new Date(year, month - 1, 1).toISOString(); // Default to 1st of month if no day selected
                updateDataPayload.competitionDate = competitionDate;
            }
            
            // 在导航前，先更新全局状态
            updateData(updateDataPayload);
            router.push(nextStepUrl);
        }
    };

    const handleSkip = () => {
        // 更新全局状态为null，表示跳过season选择
        updateData({ season: null });
        setTrainingSeason(null);
        router.push(nextStepUrl);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="w-full max-w-4xl flex flex-col">
                <div className="text-center mb-10">
                    <p className="text-blue-400 font-semibold mb-2">Step 3 of 5</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                        What's Your Training Season?
                    </h1>
                    <p className="text-lg text-gray-400">This helps us periodize your training. You can skip this if it doesn't apply.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {seasonOptions.map((option) => (
                        <div
                            key={option.id}
                            onClick={() => setTrainingSeason(option.id)}
                            className={`cursor-pointer p-6 rounded-lg border-2 flex flex-col transition-all transform hover:scale-105 ${
                                trainingSeason === option.id
                                ? "border-blue-500 bg-blue-500/10 scale-105"
                                : "border-gray-700 hover:border-blue-500/50"
                            }`}
                        >
                            <h2 className="text-xl font-semibold">{option.title}</h2>
                            <p className="text-gray-400 mt-2">{option.description}</p>
                        </div>
                    ))}
                </div>

                {/* Competition date selection for pre-season and off-season */}
                {(trainingSeason === 'pre-season' || trainingSeason === 'off-season') && (
                    <div className="mt-8 p-6 bg-gray-800 rounded-lg">
                        <label className="block text-lg font-semibold mb-4">
                            When is your competition? (Optional)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Year Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    {yearOptions.map((yearOption) => (
                                        <option key={yearOption} value={yearOption}>
                                            {yearOption}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Month Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
                                <select
                                    value={month || ''}
                                    onChange={(e) => setMonth(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Select Month</option>
                                    {monthOptions.map((monthOption) => (
                                        <option key={monthOption.value} value={monthOption.value}>
                                            {monthOption.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Day Select - Conditional Rendering */}
                            {month && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Day (Optional)</label>
                                    <select
                                        value={day || ''}
                                        onChange={(e) => setDay(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Optional Day</option>
                                        {getDayOptions().map((dayOption) => (
                                            <option key={dayOption} value={dayOption}>
                                                {dayOption}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-400 mt-3">
                            This helps us create a countdown and adjust training intensity
                        </p>
                    </div>
                )}
                
                <div className="flex justify-center items-center mt-10 space-x-4">
                    <button
                        onClick={() => router.back()}
                        className="px-8 py-3 bg-gray-700 text-white rounded-md font-semibold transition-transform transform hover:scale-105"
                    >
                        &larr; Back
                    </button>
                    {/* Enhanced Skip button with robust event handling */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSkip();
                        }}
                        className="px-8 py-3 bg-transparent text-gray-400 rounded-md font-semibold hover:text-white"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleContinue}
                        disabled={!trainingSeason || ((trainingSeason === 'pre-season' || trainingSeason === 'off-season') && isContinueDisabled)}
                        className="px-8 py-3 bg-blue-600 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
                    >
                        Continue &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
}