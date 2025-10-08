#!/usr/bin/env node
import fs from 'node:fs/promises';
import { runEslint, partitionPilot, deltaNew, loadAllowPatternsSync, getChangedFiles } from './boundaries-lib.mjs';

// Check if boundaries are frozen (enforcement mode)
const frozenLockFile = '.boundaries-frozen.lock';
const isFrozen = await fs.access(frozenLockFile).then(() => true).catch(() => false);

if (!isFrozen) {
  console.log('Boundaries not frozen - skipping enforcement');
  process.exit(0);
}

console.log('Boundaries frozen - enforcing zero new violations');

const changed = getChangedFiles();
const globs = changed.length ? changed : ['**/*.{ts,tsx,js,jsx}'];
const results = await runEslint(globs);
const { pilot } = partitionPilot(results);

// Load baseline and allowlist
const baseline = JSON.parse(await fs.readFile('ci/boundaries-baseline.json', 'utf8').catch(()=>'{"items": {"pilot":[],"nonPilot":[]},"totals":{"pilot":{"total":0,"byRule":{}},"overall":{"total":0,"byRule":{}}}}'));
const allowPatterns = loadAllowPatternsSync();

const newPilot = deltaNew(pilot, baseline.items?.pilot || [], allowPatterns);

if (newPilot.length > 0) {
  console.error(`❌ Found ${newPilot.length} new boundary violations:`);
  for (const item of newPilot) {
    console.error(`  ${item.filePath}:${item.line}:${item.column} - ${item.ruleId}: ${item.message}`);
  }
  process.exit(1);
} else {
  console.log('✅ No new boundary violations found');
  process.exit(0);
}
