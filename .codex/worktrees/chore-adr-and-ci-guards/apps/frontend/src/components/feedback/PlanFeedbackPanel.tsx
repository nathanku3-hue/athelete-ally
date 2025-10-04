"use client";

import React, { useCallback, useMemo, useState } from 'react';
import { TrendingUp, RotateCcw, Zap, Clock, MessageSquare } from 'lucide-react';

type AdjustmentType = 'intensity' | 'volume' | 'exercise_substitution' | 'rest' | 'warmup';

export interface TrainingAdjustment {
  type: AdjustmentType;
  originalValue: any;
  adjustedValue: any;
  reason: string;
  confidence: number;
  exerciseId?: string;
  exerciseName?: string;
  id?: string; // optional stable id if provided
}

interface PlanFeedbackPanelProps {
  adjustments: TrainingAdjustment[];
  onFeedback: (adjustmentId: string, satisfactionScore: number, feedback?: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

// Pure helpers kept outside component to avoid re-creating per render
function AdjustmentIcon({ type }: { type: AdjustmentType }) {
  switch (type) {
    case 'intensity':
      return <Zap className="w-5 h-5" />;
    case 'volume':
      return <TrendingUp className="w-5 h-5" />;
    case 'exercise_substitution':
      return <RotateCcw className="w-5 h-5" />;
    case 'rest':
      return <Clock className="w-5 h-5" />;
    case 'warmup':
      return <TrendingUp className="w-5 h-5" />;
    default:
      return <Zap className="w-5 h-5" />;
  }
}

function typeColor(type: AdjustmentType): string {
  switch (type) {
    case 'intensity':
      return 'text-orange-400 bg-orange-600/20';
    case 'volume':
      return 'text-blue-400 bg-blue-600/20';
    case 'exercise_substitution':
      return 'text-purple-400 bg-purple-600/20';
    case 'rest':
      return 'text-green-400 bg-green-600/20';
    case 'warmup':
      return 'text-yellow-400 bg-yellow-600/20';
    default:
      return 'text-gray-400 bg-gray-600/20';
  }
}

function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-400';
  if (confidence >= 0.6) return 'text-yellow-400';
  return 'text-red-400';
}

function confidenceText(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  return 'Low';
}

interface FeedbackState { satisfactionScore: number; feedback: string; isOpen: boolean }

const AdjustmentItem = React.memo(function AdjustmentItem({
  adj,
  idx,
  onOpen,
  onClose,
  onSubmit,
  state,
  setState,
}: {
  adj: TrainingAdjustment;
  idx: number;
  state: FeedbackState;
  setState: (next: FeedbackState) => void;
  onOpen: () => void;
  onClose: () => void;
  onSubmit: (score: number, feedback: string) => void;
}) {
  const originalText = useMemo(() =>
    typeof adj.originalValue === 'object' ? JSON.stringify(adj.originalValue, null, 2) : String(adj.originalValue),
  [adj.originalValue]);
  const adjustedText = useMemo(() =>
    typeof adj.adjustedValue === 'object' ? JSON.stringify(adj.adjustedValue, null, 2) : String(adj.adjustedValue),
  [adj.adjustedValue]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${typeColor(adj.type)}`}>
            <AdjustmentIcon type={adj.type} />
          </div>
          <div>
            <h3 className="text-white font-semibold capitalize">{adj.type.replace('_', ' ')}</h3>
            {adj.exerciseName && <p className="text-sm text-gray-400">{adj.exerciseName}</p>}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${confidenceColor(adj.confidence)}`}>{confidenceText(adj.confidence)} Confidence</div>
          <div className="text-xs text-gray-400">{Math.round(adj.confidence * 100)}%</div>
        </div>
      </div>

      <p className="text-gray-300 mb-4">{adj.reason}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">Original</p>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{originalText}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Adjusted</p>
          <p className="text-sm text-blue-400 whitespace-pre-wrap">{adjustedText}</p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button onClick={onOpen} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
          <span>Apply & Rate</span>
        </button>
        <button onClick={onOpen} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2" aria-label="Open feedback">
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>

      {state.isOpen && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-white font-medium mb-3">Rate this adjustment</h4>
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">How satisfied are you with this adjustment?</p>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setState({ ...state, satisfactionScore: rating })}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    state.satisfactionScore === rating ? 'border-blue-500 bg-blue-500' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  aria-label={`Set satisfaction ${rating}`}
                >
                  <span className="text-sm text-white">{rating}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2" htmlFor={`feedback-${idx}`}>
              Additional feedback (optional)
            </label>
            <textarea
              id={`feedback-${idx}`}
              value={state.feedback}
              onChange={(e) => setState({ ...state, feedback: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
              rows={3}
              placeholder="Share your thoughts about this adjustment..."
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onSubmit(state.satisfactionScore, state.feedback)}
              disabled={state.satisfactionScore === 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              Submit Feedback
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default function PlanFeedbackPanel({ adjustments, onFeedback, onClose, isOpen }: PlanFeedbackPanelProps) {
  const [panelState, setPanelState] = useState<Record<string, FeedbackState>>({});

  const items = useMemo(() =>
    adjustments.map((adj, i) => ({ adj, key: adj.id || `${adj.exerciseId || adj.exerciseName || 'adj'}-${adj.type}-${i}` })),
  [adjustments]);

  const openItem = useCallback((key: string) => setPanelState((prev) => ({ ...prev, [key]: { isOpen: true, satisfactionScore: 0, feedback: '' } })), []);
  const closeItem = useCallback((key: string) => setPanelState((prev) => ({ ...prev, [key]: { isOpen: false, satisfactionScore: 0, feedback: '' } })), []);
  const setStateFor = useCallback((key: string, next: FeedbackState) => setPanelState((prev) => ({ ...prev, [key]: next })), []);
  const submitFor = useCallback((key: string, score: number, feedback: string) => {
    onFeedback(key, score, feedback);
    closeItem(key);
  }, [onFeedback, closeItem]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="plan-feedback-title">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 id="plan-feedback-title" className="text-xl font-bold text-white">Training Adjustments</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close panel">×</button>
          </div>
          <p className="text-gray-400 mt-2">Based on your fatigue assessment, here are suggested adjustments for your training session.</p>
        </div>

        <div className="p-6 space-y-4">
          {items.map(({ adj, key }, idx) => (
            <AdjustmentItem
              key={key}
              adj={adj}
              idx={idx}
              state={panelState[key] || { isOpen: false, satisfactionScore: 0, feedback: '' }}
              setState={(next) => setStateFor(key, next)}
              onOpen={() => openItem(key)}
              onClose={() => closeItem(key)}
              onSubmit={(score, fb) => submitFor(key, score, fb)}
            />
          ))}
        </div>

        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{adjustments.length} adjustment{adjustments.length !== 1 ? 's' : ''} suggested</p>
              <p className="text-gray-500 text-xs">High confidence: {adjustments.filter((a) => a.confidence >= 0.8).length}</p>
            </div>
            <button onClick={onClose} className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

