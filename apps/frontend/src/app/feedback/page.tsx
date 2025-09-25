"use client";

import { useState } from 'react';
import { 
  MessageSquare, 
  Star, 
  Bug, 
  Lightbulb, 
  ThumbsUp, 
  ThumbsDown,
  Send,
  CheckCircle
} from 'lucide-react';

interface FeedbackData {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  rating: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  userEmail?: string;
  userId?: string;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackData>({
    type: 'general',
    rating: 5,
    title: '',
    description: '',
    priority: 'medium',
    category: 'onboarding',
    userEmail: '',
    userId: 'user_123'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-400' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-blue-400' },
    { value: 'improvement', label: 'Improvement', icon: ThumbsUp, color: 'text-green-400' },
    { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-purple-400' }
  ];

  const categories = [
    { value: 'onboarding', label: 'User Onboarding' },
    { value: 'plan-generation', label: 'Plan Generation' },
    { value: 'workout-tracking', label: 'Workout Tracking' },
    { value: 'progress-dashboard', label: 'Progress Dashboard' },
    { value: 'fatigue-management', label: 'Fatigue Management' },
    { value: 'exercise-library', label: 'Exercise Library' },
    { value: 'ui-ux', label: 'UI/UX' },
    { value: 'performance', label: 'Performance' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'critical', label: 'Critical', color: 'text-red-400' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real implementation, this would send to your feedback API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Reset form
        setFeedback({
          type: 'general',
          rating: 5,
          title: '',
          description: '',
          priority: 'medium',
          category: 'onboarding',
          userEmail: '',
          userId: 'user_123'
        });
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
          <p className="text-gray-400 mb-6">
            Your feedback has been submitted successfully. We'll review it and get back to you soon.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Another Feedback
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Share Your Feedback</h1>
          <p className="text-gray-400">
            Help us improve Athlete Ally by sharing your thoughts and experiences
          </p>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Overall Experience</span>
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Rate your experience:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                    className="text-2xl transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= feedback.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-400 ml-2">
                {feedback.rating}/5
              </span>
            </div>
          </div>

          {/* Feedback Type */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Feedback Type</h3>
            <div className="grid grid-cols-2 gap-4">
              {feedbackTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFeedback(prev => ({ ...prev, type: type.value as any }))}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    feedback.type === type.value
                      ? 'border-blue-500 bg-blue-600/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <type.icon className={`w-5 h-5 ${type.color}`} />
                    <span className="font-medium">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Category</h3>
              <select
                value={feedback.category}
                onChange={(e) => setFeedback(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Priority</h3>
              <select
                value={feedback.priority}
                onChange={(e) => setFeedback(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title and Description */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={feedback.title}
                  onChange={(e) => setFeedback(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of your feedback"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={feedback.description}
                  onChange={(e) => setFeedback(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide detailed information about your feedback, including steps to reproduce if it's a bug report"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                  rows={6}
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information (Optional)</h3>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email (if you'd like us to follow up)
              </label>
              <input
                type="email"
                value={feedback.userEmail}
                onChange={(e) => setFeedback(prev => ({ ...prev, userEmail: e.target.value }))}
                placeholder="your.email@example.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !feedback.title || !feedback.description}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-600/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-400">Beta Testing Program</h3>
          <p className="text-blue-300 text-sm">
            You're part of our beta testing program! Your feedback is incredibly valuable to us. 
            We'll review all feedback and use it to improve the product. Thank you for helping us build something amazing!
          </p>
        </div>
      </div>
    </main>
  );
}

