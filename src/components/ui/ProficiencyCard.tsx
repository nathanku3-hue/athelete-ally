'use client';

import { ProficiencyLevel } from '@/lib/constants/proficiency';
import { CheckCircle, Star, Target, Clock, Zap } from 'lucide-react';
import ProficiencyLevelIndicator from './ProficiencyLevelIndicator';

interface ProficiencyCardProps {
  level: ProficiencyLevel;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export default function ProficiencyCard({ 
  level, 
  isSelected, 
  onSelect,
  className = ''
}: ProficiencyCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] group ${
        isSelected
          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30'
          : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-750 hover:shadow-lg hover:shadow-gray-500/10'
      } ${className}`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 animate-pulse">
          <CheckCircle className="w-6 h-6 text-blue-500" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl mb-2">{level.icon}</div>
        {isSelected && (
          <div className="flex items-center space-x-1 text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">已選擇</span>
          </div>
        )}
      </div>

      {/* Title and Experience Range */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-bold">{level.title}</h3>
          <ProficiencyLevelIndicator 
            level={level.id === 'beginner' ? 1 : level.id === 'intermediate' ? 2 : 3} 
          />
        </div>
        <p className="text-sm text-gray-400 font-medium">{level.experienceRange}</p>
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-4 leading-relaxed">{level.description}</p>

      {/* Training Focus */}
      <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-gray-300">訓練重點</span>
        </div>
        <p className="text-sm text-blue-400 font-medium">{level.trainingFocus}</p>
      </div>

      {/* Key Points */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>關鍵特徵</span>
        </h4>
        <ul className="text-sm text-gray-400 space-y-1">
          {level.keyPoints.map((point, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-400 mr-2 mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Characteristics */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>訓練特點</span>
        </h4>
        <ul className="text-sm text-gray-400 space-y-1">
          {level.characteristics.map((char, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-400 mr-2 mt-0.5">✓</span>
              <span>{char}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Hover Effect Overlay */}
      <div className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${
        isSelected 
          ? 'bg-blue-500/5' 
          : 'bg-transparent group-hover:bg-white/5'
      }`} />
    </div>
  );
}