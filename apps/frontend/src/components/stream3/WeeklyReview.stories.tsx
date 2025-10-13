/**
 * WeeklyReview Storybook Stories
 * Stream 3: UI Prototypes
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { WeeklyReviewVariantA } from './WeeklyReviewVariantA';
import { WeeklyReviewVariantB } from './WeeklyReviewVariantB';
import type { WeeklyReviewData } from './WeeklyReview';

// Sample data for stories
const sampleData: WeeklyReviewData = {
  weekNumber: 12,
  dateRange: 'Jan 15 - Jan 21, 2025',
  totalSessions: 5,
  completionRate: 100,
  avgRPE: 7.2,
  totalVolume: 12500,
  volumeUnit: 'kg',
  highlights: [
    'Completed all scheduled sessions with excellent consistency',
    'RPE management improved - maintained target zones throughout',
    'Progressive overload achieved on main lifts (squat +5kg, bench +2.5kg)',
  ],
  trends: [
    {
      label: 'Training Volume',
      value: '12,500 kg',
      change: 'up',
      changePercent: 8,
    },
    {
      label: 'Session Duration',
      value: '72 min avg',
      change: 'stable',
      changePercent: 0,
    },
    {
      label: 'Recovery Quality',
      value: 'Good',
      change: 'up',
      changePercent: 12,
    },
  ],
};

const lowCompletionData: WeeklyReviewData = {
  weekNumber: 8,
  dateRange: 'Dec 18 - Dec 24, 2024',
  totalSessions: 2,
  completionRate: 50,
  avgRPE: 8.5,
  totalVolume: 6200,
  volumeUnit: 'kg',
  highlights: [
    'Managed 2 quality sessions despite schedule challenges',
    'Maintained intensity when training was possible',
  ],
  trends: [
    {
      label: 'Training Volume',
      value: '6,200 kg',
      change: 'down',
      changePercent: -42,
    },
    {
      label: 'Session Duration',
      value: '85 min avg',
      change: 'up',
      changePercent: 18,
    },
    {
      label: 'Recovery Quality',
      value: 'Fair',
      change: 'down',
      changePercent: -8,
    },
  ],
};

// Variant A Stories
const metaA: Meta<typeof WeeklyReviewVariantA> = {
  title: 'Stream3/WeeklyReview/Variant A',
  component: WeeklyReviewVariantA,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default metaA;

type StoryA = StoryObj<typeof WeeklyReviewVariantA>;

export const SuccessfulWeekA: StoryA = {
  args: {
    data: sampleData,
    onViewDetails: () => alert('View details clicked'),
  },
};

export const ChallengingWeekA: StoryA = {
  args: {
    data: lowCompletionData,
    onViewDetails: () => alert('View details clicked'),
  },
};

export const NoActionButtonA: StoryA = {
  args: {
    data: sampleData,
  },
};

// Variant B Stories
const metaB: Meta<typeof WeeklyReviewVariantB> = {
  title: 'Stream3/WeeklyReview/Variant B',
  component: WeeklyReviewVariantB,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export const SuccessfulWeekB: StoryObj<typeof WeeklyReviewVariantB> = {
  args: {
    data: sampleData,
    onViewDetails: () => alert('View details clicked'),
  },
};

export const ChallengingWeekB: StoryObj<typeof WeeklyReviewVariantB> = {
  args: {
    data: lowCompletionData,
    onViewDetails: () => alert('View details clicked'),
  },
};

export const NoActionButtonB: StoryObj<typeof WeeklyReviewVariantB> = {
  args: {
    data: sampleData,
  },
};

export { metaB as VariantBMeta };
