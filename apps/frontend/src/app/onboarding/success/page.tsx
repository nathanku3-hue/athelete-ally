"use client";

import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  const handleGoToDashboard = () => {
    // For now, redirect to home page
    // Later this will be the actual dashboard
    router.push('/');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-2xl text-center">
        {/* Success animation */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-6">Welcome to Athlete Ally!</h1>
        <p className="text-xl text-gray-400 mb-8">
          Your personalized training plan is being created. This usually takes just a few moments.
        </p>

        {/* What happens next */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">What happens next?</h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-1">1</div>
              <div>
                <h3 className="font-semibold">AI Analysis</h3>
                <p className="text-gray-400 text-sm">Our AI analyzes your profile and creates a customized training plan</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-1">2</div>
              <div>
                <h3 className="font-semibold">Plan Generation</h3>
                <p className="text-gray-400 text-sm">Your training plan is generated with exercises, sets, and progressions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-1">3</div>
              <div>
                <h3 className="font-semibold">Ready to Train</h3>
                <p className="text-gray-400 text-sm">You'll receive a notification when your plan is ready</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-gray-800 rounded-lg">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-bold mb-2">Personalized Plans</h3>
            <p className="text-gray-400 text-sm">AI-generated training plans tailored to your goals and equipment</p>
          </div>

          <div className="p-6 bg-gray-800 rounded-lg">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold mb-2">Smart Scheduling</h3>
            <p className="text-gray-400 text-sm">Training sessions that fit your schedule and availability</p>
          </div>

          <div className="p-6 bg-gray-800 rounded-lg">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold mb-2">Progress Tracking</h3>
            <p className="text-gray-400 text-sm">Monitor your progress and get automatic plan adjustments</p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleGoToDashboard}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard →
        </button>

        {/* Contact info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Questions? Contact us at support@athleteally.com</p>
        </div>
      </div>
    </main>
  );
}
