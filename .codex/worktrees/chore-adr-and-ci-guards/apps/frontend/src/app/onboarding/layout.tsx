// src/app/onboarding/layout.tsx
import React from "react";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <section className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        {/* Onboarding layout */}
        {children}
      </section>
    </OnboardingProvider>
  );
}
