/**
 * Feature variant hook for UI A/B testing
 * Stream 3: UI Prototypes
 *
 * This hook provides a simple mechanism to toggle between UI variants
 * without external dependencies. For production, this can be integrated
 * with LaunchDarkly or a similar feature flag service.
 */

import { useState, useEffect } from 'react';

export type VariantType = 'A' | 'B';

export interface FeatureVariants {
  coachTip: VariantType;
  weeklyReview: VariantType;
  onboarding: VariantType;
}

// Default variants - can be overridden via localStorage or environment
const DEFAULT_VARIANTS: FeatureVariants = {
  coachTip: 'A',
  weeklyReview: 'A',
  onboarding: 'A',
};

// Storage key for persisting variant selections
const STORAGE_KEY = 'stream3_feature_variants';

/**
 * Hook to get and set feature variants
 * @returns Current variants and a setter function
 */
export function useFeatureVariants() {
  const [variants, setVariantsState] = useState<FeatureVariants>(DEFAULT_VARIANTS);

  // Load variants from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setVariantsState({ ...DEFAULT_VARIANTS, ...parsed });
      }
    } catch {
      // Silently fail - feature flags are not critical
      // In production, this would use proper logging
    }
  }, []);

  // Setter that also persists to localStorage
  const setVariants = (newVariants: Partial<FeatureVariants>) => {
    const updated = { ...variants, ...newVariants };
    setVariantsState(updated);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Silently fail - feature flags are not critical
        // In production, this would use proper logging
      }
    }
  };

  return { variants, setVariants };
}

/**
 * Hook to get a specific feature variant
 * @param feature The feature name
 * @returns The current variant for the feature
 */
export function useFeatureVariant(feature: keyof FeatureVariants): VariantType {
  const { variants } = useFeatureVariants();
  return variants[feature];
}
