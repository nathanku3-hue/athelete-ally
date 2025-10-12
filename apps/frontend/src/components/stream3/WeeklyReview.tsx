/**
 * WeeklyReview Component - Unified Interface
 * Stream 3: UI Prototypes
 *
 * This component automatically switches between variants based on feature flags
 */

'use client';

import React from 'react';
import { useFeatureVariant } from '@/hooks/useFeatureVariant';
import { WeeklyReviewVariantA } from './WeeklyReviewVariantA';
import { WeeklyReviewVariantB } from './WeeklyReviewVariantB';

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

export interface WeeklyReviewProps {
  data: WeeklyReviewData;
  onViewDetails?: () => void;
}

export function WeeklyReview(props: WeeklyReviewProps) {
  const variant = useFeatureVariant('weeklyReview');

  if (variant === 'B') {
    return <WeeklyReviewVariantB {...props} />;
  }

  return <WeeklyReviewVariantA {...props} />;
}
