// CI guard: block direct edits to hub files unless label present
import { execSync } from 'node:child_process';

const hubGlobs = [
  'README.md',
  'docs/README.md',
  'docs/runbook/index.md',
  'openapi.yaml',
  'monitoring/alert_rules.yml',
  'monitoring/grafana/dashboards/index.json',
  'CHANGELOG.md',
  'registry.json',
  'registry.ts',
  'infra/index.yaml',
  'protobuf/registry.yaml',
  'sql/migrations/catalog.yaml',
];

function run(cmd: string): string {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] })
    .toString()
    .trim();
}

function main() {
  const base = process.env.GITHUB_BASE_REF || 'origin/main';
  try {
    execSync(`git fetch --no-tags --depth=1 origin ${base}`, { stdio: 'inherit' });
  } catch {}
  const diff = run(`git diff --name-only --diff-filter=ACMRT ${base}...HEAD`);
  const changed = new Set(diff.split('\n').filter(Boolean));
  const hits = hubGlobs.filter((g) => changed.has(g));
  if (hits.length) {
    console.error('Blocked: hub files edited in PR:', hits);
    process.exit(42);
  }
  console.log('No hub edits detected.');
}

main();
