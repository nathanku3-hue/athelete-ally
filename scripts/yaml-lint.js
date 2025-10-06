#!/usr/bin/env node
const fs = require('fs');
let ok = true;
const files = process.argv.slice(2);
if (files.length === 0) { console.error('Usage: node scripts/yaml-lint.js <files...>'); process.exit(2); }
let parser = null;
try { parser = require('yaml'); } catch {}
try { if (!parser) parser = require('js-yaml'); } catch {}
for (const f of files) {
  try {
    const txt = fs.readFileSync(f, 'utf8');
    if (parser) {
      const parsed = parser.parse ? parser.parse(txt) : parser.load(txt);
      void parsed; // Validate by parsing
      console.log(`OK: ${f}`);
    } else {
      // Fallback: minimal check for required keys
      if (!/groups:\s*[\s\S]+name:/m.test(txt) || !/rules:/m.test(txt)) throw new Error('basic YAML structure check failed (install yaml/js-yaml for full parse)');
      console.log(`OK(basic): ${f}`);
    }
  } catch (e) { ok = false; console.error(`YAML error in ${f}: ${e.message}`); }
}
process.exit(ok ? 0 : 1);