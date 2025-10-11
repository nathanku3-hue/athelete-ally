'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterValue = string | string[] | { min?: number; max?: number };

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: Record<string, FilterValue>) => void;
  onClear: () => void;
  filters: FilterOption[];
  placeholder?: string;
  className?: string;
}

export function AdvancedSearch({
  onSearch,
  onClear,
  filters,
  placeholder = '搜索...',
  className,
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterValue>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(query, activeFilters);
  };

  const handleClear = () => {
    setQuery('');
    setActiveFilters({});
    onClear();
  };

  const updateFilter = (key: string, value: FilterValue) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeFilter = (key: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 搜索栏 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>
          搜索
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          筛选
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        <Button variant="ghost" onClick={handleClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 活跃筛选器 */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key);
            if (!filter) return null;

            const displayValue = Array.isArray(value)
              ? value.join(', ')
              : typeof value === 'object' && value !== null
              ? `${value.min || ''}-${value.max || ''}`
              : String(value);

            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {filter.label}: {displayValue}
                <button
                  // Provide an accessible name so tests and screen readers can find the control
                  aria-label="移除"
                  onClick={() => removeFilter(key)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* 筛选面板 */}
      {showFilters && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">筛选选项</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium">{filter.label}</label>
                
                {filter.type === 'select' && filter.options && (
                  <select
                    value={typeof activeFilters[filter.key] === 'string' ? activeFilters[filter.key] as string : ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">全部</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'multiselect' && filter.options && (
                  <div className="space-y-2">
                    {filter.options.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={Array.isArray(activeFilters[filter.key]) && (activeFilters[filter.key] as string[]).includes(option.value) || false}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const currentValues = Array.isArray(activeFilters[filter.key]) ? (activeFilters[filter.key] as string[]) : [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.value]
                              : currentValues.filter((v: string) => v !== option.value);
                            updateFilter(filter.key, newValues);
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {filter.type === 'range' && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="最小值"
                      value={typeof activeFilters[filter.key] === 'object' && !Array.isArray(activeFilters[filter.key]) ? (activeFilters[filter.key] as { min?: number; max?: number }).min || '' : ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const current = typeof activeFilters[filter.key] === 'object' && !Array.isArray(activeFilters[filter.key]) ? (activeFilters[filter.key] as { min?: number; max?: number }) : {};
                        updateFilter(filter.key, {
                          ...current,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        });
                      }}
                      min={filter.min}
                      max={filter.max}
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="最大值"
                      value={typeof activeFilters[filter.key] === 'object' && !Array.isArray(activeFilters[filter.key]) ? (activeFilters[filter.key] as { min?: number; max?: number }).max || '' : ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const current = typeof activeFilters[filter.key] === 'object' && !Array.isArray(activeFilters[filter.key]) ? (activeFilters[filter.key] as { min?: number; max?: number }) : {};
                        updateFilter(filter.key, {
                          ...current,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        });
                      }}
                      min={filter.min}
                      max={filter.max}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
