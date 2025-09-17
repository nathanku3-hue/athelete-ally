'use client';

import { useState } from 'react';
import { Calendar, Target, Clock, AlertCircle } from 'lucide-react';

interface CompetitionDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  seasonPhase: string;
  className?: string;
}

export default function CompetitionDatePicker({
  value,
  onChange,
  seasonPhase,
  className = ''
}: CompetitionDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || '');

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    onChange(date);
    setIsOpen(false);
  };

  const getDateRecommendations = (phase: string) => {
    const today = new Date();
    const recommendations = [];

    switch (phase) {
      case 'offseason':
        // 6-12 months from now
        for (let i = 6; i <= 12; i += 2) {
          const date = new Date(today);
          date.setMonth(date.getMonth() + i);
          recommendations.push({
            label: `${i}个月后`,
            value: date.toISOString().split('T')[0],
            description: '适合休赛期训练'
          });
        }
        break;
      case 'preseason':
        // 2-6 months from now
        for (let i = 2; i <= 6; i += 1) {
          const date = new Date(today);
          date.setMonth(date.getMonth() + i);
          recommendations.push({
            label: `${i}个月后`,
            value: date.toISOString().split('T')[0],
            description: '适合赛前准备'
          });
        }
        break;
      case 'inseason':
        // 0-3 months from now
        for (let i = 0; i <= 3; i += 1) {
          const date = new Date(today);
          date.setMonth(date.getMonth() + i);
          recommendations.push({
            label: i === 0 ? '本月' : `${i}个月后`,
            value: date.toISOString().split('T')[0],
            description: '适合赛季中训练'
          });
        }
        break;
    }

    return recommendations;
  };

  const getPhaseGuidance = (phase: string) => {
    switch (phase) {
      case 'offseason':
        return {
          title: '休赛期建议',
          description: '建议选择6-12个月后的比赛日期，这样可以有充足时间进行基础建设。',
          icon: '🏗️'
        };
      case 'preseason':
        return {
          title: '赛前准备期建议',
          description: '建议选择2-6个月后的比赛日期，这样可以进行充分的专项准备。',
          icon: '⚡'
        };
      case 'inseason':
        return {
          title: '赛季中建议',
          description: '建议选择本月或下个月的比赛日期，重点维持当前状态。',
          icon: '🏆'
        };
      default:
        return {
          title: '选择比赛日期',
          description: '请选择你的目标比赛日期，这将帮助AI制定合适的训练计划。',
          icon: '🎯'
        };
    }
  };

  const guidance = getPhaseGuidance(seasonPhase);
  const recommendations = getDateRecommendations(seasonPhase);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Guidance Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{guidance.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-2">{guidance.title}</h3>
            <p className="text-sm text-blue-200">{guidance.description}</p>
          </div>
        </div>
      </div>

      {/* Date Input */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-300">
          比赛日期
        </label>
        
        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-500"
            placeholder="选择比赛日期"
          />
          <Calendar className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {selectedDate && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">
                已选择：{new Date(selectedDate).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Recommendations */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-300">快速选择</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {recommendations.map((rec, index) => (
            <button
              key={index}
              onClick={() => handleDateChange(rec.value)}
              className={`p-3 rounded-lg border text-left transition-all duration-200 hover:scale-105 ${
                selectedDate === rec.value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-300 ring-2 ring-blue-500/30'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-750 text-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{rec.label}</div>
              <div className="text-xs text-gray-400 mt-1">{rec.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Warning for Past Dates */}
      {selectedDate && new Date(selectedDate) < new Date() && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">
              选择的日期已过，请选择未来的日期
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
