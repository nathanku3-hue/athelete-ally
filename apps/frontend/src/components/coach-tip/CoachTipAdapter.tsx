/**
 * CoachTip Adapter
 * Stream 3: UI Prototypes
 *
 * Bridges backend CoachTipPayload types with variant components
 */

"use client";

import { CoachTipPayload, CoachTipSeverity } from '@athlete-ally/shared-types';
import { CoachTip } from '@/components/stream3/CoachTip';
import { sendCoachTipTelemetry } from '@/lib/coach-tip';

interface CoachTipAdapterProps {
  tip: CoachTipPayload;
  onDismiss?: () => void;
  onAccept?: () => void;
}

// Map backend severity to variant category
const severityToCategory: Record<CoachTipSeverity, 'insight' | 'warning' | 'success' | 'info'> = {
  info: 'info',
  warning: 'warning',
  critical: 'warning', // Map critical to warning for UI consistency
};

export function CoachTipAdapter({ tip, onDismiss, onAccept }: CoachTipAdapterProps) {
  // Format RPE context from scoring data
  const rpeContext = tip.scoringContext
    ? `Score: ${(tip.scoringContext.totalScore ?? 0).toFixed(1)}/10`
    : undefined;

  const handleDismiss = async () => {
    await sendCoachTipTelemetry('coach_tip_dismissed', tip);
    onDismiss?.();
  };

  const handleAccept = async () => {
    await sendCoachTipTelemetry('coach_tip_accepted', tip);
    onAccept?.();
  };

  return (
    <CoachTip
      category={severityToCategory[tip.severity]}
      title={tip.title}
      message={tip.message}
      rpeContext={rpeContext}
      dismissible={true}
      onDismiss={handleDismiss}
      action={
        tip.actions[0]
          ? {
              label: tip.actions[0].label,
              onClick: handleAccept,
            }
          : undefined
      }
    />
  );
}
