import { execSync } from 'node:child_process';

const HUBS = [
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

function run(cmd: string) {
  return execSync(cmd, { stdio: 'pipe' }).toString();
}

function main() {
  for (const f of HUBS) {
    try {
      run(`git update-index --no-assume-unchanged ${f}`);
    } catch {}
  }
  console.log('Cleared assume-unchanged on hubs.');
}

main();
