/**
 * CoachTip Variant A - Baseline
 * Stream 3: UI Prototypes
 *
 * Traditional tooltip/callout design with icon and text
 * Suitable for subtle, informative guidance
 */

'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface CoachTipProps {
  /**
   * The main tip content
   */
  message: string;
  /**
   * Optional title for the tip
   */
  title?: string;
  /**
   * Tip category for styling
   */
  category?: 'insight' | 'warning' | 'success' | 'info';
  /**
   * Whether the tip can be dismissed
   */
  dismissible?: boolean;
  /**
   * Callback when tip is dismissed
   */
  onDismiss?: () => void;
  /**
   * Optional action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function CoachTipVariantA({
  message,
  title,
  category = 'info',
  dismissible = true,
  onDismiss,
  action,
}: CoachTipProps) {
  const categoryStyles = {
    insight: 'bg-purple-50 border-purple-200 text-purple-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  const iconStyles = {
    insight: 'text-purple-600',
    warning: 'text-yellow-600',
    success: 'text-green-600',
    info: 'text-blue-600',
  };

  return (
    <div
      className={`relative flex items-start gap-3 p-4 border rounded-lg ${categoryStyles[category]}`}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${iconStyles[category]}`} aria-hidden="true">
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold mb-1">{title}</h4>
        )}
        <p className="text-sm leading-relaxed">{message}</p>

        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Dismiss tip"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
