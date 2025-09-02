"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const purposes = [
  {
    id: "recreational",
    title: "Recreational Fitness",
    description:
      "I'm looking to get fitter, stronger, and improve my general well-being.",
  },
  {
    id: "competitive",
    title: "Competitive Performance",
    description:
      "I'm a competitive athlete with a fixed season and specific performance goals.",
  },
  {
    id: "event",
    title: "Event Preparation",
    description:
      "I'm training for a specific event, like a marathon, a weightlifting meet, or a cycling race.",
  },
];

export default function PurposePage() {
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const router = useRouter();

  const handleSelectPurpose = (purposeId: string) => {
    setSelectedPurpose(purposeId);
  };

  const handleContinue = () => {
    if (selectedPurpose) {
      router.push("/onboarding/proficiency");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-2xl px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          What's your primary training purpose?
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {purposes.map((purpose) => (
            <div
              key={purpose.id}
              onClick={() => handleSelectPurpose(purpose.id)}
              className={`cursor-pointer p-6 rounded-lg border-2 transition-all transform hover:scale-105 ${
                selectedPurpose === purpose.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 hover:border-blue-500/50"
              }`}
            >
              <h2 className="text-xl font-semibold mb-2">{purpose.title}</h2>
              <p className="text-gray-400">{purpose.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedPurpose}
            className="px-8 py-3 bg-blue-600 text-white rounded-md font-semibold disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}