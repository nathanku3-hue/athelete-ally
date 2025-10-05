#!/usr/bin/env node
/**
 * Non-blocking client bundle scanner.
 * - Scans built assets (apps/frontend/.next) for server-only/telemetry code
 * - Falls back to source import scan when build artifacts are absent
 * - Always exits 0; prints findings to stdout (CI can upload as artifact)
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'apps', 'frontend');
const NEXT_DIR = path.join(APP_DIR, '.next');
const STATIC_DIR = path.join(NEXT_DIR, 'static');

/** simple recursive walk */
function* walk(dir, filter = () => true) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full, filter);
    } else if (filter(full)) {
      yield full;
    }
  }
}

function scanBuiltAssets() {
  const issues = [];
  for (const file of walk(STATIC_DIR, f => f.endsWith('.js'))) {
    const rel = path.relative(ROOT, file);
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('recordLegacyMapping') || content.includes('contractTelemetry')) {
      issues.push();
    }
    if (content.includes('server-only') || content.includes('process.env') && content.includes('METRICS_API_KEY')) {
      issues.push();
    }
  }
  return issues;
}

function scanSourceImports() {
  const issues = [];
  const SRC_DIR = path.join(APP_DIR, 'src');
  for (const file of walk(SRC_DIR, f => /\.(tsx?|jsx?)$/.test(f))) {
    const rel = path.relative(ROOT, file);
    const content = fs.readFileSync(file, 'utf8');
    // Heuristics: server-only wrappers or metrics adapter should not be imported in client components
    const isClient = /^\s*['"]use client['"];/.test(content);
    if (!isClient) continue;
    if (/shared-types\/(server-only|metrics-adapter|telemetry)/.test(content)) {
      issues.push();
    }
  }
  return issues;
}

function main() {
  const findings = [];
  if (fs.existsSync(NEXT_DIR)) {
    findings.push(...scanBuiltAssets());
  } else {
    findings.push('[info] .next not found; running source-only scan');
  }
  findings.push(...scanSourceImports());

  console.log('Client Bundle Scan Report');
  console.log('===========================');
  if (findings.length === 0) {
    console.log('No issues detected.');
  } else {
    findings.forEach(line => console.log());
  }
  // Always exit 0 (non-blocking)
  process.exit(0);
}

if (require.main === module) main();
