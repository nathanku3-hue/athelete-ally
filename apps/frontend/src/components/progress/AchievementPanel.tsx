/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Award,
  Target,
  Calendar,
  Star,
  Trophy,
  Zap,
  Activity,
  BarChart3,
  Clock
} from 'lucide-react';

interface AchievementStats {
  totalRecords: number;
  totalGoals: number;
  achievedGoals: number;
  activeGoals: number;
  recordTypes: Array<{
    type: string;
    count: number;
  }>;
}

interface Exercise {
  id: string;
  exerciseName: string;
  records: Array<{
    actualWeight?: number;
    actualReps: number;
  }>;
}

interface WorkoutSession {
  id: string;
  sessionName?: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  totalDuration?: number;
  overallRating?: number;
  difficulty?: number;
  energy?: number;
  motivation?: number;
  exercises: Exercise[];
}

interface AchievementPanelProps {
  stats: AchievementStats | null;
  recentSessions: WorkoutSession[];
}

export default function AchievementPanel({ stats, recentSessions }: AchievementPanelProps) {
  if (!stats) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Loading achievements...</p>
        </div>
      </div>
    );
  }

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'max_weight': return <Target className="w-4 h-4" />;
      case 'max_reps': return <Activity className="w-4 h-4" />;
      case 'max_volume': return <BarChart3 className="w-4 h-4" />;
      case 'max_duration': return <Clock className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'max_weight': return 'text-red-400';
      case 'max_reps': return 'text-blue-400';
      case 'max_volume': return 'text-purple-400';
      case 'max_duration': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'max_weight': return 'Weight';
      case 'max_reps': return 'Reps';
      case 'max_volume': return 'Volume';
      case 'max_duration': return 'Duration';
      default: return type;
    }
  };

  // Calculate streak
  const calculateStreak = () => {
    if (recentSessions.length === 0) return 0;
    
    const sortedSessions = recentSessions
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime());
    
    if (sortedSessions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].completedAt || sortedSessions[i].startedAt);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      // Check if session is within 2 days of expected date (to account for rest days)
      const daysDiff = Math.abs(sessionDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 2) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();
  const totalSessions = recentSessions.length;
  const completedSessions = recentSessions.filter(s => s.status === 'completed').length;
  const averageRating = recentSessions
    .filter(s => s.overallRating)
    .reduce((sum, s) => sum + (s.overallRating || 0), 0) / 
    recentSessions.filter(s => s.overallRating).length || 0;

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>Achievement Overview</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.totalRecords}</div>
            <div className="text-sm text-gray-400">Personal Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.achievedGoals}</div>
            <div className="text-sm text-gray-400">Goals Achieved</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Success Rate</span>
            <span className="text-white font-medium">
              {stats.totalGoals > 0 ? Math.round((stats.achievedGoals / stats.totalGoals) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Record Types Breakdown */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <span>Record Types</span>
        </h3>

        <div className="space-y-3">
          {stats.recordTypes.map((recordType) => (
            <div key={recordType.type} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={getRecordTypeColor(recordType.type)}>
                  {getRecordTypeIcon(recordType.type)}
                </div>
                <span className="text-sm text-gray-300">
                  {getRecordTypeLabel(recordType.type)}
                </span>
              </div>
              <span className="text-sm font-medium text-white">
                {recordType.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Training Stats */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-400" />
          <span>Training Stats</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Current Streak</span>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">{streak} days</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Total Sessions</span>
            <span className="text-sm font-medium text-white">{totalSessions}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Completion Rate</span>
            <span className="text-sm font-medium text-white">
              {totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}%
            </span>
          </div>

          {averageRating > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Avg Rating</span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  {averageRating.toFixed(1)}/5
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <span>Recent Activity</span>
        </h3>

        <div className="space-y-3">
          {recentSessions.slice(0, 3).map((session) => (
            <div key={session.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">
                  {session.sessionName || 'Training Session'}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(session.completedAt || session.startedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {session.overallRating && (
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-3 h-3 ${
                          star <= session.overallRating! 
                            ? 'text-yellow-400' 
                            : 'text-gray-600'
                        }`}
                      >
                        ★
                      </div>
                    ))}
                  </div>
                )}
                <div className={`w-2 h-2 rounded-full ${
                  session.status === 'completed' ? 'bg-green-400' :
                  session.status === 'active' ? 'bg-blue-400' :
                  'bg-gray-400'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-6 border border-blue-500/30">
        <div className="text-center">
          <div className="text-2xl mb-2">💪</div>
          <p className="text-sm text-gray-300 italic">
            &quot;Every workout is a step closer to your goals. Keep pushing forward!&quot;
          </p>
        </div>
      </div>
    </div>
  );
}

