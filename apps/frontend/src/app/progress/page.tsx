"use client";

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  Calendar, 
  BarChart3,
  Activity,
  Zap,
  Clock,
  Award,
  Star
} from 'lucide-react';
import StrengthChart from '@/components/progress/StrengthChart';
import VolumeChart from '@/components/progress/VolumeChart';
import PersonalRecords from '@/components/progress/PersonalRecords';
import AchievementPanel from '@/components/progress/AchievementPanel';

interface PersonalRecord {
  id: string;
  exerciseName: string;
  recordType: 'max_weight' | 'max_reps' | 'max_volume' | 'max_duration';
  value: number;
  unit: string;
  verifiedAt: string;
  sessionId?: string;
  setNumber?: number;
  notes?: string;
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
  exercises: any[];
}

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

export default function ProgressPage() {
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [achievementStats, setAchievementStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchProgressData();
  }, [selectedTimeRange]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      // 使用新的摘要API，查询预计算的数据
      const summaryResponse = await fetch(`/api/v1/workouts/summary/user_123?timeRange=${selectedTimeRange}`);
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        
        // 从摘要数据中提取信息
        setPersonalRecords(summaryData.personalRecords || []);
        setRecentSessions(summaryData.recentSessions || []);
        setAchievementStats({
          totalRecords: summaryData.personalRecordsSet || 0,
          totalGoals: summaryData.weeklyGoalCompletion || 0,
          achievedGoals: summaryData.completedWorkouts || 0,
          activeGoals: (summaryData.weeklyGoalCompletion || 0) - (summaryData.completedWorkouts || 0),
          recordTypes: summaryData.recordTypes || [],
        });
      } else {
        // 如果摘要API不可用，回退到原始API
        await fetchLegacyProgressData();
      }

    } catch (error) {
      console.error('Failed to fetch progress data:', error);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLegacyProgressData = async () => {
    // 原始的数据获取逻辑作为后备
    const recordsResponse = await fetch('/api/v1/workouts/records/user_123');
    if (recordsResponse.ok) {
      const recordsData = await recordsResponse.json();
      setPersonalRecords(recordsData.records || []);
    }

    const sessionsResponse = await fetch('/api/v1/workouts/sessions?userId=user_123&limit=20');
    if (sessionsResponse.ok) {
      const sessionsData = await sessionsResponse.json();
      setRecentSessions(sessionsData.sessions || []);
    }

    const statsResponse = await fetch('/api/v1/workouts/achievements/user_123');
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      setAchievementStats(statsData.stats);
    }
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      default: return 'Last 30 days';
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'max_weight': return 'Max Weight';
      case 'max_reps': return 'Max Reps';
      case 'max_volume': return 'Max Volume';
      case 'max_duration': return 'Max Duration';
      default: return type;
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'max_weight': return <Target className="w-4 h-4" />;
      case 'max_reps': return <Activity className="w-4 h-4" />;
      case 'max_volume': return <BarChart3 className="w-4 h-4" />;
      case 'max_duration': return <Clock className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your progress...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Progress</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchProgressData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <span>Your Progress</span>
              </h1>
              <p className="text-gray-400 mt-2">
                Track your growth and celebrate your achievements
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Achievement Stats */}
        {achievementStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {achievementStats.totalRecords}
                  </div>
                  <div className="text-sm text-gray-400">Personal Records</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <Target className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {achievementStats.achievedGoals}
                  </div>
                  <div className="text-sm text-gray-400">Goals Achieved</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {recentSessions.length}
                  </div>
                  <div className="text-sm text-gray-400">Recent Sessions</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <Star className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {achievementStats.activeGoals}
                  </div>
                  <div className="text-sm text-gray-400">Active Goals</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Strength Progress Chart */}
            <StrengthChart 
              sessions={recentSessions}
              timeRange={selectedTimeRange}
            />

            {/* Volume Progress Chart */}
            <VolumeChart 
              sessions={recentSessions}
              timeRange={selectedTimeRange}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Personal Records */}
            <PersonalRecords 
              records={personalRecords}
              onRecordClick={(record) => {
                // Navigate to specific record or session
                console.log('Record clicked:', record);
              }}
            />

            {/* Achievement Panel */}
            <AchievementPanel 
              stats={achievementStats}
              recentSessions={recentSessions}
            />
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            <span>Recent Sessions</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSessions.map((session) => (
              <div key={session.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">
                    {session.sessionName || 'Training Session'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'completed' ? 'bg-green-600' :
                    session.status === 'active' ? 'bg-blue-600' :
                    'bg-gray-600'
                  }`}>
                    {session.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Date</span>
                    <span>{new Date(session.startedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {session.totalDuration && (
                    <div className="flex items-center justify-between">
                      <span>Duration</span>
                      <span>{session.totalDuration} min</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span>Exercises</span>
                    <span>{session.exercises.length}</span>
                  </div>
                  
                  {session.overallRating && (
                    <div className="flex items-center justify-between">
                      <span>Rating</span>
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
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

