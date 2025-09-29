#!/usr/bin/env node
/*
 Tsconfig Drift Guard
 - Ensures services/* and packages/* tsconfig.json extend the central base and set baseUrl to repo root.
 - Fails with a clear message listing offenders.
*/
const fs = require('fs');
const path = require('path');

function stripJsonComments(s){
  return s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|\s)\/\/.*$/gm,'');
}

function readJson(file){
  try { const raw = fs.readFileSync(file,'utf8'); return JSON.parse(stripJsonComments(raw)); } catch(e){ return null; }
}

const repoRoot = process.cwd();
const expectedExtends = path.posix.join('..','..','config','typescript','tsconfig.base.json');
const expectedBaseUrl = path.posix.join('..','..');

function gatherTsconfigs(){
  const globs = ['services','packages'];
  const found = [];
  for (const top of globs){
    const topDir = path.join(repoRoot, top);
    if (!fs.existsSync(topDir)) continue;
    for (const entry of fs.readdirSync(topDir)){
      const dir = path.join(topDir, entry);
      if (!fs.statSync(dir).isDirectory()) continue;
      const tsconfig = path.join(dir, 'tsconfig.json');
      if (fs.existsSync(tsconfig)) found.push(tsconfig);
    }
  }
  return found;
}

const offenders = [];
for (const file of gatherTsconfigs()){
  const rel = path.relative(repoRoot, file).split(path.sep).join('/');
  const json = readJson(file);
  if (!json){ offenders.push({file: rel, reason: 'invalid JSON'}); continue; }
  const ext = json.extends;
  const baseUrl = json.compilerOptions && json.compilerOptions.baseUrl;
  if (ext !== expectedExtends){ offenders.push({file: rel, reason: 'extends != '+expectedExtends+' (got '+(ext||'undefined')+')'}); continue; }
  if (baseUrl !== expectedBaseUrl){ offenders.push({file: rel, reason: 'baseUrl != '+expectedBaseUrl+' (got '+(baseUrl||'undefined')+')'}); continue; }
}

if (offenders.length){
  console.error('Tsconfig drift detected in the following files:');
  for (const o of offenders){ console.error(' - '+o.file+': '+o.reason); }
  process.exit(1);
}
console.log('Tsconfig drift check: OK');
