"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { trainingAPI } from '@/lib/api/training';
import {
  TimeCrunchPreviewResponse,
  TimeCrunchPreviewSession,
  TimeCrunchSegment,
  TimeCrunchCoreLiftSegment,
  TimeCrunchSupersetSegment,
  TimeCrunchBlockSegment,
  TimeCrunchSingleSegment
} from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface TimeCrunchPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string | null;
  defaultTargetMinutes?: number;
}

type PreviewStatus = 'idle' | 'loading' | 'success' | 'error';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const describeSegment = (segment: TimeCrunchSegment): string => {
  switch (segment.kind) {
    case 'core_lift':
      return 'Core Lift';
    case 'accessory_superset':
      return 'Accessory Superset';
    case 'accessory_block':
      return 'Accessory Block';
    case 'accessory_single':
      return 'Accessory';
    default:
      return 'Unknown Segment';
  }
};

const segmentAccent = (kind: TimeCrunchSegment['kind']): string => {
  switch (kind) {
    case 'core_lift':
      return 'border-blue-400';
    case 'accessory_superset':
      return 'border-purple-400';
    case 'accessory_block':
      return 'border-emerald-400';
    default:
      return 'border-gray-500';
  }
};

const renderExercises = (segment: TimeCrunchSegment) => {
  if (segment.kind === 'core_lift') {
    const core = segment as TimeCrunchCoreLiftSegment;
    return (
      <div className="space-y-2">
        <p className="text-lg font-semibold text-white">{core.exercise.name}</p>
        <p className="text-sm text-gray-400">
          Working sets: {core.exercise.sets.length} • Rest: {core.exercise.targetRestSeconds}s
        </p>
      </div>
    );
  }

  if (segment.kind === 'accessory_superset') {
    const superset = segment as TimeCrunchSupersetSegment;
    return (
      <div className="space-y-3">
        {superset.exercises.map((exercise) => (
          <div key={exercise.id} className="flex flex-col">
            <span className="text-white font-medium">{exercise.name}</span>
            <span className="text-xs text-gray-400">
              Sets: {exercise.sets.length} • Rest between alternations: {superset.restBetweenAlternationsSeconds}s
            </span>
          </div>
        ))}
        <span className="text-xs text-indigo-300 uppercase tracking-wide">
          Priority: {superset.priority.replace('_', ' ')}
        </span>
      </div>
    );
  }

  if (segment.kind === 'accessory_block') {
    const block = segment as TimeCrunchBlockSegment;
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-300">
          {block.rounds} rounds • Rest between exercises: {block.restBetweenExercisesSeconds}s • Rest between rounds: {block.restBetweenRoundsSeconds}s
        </p>
        <div className="space-y-2">
          {block.exercises.map((exercise) => (
            <div key={exercise.id} className="flex flex-col">
              <span className="text-white font-medium">{exercise.name}</span>
              <span className="text-xs text-gray-400">Sets: {exercise.sets.length}</span>
            </div>
          ))}
        </div>
        <span className="text-xs text-emerald-300 uppercase tracking-wide">
          Rationale: {block.rationale.replace('_', ' ')}
        </span>
      </div>
    );
  }

  const accessory = segment as TimeCrunchSingleSegment;
  return (
    <div className="space-y-2">
      <p className="text-white font-medium">{accessory.exercise.name}</p>
      <p className="text-xs text-gray-400">
        Sets: {accessory.exercise.sets.length} • Rest: {accessory.exercise.targetRestSeconds}s
      </p>
    </div>
  );
};

const renderSessionHeader = (session: TimeCrunchPreviewSession) => {
  const dayName = DAY_NAMES[session.context.dayOfWeek - 1] ?? `Day ${session.context.dayOfWeek}`;
  const savedSeconds = session.summary.durationDeltaSeconds;
  const savedLabel = savedSeconds >= 0 ? `${formatDuration(savedSeconds)} saved` : `${formatDuration(savedSeconds * -1)} over target`;

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
      <div>
        <p className="text-xl font-semibold text-white">{dayName}</p>
        <p className="text-sm text-gray-400">Compressed duration: {formatDuration(session.summary.compressedDurationSeconds)}</p>
      </div>
      <span className={`text-xs font-medium ${savedSeconds >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
        {savedLabel}
      </span>
    </div>
  );
};

export const TimeCrunchPreviewModal: React.FC<TimeCrunchPreviewModalProps> = ({
  isOpen,
  onClose,
  planId,
  defaultTargetMinutes = 45
}) => {
  const [targetMinutes, setTargetMinutes] = useState(defaultTargetMinutes);
  const [status, setStatus] = useState<PreviewStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<TimeCrunchPreviewResponse | null>(null);
  const [lastStrategy, setLastStrategy] = useState<string>('pending');

  const loadPreview = useCallback(async () => {
    if (!planId) {
      setError('No plan available for preview.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      const response = await trainingAPI.previewTimeCrunch(planId, targetMinutes);
      setPreview(response);
      setLastStrategy(deriveCompressionStrategy(response));
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setPreview(null);
      setLastStrategy('unavailable');
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    }
  }, [planId, targetMinutes]);

  useEffect(() => {
    if (isOpen) {
      setTargetMinutes(defaultTargetMinutes);
      setPreview(null);
      setError(null);
      setLastStrategy('pending');
      if (planId) {
        loadPreview();
      }
    } else {
      setStatus('idle');
    }
  }, [isOpen, loadPreview, planId, defaultTargetMinutes]);

  const totalSavedLabel = useMemo(() => {
    if (!preview) return null;
    const savedSeconds = preview.originalDurationSeconds - preview.compressedDurationSeconds;
    const prefix = savedSeconds >= 0 ? 'Total Saved' : 'Over Target';
    return `${prefix}: ${formatDuration(Math.abs(savedSeconds))}`;
  }, [preview]);

  const sendTelemetry = useCallback(
    async (event: string, payload: Record<string, unknown>) => {
      try {
        await fetch('/api/v1/time-crunch/telemetry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ event, ...payload })
        });
      } catch {
        // swallow telemetry errors
      }
    },
    []
  );

  const handleClose = () => {
    if (planId) {
      const reason =
        status === 'success'
          ? 'after_success'
          : status === 'loading'
          ? 'during_loading'
          : status === 'error'
          ? 'error_state'
          : 'modal_closed';

      void sendTelemetry('stream5.time_crunch_preview_declined', {
        planId,
        targetMinutes,
        compressionStrategy: status === 'success' ? lastStrategy : 'user_decline',
        reason
      });
    }
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-800">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-white">Time Crunch Preview</h2>
            <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/50">Time Crunch</Badge>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close time crunch preview">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="targetMinutes">
                Target Session Duration (minutes)
              </label>
              <input
                id="targetMinutes"
                type="number"
                min={15}
                max={180}
                value={targetMinutes}
                onChange={(event) => setTargetMinutes(Number(event.target.value))}
                className="w-32 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">Coach guidance: 45 minutes preserves core lifts while maximizing density.</p>
            </div>

            <div className="flex items-center gap-3">
              {totalSavedLabel && status === 'success' && (
                <span className="text-sm font-medium text-emerald-300">{totalSavedLabel}</span>
              )}
              <button
                onClick={loadPreview}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold transition-colors"
                disabled={status === 'loading' || !planId}
              >
                {status === 'loading' ? 'Loading...' : 'Refresh Preview'}
              </button>
            </div>
          </div>

          {status === 'error' && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error ?? 'Preview failed. Please try again later.'}
            </div>
          )}

          {status === 'loading' && (
            <div className="flex items-center justify-center py-12 text-gray-400">Generating compressed structure…</div>
          )}

          {status === 'success' && preview && (
            <div className="space-y-6">
              {preview.sessions.map((session) => (
                <div key={session.context.sessionId} className="rounded-lg border border-gray-800 bg-gray-800 p-5 space-y-4">
                  {renderSessionHeader(session)}
                  <div className="space-y-3">
                    {session.segments.map((segment) => (
                      <div
                        key={segment.id}
                        className={`border-l-4 ${segmentAccent(segment.kind)} bg-gray-900/60 rounded-md p-4`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                          <p className="text-sm font-semibold text-white uppercase tracking-wide">
                            {describeSegment(segment)}
                          </p>
                          <span className="text-xs text-gray-400">
                            Duration: {formatDuration(segment.timing.totalSeconds)}
                          </span>
                        </div>
                        {renderExercises(segment)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === 'success' && preview && preview.sessions.length === 0 && (
            <div className="text-center text-gray-400">No compressible sessions were found for this plan.</div>
          )}

          {status === 'idle' && !planId && (
            <div className="text-center text-gray-400">
              Plan context missing. Generate a plan first to preview Time Crunch mode.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const deriveCompressionStrategy = (preview: TimeCrunchPreviewResponse): string => {
  const allSegments = preview.sessions.flatMap((session) => session.segments ?? []);
  const hasBlock = allSegments.some((segment) => segment.kind === 'accessory_block');
  const hasSuperset = allSegments.some((segment) => segment.kind === 'accessory_superset');
  const hasAccessorySingle = allSegments.some((segment) => segment.kind === 'accessory_single');

  if (hasBlock && hasSuperset) {
    return 'core_plus_block_and_superset';
  }
  if (hasBlock) {
    return 'core_plus_block';
  }
  if (hasSuperset) {
    return 'core_plus_superset';
  }
  if (hasAccessorySingle) {
    return 'core_plus_accessory';
  }
  return 'core_only';
};
