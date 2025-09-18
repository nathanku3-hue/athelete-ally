"use client";

import { 
  Clock, 
  Target, 
  Activity, 
  Zap, 
  TrendingUp,
  BarChart3,
  Timer
} from 'lucide-react';

interface WorkoutSession {
  id: string;
  userId: string;
  planId?: string;
  sessionName?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  isActive: boolean;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  totalDuration?: number;
  notes?: string;
  overallRating?: number;
  difficulty?: number;
  energy?: number;
  motivation?: number;
  location?: string;
  weather?: string;
  temperature?: number;
  exercises: any[];
}

interface RealTimeStatsProps {
  session: WorkoutSession;
  elapsedTime: number;
}

export default function RealTimeStats({ session, elapsedTime }: RealTimeStatsProps) {
  const completedExercises = session.exercises.filter(ex => ex.isCompleted).length;
  const totalExercises = session.exercises.length;
  const completedSets = session.exercises.reduce((sum, ex) => sum + ex.actualSets, 0);
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.targetSets, 0);
  const totalVolume = session.exercises.reduce((sum, ex) => sum + (ex.totalVolume || 0), 0);
  const totalReps = session.exercises.reduce((sum, ex) => sum + ex.actualReps, 0);
  
  // Calculate average RPE
  const allRpeValues = session.exercises
    .flatMap(ex => ex.records)
    .filter(record => record.rpe)
    .map(record => record.rpe);
  const averageRPE = allRpeValues.length > 0 
    ? allRpeValues.reduce((sum, rpe) => sum + rpe, 0) / allRpeValues.length 
    : 0;

  // Calculate completion percentage
  const exerciseProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  const setProgress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-400';
    if (progress >= 75) return 'text-blue-400';
    if (progress >= 50) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getRpeColor = (rpe: number) => {
    if (rpe <= 3) return 'text-green-400';
    if (rpe <= 5) return 'text-yellow-400';
    if (rpe <= 7) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold flex items-center space-x-2">
        <BarChart3 className="w-5 h-5" />
        <span>Live Stats</span>
      </h3>

      {/* Time Stats */}
      <div className="space-y-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Elapsed Time</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {formatTime(elapsedTime)}
          </div>
        </div>

        {session.totalDuration && (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Total Duration</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {session.totalDuration} min
            </div>
          </div>
        )}
      </div>

      {/* Progress Stats */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Progress</h4>
        
        <div className="space-y-3">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Exercises</span>
              <span className={`text-sm font-bold ${getProgressColor(exerciseProgress)}`}>
                {Math.round(exerciseProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exerciseProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {completedExercises} of {totalExercises} completed
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Sets</span>
              <span className={`text-sm font-bold ${getProgressColor(setProgress)}`}>
                {Math.round(setProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${setProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {completedSets} of {totalSets} completed
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Performance</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Total Reps</span>
            </div>
            <div className="text-xl font-bold text-purple-400">{totalReps}</div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">Volume</span>
            </div>
            <div className="text-xl font-bold text-orange-400">
              {totalVolume > 0 ? `${totalVolume.toFixed(0)}kg` : '0kg'}
            </div>
          </div>
        </div>

        {averageRPE > 0 && (
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Average RPE</span>
              </div>
              <span className={`text-lg font-bold ${getRpeColor(averageRPE)}`}>
                {averageRPE.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Breakdown */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Exercise Breakdown</h4>
        
        <div className="space-y-2">
          {session.exercises.map((exercise) => (
            <div key={exercise.id} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{exercise.exerciseName}</span>
                <span className="text-xs text-gray-400">
                  {exercise.actualSets}/{exercise.targetSets} sets
                </span>
              </div>
              
              <div className="w-full bg-gray-600 rounded-full h-1.5 mb-2">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${exercise.targetSets > 0 ? (exercise.actualSets / exercise.targetSets) * 100 : 0}%` 
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {exercise.actualReps} reps
                  {exercise.actualWeight && ` @ ${exercise.actualWeight}kg`}
                </span>
                {exercise.totalVolume && (
                  <span>{exercise.totalVolume.toFixed(0)}kg volume</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Environment */}
      {(session.location || session.weather || session.temperature) && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Environment</h4>
          
          <div className="bg-gray-700 rounded-lg p-3 space-y-2">
            {session.location && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Location</span>
                <span className="text-white">{session.location}</span>
              </div>
            )}
            {session.weather && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Weather</span>
                <span className="text-white">{session.weather}</span>
              </div>
            )}
            {session.temperature && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Temperature</span>
                <span className="text-white">{session.temperature}°C</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

