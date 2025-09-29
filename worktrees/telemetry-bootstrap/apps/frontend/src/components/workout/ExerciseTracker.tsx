"use client";

import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Target, 
  Zap,
  RotateCcw,
  Save,
  Plus,
  Minus
} from 'lucide-react';
import { WorkoutExercise, WorkoutRecord } from '@athlete-ally/shared-types';

interface ExerciseTrackerProps {
  exercise: WorkoutExercise;
  onComplete: (exerciseId: string) => void;
  onUpdate: () => void;
}

export default function ExerciseTracker({ 
  exercise, 
  onComplete, 
  onUpdate 
}: ExerciseTrackerProps) {
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  
  // Current set data
  const [actualReps, setActualReps] = useState(exercise.targetReps);
  const [actualWeight, setActualWeight] = useState(exercise.targetWeight || 0);
  const [actualDuration, setActualDuration] = useState(exercise.targetDuration || 0);
  const [rpe, setRpe] = useState(5);
  const [form, setForm] = useState(5);
  const [difficulty, setDifficulty] = useState(3);
  const [notes, setNotes] = useState('');

  const completedSets = exercise.records.length;
  const remainingSets = exercise.targetSets - completedSets;
  const isLastSet = currentSet === exercise.targetSets;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  const startRest = () => {
    const restDuration = exercise.targetRest || 60;
    setRestTimeLeft(restDuration);
    setIsResting(true);
  };

  const stopRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const handleRecordSet = async () => {
    setIsRecording(true);
    
    try {
      const response = await fetch(`/api/v1/workouts/exercises/${exercise.id}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_123',
          setNumber: currentSet,
          targetReps: exercise.targetReps,
          actualReps: actualReps,
          targetWeight: exercise.targetWeight,
          actualWeight: actualWeight,
          targetDuration: exercise.targetDuration,
          actualDuration: actualDuration,
          rpe: rpe,
          form: form,
          difficulty: difficulty,
          notes: notes
        })
      });

      if (response.ok) {
        // Reset for next set
        setActualReps(exercise.targetReps);
        setActualWeight(exercise.targetWeight || 0);
        setActualDuration(exercise.targetDuration || 0);
        setRpe(5);
        setForm(5);
        setDifficulty(3);
        setNotes('');
        
        // Move to next set or complete exercise
        if (isLastSet) {
          onComplete(exercise.id);
        } else {
          setCurrentSet(currentSet + 1);
          startRest();
        }
        
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to record set:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getRpeColor = (rpe: number) => {
    if (rpe <= 3) return 'text-green-400';
    if (rpe <= 5) return 'text-yellow-400';
    if (rpe <= 7) return 'text-orange-400';
    return 'text-red-400';
  };

  const getFormColor = (form: number) => {
    if (form >= 4) return 'text-green-400';
    if (form >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Exercise Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{exercise.exerciseName}</h2>
          <p className="text-gray-400 capitalize">{exercise.category}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Set {currentSet} of {exercise.targetSets}</div>
          <div className="text-lg font-semibold">
            {completedSets}/{exercise.targetSets} completed
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSets / exercise.targetSets) * 100}%` }}
          />
        </div>
      </div>

      {/* Rest Timer */}
      {isResting && (
        <div className="mb-6 p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Rest Time</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              {formatTime(restTimeLeft)}
            </div>
          </div>
          <button
            onClick={stopRest}
            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Skip Rest
          </button>
        </div>
      )}

      {/* Set Recording Form */}
      {!isResting && (
        <div className="space-y-6">
          {/* Target vs Actual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Target</div>
              <div className="text-lg font-semibold">
                {exercise.targetReps} reps
                {exercise.targetWeight && ` @ ${exercise.targetWeight}kg`}
                {exercise.targetDuration && ` for ${exercise.targetDuration}s`}
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Actual Reps</div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActualReps(Math.max(0, actualReps - 1))}
                  className="p-1 rounded bg-gray-600 hover:bg-gray-500"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={actualReps}
                  onChange={(e) => setActualReps(parseInt(e.target.value) || 0)}
                  className="w-16 text-center bg-transparent border-b border-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => setActualReps(actualReps + 1)}
                  className="p-1 rounded bg-gray-600 hover:bg-gray-500"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {exercise.targetWeight && (
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Actual Weight (kg)</div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActualWeight(Math.max(0, actualWeight - 2.5))}
                    className="p-1 rounded bg-gray-600 hover:bg-gray-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={actualWeight}
                    onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)}
                    className="w-16 text-center bg-transparent border-b border-gray-500 focus:border-blue-500 focus:outline-none"
                    step="2.5"
                  />
                  <button
                    onClick={() => setActualWeight(actualWeight + 2.5)}
                    className="p-1 rounded bg-gray-600 hover:bg-gray-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RPE and Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Rate of Perceived Exertion (RPE)</div>
              <div className="flex items-center space-x-2">
                <span className="text-xs">1</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs">10</span>
                <span className={`font-bold ${getRpeColor(rpe)}`}>{rpe}</span>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Form Quality</div>
              <div className="flex items-center space-x-2">
                <span className="text-xs">1</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form}
                  onChange={(e) => setForm(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs">5</span>
                <span className={`font-bold ${getFormColor(form)}`}>{form}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Notes (optional)</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did this set feel? Any observations..."
              className="w-full bg-transparent border border-gray-500 rounded-lg p-3 focus:border-blue-500 focus:outline-none resize-none"
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleRecordSet}
              disabled={isRecording || actualReps === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isRecording ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Record Set {currentSet}</span>
                </>
              )}
            </button>

            {!isLastSet && (
              <button
                onClick={startRest}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Start Rest</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Previous Sets */}
      {exercise.records.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Previous Sets</h3>
          <div className="space-y-2">
            {exercise.records.map((record, index) => (
              <div key={record.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">Set {record.setNumber}</span>
                  <span className="font-medium">
                    {record.actualReps} reps
                    {record.actualWeight && ` @ ${record.actualWeight}kg`}
                  </span>
                  {record.rpe && (
                    <span className={`text-sm ${getRpeColor(record.rpe)}`}>
                      RPE {record.rpe}
                    </span>
                  )}
                  {record.form && (
                    <span className={`text-sm ${getFormColor(record.form)}`}>
                      Form {record.form}
                    </span>
                  )}
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

