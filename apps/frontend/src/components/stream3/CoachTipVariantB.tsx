/**
 * CoachTip Variant B - Modern Card Design
 * Stream 3: UI Prototypes
 *
 * Card-based design with prominent visual emphasis
 * Highlights adaptive/personalized insights with RPE context
 */

'use client';

import React from 'react';
import { X, Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

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
  /**
   * Optional RPE context indicator
   */
  rpeContext?: string;
}

export function CoachTipVariantB({
  message,
  title,
  category = 'info',
  dismissible = true,
  onDismiss,
  action,
  rpeContext,
}: CoachTipProps) {
  const categoryConfig = {
    insight: {
      gradient: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      icon: Sparkles,
      badge: 'bg-purple-100 text-purple-700',
    },
    warning: {
      gradient: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      icon: AlertCircle,
      badge: 'bg-yellow-100 text-yellow-700',
    },
    success: {
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      icon: CheckCircle,
      badge: 'bg-green-100 text-green-700',
    },
    info: {
      gradient: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      icon: TrendingUp,
      badge: 'bg-blue-100 text-blue-700',
    },
  };

  const config = categoryConfig[category];
  const IconComponent = config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-md border border-gray-200 ${config.bgColor}`}
      role="status"
      aria-live="polite"
    >
      {/* Gradient accent bar */}
      <div className={`h-1 bg-gradient-to-r ${config.gradient}`} aria-hidden="true" />

      <div className="p-5">
        {/* Header with icon and dismiss */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient}`}>
              <IconComponent className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            {title && (
              <h4 className="text-base font-bold text-gray-900">{title}</h4>
            )}
          </div>

          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              aria-label="Dismiss tip"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* RPE Context Badge */}
        {rpeContext && (
          <div className="mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
              {rpeContext}
            </span>
          </div>
        )}

        {/* Message */}
        <p className="text-sm leading-relaxed text-gray-700 mb-3">
          {message}
        </p>

        {/* Action button */}
        {action && (
          <button
            onClick={action.onClick}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r ${config.gradient} rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all`}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
