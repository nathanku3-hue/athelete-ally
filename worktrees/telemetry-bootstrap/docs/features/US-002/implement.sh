#!/bin/bash

# Create src/lib/constants.ts
mkdir -p src/lib
cat <<EOF > src/lib/constants.ts
export const PROFICIENCY_LEVELS = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'New to structured training, focusing on fundamental movements.',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Comfortable with major lifts, ready to increase complexity.',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Experienced in complex training, aiming for peak performance.',
  },
];
EOF

# Create src/components/ui/ProficiencyCard.tsx
mkdir -p src/components/ui
cat <<'EOF' > src/components/ui/ProficiencyCard.tsx
"use client";

import React from 'react';

interface ProficiencyCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const ProficiencyCard: React.FC<ProficiencyCardProps> = ({ title, description, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
    >
      <h3 class="text-lg font-bold">{title}</h3>
      <p class="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default ProficiencyCard;
EOF

# Create src/app/(onboarding)/proficiency/page.tsx
mkdir -p "src/app/(onboarding)/proficiency"
cat <<'EOF' > "src/app/(onboarding)/proficiency/page.tsx"
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PROFICIENCY_LEVELS } from '@/lib/constants';
import ProficiencyCard from '@/components/ui/ProficiencyCard';

export default function ProficiencyPage() {
  const router = useRouter();
  const [selectedProficiency, setSelectedProficiency] = useState<string | null>(null);

  const handleSelectProficiency = (id: string) => {
    setSelectedProficiency(id);
  };

  const handleContinue = () => {
    if (selectedProficiency) {
      // Here you would typically save the state to a store (e.g., Zustand)
      console.log('Selected proficiency:', selectedProficiency);
      router.push('/onboarding/season');
    }
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div class="text-center">
          <h1 class="text-3xl font-bold">Select Your Proficiency</h1>
          <p class="text-gray-600">Choose the level that best describes your experience.</p>
        </div>
        <div class="space-y-4">
          {PROFICIENCY_LEVELS.map((level) => (
            <ProficiencyCard
              key={level.id}
              title={level.title}
              description={level.description}
              isSelected={selectedProficiency === level.id}
              onClick={() => handleSelectProficiency(level.id)}
            />
          ))}
        </div>
        <button
          onClick={handleContinue}
          disabled={!selectedProficiency}
          className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
EOF

# Modify src/app/(onboarding)/purpose/page.tsx to navigate to the new page
PURPOSE_PAGE_PATH="src/app/(onboarding)/purpose/page.tsx"
if [ -f "$PURPOSE_PAGE_PATH" ]; then
    # Use a temporary file for sed to avoid issues with in-place editing
    sed "s|router.push('/onboarding/season')|router.push('/onboarding/proficiency')|" "$PURPOSE_PAGE_PATH" > "$PURPOSE_PAGE_PATH.tmp" && mv "$PURPOSE_PAGE_PATH.tmp" "$PURPOSE_PAGE_PATH"
fi


# Modify src/app/(onboarding)/layout.tsx to add the "Proficiency" step.
LAYOUT_PATH="src/app/(onboarding)/layout.tsx"
if [ -f "$LAYOUT_PATH" ]; then
    # Use awk to insert the new step to avoid sed complexities
    awk '/const steps = \[/ { print; print "    { id: '\''02'\''\;, name: '\''Proficiency'\''\;, href: '\''/onboarding/proficiency'\'' },"; next } 1' "$LAYOUT_PATH" > "$LAYOUT_PATH.tmp" && mv "$LAYOUT_PATH.tmp" "$LAYOUT_PATH"
fi

echo "Implementation script finished."