/**
 * WeeklyReview Variant A - Traditional Dashboard
 * Stream 3: UI Prototypes
 *
 * Classic tabular layout with metrics grid
 * Emphasizes data completeness and historical trends
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';

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

export interface WeeklyReviewVariantAProps {
  data: WeeklyReviewData;
  onViewDetails?: () => void;
}

export function WeeklyReviewVariantA({ data, onViewDetails }: WeeklyReviewVariantAProps) {
  const getTrendIcon = (change: 'up' | 'down' | 'stable') => {
    if (change === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Week {data.weekNumber} Review
          </h2>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            {data.dateRange}
          </p>
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Details
          </button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Sessions Completed</p>
          <p className="text-2xl font-bold text-gray-900">{data.totalSessions}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900">{data.completionRate}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Avg RPE</p>
          <p className="text-2xl font-bold text-gray-900">{data.avgRPE.toFixed(1)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-gray-900">
            {data.totalVolume}
            <span className="text-sm text-gray-600 ml-1">{data.volumeUnit}</span>
          </p>
        </div>
      </div>

      {/* Trends Table */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Trends</h3>
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Metric
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.trends.map((trend, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900">{trend.label}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{trend.value}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(trend.change)}
                      {trend.changePercent !== undefined && (
                        <span className={`font-medium ${
                          trend.change === 'up' ? 'text-green-600' :
                          trend.change === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {trend.changePercent > 0 ? '+' : ''}{trend.changePercent}%
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Highlights */}
      {data.highlights.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Week Highlights</h3>
          <ul className="space-y-2">
            {data.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
