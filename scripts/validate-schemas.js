#!/usr/bin/env node
/* Validate normalized example payloads against their corresponding JSON Schemas.
   - Schemas: docs/phase-3/schemas/normalized/{domain}.v1.json
   - Examples: docs/phase-3/schemas/normalized/examples/{domain}.v1.example.json
*/
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const root = process.cwd();
const examplesDir = path.join(root, 'docs', 'phase-3', 'schemas', 'normalized', 'examples');
const schemasDir = path.join(root, 'docs', 'phase-3', 'schemas', 'normalized');

function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function loadSchemaForExample(exampleFile) {
  const base = path.basename(exampleFile); // e.g., heart_rate.v1.example.json
  const match = base.match(/^(.*)\.v(\d+)\.example\.json$/);
  if (!match) throw new Error(`Unexpected example filename: ${base}`);
  const domain = match[1];
  const version = match[2];
  const schemaPath = path.join(schemasDir, `${domain}.v${version}.json`);
  if (!fs.existsSync(schemaPath)) throw new Error(`Schema not found for example ${base}: ${schemaPath}`);
  return schemaPath;
}

function main() {
  const ajv = new Ajv({ strict: false, allErrors: true, allowUnionTypes: true });
  addFormats(ajv);

  if (!fs.existsSync(examplesDir)) { console.error(`Examples directory not found: ${examplesDir}`); process.exit(1); }
  const exampleFiles = fs.readdirSync(examplesDir).filter(f => f.endsWith('.json')).map(f => path.join(examplesDir, f));
  if (exampleFiles.length === 0) { console.warn('No example files found to validate.'); return; }

  let failures = 0;
  for (const ex of exampleFiles) {
    try {
      const schemaPath = loadSchemaForExample(ex);
      const schema = readJSON(schemaPath);
      const data = readJSON(ex);
      const validate = ajv.compile(schema);
      const ok = validate(data);
      if (ok) {
        console.log(`VALID: ${path.basename(ex)} ?`);
      } else {
        failures++;
        console.error(`INVALID: ${path.basename(ex)} ?`);
        for (const err of validate.errors || []) console.error(`  ? ${err.instancePath || '/'} ${err.message}`);
      }
    } catch (e) {
      failures++;
      console.error(`ERROR: ${path.basename(ex)} -> ${(e && e.message) || e}`);
    }
  }

  if (failures > 0) { console.error(`Schema validation failed for ${failures} example(s).`); process.exit(1); }
  else { console.log('All examples conform to their schemas.'); }
}

if (require.main === module) main();

