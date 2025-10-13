"use client";

// eslint-disable-next-line import/no-internal-modules
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/onboarding/purpose');
  }, [router]);

  return null;
}
