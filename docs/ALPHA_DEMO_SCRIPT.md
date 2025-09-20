# Alpha Demo Script — Magic Slice

This script explains the user journey for demonstrating the Magic Slice feature.

1) Onboarding Intent
- Navigate to the onboarding intent page.
- Enter basic goals (e.g., strength), available days, and preferences.
- Submit to trigger plan generation. A job id is returned and the app navigates to the generating page.

2) Generating Status
- The generating page polls status using a backoff strategy.
- When complete, the user is sent to the plan view.

3) Plan View
- The user sees a weekly plan with sessions and exercises.
- Each exercise has sets/reps and optional notes.

4) Feedback Loop
- In the plan screen, use the Session Feedback section to submit:
  - RPE feedback per exercise (with completion rate and notes).
  - Performance metrics per session (volume, average RPE, recovery time, sleep quality, stress level).
- Submissions show inline validation and success indicators.

5) Adaptation & Adjustments
- Based on collected feedback and signals, adjustments are suggested (PlanFeedbackPanel).
- The user can apply and rate adjustments, providing qualitative feedback.

6) Takeaways
- Magic Slice closes the loop: onboard, generate, perform, feedback, adapt.
- Telemetry and metrics ensure observability; APIs are validated end-to-end.
