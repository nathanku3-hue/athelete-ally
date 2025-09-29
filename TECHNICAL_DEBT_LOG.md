## 2025-09-29 ? TS path alias for @athlete-ally/otel-preset (tactical)

Context: packages/telemetry-bootstrap imports @athlete-ally/otel-preset. In our monorepo, TypeScript sometimes fails to resolve package exports across workspaces without an explicit paths alias in the base tsconfig.

Change: Added a one-line path alias in config/typescript/tsconfig.base.json to map @athlete-ally/otel-preset ? ./packages/otel-preset for type resolution.

File reference: config/typescript/tsconfig.base.json:(added) ? search for the "@athlete-ally/otel-preset" key.

Risk: Accumulating manual paths aliases couples TS config to repo layout and can mask issues with package exports or workspace resolution.

Long-term fix: Remove ad-hoc aliases and rely on standard workspace/package exports. Prefer 	ypes in package.json and ensure consumers don?t override paths in ways that bypass exports. Consider a repo-wide rule to forbid new paths mappings for local packages without an RFC.
