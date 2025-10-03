#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const DASH_DIR = 'monitoring/grafana/dashboards';
const INDEX_PATH = path.join(DASH_DIR, 'index.json');

async function sha256File(file) {
  const buf = await fs.readFile(file);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function extractFields(obj) {
  const d = obj?.dashboard && typeof obj.dashboard === 'object' ? obj.dashboard : obj;
  const title = (d?.title ?? obj?.title ?? '').toString();
  const uid = (d?.uid ?? obj?.uid ?? '').toString();
  const panels = Array.isArray(d?.panels) ? d.panels : Array.isArray(obj?.panels) ? obj.panels : [];
  return { title, uid, panels };
}

function countLeafPanels(panels) {
  let count = 0;
  const stack = Array.isArray(panels) ? [...panels] : [];
  while (stack.length) {
    const p = stack.pop();
    if (!p || typeof p !== 'object') continue;
    const children = Array.isArray(p.panels) ? p.panels : [];
    const isRow = p.type === 'row';
    if (children.length > 0 || isRow) {
      // container: traverse children only
      for (const c of children) stack.push(c);
      continue;
    }
    if (p.type) count++;
  }
  return count;
}

async function main() {
  // read dashboard files (exclude index.json, ignore subfolders)
  const entries = await fs.readdir(DASH_DIR, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.json') && e.name !== 'index.json')
    .map((e) => path.join(DASH_DIR, e.name));

  const dashboards = [];
  for (const file of files) {
    try {
      const raw = await fs.readFile(file, 'utf8');
      const data = JSON.parse(raw);
      const { title, uid, panels } = extractFields(data);
      dashboards.push({
        file: file.replace(/\\/g, '/'),
        title: title || path.basename(file, '.json'),
        uid: uid || '',
        panelsCount: countLeafPanels(panels),
        checksumSha256: crypto.createHash('sha256').update(Buffer.from(raw, 'utf8')).digest('hex'),
      });
    } catch (e) {
      // skip invalid json files; do not fail CI for non-dashboard json
    }
  }

  dashboards.sort((a, b) => {
    const aEmpty = !a.uid;
    const bEmpty = !b.uid;
    if (aEmpty !== bEmpty) return aEmpty ? 1 : -1; // non-empty first
    const uidCmp = (a.uid || '').localeCompare(b.uid || '');
    if (uidCmp !== 0) return uidCmp;
    const titleCmp = (a.title || '').localeCompare(b.title || '');
    if (titleCmp !== 0) return titleCmp;
    return a.file.localeCompare(b.file);
  });

  const out = {
    generatedAt: new Date().toISOString(),
    dashboards,
  };
  const json = JSON.stringify(out, null, 2) + '\n';
  await fs.writeFile(INDEX_PATH, json, 'utf8');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});