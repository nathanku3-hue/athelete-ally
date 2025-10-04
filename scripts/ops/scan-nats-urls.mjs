#!/usr/bin/env node
// scripts/ops/scan-nats-urls.mjs
// Scans repo for NATS URLs and env refs. Outputs JSON and Markdown reports.

import fs from 'fs';
import path from 'path';

const EXCLUDE_DIRS = new Set(['node_modules','.git','dist','build','coverage','.turbo','.next']);
const INCLUDE_EXT = new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs','.json','.yml','.yaml','.md','.env','.sh','.ps1','.toml','.ini','.cfg','.conf']);

const PROD_RE = /(prod|production|live|primary)/i;
const PROD_LIST_FILE = path.resolve(process.cwd(), 'config/prod-hosts.txt');

function loadProdAllowlist(){
  try{
    const raw = fs.readFileSync(PROD_LIST_FILE, 'utf8');
    return raw.split(/\r?\n/).map(s=>s.trim()).filter(s=>s && !s.startsWith('#'));
  } catch { return []; }
}
const PROD_ALLOW = loadProdAllowlist();

function listFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('.codex')) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (EXCLUDE_DIRS.has(e.name)) continue;
        stack.push(p);
      } else {
        const ext = path.extname(e.name).toLowerCase();
        if (INCLUDE_EXT.has(ext) || e.name.startsWith('.env')) out.push(p);
      }
    }
  }
  return out;
}

function scanFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const hits = [];
  const urlRe = /(nats|tls|ws|wss):\/\/([A-Za-z0-9_.:-]+)(?:\b|\/)/g;
  const envRe = /\b(NATS_URL|NATS_SERVERS)\b\s*[:=]\s*(['\"]?)([^\s#'\"`]+)\2/g;
  for (let i=0;i<lines.length;i++) {
    const line = lines[i];
    let m;
    urlRe.lastIndex=0;
    while ((m = urlRe.exec(line)) !== null) {
      const scheme=m[1];
      const hostport=m[2];
      const [host,port] = hostport.split(':');
      hits.push({ type:'url', scheme, host, port: port?Number(port):null, line: i+1, match: `${scheme}://${hostport}` });
    }
    envRe.lastIndex=0;
    while ((m = envRe.exec(line)) !== null) {
      const key=m[1]; const val=m[3];
      hits.push({ type:'env', key, value: redact(val), line: i+1, match: `${key}=${redact(val)}` });
    }
  }
  return hits;
}

function redact(v) { return v.replace(/:[^@\s]+@/g, ':[REDACTED]@'); }

function tier(host) {
  if (!host) return 'unknown';
  if (PROD_ALLOW.some(p => host.includes(p))) return 'prod';
  return PROD_RE.test(host) ? 'prod' : (/(dev|staging|test)/i.test(host) ? 'non-prod' : 'unknown');
}

function assess(item) {
  if (item.type==='url') {
    const tls = item.scheme==='tls' || item.scheme==='wss' || item.port===4223;
    const warn = item.scheme==='nats' && !tls;
    return { tls, warn, riskTier: tier(item.host) };
  }
  return { tls: null, warn: false, riskTier: 'unknown' };
}

function main() {
  const root = process.cwd();
  const files = listFiles(root);
  const results = [];
  for (const f of files) {
    const rel = path.relative(root, f).replace(/\\/g,'/');
    const hits = scanFile(f);
    if (hits.length) {
      for (const h of hits) {
        const meta = assess(h);
        results.push({ file: rel, ...h, ...meta });
      }
    }
  }
  const outDir = path.join('reports');
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'nats_url_scan.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
  const mdPath = path.join(outDir, 'nats_url_scan.md');
  const counts = { total: results.length, prod: results.filter(x=>x.riskTier==='prod').length, tls: results.filter(x=>x.tls===true).length, warn: results.filter(x=>x.warn===true).length };
  const md = [
    '# NATS URL Scan',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `- Total matches: ${counts.total}`,
    `- Prod-tier matches: ${counts.prod}`,
    `- TLS-protected: ${counts.tls}`,
    `- Warnings (plain nats://): ${counts.warn}`,
    '',
    '## Findings',
    '',
    ...results.slice(0,500).map(r => `- [${r.type}] ${r.match} (${r.file}:${r.line}) tier=${r.riskTier} tls=${r.tls===true?'yes':'no'}${r.warn?' WARN':''}`)
  ].join('\n');
  fs.writeFileSync(mdPath, md);
  console.log(`Wrote ${jsonPath} and ${mdPath}`);
}

main();
=======
import fs from 'node:fs/promises';
import fg from 'fast-glob';

const OUT_JSON = 'reports/nats_url_scan.json';
const OUT_MD = 'reports/nats_url_scan.md';

const exts = ['yml','yaml','json','ts','tsx','js','cjs','mjs','md','mdx'];
const patterns = [
  '**/.env',
  '**/.env.*',
  '**/*.env',
  '**/*.env.*',
  `**/*.{${exts.join(',')}}`,
];

const NATS_RE = /\bnats:\/\/[^\s"'`]+/gi;

async function scanFile(file){
  try{
    const txt = await fs.readFile(file,'utf8');
    const matches = [];
    let m; 
    while((m = NATS_RE.exec(txt))){
      const idx = m.index;
      const before = txt.slice(0, idx);
      const lineNum = before.split(/\r?\n/).length; // 1-based
      matches.push({ line: lineNum, value: m[0] });
    }
    return matches;
  }catch{ return []; }
}

async function main(){
  const files = await fg(patterns, { dot: true, ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'] });
  const results = [];
  const urlCounts = new Map();
  for(const f of files){
    const ms = await scanFile(f);
    if(ms.length){
      results.push({ file: f, occurrences: ms });
      for(const { value } of ms){ urlCounts.set(value, (urlCounts.get(value)||0)+1); }
    }
  }
  const summary = Array.from(urlCounts.entries()).map(([url,count])=>({url,count})).sort((a,b)=> a.url.localeCompare(b.url));
  await fs.mkdir('reports', { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify({ scanned: files.length, findings: results, summary }, null, 2)+'\n','utf8');
  const md = [
    '# NATS_URL Scan Report',
    '',
    `Scanned files: ${files.length}`,
    `Findings: ${results.length}`,
    '',
    '## Summary by URL',
  ];
  for(const s of summary){ md.push(`- ${s.url} (${s.count})`); }
  md.push('', '## Recommendation', '', '- Prefer `nats://localhost:4223` for local/dev; centralize config to avoid drift.');
  await fs.writeFile(OUT_MD, md.join('\n')+'\n','utf8');
  console.log('Wrote', OUT_JSON, 'and', OUT_MD);
}

main().catch(e=>{ console.error(e); process.exit(1); });
>>>>>>> origin/stream-d/supply-chain-guardrails
