#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { runEslint, partitionPilot, deltaNew, groupByRule, getConfigHash, getVersions, loadAllowPatternsSync, getChangedFiles } from './boundaries-lib.mjs';

const changed = getChangedFiles();
const globs = changed.length ? changed : ['**/*.{ts,tsx,js,jsx}'];
const results = await runEslint(globs);
const { pilot, nonPilot } = partitionPilot(results);

// Load baseline and allowlist
const baseline = JSON.parse(await fs.readFile('ci/boundaries-baseline.json', 'utf8').catch(()=>'{"items": {"pilot":[],"nonPilot":[]},"totals":{"pilot":{"total":0,"byRule":{}},"overall":{"total":0,"byRule":{}}}}'));
const allowPatterns = loadAllowPatternsSync();

const newPilot = deltaNew(pilot, baseline.items?.pilot || [], allowPatterns);

const configHash = await getConfigHash();
const versions = await getVersions();

// Compose Step Summary
const T = pilot.length;
const B = baseline.totals?.pilot?.total ?? 0;
const N = newPilot.length;
const line1 = `Boundaries (pilot): +${N} new / ${T} total (baseline ${B})`;
const line2 = `Config ${configHash} (${process.env.ESLINT_CONFIG_FILE || "eslint.config.unified.mjs"})  Node ${versions.node}  ESLint ${versions.eslint}  boundaries ${versions.boundaries}`;

const summaryOut = [line1, '', line2].join('\n');

if (process.env.GITHUB_STEP_SUMMARY) {
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summaryOut + '\n');
} else {
  console.log(summaryOut);
}

// Artifact data (sanitized)
const artifact = {
  meta: { configHash, versions, changedFiles: changed },
  summary: { new: N, total: T, baseline: B, byRule: groupByRule(pilot) },
  pilot: newPilot.map(i => ({ filePath: i.filePath, ruleId: i.ruleId, message: i.message })),
  nonPilotSummary: { total: nonPilot.length, byRule: groupByRule(nonPilot) }
};

await fs.writeFile('boundaries-report.json', JSON.stringify(artifact, null, 2) + '\n', 'utf8');

// Exit code remains 0 here (non-blocking), enforcement handled separately

