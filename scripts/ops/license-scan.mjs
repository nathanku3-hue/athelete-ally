#!/usr/bin/env node
/**
 * License compliance scan (report-only).
 * - Uses npx license-checker-rseidelsohn@3.11.2
 * - Compares against config/licenses-allowlist.json
 * - Emits JSON per target and a Markdown summary
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(_exec);

function utcDateStamp() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function sanitizeName(s) {
  return s.replace(/[\\/\s@:]+/g, '-').replace(/^-+|-+$/g, '');
}

async function readJSON(p, fallback = null) {
  try {
    const raw = await fs.readFile(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function listDirs(p) {
  const ents = await fs.readdir(p, { withFileTypes: true });
  return ents.filter(e => e.isDirectory()).map(e => path.join(p, e.name));
}

async function expandWorkspaces(rootDir, patterns) {
  const results = [];
  for (const pat of patterns) {
    if (pat.endsWith('/*')) {
      const base = pat.slice(0, -2);
      const baseAbs = path.join(rootDir, base);
      try {
        const subs = await listDirs(baseAbs);
        for (const sub of subs) {
          const pj = path.join(sub, 'package.json');
          const pkg = await readJSON(pj);
          if (pkg) results.push({ dir: sub, name: pkg.name ?? path.basename(sub) });
        }
      } catch {
        // ignore
      }
    } else {
      const abs = path.join(rootDir, pat);
      const pkg = await readJSON(path.join(abs, 'package.json'));
      if (pkg) results.push({ dir: abs, name: pkg.name ?? path.basename(abs) });
    }
  }
  const seen = new Set();
  return results.filter(r => (seen.has(r.dir) ? false : (seen.add(r.dir), true)));
}

async function runLicenseChecker(cwd) {
  const cmd = [
    'npx --yes license-checker-rseidelsohn@3.11.2',
    '--json',
    '--excludePrivatePackages',
    '--production',
    '--development',
  ].join(' ');
  const { stdout } = await exec(cmd, { cwd, env: { ...process.env, CI: '1' } });
  return JSON.parse(stdout);
}

function normalizeLicenses(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  return String(val).split(/[+|()\s]*OR[+|()\s]*|[+|()\s]*AND[+|()\s]*/i).map(s => s.trim()).filter(Boolean);
}

function categorize(licenseIds, policy) {
  const ids = licenseIds.map(s => s.replace(/^\(|\)$/g, ''));
  const denyHit = ids.find(id => policy.deny.includes(id));
  if (denyHit) return { level: 'DISALLOWED', hit: denyHit };
  const warnHit = ids.find(id => policy.warn.includes(id));
  if (warnHit) return { level: 'WARN', hit: warnHit };
  const unknown = ids.find(id => !policy.allow.includes(id));
  if (unknown) return { level: 'WARN', hit: unknown };
  return { level: 'ALLOWED', hit: null };
}

async function main() {
  const rootDir = process.cwd();
  const pkg = await readJSON(path.join(rootDir, 'package.json'));
  const patterns = Array.isArray(pkg?.workspaces) ? pkg.workspaces : [];
  const workspaces = await expandWorkspaces(rootDir, patterns);

  const policy = await readJSON(path.join(rootDir, 'config', 'licenses-allowlist.json'), {
    allow: ['MIT','Apache-2.0','BSD-2-Clause','BSD-3-Clause','ISC','MPL-2.0','EPL-2.0','CC0-1.0','Unlicense'],
    warn: ['LGPL-2.1','LGPL-3.0'],
    deny: ['AGPL-3.0','SSPL-1.0','GPL-2.0-only','GPL-3.0-only'],
  });

  const date = utcDateStamp();
  const outBase = path.join(rootDir, 'reports', 'licenses', date);
  await ensureDir(outBase);

  const targets = [{ name: pkg?.name || 'root', dir: rootDir }, ...workspaces];
  const aggregate = [];

  for (const t of targets) {
    const result = { target: t.name, findings: [], summary: { ALLOWED: 0, WARN: 0, DISALLOWED: 0, TOTAL: 0 } };
    try {
      const data = await runLicenseChecker(t.dir);
      for (const [pkgKey, info] of Object.entries(data)) {
        const licenses = normalizeLicenses(info.licenses);
        const cat = categorize(licenses, policy);
        result.findings.push({ pkg: pkgKey, licenses, category: cat.level, hit: cat.hit || undefined });
        result.summary[cat.level] += 1;
      }
      result.summary.TOTAL = result.findings.length;
    } catch (err) {
      result.error = String(err?.message || err);
    }
    aggregate.push(result);
    const file = path.join(outBase, `${sanitizeName(t.name)}.json`);
    await fs.writeFile(file, JSON.stringify(result, null, 2), 'utf8');
    // eslint-disable-next-line no-console
    console.log(`License report -> ${path.relative(rootDir, file)}`);
  }

  // Write aggregate summary (MD + JSON)
  const sumJson = path.join(outBase, `_summary.json`);
  await fs.writeFile(sumJson, JSON.stringify(aggregate, null, 2), 'utf8');

  const md = [];
  md.push(`# License Compliance Summary (${date})`);
  for (const r of aggregate) {
    md.push(`\n## ${r.target}`);
    if (r.error) {
      md.push(`- Error: ${r.error}`);
      continue;
    }
    md.push(`- Total: ${r.summary.TOTAL} | Allowed: ${r.summary.ALLOWED} | Warn: ${r.summary.WARN} | Disallowed: ${r.summary.DISALLOWED}`);
    const highlight = r.findings.filter(f => f.category !== 'ALLOWED').slice(0, 20);
    if (highlight.length) {
      md.push(`- Notable (first 20):`);
      for (const f of highlight) {
        md.push(`  - ${f.pkg} -> [${f.licenses.join(', ')}] (${f.category}${f.hit ? `: ${f.hit}` : ''})`);
      }
    } else {
      md.push(`- No WARN/DISALLOWED licenses found.`);
    }
  }
  await fs.writeFile(path.join(outBase, `summary.md`), md.join('\n'), 'utf8');
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

