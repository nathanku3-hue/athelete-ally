#!/usr/bin/env node
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