#!/usr/bin/env node
import fs from 'node:fs/promises';
import { runEslint, partitionPilot, deltaNew, loadAllowPatternsSync, getChangedFiles } from './boundaries-lib.mjs';

const hasFreeze = await fs.access('.boundaries-frozen.lock').then(()=>true).catch(()=>false);
if (!hasFreeze) {
  console.log('No freeze lock present (.boundaries-frozen.lock); enforcement skipped.');
  process.exit(0);
}

const changed = getChangedFiles();
const globs = changed.length ? changed : ['**/*.{ts,tsx,js,jsx}'];
const results = await runEslint(globs);
const { pilot } = partitionPilot(results);
const baseline = JSON.parse(await fs.readFile('.github/ci/boundaries-baseline.json', 'utf8').catch(()=>'{"items":{"pilot":[]}}'));
const allowPatterns = loadAllowPatternsSync();
const newPilot = deltaNew(pilot, baseline.items?.pilot || [], allowPatterns);

if (newPilot.length > 0) {
  console.error(`Found ${newPilot.length} new boundaries violations in pilot packages after freeze.`);
  // Fail the job
  process.exit(2);
} else {
  console.log('Zero new boundaries violations.');
}
