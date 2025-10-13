/**
 * Onboarding Copy Variants
 * Stream 3: UI Prototypes
 *
 * Provides different messaging variants for onboarding flows
 */

export interface OnboardingCopyVariant {
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  value: {
    title: string;
    points: string[];
  };
  howItWorks: {
    title: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
}

/**
 * Variant A: Technical/Data-driven
 * Appeals to analytical users who want precision and evidence
 */
export const onboardingCopyVariantA: OnboardingCopyVariant = {
  hero: {
    headline: 'Precision Training, Powered by Data',
    subheadline:
      'Our RPE-based adaptive algorithm adjusts your training in real-time, delivering 40% more accurate load management than static programs.',
    cta: 'Start Your Plan',
  },
  value: {
    title: 'Why RPE-Based Training Works',
    points: [
      'Evidence-based algorithms analyze your subjective recovery data',
      'Automatic volume and intensity adjustments based on your daily readiness',
      'Quantified progress tracking with detailed performance metrics',
      'Research-backed methodology proven in peer-reviewed studies',
    ],
  },
  howItWorks: {
    title: 'How It Works',
    steps: [
      {
        title: 'Log Your RPE',
        description:
          'After each session, rate your perceived exertion on a 1-10 scale. This subjective metric is more predictive of recovery than any objective measure.',
      },
      {
        title: 'Algorithm Analyzes',
        description:
          'Our multi-factor scoring engine (60% safety, 30% compliance, 10% performance) calculates your optimal next-session load.',
      },
      {
        title: 'Automatic Adjustments',
        description:
          'Your program adapts daily based on trend analysis, ensuring you train hard when fresh and back off when fatigued.',
      },
      {
        title: 'Track Progress',
        description:
          'View detailed charts of volume, intensity, and RPE trends over time. Export data for external analysis if needed.',
      },
    ],
  },
};

/**
 * Variant B: Personalized/Adaptive
 * Appeals to users who want a coaching relationship and personal guidance
 */
export const onboardingCopyVariantB: OnboardingCopyVariant = {
  hero: {
    headline: 'Your AI Coach, Learning Every Day',
    subheadline:
      'Training that adapts to your life. Whether you crushed a workout or barely slept, your plan adjusts to keep you progressing safely.',
    cta: 'Meet Your Coach',
  },
  value: {
    title: 'Training That Understands You',
    points: [
      'Learns how your body responds to training stress over time',
      'Adapts to life stressors like poor sleep, work demands, or illness',
      'Celebrates your wins and guides you through challenging weeks',
      'Feels like having a coach in your pocket, available 24/7',
    ],
  },
  howItWorks: {
    title: 'How Your Coach Works With You',
    steps: [
      {
        title: 'Share How You Feel',
        description:
          'After training, tell us how hard it felt. That simple feedback is all your coach needs to understand your recovery.',
      },
      {
        title: 'AI Learns Your Patterns',
        description:
          'Over time, your coach learns your unique recovery patterns, stress tolerance, and performance trends.',
      },
      {
        title: 'Plan Adapts Automatically',
        description:
          "Based on your feedback, your coach adjusts tomorrow's workout to match your readiness. Push hard when you're fresh, dial back when you need rest.",
      },
      {
        title: 'Celebrate Progress Together',
        description:
          'Get weekly summaries of your progress, adaptive insights on your training, and personalized encouragement.',
      },
    ],
  },
};

/**
 * Get onboarding copy based on variant preference
 * @param variant 'A' for Technical, 'B' for Personalized
 */
export function getOnboardingCopy(variant: 'A' | 'B'): OnboardingCopyVariant {
  return variant === 'B' ? onboardingCopyVariantB : onboardingCopyVariantA;
}
