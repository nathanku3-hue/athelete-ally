"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { usePlanStatusPolling } from '@/hooks/usePlanStatusPolling';

function GeneratingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, clearData } = useOnboarding();
  
  // Get jobId from URL parameters (primary) or localStorage (fallback)
  const jobId = searchParams.get('jobId') || 
    (typeof window !== 'undefined' ? localStorage.getItem('planGenerationJobId') : null);
  
  // 调试模式：直接跳转到plans页面
  

  // 使用轮询逻辑获取计划生成状态（调试模式下被跳过）
  const {
    status: planStatus,
    isLoading,
    error,
    retryCount,
    retry: handleRetry,
    stop
  } = usePlanStatusPolling({
    jobId: jobId || undefined,
    maxRetries: 3,
    baseInterval: 500,  // 更快的初始輪詢
    maxInterval: 2000,  // 更短的最大間隔
    onComplete: (planId) => {
      clearData();
      // Clear the jobId from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('planGenerationJobId');
      }
      // 跳转到训练计划页面而不是特定的plan ID页面
      router.push('/plan');
    },
    onError: (error) => {
      // 处理计划生成错误
    }
  });

  // 使用轮询状态或默认状态（调试模式下显示调试消息）
  const currentStatus = planStatus || {
    status: 'pending' as const,
    progress: 0,
    estimatedTime: 30,
    message: jobId ? 'Generating your training plan...' : 'Initializing your personalized training plan...'
  };

  const handleGoBack = () => {
    router.push('/onboarding/summary');
  };

  const getStatusIcon = () => {
    switch (currentStatus.status) {
      case 'pending':
      case 'processing':
        return (
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        );
      case 'completed':
        return (
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (currentStatus.status) {
      case 'pending':
      case 'processing':
        return 'text-blue-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-2xl text-center">
        {/* Status Icon */}
        {getStatusIcon()}

        {/* Main Title */}
        <h1 className="text-4xl font-bold mb-6">
          {currentStatus.status === 'completed' 
            ? 'Your Plan is Ready!' 
            : currentStatus.status === 'failed'
            ? 'Something Went Wrong'
            : 'Creating Your Training Plan'
          }
        </h1>

        {/* Status Message */}
        <p className={`text-xl mb-8 ${getStatusColor()}`}>
          {error || currentStatus.message}
        </p>

        {/* Progress Bar */}
        {currentStatus.status === 'processing' && (
          <div className="mb-8">
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${currentStatus.progress}%` }}
              />
            </div>
            <div className="text-sm text-gray-400">
              {currentStatus.progress}% Complete
            </div>
          </div>
        )}

        {/* Estimated Time */}
        {currentStatus.status === 'processing' && (
          <div className="mb-8 p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-400">
                Estimated time remaining: {currentStatus.estimatedTime} seconds
              </span>
            </div>
          </div>
        )}

        {/* What's happening section */}
        {currentStatus.status === 'processing' && (
          <div className="mb-8 p-6 bg-gray-800 rounded-lg text-left">
            <h3 className="text-lg font-semibold mb-4 text-center">What's happening?</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-1">1</div>
                <div>
                  <h4 className="font-semibold">Analyzing Your Profile</h4>
                  <p className="text-gray-400 text-sm">Processing your training goals, experience level, and preferences</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-1">2</div>
                <div>
                  <h4 className="font-semibold">Generating Exercises</h4>
                  <p className="text-gray-400 text-sm">AI is selecting the perfect exercises for your goals and equipment</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-1">3</div>
                <div>
                  <h4 className="font-semibold">Creating Your Schedule</h4>
                  <p className="text-gray-400 text-sm">Building a personalized weekly training schedule</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {currentStatus.status === 'failed' && (
            <>
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleGoBack}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Go Back
              </button>
            </>
          )}
          
          {currentStatus.status === 'completed' && (
            <button
              onClick={() => router.push('/plan')}
              className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              View My Plan →
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href={(currentStatus?.status === "completed") ? "/plan" : "#"}
            className={(currentStatus?.status === "completed") ? "inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" : "inline-block px-4 py-2 bg-gray-700 text-gray-400 rounded cursor-not-allowed pointer-events-none"}
            aria-disabled={currentStatus?.status !== "completed"}
          >
            Continue to Plan →
          </Link>
        </div>
        {/* Loading animation for processing */}
        {currentStatus.status === 'processing' && (
          <div className="mt-8">
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
export default function GeneratingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">載入中...</p>
        </div>
      </div>
    }>
      <GeneratingContent />
    </Suspense>
  );
}

