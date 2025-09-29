const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('Usage: node scripts/update-zod.js <package.json>'); process.exit(1); }
const raw = fs.readFileSync(path, 'utf8');
const json = JSON.parse(raw);
let changed = false;
if (json.dependencies && typeof json.dependencies.zod === 'string') {
  if (json.dependencies.zod !== '^3.25.76') {
    json.dependencies.zod = '^3.25.76';
    changed = true;
  }
}
if (json.overrides && Object.prototype.hasOwnProperty.call(json.overrides, 'zod')) {
  delete json.overrides.zod;
  changed = true;
  // if overrides becomes empty, keep the object for now to avoid noise
}
if (changed) {
  fs.writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
  console.log('Updated', path);
} else {
  console.log('No change', path);
}
