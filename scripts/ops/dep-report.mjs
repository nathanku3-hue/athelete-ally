#!/usr/bin/env node
/**
 * Dependency maintainability report (outdated, deprecated, peer conflicts).
 * - Uses npm CLI (no new deps)
 * - Outdated via `npm outdated --json`
 * - Deprecated (best-effort): queries registry for packages in the outdated set
 * - Emits per-target JSON plus an aggregate summary.md
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { exec as _exec, spawn } from 'node:child_process';
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

async function readJSON(p) {
  try {
    const raw = await fs.readFile(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
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

async function npmOutdated(cwd) {
  try {
    const { stdout } = await exec('npm outdated --json || true', { cwd, env: { ...process.env, CI: '1' } });
    const out = stdout.trim();
    if (!out) return {};
    return JSON.parse(out);
  } catch (err) {
    return { _error: String(err?.message || err) };
  }
}

async function npmLsProblems(cwd) {
  try {
    const { stdout } = await exec('npm ls --all --json || true', { cwd, env: { ...process.env, CI: '1' } });
    const data = JSON.parse(stdout || '{}');
    const problems = Array.isArray(data.problems) ? data.problems : [];
    return problems;
  } catch {
    return [];
  }
}

async function npmViewDeprecated(name, version, cwd) {
  // Query exact version deprecation message. This requires network; offline it may fail.
  try {
    const { stdout } = await exec(`npm view ${name}@${version} deprecated --json || true`, { cwd, env: { ...process.env, CI: '1' } });
    const out = stdout.trim();
    if (!out || out === 'null') return null;
    try {
      const parsed = JSON.parse(out);
      return parsed || null;
    } catch {
      // Sometimes npm returns a bare string
      return out || null;
    }
  } catch {
    return null;
  }
}

async function gatherDeprecatedFromOutdated(cwd, outdated) {
  const entries = Object.entries(outdated || {});
  const results = [];
  const limit = 6;
  let active = 0;
  let idx = 0;
  const next = () => {
    if (idx >= entries.length) return Promise.resolve();
    const [name, info] = entries[idx++];
    active++;
    return npmViewDeprecated(name, info.current, cwd)
      .then(msg => {
        if (msg) results.push({ name, version: info.current, message: msg });
      })
      .finally(() => { active--; });
  };
  const workers = Array.from({ length: Math.min(limit, entries.length) }, () => (async function run() { while (idx < entries.length) { await next(); } })());
  await Promise.all(workers);
  return results;
}

async function main() {
  const rootDir = process.cwd();
  const pkg = await readJSON(path.join(rootDir, 'package.json'));
  const patterns = Array.isArray(pkg?.workspaces) ? pkg.workspaces : [];
  const workspaces = await expandWorkspaces(rootDir, patterns);
  const date = utcDateStamp();
  const outBase = path.join(rootDir, 'reports', 'deps', date);
  await ensureDir(outBase);

  const targets = [{ name: pkg?.name || 'root', dir: rootDir }, ...workspaces];
  const aggregate = [];

  for (const t of targets) {
    const report = { target: t.name, generatedAt: new Date().toISOString(), summary: {}, data: {} };
    const outdated = await npmOutdated(t.dir);
    report.data.outdated = outdated;
    const problems = await npmLsProblems(t.dir);
    report.data.problems = problems;
    let deprecated = [];
    try {
      deprecated = await gatherDeprecatedFromOutdated(t.dir, outdated);
    } catch {
      deprecated = [];
    }
    report.data.deprecated = deprecated;
    report.summary.outdatedCount = Object.keys(outdated || {}).length;
    report.summary.deprecatedCount = deprecated.length;
    report.summary.peerProblemCount = Array.isArray(problems) ? problems.filter(p => String(p).toLowerCase().includes('peer')).length : 0;

    const file = path.join(outBase, `${sanitizeName(t.name)}.json`);
    await fs.writeFile(file, JSON.stringify(report, null, 2), 'utf8');
    // eslint-disable-next-line no-console
    console.log(`Deps report -> ${path.relative(rootDir, file)}`);
    aggregate.push(report);
  }

  // Aggregate MD summary
  const md = [];
  md.push(`# Dependency Report Summary (${date})`);
  for (const r of aggregate) {
    md.push(`\n## ${r.target}`);
    md.push(`- Outdated: ${r.summary.outdatedCount} | Deprecated: ${r.summary.deprecatedCount} | Peer issues: ${r.summary.peerProblemCount}`);
    const top5 = Object.entries(r.data.outdated || {}).slice(0, 5);
    if (top5.length) {
      md.push(`- Top outdated (first 5):`);
      for (const [name, info] of top5) {
        md.push(`  - ${name} ${info.current} -> wanted:${info.wanted} latest:${info.latest}`);
      }
    }
    if ((r.data.deprecated || []).length) {
      md.push(`- Deprecated (from outdated set):`);
      for (const d of r.data.deprecated.slice(0, 5)) {
        md.push(`  - ${d.name}@${d.version}: ${String(d.message).slice(0, 140)}${String(d.message).length > 140 ? '…' : ''}`);
      }
    }
  }
  await fs.writeFile(path.join(outBase, `summary.md`), md.join('\n'), 'utf8');
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

