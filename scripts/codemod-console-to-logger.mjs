#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const excludeSnippets = [
  "/node_modules/","/tests/","/__tests__/","/test/","/dist/","/build/","/out/","/coverage/","/bin/",
  "packages/logger/","apps/frontend/src/app/api/logs/"
];
const exts = new Set([".ts",".tsx",".js",".jsx"]);

function shouldSkip(abs){
  const rel = path.relative(root, abs).replace(/\\/g, "/");
  if (!rel.startsWith("packages/")) return true;
  for (const ex of excludeSnippets) { if (rel.includes(ex)) return true; }
  const ext = path.extname(rel);
  return !exts.has(ext);
}

function mapMethod(m){
  if (m === "log" || m === "info") return "info";
  if (m === "warn") return "warn";
  if (m === "error") return "error";
  if (m === "debug") return "debug";
  return null;
}

function ensureImport(src){
  if (src.includes("'@athlete-ally/logger'")) return src;
  const lines = src.split(/\r?\n/);
  let insertAt = 0;
  while (insertAt < lines.length && /^\s*$/.test(lines[insertAt])) insertAt++;
  const imp = "import { createLogger } from '@athlete-ally/logger';\nimport nodeAdapter from '@athlete-ally/logger/server';\nconst logger = createLogger(nodeAdapter);";
  lines.splice(insertAt, 0, imp, "");
  return lines.join("\n");
}

function replaceConsoles(src){
  return src.replace(/\bconsole\.(log|warn|error|debug|info)\s*\(/g, (_m, cap)=>{
    const mm = mapMethod(cap);
    return mm ? `logger.${mm}(` : _m;
  });
}

async function walk(dir){
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of ents) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) { await walk(p); continue; }
    if (shouldSkip(p)) continue;
    let text = await fs.readFile(p, "utf8");
    if (!/\bconsole\.(log|warn|error|debug|info)\s*\(/.test(text)) continue;
    const before = text;
    text = replaceConsoles(text);
    if (text === before) continue;
    if (!/\blogger\s*=\s*createLogger\(/.test(text) && !/from\s+['"]@athlete-ally\/logger['"]/.test(text)) {
      text = ensureImport(text);
    }
    await fs.writeFile(p, text, "utf8");
    process.stdout.write(`MOD: ${path.relative(root,p).replace(/\\\\/g,'/')}\n`);
  }
}

(async()=>{ await walk(path.join(root,'packages')); })().catch(err=>{ console.error(err.message||String(err)); process.exit(1); });
