import { collectIds, findDuplicates, validateIdFormat } from './lib/ids';

async function main() {
  const shards = await collectIds();\n  // include reserved ids if present\n  const fs = await import('node:fs/promises');\n  try {\n    const r = JSON.parse(await fs.readFile('registry/reserved-ids.json', 'utf8'));\n    const ids: string[] = Array.isArray(r) ? r : Array.isArray(r?.ids) ? r.ids : [];\n    for (const id of ids) shards.push({ id, path: 'registry/reserved-ids.json' } as any);\n  } catch {}
  // format check
  const bad = shards.filter((s) => !validateIdFormat(s.id));
  if (bad.length) {
    console.error('Invalid id format (expected {stream}-{domain}-{slug} ASCII):');
    for (const b of bad) console.error(`  ${b.id} <- ${b.path}`);
    process.exit(2);
  }

  const dups = findDuplicates(shards);
  if (dups.size) {
    console.error('Duplicate ids detected:');
    for (const [id, list] of dups)
      console.error(`  ${id}:\n    ${list.map((x) => x.path).join('\n    ')}`);
    process.exit(3);
  }
  console.log(`IDs OK (${shards.length} shards).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
