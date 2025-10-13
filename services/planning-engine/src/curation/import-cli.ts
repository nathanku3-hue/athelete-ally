#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';
import { MovementCurationService } from './movement-service.js';
import { MovementImportRunner, type ImportFormat } from './movement-import-runner.js';

const usage = `Movement Curation Import CLI

Usage:
  tsx src/curation/import-cli.ts --file ./movements.json [--format json|csv] [options]

Options:
  --file <path>           Path to CSV/JSON file containing movement data
  --format <format>       Input format (json or csv). Defaults to file extension
  --dry-run               Validate and preview actions without writing to the database
  --update                Permit updates when a draft/published movement already exists
  --submit                Automatically submit drafts for review after import
  --publish               Automatically approve + publish after import (implies --submit)
  --actor-id <id>         Actor id used for audit logging (default: import-script)
  --actor-email <email>   Actor email used for audit logging (default: import@athlete-ally.test)
  --help                  Show this message
`;

interface CliOptions {
  file?: string;
  format?: ImportFormat;
  dryRun?: boolean;
  updateExisting?: boolean;
  submit?: boolean;
  publish?: boolean;
  actorId?: string;
  actorEmail?: string;
}

const parseArgs = (argv: string[]): CliOptions => {
  const args = argv.slice(2);
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--file':
        options.file = args[i + 1];
        i += 1;
        break;
      case '--format':
        {
          const value = args[i + 1];
          if (value !== 'json' && value !== 'csv') {
            throw new Error(`Unsupported format: ${value}`);
          }
          options.format = value;
          i += 1;
        }
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--update':
        options.updateExisting = true;
        break;
      case '--submit':
        options.submit = true;
        break;
      case '--publish':
        options.publish = true;
        options.submit = true;
        break;
      case '--actor-id':
        options.actorId = args[i + 1];
        i += 1;
        break;
      case '--actor-email':
        options.actorEmail = args[i + 1];
        i += 1;
        break;
      case '--help':
      case '-h':
        console.log(usage);
        process.exit(0);
        break;
      default:
        if (arg.startsWith('-')) {
          throw new Error(`Unknown option: ${arg}`);
        }
        break;
    }
  }

  return options;
};

const detectFormat = (filePath: string, provided?: ImportFormat): ImportFormat => {
  if (provided) return provided;
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') return 'json';
  if (ext === '.csv') return 'csv';
  throw new Error('Unable to determine format from file extension. Please provide --format json|csv');
};

const formatPath = (filePath: string) => {
  const relative = path.relative(process.cwd(), filePath);
  return relative.startsWith('..') ? filePath : relative;
};

async function run() {
  try {
    const options = parseArgs(process.argv);
    if (!options.file) {
      console.error('Error: --file is required');
      console.log(usage);
      process.exit(1);
    }

    const format = detectFormat(options.file, options.format);
    const actor = {
      id: options.actorId ?? process.env.CURATION_ACTOR_ID ?? 'import-script',
      email: options.actorEmail ?? process.env.CURATION_ACTOR_EMAIL ?? 'import@athlete-ally.test',
      role: 'curator' as const,
    };

    const service = new MovementCurationService();
    const runner = new MovementImportRunner(service, actor, {
      dryRun: options.dryRun,
      submitForReview: options.submit,
      publishApproved: options.publish,
      updateExisting: options.updateExisting,
    });

    console.log(`Starting movement import from ${formatPath(options.file)} (format=${format})`);
    if (options.dryRun) {
      console.log('Dry run enabled. No database changes will be applied.');
    }

    const summary = await runner.import(options.file, format);

    console.log(`Processed ${summary.total} movements`);
    console.log(`  Created: ${summary.created}`);
    console.log(`  Updated: ${summary.updated}`);
    console.log(`  Skipped: ${summary.skipped}`);
    console.log(`  Errors: ${summary.errors}`);

    for (const item of summary.items) {
      const prefix = item.action.toUpperCase().padEnd(7);
      if (item.action === 'error') {
        console.error(`${prefix} ${item.slug} :: ${item.message ?? 'Unknown error'}`);
      } else if (item.message) {
        console.log(`${prefix} ${item.slug} :: ${item.message}`);
      } else {
        console.log(`${prefix} ${item.slug}`);
      }
    }

    if (summary.errors > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
