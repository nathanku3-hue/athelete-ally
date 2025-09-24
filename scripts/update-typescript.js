const fs = require('fs');
const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node scripts/update-typescript.js <package.json>...');
  process.exit(1);
}
const target = '^5.9.2';
let count = 0;
for (const p of files) {
  const raw = fs.readFileSync(p, 'utf8');
  const j = JSON.parse(raw);
  let changed = false;
  if (j.devDependencies && typeof j.devDependencies.typescript === 'string' && j.devDependencies.typescript !== target) {
    j.devDependencies.typescript = target;
    changed = true;
  }
  if (j.dependencies && typeof j.dependencies.typescript === 'string' && j.dependencies.typescript !== target) {
    j.dependencies.typescript = target;
    changed = true;
  }
  if (j.peerDependencies && typeof j.peerDependencies.typescript === 'string' && j.peerDependencies.typescript !== target) {
    j.peerDependencies.typescript = target;
    changed = true;
  }
  if (j.overrides && Object.prototype.hasOwnProperty.call(j.overrides, 'typescript')) {
    delete j.overrides.typescript;
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
    console.log('Updated', p);
    count++;
  }
}
console.log('Files updated:', count);
