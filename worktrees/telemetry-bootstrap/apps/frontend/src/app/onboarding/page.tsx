"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // 自动重定向到onboarding的第一步
    router.push('/onboarding/intent');
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Athlete Ally</h1>
        <p className="text-xl text-gray-400 mb-8">Redirecting to intent...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </main>
  );
}