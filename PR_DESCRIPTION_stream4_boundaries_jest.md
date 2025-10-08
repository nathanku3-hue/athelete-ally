chore(stream4): boundaries pilot + packages jest project (non-blocking)

Summary
- Add feature-hello to Boundaries pilot (warn-only via scripts/eslint-config-constants.mjs)
- Add packages Jest project and include in aggregator (non-blocking)
- Add Stream 4 self-check workflow + changed-tests summary (PR Step Summary only)
- Dual sign-off in CODEOWNERS for templates and pilot paths

Verification
- Self-check: 
- Packages Jest (pilot): 

CI Expectations
-  runs on PRs touching template/pilot/scripts
- Job is non-required; prints Step Summary with self-check + changed-tests summary

Acceptance
- Boundaries pilot includes  (warnings only)
- Packages Jest project runs and passes (passWithNoTests=true allowed)
- No required checks added

Labels: governance, framework, scaffolding
Reviewers: Safety DM + Feature DM
