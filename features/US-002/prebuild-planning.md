
# Pre-build Technical Plan for US-002: Select Training Proficiency Level

This document outlines the technical implementation plan for User Story US-002.

## 1. New Files to Create

*   `src/app/(onboarding)/proficiency/page.tsx`: This new page will host the UI for the proficiency selection step in the onboarding flow.
*   `src/components/ui/ProficiencyCard.tsx`: A reusable UI component to display each proficiency level as a selectable card.
*   `src/lib/constants.ts`: A file to store constant values, such as the definitions for proficiency levels.

## 2. Existing Files to Modify

*   `src/app/(onboarding)/layout.tsx`: The layout for the onboarding flow will be updated to include "Proficiency" as a step in the progress indicator.
*   `src/app/(onboarding)/purpose/page.tsx`: The "Continue" button on the "Purpose" page will be updated to navigate the user to the new `/onboarding/proficiency` page.
*   `src/lib/store/onboardingStore.ts`: Assuming a client-side state management store (e.g., Zustand) is used, this file will be modified to handle the state for the selected proficiency level.

## 3. Core Logic, Components, and State Management

### State Management (`onboardingStore.ts`)

*   A new state variable, `proficiency`, will be added to the store, initialized to `null`.
*   An action, `setProficiency`, will be created to update the `proficiency` state.

### Proficiency Options (`src/lib/constants.ts`)

*   An array of objects will be defined to represent the different proficiency levels. Each object will contain:
    *   `id`: A unique identifier (e.g., 'beginner').
    *   `title`: A user-facing title (e.g., 'Beginner').
    *   `description`: A brief explanation of the level.

### Proficiency Page (`src/app/(onboarding)/proficiency/page.tsx`)

*   The page will retrieve the proficiency options from `src/lib/constants.ts`.
*   It will use the `onboardingStore` to manage the selected proficiency level.
*   The UI will consist of a list of `ProficiencyCard` components.
*   A "Continue" button will be present, which will be enabled only after a proficiency level has been selected.
*   Upon clicking "Continue", the user will be navigated to the next step in the onboarding flow (e.g., `/onboarding/season`).

### Proficiency Card Component (`src/components/ui/ProficiencyCard.tsx`)

*   This component will accept `title`, `description`, `isSelected`, and `onClick` as props.
*   It will display the details of a proficiency level.
*   The card's appearance will change (e.g., border color, background) to reflect whether it is currently selected.

## 4. Database Schema Changes or Supabase Function Calls

*   No direct database schema changes are required for this user story.
*   The selected proficiency level will be stored in the user's record. This will be handled by a general "save onboarding data" function at the end of the onboarding flow, so no immediate Supabase calls are needed on this page.
