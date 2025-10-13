/**
 * WeeklyReview Adapter
 * Stream 3: UI Prototypes
 *
 * Bridges backend WeeklyReviewSummary types with variant components
 */

"use client";

import { WeeklyReviewSummary } from '@athlete-ally/shared-types';
import { WeeklyReview, WeeklyReviewData } from '@/components/stream3/WeeklyReview';
import { applyWeeklyReview } from '@/lib/weekly-review';
import { useState } from 'react';

interface WeeklyReviewAdapterProps {
  review: WeeklyReviewSummary;
  onApplied?: () => void;
}

export function WeeklyReviewAdapter({ review, onApplied }: WeeklyReviewAdapterProps) {
  const [isApplying, setIsApplying] = useState(false);

  // Transform backend data to variant format
  const weekNumber = getWeekNumberFromDate(review.generatedAt);
  const dateRange = formatDateRange(review.generatedAt);

  // Calculate metrics from adjustments
  const totalSessions = review.adjustments.find((a) => a.metric === 'Sessions')?.adjusted ?? 0;
  const completionRate = 100; // Backend doesn't provide this yet
  const avgRPE = review.adjustments.find((a) => a.metric === 'Average RPE')?.adjusted ?? 7;
  const volumeAdjustment = review.adjustments.find((a) => a.metric.includes('Volume'));
  const totalVolume = typeof volumeAdjustment?.adjusted === 'number' ? volumeAdjustment.adjusted : 0;
  const volumeUnit = volumeAdjustment?.unit === 'percent' ? '%' : 'kg';

  // Transform adjustments to trends (map 'neutral' to 'stable' for variant compatibility)
  const trends = review.adjustments.map((adj) => ({
    label: adj.metric,
    value: `${adj.adjusted}${adj.unit === 'percent' ? '%' : ''}`,
    change: adj.direction === 'neutral' ? 'stable' : adj.direction,
    changePercent:
      typeof adj.baseline === 'number' && typeof adj.adjusted === 'number'
        ? Math.round(((adj.adjusted - adj.baseline) / adj.baseline) * 100)
        : undefined,
  })) as Array<{
    label: string;
    value: string;
    change: 'up' | 'down' | 'stable';
    changePercent?: number;
  }>;

  // Extract highlights from recommendation (simple split)
  const highlights = [review.recommendation];

  const data: WeeklyReviewData = {
    weekNumber,
    dateRange,
    totalSessions: typeof totalSessions === 'number' ? totalSessions : 0,
    completionRate,
    avgRPE: typeof avgRPE === 'number' ? avgRPE : 7,
    totalVolume,
    volumeUnit,
    highlights,
    trends,
  };

  const handleViewDetails = async () => {
    if (review.status === 'pending') {
      setIsApplying(true);
      try {
        await applyWeeklyReview(review.planId);
        onApplied?.();
      } catch (error) {
        console.error('Failed to apply weekly review:', error);
      } finally {
        setIsApplying(false);
      }
    }
  };

  return <WeeklyReview data={data} onViewDetails={handleViewDetails} />;
}

// Helper functions
function getWeekNumberFromDate(dateStr: string): number {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

function formatDateRange(dateStr: string): string {
  const date = new Date(dateStr);
  const endDate = new Date(date);
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - 6);

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}, ${date.getFullYear()}`;
}
