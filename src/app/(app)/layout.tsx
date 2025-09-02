// src/app/(app)/layout.tsx
import React from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      {/* Main app layout */}
      {children}
    </main>
  );
}
