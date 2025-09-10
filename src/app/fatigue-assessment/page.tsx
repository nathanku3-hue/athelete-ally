"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FatigueAssessmentData {
  sleepQuality: number;
  stressLevel: number;
  muscleSoreness: number;
  energyLevel: number;
  motivation: number;
}

export default function FatigueAssessmentPage() {
  const router = useRouter();
  const [assessmentData, setAssessmentData] = useState<FatigueAssessmentData>({
    sleepQuality: 5,
    stressLevel: 5,
    muscleSoreness: 5,
    energyLevel: 5,
    motivation: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSliderChange = (field: keyof FatigueAssessmentData, value: number) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/v1/fatigue/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      if (response.ok) {
        const result = await response.json();
        setResult(result);
      } else {
        throw new Error('Failed to submit assessment');
      }
    } catch (error) {
      console.error('Failed to submit fatigue assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSliderColor = (value: number, reverse = false) => {
    const normalizedValue = reverse ? 10 - value : value;
    if (normalizedValue <= 3) return 'bg-red-500';
    if (normalizedValue <= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSliderLabel = (value: number, reverse = false) => {
    const normalizedValue = reverse ? 10 - value : value;
    if (normalizedValue <= 3) return 'Poor';
    if (normalizedValue <= 6) return 'Fair';
    return 'Good';
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 text-center">
          <div className="mb-6">
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl ${
              result.level === 'high' ? 'bg-red-600' : 
              result.level === 'normal' ? 'bg-yellow-600' : 'bg-green-600'
            }`}>
              {result.level === 'high' ? '⚠️' : 
               result.level === 'normal' ? '⚡' : '✅'}
            </div>
            <h1 className="text-2xl font-bold mb-2">Assessment Complete</h1>
            <p className="text-gray-400">Your fatigue level: <span className="font-semibold">{result.level.toUpperCase()}</span></p>
            <p className="text-2xl font-bold mt-2">{result.fatigueScore}/10</p>
          </div>
          
          <div className="mb-6 text-left">
            <h3 className="font-semibold mb-2">Recommendations:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Consider adjusting your training intensity</li>
              <li>• Focus on recovery and sleep quality</li>
              <li>• Monitor your energy levels closely</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/plan')}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Back to Training Plan
            </button>
            <button
              onClick={() => {
                setResult(null);
                setAssessmentData({
                  sleepQuality: 5,
                  stressLevel: 5,
                  muscleSoreness: 5,
                  energyLevel: 5,
                  motivation: 5,
                });
              }}
              className="w-full py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
            >
              Take Another Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold mb-2">Fatigue Assessment</h1>
          <p className="text-gray-400">
            Rate your current state on each factor. This helps us adjust your training plan accordingly.
          </p>
        </div>

        <div className="space-y-8">
          {/* Sleep Quality */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Sleep Quality (Last Night)</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Poor</span>
                <span className={`font-semibold ${getSliderColor(assessmentData.sleepQuality, true)} px-2 py-1 rounded`}>
                  {getSliderLabel(assessmentData.sleepQuality, true)}
                </span>
                <span>Excellent</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={assessmentData.sleepQuality}
                onChange={(e) => handleSliderChange('sleepQuality', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Stress Level */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Stress Level</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Low</span>
                <span className={`font-semibold ${getSliderColor(assessmentData.stressLevel)} px-2 py-1 rounded`}>
                  {getSliderLabel(assessmentData.stressLevel)}
                </span>
                <span>High</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={assessmentData.stressLevel}
                onChange={(e) => handleSliderChange('stressLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Muscle Soreness */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Muscle Soreness</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>None</span>
                <span className={`font-semibold ${getSliderColor(assessmentData.muscleSoreness)} px-2 py-1 rounded`}>
                  {getSliderLabel(assessmentData.muscleSoreness)}
                </span>
                <span>Severe</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={assessmentData.muscleSoreness}
                onChange={(e) => handleSliderChange('muscleSoreness', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Energy Level */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Energy Level</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Low</span>
                <span className={`font-semibold ${getSliderColor(assessmentData.energyLevel, true)} px-2 py-1 rounded`}>
                  {getSliderLabel(assessmentData.energyLevel, true)}
                </span>
                <span>High</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={assessmentData.energyLevel}
                onChange={(e) => handleSliderChange('energyLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Motivation */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Training Motivation</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Low</span>
                <span className={`font-semibold ${getSliderColor(assessmentData.motivation, true)} px-2 py-1 rounded`}>
                  {getSliderLabel(assessmentData.motivation, true)}
                </span>
                <span>High</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={assessmentData.motivation}
                onChange={(e) => handleSliderChange('motivation', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Analyzing...' : 'Submit Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
}
