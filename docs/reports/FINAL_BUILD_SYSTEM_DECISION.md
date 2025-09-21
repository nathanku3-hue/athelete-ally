# Final Build System Decision (Frontend)

- Removed custom Babel config in apps/frontend/babel.config.js to avoid SWC/Babel conflict.
- Next.js now builds with SWC exclusively; ESLint disabled during Next build (`eslint.ignoreDuringBuilds: true`).
- Rationale: reduce build complexity, eliminate invalid ESLint option warnings, and standardize on SWC for performance.
- Verification: `npm run build` succeeds; tailwind warning remains (tracked in TECHNICAL_DEBT_LOG.md).
