"use client";

import { useState } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  RotateCcw, 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';

interface TrainingAdjustment {
  type: 'intensity' | 'volume' | 'exercise_substitution' | 'rest' | 'warmup';
  originalValue: any;
  adjustedValue: any;
  reason: string;
  confidence: number;
  exerciseId?: string;
  exerciseName?: string;
}

interface AdjustmentSuggestionsProps {
  adjustments: TrainingAdjustment[];
  onFeedback: (adjustmentId: string, satisfactionScore: number, feedback?: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function AdjustmentSuggestions({ 
  adjustments, 
  onFeedback, 
  onClose, 
  isOpen 
}: AdjustmentSuggestionsProps) {
  const [feedbackStates, setFeedbackStates] = useState<Record<string, {
    isOpen: boolean;
    satisfactionScore: number;
    feedback: string;
  }>>({});

  const getAdjustmentIcon = (type: string) => {
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
  };

  const getAdjustmentColor = (type: string) => {
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
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const handleFeedback = (adjustmentId: string, satisfactionScore: number, feedback: string) => {
    onFeedback(adjustmentId, satisfactionScore, feedback);
    setFeedbackStates(prev => ({
      ...prev,
      [adjustmentId]: { isOpen: false, satisfactionScore: 0, feedback: '' }
    }));
  };

  const openFeedback = (adjustmentId: string) => {
    setFeedbackStates(prev => ({
      ...prev,
      [adjustmentId]: { isOpen: true, satisfactionScore: 0, feedback: '' }
    }));
  };

  const closeFeedback = (adjustmentId: string) => {
    setFeedbackStates(prev => ({
      ...prev,
      [adjustmentId]: { isOpen: false, satisfactionScore: 0, feedback: '' }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Training Adjustments</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-gray-400 mt-2">
            Based on your fatigue assessment, here are some suggested adjustments for your training session.
          </p>
        </div>

        {/* Adjustments List */}
        <div className="p-6 space-y-4">
          {adjustments.map((adjustment, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getAdjustmentColor(adjustment.type)}`}>
                    {getAdjustmentIcon(adjustment.type)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold capitalize">
                      {adjustment.type.replace('_', ' ')}
                    </h3>
                    {adjustment.exerciseName && (
                      <p className="text-sm text-gray-400">{adjustment.exerciseName}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getConfidenceColor(adjustment.confidence)}`}>
                    {getConfidenceText(adjustment.confidence)} Confidence
                  </div>
                  <div className="text-xs text-gray-400">
                    {Math.round(adjustment.confidence * 100)}%
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{adjustment.reason}</p>

              {/* Adjustment Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Original</p>
                  <p className="text-sm text-gray-300">
                    {typeof adjustment.originalValue === 'object' 
                      ? JSON.stringify(adjustment.originalValue, null, 2)
                      : adjustment.originalValue
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Adjusted</p>
                  <p className="text-sm text-blue-400">
                    {typeof adjustment.adjustedValue === 'object' 
                      ? JSON.stringify(adjustment.adjustedValue, null, 2)
                      : adjustment.adjustedValue
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => openFeedback(`adjustment-${index}`)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Apply & Rate</span>
                </button>
                <button
                  onClick={() => openFeedback(`adjustment-${index}`)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>

              {/* Feedback Modal */}
              {feedbackStates[`adjustment-${index}`]?.isOpen && (
                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Rate this adjustment</h4>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">How satisfied are you with this adjustment?</p>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setFeedbackStates(prev => ({
                            ...prev,
                            [`adjustment-${index}`]: {
                              ...prev[`adjustment-${index}`],
                              satisfactionScore: rating
                            }
                          }))}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                            feedbackStates[`adjustment-${index}`].satisfactionScore === rating
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <span className="text-sm text-white">{rating}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">
                      Additional feedback (optional)
                    </label>
                    <textarea
                      value={feedbackStates[`adjustment-${index}`].feedback}
                      onChange={(e) => setFeedbackStates(prev => ({
                        ...prev,
                        [`adjustment-${index}`]: {
                          ...prev[`adjustment-${index}`],
                          feedback: e.target.value
                        }
                      }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                      rows={3}
                      placeholder="Share your thoughts about this adjustment..."
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFeedback(
                        `adjustment-${index}`,
                        feedbackStates[`adjustment-${index}`].satisfactionScore,
                        feedbackStates[`adjustment-${index}`].feedback
                      )}
                      disabled={feedbackStates[`adjustment-${index}`].satisfactionScore === 0}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Feedback
                    </button>
                    <button
                      onClick={() => closeFeedback(`adjustment-${index}`)}
                      className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                {adjustments.length} adjustment{adjustments.length !== 1 ? 's' : ''} suggested
              </p>
              <p className="text-gray-500 text-xs">
                High confidence: {adjustments.filter(a => a.confidence >= 0.8).length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

