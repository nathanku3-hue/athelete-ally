'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

interface SearchFilters {
  difficulty?: string;
  category?: string;
  duration?: string;
  status?: string;
}

export function SmartSearch({ 
  onSearch, 
  placeholder = "搜索训练计划...", 
  suggestions = [],
  className 
}: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!query) return suggestions.slice(0, 5);
    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }, [query, suggestions]);

  const handleSearch = () => {
    onSearch(query, filters);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion, filters);
  };

  const clearFilters = () => {
    setFilters({});
    onSearch(query, {});
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10"
          />
          
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-md last:rounded-b-md text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center space-x-2",
            hasActiveFilters && "bg-primary/10 border-primary"
          )}
        >
          <Filter className="h-4 w-4" />
          <span>筛选</span>
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
        </Button>
        
        <Button onClick={handleSearch} className="px-6">
          搜索
        </Button>
      </div>

      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">难度</label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">全部</option>
                <option value="beginner">初级</option>
                <option value="intermediate">中级</option>
                <option value="advanced">高级</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">类别</label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">全部</option>
                <option value="strength">力量训练</option>
                <option value="cardio">有氧运动</option>
                <option value="flexibility">柔韧性</option>
                <option value="endurance">耐力训练</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">时长</label>
              <select
                value={filters.duration || ''}
                onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">全部</option>
                <option value="short">30分钟以下</option>
                <option value="medium">30-60分钟</option>
                <option value="long">60分钟以上</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">状态</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">全部</option>
                <option value="active">进行中</option>
                <option value="completed">已完成</option>
                <option value="paused">已暂停</option>
                <option value="draft">草稿</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center space-x-2"
              disabled={!hasActiveFilters}
            >
              <X className="h-4 w-4" />
              <span>清除筛选</span>
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(false)}
              >
                取消
              </Button>
              <Button onClick={handleSearch}>
                应用筛选
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


