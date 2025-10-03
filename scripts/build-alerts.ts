import { glob, readYAML, writeYAMLSorted, headerWithSources } from './lib/fs';

async function build() {
  const sources = await glob('monitoring/alert_rules.d/**/*.y?(a)ml');
  const groups: any[] = [];

  for (const p of sources.sort()) {
    const y: any = await readYAML(p);
    const gs = Array.isArray(y?.groups) ? y.groups : [];
    for (const g of gs) groups.push(g);
  }

  // sort groups by name for stability
  groups.sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')));

  const header = headerWithSources('Prometheus Alerts (monitoring/alert_rules.yml)', sources);
  const target = 'monitoring/alert_rules.yml';
  await writeYAMLSorted(target, { groups });
  const fs = await import('node:fs/promises');
  const body = await fs.readFile(target, 'utf8');
  await fs.writeFile(target, header + body, 'utf8');
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
