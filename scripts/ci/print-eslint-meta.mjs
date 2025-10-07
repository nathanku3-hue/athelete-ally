#!/usr/bin/env node
// Prints ESLint meta (versions and config hash) to both stdout and $GITHUB_STEP_SUMMARY
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function readJSON(pkgPath) {
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    return null;
  }
}

function findPkgJson(modName) {
  try {
    const p = require.resolve(path.join(modName, 'package.json'), { paths: [process.cwd()] });
    return p;
  } catch {
    return null;
  }
}

function getVersion(modName) {
  const pkg = findPkgJson(modName);
  if (!pkg) return null;
  const j = readJSON(pkg);
  return j?.version || null;
}

function hashFile(file) {
  try {
    const content = fs.readFileSync(file, 'utf8')
      .replace(/\r\n/g, '\n');
    const h = crypto.createHash('sha256').update(content, 'utf8').digest('hex');
    return h;
  } catch {
    return null;
  }
}

const meta = {
  eslint: getVersion('eslint'),
  plugins: {
    'eslint-plugin-import': getVersion('eslint-plugin-import'),
    'eslint-plugin-boundaries': getVersion('eslint-plugin-boundaries'),
    '@typescript-eslint/eslint-plugin': getVersion('@typescript-eslint/eslint-plugin'),
    '@typescript-eslint/parser': getVersion('@typescript-eslint/parser'),
    'eslint-config-next': getVersion('eslint-config-next'),
  },
  configHash: hashFile(path.join(process.cwd(), 'eslint.config.mjs')),
};

const lines = [
  'ESLint Meta:',
  `- eslint: ${meta.eslint ?? 'unknown'}`,
  `- plugins/import: ${meta.plugins['eslint-plugin-import'] ?? 'missing'}`,
  `- plugins/boundaries: ${meta.plugins['eslint-plugin-boundaries'] ?? 'missing'}`,
  `- plugins/@typescript-eslint: ${meta.plugins['@typescript-eslint/eslint-plugin'] ?? 'missing'}`,
  `- parser/@typescript-eslint: ${meta.plugins['@typescript-eslint/parser'] ?? 'missing'}`,
  `- config: eslint.config.mjs sha256=${meta.configHash ?? 'n/a'}`,
];

const summary = lines.join('\n');
console.log(summary);

if (process.env.GITHUB_STEP_SUMMARY) {
  try {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  } catch {}
}
