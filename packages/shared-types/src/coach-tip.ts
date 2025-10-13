export type CoachTipSeverity = 'info' | 'warning' | 'critical';

export type CoachTipSurface = 'plan_summary' | 'plan_dashboard';

export type CoachTipEventName = 'coach_tip_shown' | 'coach_tip_dismissed' | 'coach_tip_accepted';

export interface CoachTipAction {
  action: 'accept' | 'dismiss';
  label: string;
  telemetryAction: CoachTipEventName;
}

export interface CoachTipPayload {
  tipId: string;
  planId: string;
  userId: string;
  surface: CoachTipSurface;
  severity: CoachTipSeverity;
  title: string;
  message: string;
  guidance: string;
  actions: CoachTipAction[];
  scoringContext?: {
    safetyScore?: number;
    complianceScore?: number;
    performanceScore?: number;
    totalScore?: number;
  };
  createdAt: string;
}

export interface CoachTipTelemetryEvent {
  event: CoachTipEventName;
  tipId: string;
  planId: string;
  userId: string;
  surface: CoachTipSurface;
  severity: CoachTipSeverity;
  planScore?: number;
  timestamp: string;
}
