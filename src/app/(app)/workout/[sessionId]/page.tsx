// src/app/(app)/workout/[sessionId]/page.tsx
export default function WorkoutSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  return <div>Workout Session: {params.sessionId}</div>;
}
