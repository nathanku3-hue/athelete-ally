#!/usr/bin/env tsx
/**
 * Stream 5 - Movement Library Seeding Script
 * 
 * Seeds the planning-engine database with foundational movements.
 * Uses the movement import CLI to load data from JSON.
 * 
 * Usage:
 *   npm run seed:movements
 * 
 * Environment:
 *   PLANNING_DATABASE_URL - Postgres connection string for planning-engine
 *   SEED_MOVEMENTS_FILE - Path to movements JSON file (default: placeholder data)
 *   SEED_MOVEMENTS_UPDATE - Set to "true" to enable updates on re-run (default: true)
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const servicesDir = path.join(rootDir, 'services', 'planning-engine');

// Basic argv parsing for --dsn and --file
const argv = process.argv.slice(2);
const getArg = (name: string): string | undefined => {
  const prefixed = argv.find((a) => a.startsWith(`${name}=`));
  if (prefixed) return prefixed.split('=').slice(1).join('=');
  const idx = argv.indexOf(name);
  return idx >= 0 ? argv[idx + 1] : undefined;
};

const overrideDsn = getArg('--dsn');
const overrideFile = getArg('--file');
if (overrideDsn) {
  process.env.PLANNING_DATABASE_URL = overrideDsn;
}
if (overrideFile) {
  process.env.SEED_MOVEMENTS_FILE = overrideFile;
}

// Configuration
const movementsFile = process.env.SEED_MOVEMENTS_FILE ||
  path.join(servicesDir, 'data', 'movements-placeholder.json');
const enableUpdate = process.env.SEED_MOVEMENTS_UPDATE !== 'false'; // Default to true
const actorId = process.env.CURATION_ACTOR_ID || 'seed-script';
const actorEmail = process.env.CURATION_ACTOR_EMAIL || 'seed@athlete-ally.internal';

// Verify database URL is set
if (!process.env.PLANNING_DATABASE_URL) {
  console.error('❌ Error: PLANNING_DATABASE_URL environment variable is not set');
  console.error('');
  console.error('Use one of:');
  console.error('  • Set env:   PLANNING_DATABASE_URL=postgresql://user:pass@host:port/db');
  console.error('  • CLI flag:  npm run seed:movements -- --dsn=postgresql://user:pass@host:port/db');
  console.error('');
  console.error('For local testing, start Postgres with:');
  console.error('  npm run infra:up');
  process.exit(1);
}

const maskedDsn = (dsn: string) => dsn.replace(/:[^:@]+@/, ':****@');

console.log('═══════════════════════════════════════════════════════════');
console.log('  Stream 5 - Movement Library Seeding');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log(`📁 Data file:     ${path.relative(rootDir, movementsFile)}`);
console.log(`🗄️  Database:      ${maskedDsn(process.env.PLANNING_DATABASE_URL)}`);
console.log(`👤 Actor:         ${actorEmail} (${actorId})`);
console.log(`🔄 Update mode:   ${enableUpdate ? 'enabled' : 'disabled'}`);
console.log('');

try {
  // Build the import command
  const importCliPath = path.join(servicesDir, 'src', 'curation', 'import-cli.ts');

  const args = [
    'tsx',
    importCliPath,
    '--file', movementsFile,
    '--format', 'json',
    '--actor-id', actorId,
    '--actor-email', actorEmail,
    '--publish', // Auto-publish for seeding
  ];

  if (enableUpdate) {
    args.push('--update');
  }

  console.log('🚀 Starting movement import...');
  console.log('');

  // Execute the import CLI
  const command = args.join(' ');
  execSync(command, {
    cwd: servicesDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      // Ensure the planning-engine can find its Prisma client
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
  });

  console.log('');
  console.log('✅ Movement seeding completed successfully');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Verify movements in database:');
  console.log('     SELECT COUNT(*) FROM movement_library;');
  console.log('  2. Run seed again to test update behavior:');
  console.log('     npm run seed:movements');
  console.log('  3. Proceed with Stream 5 scoring implementation');
  console.log('');

} catch (error) {
  console.error('');
  console.error('❌ Movement seeding failed');
  console.error('');

  if (error instanceof Error) {
    console.error('Error:', error.message);
  }

  console.error('');
  console.error('Troubleshooting:');
  console.error('  • Verify PLANNING_DATABASE_URL (or --dsn) is correct');
  console.error('  • Ensure Postgres is running (npm run infra:up)');
  console.error('  • Check that Prisma schema is migrated');
  console.error('  • Review movement data JSON format');
  console.error('');

  process.exit(1);
}
