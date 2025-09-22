"use client";

import { STEP_LABELS } from '@/lib/constants/labels';

interface ProgressIndicatorProps {
  className?: string;
  currentStep?: number;
  totalSteps?: number;
  percentage?: number;
}

export default function ProgressIndicator({ 
  className = '',
  currentStep = 1,
  totalSteps = 5,
  percentage = 20
}: ProgressIndicatorProps) {
  const current = currentStep;
  const total = totalSteps;

  return (
    <div className={`mb-8 ${className}`}>
      {/* Progress circles */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        {Array.from({ length: total }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < current;
          const isCurrent = stepNumber === current;
          
          return (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              
              {/* Connector line */}
              {stepNumber < total && (
                <div
                  className={`w-8 h-0.5 mx-2 transition-colors ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress text */}
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-2">
          Step {current} of {total} - {STEP_LABELS[current - 1]}
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          {percentage}% Complete
        </div>
      </div>
    </div>
  );
}
