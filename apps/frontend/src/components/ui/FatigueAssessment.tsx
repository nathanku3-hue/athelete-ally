"use client";

import { useState } from 'react';
import { Activity, Brain, Moon, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface FatigueAssessmentProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FatigueData) => void;
  userId: string;
  sessionId?: string;
}

interface FatigueData {
  userId: string;
  sessionId?: string;
  overallFatigue: number;
  physicalFatigue: number;
  mentalFatigue: number;
  sleepQuality: number;
  stressLevel: number;
  notes?: string;
  previousWorkout?: string;
  timeSinceLastWorkout?: number;
  assessmentType: 'pre_workout' | 'post_workout' | 'daily';
}

export default function FatigueAssessment({ 
  isOpen, 
  onClose, 
  onSubmit, 
  userId, 
  sessionId 
}: FatigueAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fatigueData, setFatigueData] = useState<FatigueData>({
    userId,
    sessionId,
    overallFatigue: 0,
    physicalFatigue: 0,
    mentalFatigue: 0,
    sleepQuality: 0,
    stressLevel: 0,
    assessmentType: 'pre_workout',
  });

  const steps = [
    {
      id: 'overall',
      title: 'Overall Fatigue',
      description: 'How tired do you feel overall?',
      icon: Activity,
      key: 'overallFatigue' as keyof FatigueData,
    },
    {
      id: 'physical',
      title: 'Physical Fatigue',
      description: 'How tired do your muscles feel?',
      icon: Activity,
      key: 'physicalFatigue' as keyof FatigueData,
    },
    {
      id: 'mental',
      title: 'Mental Fatigue',
      description: 'How mentally tired do you feel?',
      icon: Brain,
      key: 'mentalFatigue' as keyof FatigueData,
    },
    {
      id: 'sleep',
      title: 'Sleep Quality',
      description: 'How well did you sleep last night?',
      icon: Moon,
      key: 'sleepQuality' as keyof FatigueData,
    },
    {
      id: 'stress',
      title: 'Stress Level',
      description: 'How stressed do you feel?',
      icon: AlertTriangle,
      key: 'stressLevel' as keyof FatigueData,
    },
  ];

  const handleRatingChange = (key: keyof FatigueData, value: number) => {
    setFatigueData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(fatigueData);
      onClose();
    } catch (error) {
      console.error('Failed to submit fatigue assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentStepValid = () => {
    const currentStepData = fatigueData[steps[currentStep].key] as number;
    return currentStepData > 0;
  };

  const getRatingDescription = (value: number) => {
    const descriptions = [
      'Not at all',
      'Slightly',
      'Moderately',
      'Quite a bit',
      'Extremely'
    ];
    return descriptions[value - 1] || '';
  };

  const getRatingColor = (value: number) => {
    if (value <= 2) return 'text-green-400';
    if (value <= 3) return 'text-yellow-400';
    if (value <= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const currentValue = fatigueData[currentStepData.key] as number;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Fatigue Assessment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          <div className="mt-2">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
              <currentStepData.icon className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-400">{currentStepData.description}</p>
          </div>

          {/* Rating Scale */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(currentStepData.key, rating)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  currentValue === rating
                    ? 'border-blue-500 bg-blue-600/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      currentValue === rating
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-600'
                    }`}>
                      {currentValue === rating && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-white font-medium">{rating}</span>
                  </div>
                  <span className={`text-sm ${getRatingColor(rating)}`}>
                    {getRatingDescription(rating)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Current Selection Display */}
          {currentValue > 0 && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Selected:</span>
                <span className={`font-semibold ${getRatingColor(currentValue)}`}>
                  {currentValue} - {getRatingDescription(currentValue)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isCurrentStepValid() || isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

