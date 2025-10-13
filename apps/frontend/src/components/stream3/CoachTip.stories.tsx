/**
 * CoachTip Storybook Stories
 * Stream 3: UI Prototypes
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { CoachTipVariantA } from './CoachTipVariantA';
import { CoachTipVariantB } from './CoachTipVariantB';

// Variant A Stories
const metaA: Meta<typeof CoachTipVariantA> = {
  title: 'Stream3/CoachTip/Variant A',
  component: CoachTipVariantA,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    category: {
      control: 'select',
      options: ['insight', 'warning', 'success', 'info'],
    },
  },
};

export default metaA;

type StoryA = StoryObj<typeof CoachTipVariantA>;

export const InsightA: StoryA = {
  args: {
    category: 'insight',
    title: 'Recovery Insight',
    message: 'Based on your recent RPE scores, your body is adapting well to the current training load. Consider maintaining this intensity for another week.',
    dismissible: true,
    action: {
      label: 'Learn More',
      onClick: () => alert('Action clicked'),
    },
  },
};

export const WarningA: StoryA = {
  args: {
    category: 'warning',
    title: 'High Fatigue Detected',
    message: 'Your fatigue levels have been elevated for 3 consecutive days. Consider scheduling an active recovery session.',
    dismissible: true,
  },
};

export const SuccessA: StoryA = {
  args: {
    category: 'success',
    title: 'Milestone Achieved!',
    message: 'You\'ve completed 4 weeks of consistent training. Great work!',
    dismissible: true,
  },
};

export const InfoA: StoryA = {
  args: {
    category: 'info',
    message: 'Remember to log your RPE after each session for better personalized insights.',
    dismissible: false,
  },
};

// Variant B Stories
const metaB: Meta<typeof CoachTipVariantB> = {
  title: 'Stream3/CoachTip/Variant B',
  component: CoachTipVariantB,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    category: {
      control: 'select',
      options: ['insight', 'warning', 'success', 'info'],
    },
  },
};

export const InsightB: StoryObj<typeof CoachTipVariantB> = {
  args: {
    category: 'insight',
    title: 'Adaptive Recovery Suggestion',
    message: 'Your recent performance data suggests you\'re primed for a deload week. This strategic reduction can help maximize your next training block.',
    rpeContext: 'Avg RPE: 7.8 (Last 7 days)',
    dismissible: true,
    action: {
      label: 'View Recovery Plan',
      onClick: () => alert('Action clicked'),
    },
  },
};

export const WarningB: StoryObj<typeof CoachTipVariantB> = {
  args: {
    category: 'warning',
    title: 'Fatigue Alert',
    message: 'Your body needs rest. Elevated fatigue markers detected across multiple sessions.',
    rpeContext: 'RPE Trend: ↑ 15% above baseline',
    dismissible: true,
    action: {
      label: 'Adjust Schedule',
      onClick: () => alert('Action clicked'),
    },
  },
};

export const SuccessB: StoryObj<typeof CoachTipVariantB> = {
  args: {
    category: 'success',
    title: 'Consistency Streak!',
    message: 'You\'ve hit a 30-day training consistency streak. Your dedication is paying off with measurable progress.',
    rpeContext: 'Completion Rate: 95%',
    dismissible: true,
  },
};

export const InfoB: StoryObj<typeof CoachTipVariantB> = {
  args: {
    category: 'info',
    title: 'Training Tip',
    message: 'Logging your subjective feelings helps our adaptive engine fine-tune your program in real-time.',
    dismissible: false,
  },
};

export { metaB as VariantBMeta };
