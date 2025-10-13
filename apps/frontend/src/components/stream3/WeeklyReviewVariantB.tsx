/**
 * WeeklyReview Variant B - Visual Story Format
 * Stream 3: UI Prototypes
 *
 * Card-based narrative layout with visual hierarchy
 * Emphasizes adaptive insights and personal growth story
 */

'use client';

import React from 'react';
import { Award, Zap, Target, TrendingUp, ChevronRight } from 'lucide-react';

export interface WeeklyReviewData {
  weekNumber: number;
  dateRange: string;
  totalSessions: number;
  completionRate: number;
  avgRPE: number;
  totalVolume: number;
  volumeUnit: string;
  highlights: string[];
  trends: {
    label: string;
    value: string;
    change: 'up' | 'down' | 'stable';
    changePercent?: number;
  }[];
}

export interface WeeklyReviewVariantBProps {
  data: WeeklyReviewData;
  onViewDetails?: () => void;
}

export function WeeklyReviewVariantB({ data, onViewDetails }: WeeklyReviewVariantBProps) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Week {data.weekNumber}</h2>
            <p className="text-indigo-100 text-sm">{data.dateRange}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Award className="w-8 h-8" aria-hidden="true" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-indigo-100 text-xs mb-1">Sessions</p>
            <p className="text-2xl font-bold">{data.totalSessions}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-indigo-100 text-xs mb-1">Completion</p>
            <p className="text-2xl font-bold">{data.completionRate}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-indigo-100 text-xs mb-1">Avg RPE</p>
            <p className="text-2xl font-bold">{data.avgRPE.toFixed(1)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-indigo-100 text-xs mb-1">Volume</p>
            <p className="text-2xl font-bold">
              {data.totalVolume}
              <span className="text-sm ml-1">{data.volumeUnit}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Adaptive Insights Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Performance Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Performance Insights</h3>
          </div>

          <div className="space-y-3">
            {data.trends.slice(0, 3).map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{trend.label}</p>
                  <p className="text-lg font-bold text-gray-900">{trend.value}</p>
                </div>
                {trend.changePercent !== undefined && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    trend.change === 'up' ? 'bg-green-100 text-green-700' :
                    trend.change === 'down' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${
                      trend.change === 'down' ? 'transform rotate-180' : ''
                    }`} />
                    {Math.abs(trend.changePercent)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Highlights Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Target className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">This Week&apos;s Wins</h3>
          </div>

          <div className="space-y-3">
            {data.highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      {onViewDetails && (
        <div className="flex justify-center">
          <button
            onClick={onViewDetails}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md hover:shadow-lg"
          >
            View Full Analysis
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
