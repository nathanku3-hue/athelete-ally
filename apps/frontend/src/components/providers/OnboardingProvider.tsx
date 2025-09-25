"use client";

import { OnboardingProvider } from '@/contexts/OnboardingContext';

interface OnboardingProviderWrapperProps {
  children: React.ReactNode;
}

export default function OnboardingProviderWrapper({ children }: OnboardingProviderWrapperProps) {
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  );
}
