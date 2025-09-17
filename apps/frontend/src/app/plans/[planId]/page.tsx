"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ExerciseModal from '@/components/ui/ExerciseModal';
import FatigueAssessment from '@/components/ui/FatigueAssessment';
import AdjustmentSuggestions from '@/components/ui/AdjustmentSuggestions';
import { Exercise } from '@athlete-ally/shared-types';
import { DAY_NAMES } from '@/lib/constants/labels';

interface PlanData {
  id: string;
  name: string;
  description: string;
  status: string;
  version: number;
  content: {
    microcycles: Array<{
      weekNumber: number;
      name: string;
      phase: string;
      sessions: Array<{
        dayOfWeek: number;
        name: string;
        duration: number;
        exercises: Array<{
          id?: string;
      name: string;
          category: string;
      sets: number;
          reps: number;
          weight?: number;
      notes?: string;
        }>;
      }>;
    }>;
  };
}


export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;
  
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isFatigueAssessmentOpen, setIsFatigueAssessmentOpen] = useState(false);
  const [isAdjustmentSuggestionsOpen, setIsAdjustmentSuggestionsOpen] = useState(false);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [fatigueData, setFatigueData] = useState<any>(null);

  useEffect(() => {
    fetchPlanData();
  }, [planId]);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real data from API
      const response = await fetch(`/api/v1/plans/${planId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const planData: PlanData = await response.json();
      setPlanData(planData);
      
      // Fallback mock data for development (commented out)
      /*
      const mockPlan: PlanData = {
        // ... mock data implementation
      };
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPlanData(mockPlan);
      */
      } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan');
      } finally {
        setLoading(false);
      }
    };

  const handleStartNewPlan = () => {
    router.push('/onboarding/purpose');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleExerciseClick = async (exerciseName: string) => {
    try {
      // Search for exercise by name
      const response = await fetch(`/api/v1/exercises?query=${encodeURIComponent(exerciseName)}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        if (data.exercises && data.exercises.length > 0) {
          setSelectedExercise(data.exercises[0]);
          setIsExerciseModalOpen(true);
        } else {
          // If not found, create a mock exercise for demonstration
          const mockExercise: Exercise = {
            id: `mock-${exerciseName.toLowerCase().replace(/\s+/g, '-')}`,
            name: exerciseName,
            description: `A ${exerciseName.toLowerCase()} exercise for your training plan`,
            category: 'General',
            equipment: ['bodyweight'],
            difficulty: 3,
            primaryMuscles: ['Multiple'],
            secondaryMuscles: [],
            instructions: `Instructions for ${exerciseName}:\n1. Set up in the starting position\n2. Execute the movement with proper form\n3. Complete the desired number of repetitions\n4. Rest and repeat as needed`,
            tags: ['mock', 'general'],
            isActive: true,
            popularity: 0,
            tips: 'Focus on proper form and controlled movement',
            averageRating: 4.0,
            totalRatings: 0
          };
          setSelectedExercise(mockExercise);
          setIsExerciseModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch exercise details:', error);
      // Show mock exercise as fallback
      const mockExercise: Exercise = {
        id: `mock-${exerciseName.toLowerCase().replace(/\s+/g, '-')}`,
        name: exerciseName,
        description: `A ${exerciseName.toLowerCase()} exercise for your training plan`,
        category: 'General',
        equipment: ['bodyweight'],
        difficulty: 3,
        primaryMuscles: ['Multiple'],
        secondaryMuscles: [],
        instructions: `Instructions for ${exerciseName}:\n1. Set up in the starting position\n2. Execute the movement with proper form\n3. Complete the desired number of repetitions\n4. Rest and repeat as needed`,
        tips: 'Focus on proper form and controlled movement',
        tags: ['mock', 'general'],
        isActive: true,
        popularity: 0,
        averageRating: 4.0,
        totalRatings: 0
      };
      setSelectedExercise(mockExercise);
      setIsExerciseModalOpen(true);
    }
  };

  const handleExerciseRate = async (exerciseId: string, rating: number, difficulty: number, comment?: string) => {
    try {
      const response = await fetch(`/api/v1/exercises/${exerciseId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user_' + Date.now(), // Mock user ID
          rating,
          difficulty,
          comment
        })
      });
      
      if (response.ok) {
        console.log('Exercise rated successfully');
        // Refresh exercise data
        if (selectedExercise) {
          const updatedExercise = { ...selectedExercise };
          const currentRating = updatedExercise.averageRating || 0;
          const currentTotal = updatedExercise.totalRatings || 0;
          updatedExercise.averageRating = (currentRating * currentTotal + rating) / (currentTotal + 1);
          updatedExercise.totalRatings = currentTotal + 1;
          setSelectedExercise(updatedExercise);
        }
      }
    } catch (error) {
      console.error('Failed to rate exercise:', error);
    }
  };

  const handleFatigueAssessment = async (data: any) => {
    try {
      const response = await fetch('/api/v1/fatigue/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('Fatigue assessment submitted successfully');
        setFatigueData(data);
        
        // Get training adjustments
        await getTrainingAdjustments(data);
      }
    } catch (error) {
      console.error('Failed to submit fatigue assessment:', error);
    }
  };

  const getTrainingAdjustments = async (fatigueData: any) => {
    try {
      if (!planData) return;

      const currentSession = planData.content.microcycles[selectedWeek]?.sessions[0];
      if (!currentSession) return;

      const trainingSession = {
        exercises: currentSession.exercises.map(ex => ({
          id: ex.id || `mock-${ex.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: ex.name,
          category: ex.category,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          intensity: 3 // Default intensity
        })),
        totalDuration: currentSession.duration,
        restBetweenSets: 60 // Default rest time
      };

      const response = await fetch('/api/v1/fatigue/adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: fatigueData.userId,
          fatigueData,
          trainingSession
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAdjustments(data.adjustments || []);
        setIsAdjustmentSuggestionsOpen(true);
      }
    } catch (error) {
      console.error('Failed to get training adjustments:', error);
    }
  };

  const handleAdjustmentFeedback = async (adjustmentId: string, satisfactionScore: number, feedback?: string) => {
    try {
      const response = await fetch('/api/v1/fatigue/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adjustmentId,
          satisfactionScore,
          feedback
        })
      });

      if (response.ok) {
        console.log('Adjustment feedback submitted successfully');
      }
    } catch (error) {
      console.error('Failed to submit adjustment feedback:', error);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Loading Your Plan</h1>
          <p className="text-gray-400">Please wait while we prepare your training program...</p>
        </div>
      </main>
    );
  }

  if (error || !planData) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Error Loading Plan</h1>
          <p className="text-gray-400 mb-8">{error || 'Plan not found'}</p>
          <div className="space-x-4">
            <button
              onClick={handleBackToHome}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </button>
          <button
              onClick={handleStartNewPlan}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
              Create New Plan
          </button>
          </div>
        </div>
      </main>
    );
  }

  const currentWeek = planData.content.microcycles[selectedWeek];
  const currentSessions = currentWeek?.sessions || [];

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{planData.name}</h1>
              <p className="text-gray-400 mt-2">{planData.description}</p>
              <div className="flex items-center space-x-4 mt-4">
                <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
                  {planData.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-400">Version {planData.version}</span>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsFatigueAssessmentOpen(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <span>⚡</span>
                <span>Assess Fatigue</span>
              </button>
              <button
                onClick={handleBackToHome}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Back to Home
              </button>
            <button
                onClick={handleStartNewPlan}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
                Create New Plan
            </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Selector */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Training Weeks</h2>
            <div className="flex flex-wrap gap-2">
            {planData.content.microcycles.map((week, index) => (
              <button
                key={week.weekNumber}
                onClick={() => setSelectedWeek(index)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedWeek === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Week {week.weekNumber}: {week.name}
              </button>
              ))}
            </div>
          </div>
          
        {/* Current Week Details */}
        {currentWeek && (
          <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">
                Week {currentWeek.weekNumber}: {currentWeek.name}
              </h3>
              <p className="text-gray-400 mb-4">Phase: {currentWeek.phase}</p>
              <p className="text-gray-300">
                {currentSessions.length} training sessions this week
              </p>
            </div>

            {/* Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentSessions.map((session, sessionIndex) => (
                <div key={sessionIndex} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold">{session.name}</h4>
                    <span className="text-sm text-gray-400">{session.duration} min</span>
        </div>

                  <div className="space-y-3">
                    <p className="text-sm text-gray-400">
                      {DAY_NAMES[session.dayOfWeek - 1]}
                    </p>
                    
                    <div className="space-y-2">
                      {session.exercises.map((exercise, exerciseIndex) => (
                        <div key={exerciseIndex} className="bg-gray-700 rounded p-3 hover:bg-gray-600 transition-colors">
                          <button
                            onClick={() => handleExerciseClick(exercise.name)}
                            className="w-full text-left"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-blue-400 hover:text-blue-300">
                                  {exercise.name}
                                </h5>
                                <p className="text-sm text-gray-400">{exercise.category}</p>
                              </div>
                              <div className="text-right text-sm">
                                <p>{exercise.sets} sets × {exercise.reps} reps</p>
                                {exercise.weight && (
                                  <p className="text-gray-400">{exercise.weight} lbs</p>
                        )}
                      </div>
                        </div>
                            {exercise.notes && (
                              <p className="text-xs text-blue-400 mt-2">{exercise.notes}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Click for details</p>
                          </button>
                        </div>
                      ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
        )}

        {/* Plan Stats */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Plan Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {planData.content.microcycles.length}
              </div>
              <div className="text-gray-400">Total Weeks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {planData.content.microcycles.reduce((total, week) => total + week.sessions.length, 0)}
              </div>
              <div className="text-gray-400">Training Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {Math.round(planData.content.microcycles.reduce((total, week) => 
                  total + week.sessions.reduce((sessionTotal, session) => sessionTotal + session.duration, 0), 0
                ) / 60)}
              </div>
              <div className="text-gray-400">Total Hours</div>
          </div>
                  </div>
          </div>
        </div>

      {/* Exercise Modal */}
      <ExerciseModal
        exercise={selectedExercise}
        isOpen={isExerciseModalOpen}
        onClose={() => {
          setIsExerciseModalOpen(false);
          setSelectedExercise(null);
        }}
        onRate={handleExerciseRate}
        userId="user_123" // Mock user ID
      />

      {/* Fatigue Assessment Modal */}
      <FatigueAssessment
        isOpen={isFatigueAssessmentOpen}
        onClose={() => setIsFatigueAssessmentOpen(false)}
        onSubmit={handleFatigueAssessment}
        userId="user_123"
        sessionId={planId}
      />

      {/* Adjustment Suggestions Modal */}
      <AdjustmentSuggestions
        adjustments={adjustments}
        onFeedback={handleAdjustmentFeedback}
        onClose={() => setIsAdjustmentSuggestionsOpen(false)}
        isOpen={isAdjustmentSuggestionsOpen}
      />
    </main>
  );
}