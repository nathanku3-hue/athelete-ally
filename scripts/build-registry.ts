import { glob, readJSON, writeJSONSorted, writeFile, headerWithSources } from './lib/fs';

async function build() {
  const sources = await glob('registry/**/*.json');
  const items: any[] = [];
  for (const p of sources.sort()) {
    try {
      items.push(await readJSON(p));
    } catch {}
  }
  // sort by id
  items.sort((a, b) => String(a?.id || '').localeCompare(String(b?.id || '')));

  const header = headerWithSources('Registry (registry.json / registry.ts)', sources);
  const jsonPath = 'registry.json';
  await writeJSONSorted(jsonPath, { items });
  // prepend header as JS comment in TS file
  const tsPath = 'registry.ts';
  const ts =
    header
      .split('\n')
      .map((l) => (l.startsWith('#') ? '//' + l.slice(1) : '// ' + l))
      .join('\n') +
    `\nexport type RegistryItem = { id: string; [k: string]: any };\nexport const registry: { items: RegistryItem[] } = ${JSON.stringify({ items }, null, 2)} as const;\n`;
  await writeFile(tsPath, ts);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
