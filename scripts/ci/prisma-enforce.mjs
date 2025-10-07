#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function listServiceDirs(root) {
  const dir = path.join(root, 'services');
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => path.join(dir, d.name));
  } catch { return []; }
}

function hasPrismaSchema(svcDir) {
  return fs.existsSync(path.join(svcDir, 'prisma', 'schema.prisma'));
}

function readPkgJson(dir) {
  const p = path.join(dir, 'package.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function scriptRunsGenerate(cmd) {
  if (!cmd) return false;
  return /prisma\s+generate/.test(cmd) || /npm\s+run\s+prisma:generate/.test(cmd) || /pnpm\s+prisma\s+generate/.test(cmd);
}

const root = process.cwd();
const services = listServiceDirs(root);
const offenders = [];

for (const svc of services) {
  if (!hasPrismaSchema(svc)) continue;
  const pkg = readPkgJson(svc);
  if (!pkg) { offenders.push({ service: svc, reason: 'missing package.json' }); continue; }
  const scripts = pkg.scripts || {};
  const ok = {
    prismaGenerate: typeof scripts['prisma:generate'] === 'string' && scriptRunsGenerate(scripts['prisma:generate']),
    prebuild: typeof scripts['prebuild'] === 'string' && scriptRunsGenerate(scripts['prebuild']),
    predev: typeof scripts['predev'] === 'string' && scriptRunsGenerate(scripts['predev']),
  };
  if (!ok.prismaGenerate || !ok.prebuild || !ok.predev) {
    offenders.push({ service: svc, ok });
  }
}

if (offenders.length) {
  console.log('Prisma enforcement failed for services:');
  for (const o of offenders) {
    console.log(`- ${o.service}:`, JSON.stringify(o.ok || o.reason));
  }
  process.exit(1);
}

console.log('All Prisma-enabled services have required scripts.');

