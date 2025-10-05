#!/usr/bin/env node
/**
 * Summarize dependency reports into GitHub Step Summary.
 * - Finds latest reports/deps/<date>//*.json
 * - Aggregates outdated and deprecated; prints Top 10 by impact.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function listDir(p) { try { return await fs.readdir(p, { withFileTypes: true }); } catch { return []; } }
function parseSemver(v) {
  if (!v) return null;
  const m = String(v).trim().replace(/^[^0-9]*/, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null; return { major: +m[1], minor: +m[2], patch: +m[3] };
}
function severity(a, b) {
  const A = parseSemver(a); const B = parseSemver(b);
  if (!A || !B) return 0; if (B.major > A.major) return 3; if (B.major === A.major && B.minor > A.minor) return 2; if (B.major === A.major && B.minor === A.minor && B.patch > A.patch) return 1; return 0;
}

async function append(lines) {
  const f = process.env.GITHUB_STEP_SUMMARY; if (!f) return;
  await fs.appendFile(f, lines.join('\n') + '\n', 'utf8');
}

async function main() {
  const root = process.cwd();
  const base = path.join(root, 'reports', 'deps');
  const dates = (await listDir(base)).filter(d => d.isDirectory()).map(d => d.name).sort();
  const latest = dates.at(-1);
  if (!latest) { await append(['\n### Dependency Report Summary', '- No reports found']); return; }
  const dir = path.join(base, latest);
  const files = (await listDir(dir)).filter(e => e.isFile() && e.name.endsWith('.json')).map(e => path.join(dir, e.name));
  const items = [];
  let deprecatedCount = 0;
  for (const f of files) {
    try {
      const r = JSON.parse(await fs.readFile(f, 'utf8'));
      const target = r.target || path.basename(f, '.json');
      const outdated = r.data?.outdated || {};
      for (const [name, info] of Object.entries(outdated)) items.push({ name, current: info.current, latest: info.latest, target });
      deprecatedCount += (r.data?.deprecated || []).length;
    } catch {}
  }
  items.sort((x, y) => severity(y.current, y.latest) - severity(x.current, x.latest));
  const top10 = items.slice(0, 10);
  const lines = ['\n### Dependency Report Summary', `- Outdated packages: ${items.length}`, `- Deprecated (from sample): ${deprecatedCount}`, '- Top 10 by impact:'];
  for (const it of top10) lines.push(`  - ${it.name} ${it.current} -> latest:${it.latest} (${it.target})`);
  await append(lines);
}

main().catch(async e => { await append(['\n### Dependency Report Summary', `- Error summarizing: ${e?.message || e}`]); });

