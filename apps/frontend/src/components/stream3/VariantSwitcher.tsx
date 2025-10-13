/**
 * Variant Switcher Component
 * Stream 3: UI Prototypes
 *
 * Development tool to easily switch between UI variants
 * This component should only be used in development/staging environments
 */

'use client';

import React from 'react';
import { useFeatureVariants, FeatureVariants } from '@/hooks/useFeatureVariant';

export function VariantSwitcher() {
  const { variants, setVariants } = useFeatureVariants();

  const handleVariantChange = (feature: keyof FeatureVariants, variant: 'A' | 'B') => {
    setVariants({ [feature]: variant });
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-xs">
      <h3 className="text-sm font-semibold mb-3 text-gray-900">UI Variants (Dev Tool)</h3>

      <div className="space-y-3">
        {(Object.keys(variants) as Array<keyof FeatureVariants>).map((feature) => (
          <div key={feature} className="flex items-center justify-between">
            <label className="text-xs text-gray-700 capitalize">
              {feature.replace(/([A-Z])/g, ' $1').trim()}:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleVariantChange(feature, 'A')}
                className={`px-2 py-1 text-xs rounded ${
                  variants[feature] === 'A'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                aria-pressed={variants[feature] === 'A'}
              >
                A
              </button>
              <button
                onClick={() => handleVariantChange(feature, 'B')}
                className={`px-2 py-1 text-xs rounded ${
                  variants[feature] === 'B'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                aria-pressed={variants[feature] === 'B'}
              >
                B
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Selections persist in localStorage
      </p>
    </div>
  );
}
