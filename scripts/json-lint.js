#!/usr/bin/env node
const fs = require('fs');
let ok = true;
const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node scripts/json-lint.js <files...>');
  process.exit(2);
}
for (const f of files) {
  try {
    const txt = fs.readFileSync(f, 'utf8');
    JSON.parse(txt);
    console.log(`OK: ${f}`);
  } catch (e) { ok = false; console.error(`JSON error in ${f}: ${e.message}`); }
}
process.exit(ok ? 0 : 1);