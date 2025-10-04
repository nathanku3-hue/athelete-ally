#!/usr/bin/env node
/**
 * Generate CycloneDX SBOMs for the monorepo (root + each workspace).
 * - Uses npx @cyclonedx/cyclonedx-npm@4.0.0 (no runtime deps added)
 * - Outputs to reports/sbom/<YYYYMMDD>/<target>.cdx.json
 * - Includes dev deps for full visibility
 * - Degrades gracefully offline by writing a stub report
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

async function readJSON(p) {
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}

async function listDirs(p) {
  const ents = await fs.readdir(p, { withFileTypes: true });
  return ents.filter(e => e.isDirectory()).map(e => path.join(p, e.name));
}

// Minimal glob support for patterns like "apps/*", "packages/*", "services/*"
async function expandWorkspaces(rootDir, patterns) {
  const results = [];
  for (const pat of patterns) {
    if (pat.endsWith('/*')) {
      const base = pat.slice(0, -2); // remove /*
      const baseAbs = path.join(rootDir, base);
      try {
        const subs = await listDirs(baseAbs);
        for (const sub of subs) {
          const pj = path.join(sub, 'package.json');
          try {
            const pkg = await readJSON(pj);
            results.push({ dir: sub, name: pkg.name ?? path.basename(sub) });
          } catch {
            // ignore non-packages
          }
        }
      } catch {
        // ignore missing bases
      }
    } else {
      // direct dir with package.json
      const abs = path.join(rootDir, pat);
      try {
        const pkg = await readJSON(path.join(abs, 'package.json'));
        results.push({ dir: abs, name: pkg.name ?? path.basename(abs) });
      } catch {
        // ignore
      }
    }
  }
  // de-dup by dir
  const seen = new Set();
  return results.filter(r => (seen.has(r.dir) ? false : (seen.add(r.dir), true)));
}

async function runCycloneDX(cwd, outFile) {
  const cmd = `npx --yes @cyclonedx/cyclonedx-npm@4.0.0 --output-file "${outFile}" --output-format json`;
  // Intentionally include dev deps for full visibility (default behavior includes them)
  // Add a modest timeout to avoid hanging forever in local runs.
  return exec(cmd, { cwd, env: { ...process.env, CI: '1' }, timeout: 10 * 60 * 1000 });
}

async function writeStub(file, reason) {
  const data = {
    stub: true,
    tool: '@cyclonedx/cyclonedx-npm@4.0.0',
    reason,
    generatedAt: new Date().toISOString(),
  };
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

async function main() {
  const rootDir = process.cwd();
  const pkg = await readJSON(path.join(rootDir, 'package.json'));
  const allWs = Array.isArray(pkg.workspaces) ? pkg.workspaces : [];
  const date = utcDateStamp();
  const outBase = path.join(rootDir, 'reports', 'sbom', date);
  await ensureDir(outBase);

  // Root SBOM (monorepo)
  const rootOut = path.join(outBase, `${sanitizeName(pkg.name || 'root')}.cdx.json`);
  try {
    await runCycloneDX(rootDir, rootOut);
    // eslint-disable-next-line no-console
    console.log(`SBOM (root) -> ${path.relative(rootDir, rootOut)}`);
  } catch (err) {
    await writeStub(rootOut, `SBOM generation failed: ${err?.message || String(err)}`);
  }

  // Per-workspace SBOMs
  const workspaces = await expandWorkspaces(rootDir, allWs);
  for (const ws of workspaces) {
    const wsOut = path.join(outBase, `${sanitizeName(ws.name)}.cdx.json`);
    try {
      await runCycloneDX(ws.dir, wsOut);
      // eslint-disable-next-line no-console
      console.log(`SBOM (${ws.name}) -> ${path.relative(rootDir, wsOut)}`);
    } catch (err) {
      await writeStub(wsOut, `SBOM generation failed: ${err?.message || String(err)}`);
    }
  }
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

