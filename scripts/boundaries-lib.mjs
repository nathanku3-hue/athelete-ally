import fs from "node:fs/promises";
import * as fsSync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, execSync } from "node:child_process";
import { BOUNDARIES_PILOT_GLOBS } from "./eslint-config-constants.mjs";

const fsSyncPlain = await import("node:fs");
export const CONFIG_FILE = process.env.ESLINT_CONFIG_FILE || (fsSyncPlain.default.existsSync("eslint.config.unified.mjs") ? "eslint.config.unified.mjs" : "eslint.config.mjs");

export async function fileExists(p) { try { await fs.access(p); return true; } catch { return false; } }
export async function readJsonSafe(p, fallback) { try { const t = await fs.readFile(p, "utf8"); return JSON.parse(t); } catch { return fallback; } }

export function computeSha256ForFiles(files) {
  const hash = crypto.createHash("sha256");
  for (const f of files) { try { const buf = fsSync.readFileSync(f); hash.update(buf); } catch {} }
  return hash.digest("hex");
}

export async function getConfigHash() {
  const roots = [CONFIG_FILE];
  const maybe = await fileExists("scripts/eslint-config-constants.mjs"); if (maybe) roots.push("scripts/eslint-config-constants.mjs");
  return computeSha256ForFiles(roots.map((p) => path.resolve(p)));
}

export function isPilotFile(filePath) {
  const globs = BOUNDARIES_PILOT_GLOBS;
  return globs.some((g) => {
    const re = new RegExp("^" + g
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*") + "$"
    );
    return re.test(filePath.replace(/\\/g, "/"));
  });
}

export function sanitizeMessages(messages) {
  return (messages || [])
    .filter((m) => m && m.ruleId && m.ruleId.startsWith("boundaries/"))
    .map((m) => ({ ruleId: m.ruleId, message: m.message || "", line: m.line || 0, column: m.column || 0 }));
}

export async function runEslint(globs) {
  const args = ["eslint", "-f", "json", "--no-error-on-unmatched-pattern", "--config", CONFIG_FILE, ...globs];
  const env = { ...process.env, ESLINT_USE_FLAT_CONFIG: "true" };
  let stdout = "[]";
  try {
    stdout = execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", args, { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    if (e.stdout) stdout = e.stdout.toString("utf8");
  }
  let parsed = [];
  try { parsed = JSON.parse(stdout); } catch { parsed = []; }
  let items = [];
  for (const r of parsed) {
    const msgs = sanitizeMessages(r.messages || []);
    if (msgs.length) {
      for (const m of msgs) items.push({ filePath: r.filePath.replace(/\\/g, "/"), ...m });
    }
  }
  return items;
}

export function loadAllowPatternsSync() {
  try {
    const raw = fsSync.readFileSync("ci/boundaries-allowlist.json", "utf8");
    const json = JSON.parse(raw);
    return Array.isArray(json.allowedPatterns) ? json.allowedPatterns : [];
  } catch { return []; }
}

export function isAllowed(item, patterns) {
  const key = `${item.filePath}::${item.ruleId}::${item.message}`;
  return patterns.some((p) => { try { const re = new RegExp(p); return re.test(key); } catch { return false; } });
}

export function toKey(item) { return `${item.filePath}::${item.ruleId}::${item.message}`; }
export function groupByRule(items) { const out = {}; for (const it of items) out[it.ruleId] = (out[it.ruleId] || 0) + 1; return out; }
export function partitionPilot(items) { const pilot = [], nonPilot = []; for (const it of items) (isPilotFile(it.filePath) ? pilot : nonPilot).push(it); return { pilot, nonPilot }; }

export function getChangedFiles() {
  const env = process.env;
  try {
    let base = env.GITHUB_BASE_REF || "origin/main";
    let diffRange = "";
    try {
      const baseSha = execSync(`git rev-parse ${base}`, { stdio: ["ignore","pipe","ignore"] }).toString().trim();
      const mb = execSync(`git merge-base ${baseSha} HEAD`, { stdio: ["ignore","pipe","ignore"] }).toString().trim();
      diffRange = `${mb}...HEAD`;
    } catch { diffRange = `${base}...HEAD`; }
    const out = execSync(`git diff --name-only --diff-filter=ACMR ${diffRange}`, { stdio: ["ignore","pipe","ignore"] }).toString();
    return out.split(/\r?\n/).filter(Boolean);
  } catch { return []; }
}

export function deltaNew(currentItems, baselineItems, allowPatterns) {
  const baseSet = new Set(baselineItems.map(toKey));
  const out = [];
  for (const it of currentItems) {
    const key = toKey(it);
    if (!baseSet.has(key) && !isAllowed(it, allowPatterns)) out.push(it);
  }
  return out;
}

export function summarize(items) { return { total: items.length, byRule: groupByRule(items) }; }

export async function getVersions() {
  let eslintVer = ""; let pluginVer = "";
  try {
    const { createRequire } = await import("node:module");
    const req = createRequire(import.meta.url);
    eslintVer = req("eslint/package.json").version;
    pluginVer = req("eslint-plugin-boundaries/package.json").version;
  } catch {
    eslintVer = eslintVer || "unknown";
    pluginVer = pluginVer || "unknown";
  }
  return { node: process.version, eslint: eslintVer, boundaries: pluginVer };
}
