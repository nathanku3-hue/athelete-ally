import { writeFile } from '../lib/fs';
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

async function main() {
  for (const f of HUBS) {
    try {
      run(`git update-index --assume-unchanged ${f}`);
    } catch {}
  }
  await writeFile(
    'scripts/dev/.assume-unchanged.log',
    `${new Date().toISOString()}\n${HUBS.join('\n')}\n`
  );
  console.log('Marked hubs assume-unchanged.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
