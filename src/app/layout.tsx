import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import OnboardingProviderWrapper from "@/components/providers/OnboardingProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Athlete Ally - Your Intelligent Training Coach",
  description: "Get personalized strength & conditioning plans powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OnboardingProviderWrapper>
          {children}
        </OnboardingProviderWrapper>
      </body>
    </html>
  );
}
