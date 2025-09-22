"use client";

import { useState } from 'react';
import { 
  Trophy, 
  Target, 
  Activity, 
  BarChart3, 
  Clock,
  Award,
  Calendar,
  Zap,
  TrendingUp,
  Star
} from 'lucide-react';

interface PersonalRecord {
  id: string;
  exerciseName: string;
  recordType: 'max_weight' | 'max_reps' | 'max_volume' | 'max_duration';
  value: number;
  unit: string;
  verifiedAt: string;
  sessionId?: string;
  setNumber?: number;
  notes?: string;
}

interface PersonalRecordsProps {
  records: PersonalRecord[];
  onRecordClick: (record: PersonalRecord) => void;
}

export default function PersonalRecords({ records, onRecordClick }: PersonalRecordsProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'exercise'>('date');

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'max_weight': return 'Max Weight';
      case 'max_reps': return 'Max Reps';
      case 'max_volume': return 'Max Volume';
      case 'max_duration': return 'Max Duration';
      default: return type;
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'max_weight': return <Target className="w-4 h-4" />;
      case 'max_reps': return <Activity className="w-4 h-4" />;
      case 'max_volume': return <BarChart3 className="w-4 h-4" />;
      case 'max_duration': return <Clock className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'max_weight': return 'text-red-400 bg-red-600/20';
      case 'max_reps': return 'text-blue-400 bg-blue-600/20';
      case 'max_volume': return 'text-purple-400 bg-purple-600/20';
      case 'max_duration': return 'text-green-400 bg-green-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const filteredRecords = records.filter(record => 
    selectedType === 'all' || record.recordType === selectedType
  );

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime();
      case 'value':
        return b.value - a.value;
      case 'exercise':
        return a.exerciseName.localeCompare(b.exerciseName);
      default:
        return 0;
    }
  });

  const recordTypes = [...new Set(records.map(r => r.recordType))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'seconds' || unit === 'minutes') {
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${value}s`;
    }
    return `${value}${unit}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>Personal Records</span>
        </h3>
        <div className="text-sm text-gray-400">
          {records.length} records
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Filter by Type
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {recordTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {getRecordTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="date">Date (Newest)</option>
            <option value="value">Value (Highest)</option>
            <option value="exercise">Exercise (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {sortedRecords.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No personal records yet</p>
            <p className="text-sm text-gray-500">
              Complete some workouts to start setting records!
            </p>
          </div>
        ) : (
          sortedRecords.map((record) => (
            <div
              key={record.id}
              onClick={() => onRecordClick(record)}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getRecordColor(record.recordType)}`}>
                    {getRecordIcon(record.recordType)}
                  </div>
                  <div>
                    <h4 className="font-medium">{record.exerciseName}</h4>
                    <p className="text-sm text-gray-400">
                      {getRecordTypeLabel(record.recordType)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {formatValue(record.value, record.unit)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(record.verifiedAt)}
                  </div>
                </div>
              </div>

              {record.setNumber && (
                <div className="text-xs text-gray-500">
                  Set {record.setNumber}
                </div>
              )}

              {record.notes && (
                <div className="mt-2 text-sm text-gray-300 italic">
                  "{record.notes}"
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {records.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {records.filter(r => r.recordType === 'max_weight').length}
              </div>
              <div className="text-xs text-gray-400">Weight PRs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {records.filter(r => r.recordType === 'max_reps').length}
              </div>
              <div className="text-xs text-gray-400">Rep PRs</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

