"use client";

import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  Clock, 
  Target, 
  Activity,
  Zap,
  RotateCcw
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

interface SessionControlsProps {
  session: WorkoutSession;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
}

export default function SessionControls({ 
  session, 
  onStart, 
  onPause, 
  onResume, 
  onComplete 
}: SessionControlsProps) {
  const completedExercises = session.exercises.filter(ex => ex.isCompleted).length;
  const totalExercises = session.exercises.length;
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.targetSets, 0);
  const completedSets = session.exercises.reduce((sum, ex) => sum + ex.actualSets, 0);
  const totalVolume = session.exercises.reduce((sum, ex) => sum + (ex.totalVolume || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-600/20';
      case 'paused': return 'text-yellow-400 bg-yellow-600/20';
      case 'completed': return 'text-blue-400 bg-blue-600/20';
      case 'cancelled': return 'text-red-400 bg-red-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <Square className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      {/* Session Status */}
      <div className="text-center">
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
          {getStatusIcon(session.status)}
          <span>{session.status.toUpperCase()}</span>
        </div>
        <h3 className="text-lg font-semibold mt-2">
          {session.sessionName || 'Training Session'}
        </h3>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        {session.status === 'draft' && (
          <button
            onClick={onStart}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Start Workout</span>
          </button>
        )}

        {session.status === 'active' && (
          <>
            <button
              onClick={onPause}
              className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Workout</span>
            </button>
            <button
              onClick={onComplete}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Workout</span>
            </button>
          </>
        )}

        {session.status === 'paused' && (
          <>
            <button
              onClick={onResume}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Resume Workout</span>
            </button>
            <button
              onClick={onComplete}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Workout</span>
            </button>
          </>
        )}

        {session.status === 'completed' && (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-semibold">Workout Completed!</p>
            <p className="text-sm text-gray-400 mt-1">Great job today!</p>
          </div>
        )}
      </div>

      {/* Session Stats */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Session Stats</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{completedExercises}</div>
            <div className="text-xs text-gray-400">Exercises</div>
            <div className="text-xs text-gray-500">of {totalExercises}</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{completedSets}</div>
            <div className="text-xs text-gray-400">Sets</div>
            <div className="text-xs text-gray-500">of {totalSets}</div>
          </div>
        </div>

        {totalVolume > 0 && (
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{totalVolume.toFixed(0)}</div>
            <div className="text-xs text-gray-400">Total Volume (kg)</div>
          </div>
        )}
      </div>

      {/* Exercise Progress */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Exercise Progress</h4>
        
        <div className="space-y-2">
          {session.exercises.map((exercise, index) => (
            <div key={exercise.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium">{exercise.exerciseName}</div>
                <div className="text-xs text-gray-400">
                  {exercise.actualSets}/{exercise.targetSets} sets
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${exercise.targetSets > 0 ? (exercise.actualSets / exercise.targetSets) * 100 : 0}%` 
                    }}
                  />
                </div>
                {exercise.isCompleted && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Notes */}
      {session.notes && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Notes</h4>
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-300">{session.notes}</p>
          </div>
        </div>
      )}

      {/* Session Rating */}
      {session.overallRating && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Session Rating</h4>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`w-4 h-4 ${
                      star <= session.overallRating! 
                        ? 'text-yellow-400' 
                        : 'text-gray-600'
                    }`}
                  >
                    ★
                  </div>
                ))}
              </div>
            </div>
            {session.difficulty && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">Difficulty</span>
                <span className="text-sm text-gray-300">{session.difficulty}/5</span>
              </div>
            )}
            {session.energy && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">Energy</span>
                <span className="text-sm text-gray-300">{session.energy}/5</span>
              </div>
            )}
            {session.motivation && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">Motivation</span>
                <span className="text-sm text-gray-300">{session.motivation}/5</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

