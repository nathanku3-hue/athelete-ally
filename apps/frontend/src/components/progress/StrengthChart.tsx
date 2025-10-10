/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Target } from 'lucide-react';

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
    targetWeight?: number;
    actualWeight?: number;
    records: Array<{
      actualWeight?: number;
      actualReps: number;
    }>;
  }>;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  maxWeight: number;
  sessionName: string;
}

interface StrengthChartProps {
  sessions: WorkoutSession[];
  timeRange: string;
}

export default function StrengthChart({ sessions, timeRange }: StrengthChartProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>('all');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    generateChartData();
  }, [sessions, selectedExercise, timeRange]);

  const generateChartData = () => {
    // Get all unique exercises
    const allExercises = [...new Set(sessions.flatMap(s => s.exercises.map(e => e.exerciseName)))];
    
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
      const exercises = selectedExercise === 'all' 
        ? session.exercises 
        : session.exercises.filter(e => e.exerciseName === selectedExercise);
      
      // Calculate max weight for this session
      const maxWeight = exercises.reduce((max, exercise) => {
        const exerciseMax = exercise.records.reduce((exMax, record) => {
          return Math.max(exMax, record.actualWeight || 0);
        }, 0);
        return Math.max(max, exerciseMax);
      }, 0);

      return {
        date: sessionDate.toISOString().split('T')[0],
        displayDate: sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        maxWeight: maxWeight,
        sessionName: session.sessionName || 'Training Session'
      };
    }).filter(d => d.maxWeight > 0).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setChartData(data);
  };

  const allExercises = [...new Set(sessions.flatMap(s => s.exercises.map(e => e.exerciseName)))];

  const maxWeight = Math.max(...chartData.map(d => d.maxWeight), 0);
  const minWeight = Math.min(...chartData.map(d => d.maxWeight), 0);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span>Strength Progress</span>
        </h3>
        
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Exercises</option>
          {allExercises.map(exercise => (
            <option key={exercise} value={exercise}>{exercise}</option>
          ))}
        </select>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No strength data available</p>
          <p className="text-sm text-gray-500">
            Complete some workouts with weight tracking to see your progress
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end space-x-2">
            {chartData.map((point, index) => {
              const height = maxWeight > 0 ? (point.maxWeight / maxWeight) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-700 rounded-t-lg relative group">
                    <div 
                      className="bg-blue-600 rounded-t-lg transition-all duration-300 hover:bg-blue-500"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {point.maxWeight}kg
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
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {maxWeight > 0 ? `${maxWeight}kg` : '0kg'}
              </div>
              <div className="text-sm text-gray-400">Max Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {chartData.length}
              </div>
              <div className="text-sm text-gray-400">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {chartData.length > 1 ? 
                  `${((maxWeight - minWeight) / minWeight * 100).toFixed(1)}%` : 
                  '0%'
                }
              </div>
              <div className="text-sm text-gray-400">Improvement</div>
            </div>
          </div>

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
                    <div className="text-sm font-bold text-blue-400">{point.maxWeight}kg</div>
                    <div className="text-xs text-gray-400">Max Weight</div>
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

