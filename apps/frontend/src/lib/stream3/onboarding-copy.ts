/**
 * Onboarding Copy Variants
 * Stream 3: UI Prototypes
 *
 * Two copy variants emphasizing different value propositions:
 * - Variant A: Technical/Data-driven approach
 * - Variant B: Personalized/Adaptive approach (emphasizes RPE adaptation)
 */

export interface OnboardingCopy {
  welcome: {
    title: string;
    subtitle: string;
    cta: string;
  };
  rpeIntro: {
    title: string;
    description: string;
    tip: string;
  };
  adaptiveEngine: {
    title: string;
    description: string;
    benefits: string[];
  };
}

/**
 * Variant A: Technical/Data-driven
 * Emphasizes metrics, precision, and data-driven training
 */
export const onboardingCopyA: OnboardingCopy = {
  welcome: {
    title: 'Welcome to Athlete Ally',
    subtitle: 'Data-driven training designed for your goals. Track metrics, analyze performance, and optimize your training program.',
    cta: 'Start Building Your Profile',
  },
  rpeIntro: {
    title: 'Understanding RPE (Rate of Perceived Exertion)',
    description: 'RPE is a 1-10 scale measuring how hard each session feels. This metric helps track training intensity and adjust your program based on objective data.',
    tip: 'Consistent RPE logging improves program accuracy by 40%',
  },
  adaptiveEngine: {
    title: 'Smart Training Algorithms',
    description: 'Our engine analyzes your performance data to calculate optimal training loads and recovery periods.',
    benefits: [
      'Automated load calculations based on RPE trends',
      'Data-driven periodization adjustments',
      'Performance metrics tracking and analysis',
      'Volume and intensity management',
    ],
  },
};

/**
 * Variant B: Personalized/Adaptive
 * Emphasizes the personal coach experience and adaptive intelligence
 */
export const onboardingCopyB: OnboardingCopy = {
  welcome: {
    title: 'Your Personal AI Coach',
    subtitle: 'Training that adapts to you. We learn how your body responds and adjust your program in real-time, so you can focus on what matters—getting stronger.',
    cta: 'Let\'s Get Started',
  },
  rpeIntro: {
    title: 'Teaching Your AI Coach How You Feel',
    description: 'After each session, share how hard it felt (1-10). Your AI coach uses this to understand your unique response to training—making your program truly yours.',
    tip: 'The more you share, the smarter your program becomes',
  },
  adaptiveEngine: {
    title: 'How Your AI Coach Works',
    description: 'Think of it as having a coach who learns your body better than anyone. Every workout teaches us more about what works for you.',
    benefits: [
      'Learns your recovery patterns and adjusts automatically',
      'Notices when you\'re ready to push harder or need rest',
      'Adapts to life changes—travel, stress, sleep quality',
      'Gets better at coaching you with every session',
    ],
  },
};

/**
 * Hook to get onboarding copy based on variant
 */
export function getOnboardingCopy(variant: 'A' | 'B'): OnboardingCopy {
  return variant === 'B' ? onboardingCopyB : onboardingCopyA;
}
