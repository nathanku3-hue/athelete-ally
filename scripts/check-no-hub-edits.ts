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
  
  // Try to fetch the base ref, but don't fail if it doesn't exist
  try {
    execSync(`git fetch --no-tags --depth=1 origin ${base}`, { stdio: 'inherit' });
  } catch (e) {
    console.log(`Warning: Could not fetch ${base}, trying alternative approach`);
  }
  
  // Try different approaches to get changed files
  let diff = '';
  try {
    // First try: use base...HEAD
    diff = run(`git diff --name-only --diff-filter=ACMRT ${base}...HEAD`);
  } catch (e) {
    try {
      // Second try: use origin/main...HEAD if base failed
      diff = run(`git diff --name-only --diff-filter=ACMRT origin/main...HEAD`);
    } catch (e2) {
      try {
        // Third try: use HEAD~1...HEAD (compare with previous commit)
        diff = run(`git diff --name-only --diff-filter=ACMRT HEAD~1...HEAD`);
      } catch (e3) {
        // Last resort: use git show to get files from current commit
        diff = run(`git show --name-only --pretty=format: HEAD | tail -n +2`);
      }
    }
  }
  
  const changed = new Set(diff.split('\n').filter(Boolean));
  const hits = hubGlobs.filter((g) => changed.has(g));
  if (hits.length) {
    console.error('Blocked: hub files edited in PR:', hits);
    process.exit(42);
  }
  console.log('No hub edits detected.');
}

main();
