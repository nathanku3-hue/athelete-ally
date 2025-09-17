'use client';

import React, { useState, useEffect } from 'react';
import { FrontendError, apiCall } from '@/lib/error-handler';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  timestamp: string;
  details?: any;
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: HealthCheck[];
  uptime: number;
  version: string;
}

interface HealthStatusProps {
  refreshInterval?: number; // 刷新间隔（毫秒）
  showDetails?: boolean; // 是否显示详细信息
  className?: string;
}

export default function HealthStatus({ 
  refreshInterval = 30000, 
  showDetails = false,
  className = '' 
}: HealthStatusProps) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FrontendError | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall<HealthStatus>('/api/health');
      
      if (response.success) {
        setHealthStatus(response.data);
        setLastChecked(new Date());
      } else {
        throw FrontendError.fromApiResponse(response);
      }
    } catch (err) {
      const frontendError = err instanceof FrontendError 
        ? err 
        : new FrontendError('Failed to fetch health status');
      setError(frontendError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchHealthStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const getStatusColor = (status: 'healthy' | 'unhealthy') => {
    return status === 'healthy' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: 'healthy' | 'unhealthy') => {
    return status === 'healthy' ? (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (loading && !healthStatus) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">检查系统状态...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-600">无法获取系统状态</span>
          <button
            onClick={fetchHealthStatus}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!healthStatus) {
    return null;
  }

  const overallStatus = healthStatus.status;
  const healthyCount = healthStatus.checks.filter(check => check.status === 'healthy').length;
  const totalCount = healthStatus.checks.length;

  return (
    <div className={`p-4 bg-white border rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(overallStatus)}
          <span className={`font-medium ${getStatusColor(overallStatus)}`}>
            系统状态: {overallStatus === 'healthy' ? '正常' : '异常'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {healthyCount}/{totalCount} 服务正常
        </div>
      </div>

      <div className="space-y-2">
        {healthStatus.checks.map((check) => (
          <div key={check.service} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {getStatusIcon(check.status)}
              <span className="capitalize">{check.service}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <span>{check.responseTime}ms</span>
              {showDetails && check.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer hover:text-gray-700">详情</summary>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(check.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <div>运行时间: {formatUptime(healthStatus.uptime)}</div>
          <div>版本: {healthStatus.version}</div>
          {lastChecked && (
            <div>最后检查: {lastChecked.toLocaleString()}</div>
          )}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          onClick={fetchHealthStatus}
          disabled={loading}
          className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          {loading ? '检查中...' : '刷新状态'}
        </button>
      </div>
    </div>
  );
}
