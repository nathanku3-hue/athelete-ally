"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Star, Target, AlertTriangle, Play } from 'lucide-react';
import { Exercise } from '@athlete-ally/shared-types';
import { logger } from '@/lib/logger';

interface ExerciseModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onRate?: (exerciseId: string, rating: number, difficulty: number, comment?: string) => void;
  userId?: string;
}

export default function ExerciseModal({ 
  exercise, 
  isOpen, 
  onClose, 
  onRate, 
  userId 
}: ExerciseModalProps) {
  const [userRating, setUserRating] = useState(0);
  const [userDifficulty, setUserDifficulty] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !exercise) return null;

  const handleRate = async () => {
    if (userRating === 0 || userDifficulty === 0) return;
    
    setIsRating(true);
    try {
      if (onRate) {
        await onRate(exercise.id, userRating, userDifficulty, userComment);
      }
      setUserRating(0);
      setUserDifficulty(0);
      setUserComment('');
    } catch (error) {
      logger.error('Failed to rate exercise:', error);
    } finally {
      setIsRating(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onStarClick && onStarClick(star)}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-400';
    if (difficulty <= 3) return 'text-yellow-400';
    if (difficulty <= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getDifficultyText = (difficulty: number) => {
    const levels = ['Beginner', 'Easy', 'Intermediate', 'Hard', 'Expert'];
    return levels[difficulty - 1] || 'Unknown';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{exercise.name}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                {exercise.category}
              </span>
              {exercise.subcategory && (
                <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {exercise.subcategory}
                </span>
              )}
              <span className={`font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                {getDifficultyText(exercise.difficulty)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Images and Video */}
          {(exercise.imageUrl || exercise.videoUrl) && (
            <div className="relative">
              {exercise.videoUrl ? (
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                    <Play className="w-5 h-5" />
                    <span>Watch Video</span>
                  </button>
                </div>
              ) : exercise.imageUrl ? (
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <Image
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                </div>
              ) : null}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-300">{exercise.description}</p>
          </div>

          {/* Equipment and Setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.equipment.map((item) => (
                  <span
                    key={item}
                    className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            {exercise.setup && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Setup</h3>
                <p className="text-gray-300">{exercise.setup}</p>
              </div>
            )}
          </div>

          {/* Target Muscles */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Target Muscles</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-400">Primary:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {exercise.primaryMuscles.map((muscle) => (
                    <span
                      key={muscle}
                      className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-sm"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
              {exercise.secondaryMuscles.length > 0 && (
                <div>
                  <span className="text-sm text-gray-400">Secondary:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {exercise.secondaryMuscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="bg-orange-600/20 text-orange-400 px-2 py-1 rounded text-sm"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Instructions</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <pre className="text-gray-300 whitespace-pre-wrap font-sans">
                {exercise.instructions}
              </pre>
            </div>
          </div>

          {/* Tips */}
          {exercise.tips && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Pro Tips</h3>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300">{exercise.tips}</p>
              </div>
            </div>
          )}

          {/* Safety Notes */}
          {exercise.safetyNotes && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                Safety Notes
              </h3>
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300">{exercise.safetyNotes}</p>
              </div>
            </div>
          )}

          {/* Modifications */}
          {exercise.modifications && exercise.modifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Modifications</h3>
              <div className="space-y-2">
                {exercise.modifications.map((mod, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-3">
                    <h4 className="font-medium text-white">{mod.name}</h4>
                    <p className="text-gray-400 text-sm">{mod.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating Section */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Rate This Exercise</h3>
            
            {/* Current Rating */}
            <div className="mb-4">
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-gray-300">Overall Rating:</span>
                {renderStars(exercise.averageRating || 0)}
                <span className="text-gray-400 text-sm">
                  ({exercise.totalRatings} ratings)
                </span>
              </div>
            </div>

            {/* User Rating */}
            {userId && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Your Rating:</label>
                  {renderStars(userRating, true, setUserRating)}
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Difficulty (for you):</label>
                  {renderStars(userDifficulty, true, setUserDifficulty)}
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Comment (optional):</label>
                  <textarea
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                    rows={3}
                    placeholder="Share your experience with this exercise..."
                  />
                </div>
                
                <button
                  onClick={handleRate}
                  disabled={userRating === 0 || userDifficulty === 0 || isRating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isRating ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

