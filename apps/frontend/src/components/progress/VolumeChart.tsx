/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from 'react';
import { BarChart3, Activity, TrendingUp } from 'lucide-react';

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
  exercises: Array<{
    id: string;
    exerciseName: string;
    totalVolume?: number;
    records: Array<{
      actualWeight?: number;
      actualReps: number;
    }>;
  }>;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  totalVolume: number;
  sessionName: string;
}

interface VolumeChartProps {
  sessions: WorkoutSession[];
  timeRange: string;
}

export default function VolumeChart({ sessions, timeRange }: VolumeChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    generateChartData();
  }, [sessions, timeRange]);

  const generateChartData = () => {
    // Filter sessions by time range
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.completedAt || session.startedAt);
      const now = new Date();
      const daysDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
      
      switch (timeRange) {
        case '7d': return daysDiff <= 7;
        case '30d': return daysDiff <= 30;
        case '90d': return daysDiff <= 90;
        case '1y': return daysDiff <= 365;
        default: return daysDiff <= 30;
      }
    });

    // Generate chart data
    const data = filteredSessions.map(session => {
      const sessionDate = new Date(session.completedAt || session.startedAt);
      
      // Calculate total volume for this session
      const totalVolume = session.exercises.reduce((sum, exercise) => {
        const exerciseVolume = exercise.records.reduce((exSum, record) => {
          return exSum + ((record.actualWeight || 0) * record.actualReps);
        }, 0);
        return sum + exerciseVolume;
      }, 0);

      return {
        date: sessionDate.toISOString().split('T')[0],
        displayDate: sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalVolume: totalVolume,
        sessionName: session.sessionName || 'Training Session'
      };
    }).filter(d => d.totalVolume > 0).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setChartData(data);
  };

  const maxVolume = Math.max(...chartData.map(d => d.totalVolume), 0);
  const minVolume = Math.min(...chartData.map(d => d.totalVolume), 0);
  const totalVolume = chartData.reduce((sum, d) => sum + d.totalVolume, 0);
  const averageVolume = chartData.length > 0 ? totalVolume / chartData.length : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <span>Training Volume</span>
        </h3>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No volume data available</p>
          <p className="text-sm text-gray-500">
            Complete some workouts to see your training volume progress
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end space-x-2">
            {chartData.map((point, index) => {
              const height = maxVolume > 0 ? (point.totalVolume / maxVolume) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-700 rounded-t-lg relative group">
                    <div 
                      className="bg-purple-600 rounded-t-lg transition-all duration-300 hover:bg-purple-500"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {point.totalVolume.toFixed(0)}kg
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 text-center">
                    {point.displayDate}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {maxVolume > 0 ? `${maxVolume.toFixed(0)}kg` : '0kg'}
              </div>
              <div className="text-sm text-gray-400">Max Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {averageVolume > 0 ? `${averageVolume.toFixed(0)}kg` : '0kg'}
              </div>
              <div className="text-sm text-gray-400">Avg Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {totalVolume > 0 ? `${totalVolume.toFixed(0)}kg` : '0kg'}
              </div>
              <div className="text-sm text-gray-400">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {chartData.length}
              </div>
              <div className="text-sm text-gray-400">Sessions</div>
            </div>
          </div>

          {/* Volume Trend */}
          {chartData.length > 1 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Volume Trend</h4>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Overall Trend</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className={`w-4 h-4 ${
                      chartData[chartData.length - 1].totalVolume > chartData[0].totalVolume 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      chartData[chartData.length - 1].totalVolume > chartData[0].totalVolume 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {chartData[chartData.length - 1].totalVolume > chartData[0].totalVolume ? 'Increasing' : 'Decreasing'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {chartData[chartData.length - 1].totalVolume > chartData[0].totalVolume ? '+' : ''}
                  {(((chartData[chartData.length - 1].totalVolume - chartData[0].totalVolume) / chartData[0].totalVolume) * 100).toFixed(1)}% 
                  from first to last session
                </div>
              </div>
            </div>
          )}

          {/* Recent Sessions */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Recent Sessions</h4>
            <div className="space-y-2">
              {chartData.slice(-5).reverse().map((point, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <div>
                    <div className="text-sm font-medium text-white">{point.sessionName}</div>
                    <div className="text-xs text-gray-400">{point.displayDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-400">{point.totalVolume.toFixed(0)}kg</div>
                    <div className="text-xs text-gray-400">Total Volume</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

