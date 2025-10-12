/**
 * CoachTip Component - Unified Interface
 * Stream 3: UI Prototypes
 *
 * This component automatically switches between variants based on feature flags
 */

'use client';

import React from 'react';
import { useFeatureVariant } from '@/hooks/useFeatureVariant';
import { CoachTipVariantA } from './CoachTipVariantA';
import { CoachTipVariantB } from './CoachTipVariantB';

export interface CoachTipProps {
  message: string;
  title?: string;
  category?: 'insight' | 'warning' | 'success' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  rpeContext?: string;
}

export function CoachTip(props: CoachTipProps) {
  const variant = useFeatureVariant('coachTip');

  if (variant === 'B') {
    return <CoachTipVariantB {...props} />;
  }

  return <CoachTipVariantA {...props} />;
}
