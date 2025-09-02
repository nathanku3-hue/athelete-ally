// src/app/(onboarding)/layout.tsx
import React from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Onboarding layout */}
      {children}
    </section>
  );
}
