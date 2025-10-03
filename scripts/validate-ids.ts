import { collectIds, findDuplicates, validateIdFormat } from './lib/ids';

async function main() {
  const shards = await collectIds();
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
