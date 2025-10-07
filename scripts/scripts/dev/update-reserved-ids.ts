import { collectIds } from '../lib/ids';
import { writeJSONSorted, readJSON } from '../lib/fs';

async function main() {
  const shards = await collectIds();
  const shardIds = new Set(shards.map((s) => s.id));
  let existing: string[] = [];
  try {
    const r = await readJSON<any>('registry/reserved-ids.json');
    existing = Array.isArray(r) ? r : Array.isArray(r?.ids) ? r.ids : [];
  } catch {}
  for (const id of existing) shardIds.add(String(id));
  const ids = Array.from(shardIds).sort((a, b) => a.localeCompare(b));
  await writeJSONSorted('registry/reserved-ids.json', { ids });
  console.log(`reserved-ids.json updated (${ids.length} ids)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
