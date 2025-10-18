#!/usr/bin/env tsx
/**
 * Scoring Contract Validation CLI
 * 
 * Validates scoring payloads from various sources against the contract.
 * 
 * Usage:
 *   npm run validate:scoring -- --sample   # Validate sample from contract
 *   npm run validate:scoring -- --file payloads.json
 *   npm run validate:scoring -- --integration  # Run integration tests and validate
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validateScoringPayload, validateScoringPayloads } from '../src/validation/scoring-validator.js';

// Sample payload from the contract
const SAMPLE_PAYLOAD = {
  version: 'fixed-weight-v1',
  total: 0.8906,
  weights: {
    safety: 0.6,
    compliance: 0.3,
    performance: 0.1,
  },
  factors: {
    safety: {
      score: 1,
      weight: 0.6,
      contribution: 0.6,
      reasons: [
        'Intensity distribution remains within safe thresholds',
        'Rest days allocated (2.0 per week)',
        'Deload structure present in 1 microcycle(s)',
      ],
      metrics: {
        deloadWeeks: 1,
        totalSessions: 5,
        averageRestDays: 2,
        highIntensityRatio: 0.2,
      },
    },
    compliance: {
      score: 0.7188,
      weight: 0.3,
      contribution: 0.2156,
      reasons: ['Plan schedules 2.5 sessions versus target 4'],
      metrics: {
        deviation: 1.5,
        weeklyGoalDays: 4,
        availabilityDays: 4,
        plannedWeeklySessions: 2.5,
      },
    },
    performance: {
      score: 0.75,
      weight: 0.1,
      contribution: 0.075,
      reasons: [
        'Progression phases detected (2) supporting long-term gains',
        'Intensity variety ensures balanced stimulus across the block',
        'Program duration supports sustained progression',
        'Microcycle structure present with defined sessions',
      ],
      metrics: {
        durationWeeks: 12,
        intensityVariety: 3,
        progressionPhases: 2,
      },
    },
  },
  metadata: {
    evaluatedAt: '2025-10-15T07:15:00.000Z',
    weeklySessionsPlanned: 2.5,
    weeklyGoalDays: 4,
    requestContext: {
      availabilityDays: 4,
      weeklyGoalDays: 4,
    },
  },
};

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('--sample')) {
    validateSample();
  } else if (args.includes('--file')) {
    const fileIndex = args.indexOf('--file');
    const filePath = args[fileIndex + 1];
    if (!filePath) {
      console.error('Error: --file requires a file path argument');
      process.exit(1);
    }
    validateFromFile(filePath);
  } else if (args.includes('--integration')) {
    console.log('Integration test validation not yet implemented');
    console.log('Use: npm run test:integration -- async-plan-generator.scoring.integration.test.ts');
    process.exit(0);
  } else {
    console.error('Error: Unknown arguments');
    printUsage();
    process.exit(1);
  }
}

function printUsage() {
  console.log(`
Scoring Contract Validation CLI

Usage:
  npm run validate:scoring -- [options]

Options:
  --sample          Validate the sample payload from the contract
  --file <path>     Validate payload(s) from a JSON file
  --integration     Run integration tests and validate scoring outputs
  --help, -h        Show this help message

Examples:
  npm run validate:scoring -- --sample
  npm run validate:scoring -- --file ./payloads.json
  npm run validate:scoring -- --integration

File Format:
  Single payload:
    { "version": "fixed-weight-v1", "total": 0.89, ... }
  
  Multiple payloads:
    [
      { "version": "fixed-weight-v1", ... },
      { "version": "fixed-weight-v1", ... }
    ]
  `);
}

function validateSample() {
  console.log('🔍 Validating sample payload from contract...\n');
  
  const result = validateScoringPayload(SAMPLE_PAYLOAD);
  
  printResult(result, 'Contract Sample Payload');
  
  if (result.valid) {
    console.log('\n✅ Contract sample payload is valid');
    process.exit(0);
  } else {
    console.log('\n❌ Contract sample payload is INVALID');
    process.exit(1);
  }
}

function validateFromFile(filePath: string) {
  console.log(`🔍 Validating payloads from file: ${filePath}\n`);
  
  try {
    const absolutePath = resolve(filePath);
    const content = readFileSync(absolutePath, 'utf-8');
    const data = JSON.parse(content);
    
    if (Array.isArray(data)) {
      // Multiple payloads
      const result = validateScoringPayloads(data);
      
      console.log(`📊 Validating ${result.summary.total} payload(s)...\n`);
      
      result.results.forEach((r, idx) => {
        printResult(r, `Payload ${idx}`);
        console.log('');
      });
      
      console.log('─'.repeat(60));
      console.log(`\n📈 Summary:`);
      console.log(`   Total:  ${result.summary.total}`);
      console.log(`   Passed: ${result.summary.passed} ✅`);
      console.log(`   Failed: ${result.summary.failed} ❌`);
      
      if (result.valid) {
        console.log('\n✅ All payloads are valid');
        process.exit(0);
      } else {
        console.log('\n❌ Some payloads are INVALID');
        process.exit(1);
      }
    } else {
      // Single payload
      const result = validateScoringPayload(data);
      printResult(result, filePath);
      
      if (result.valid) {
        console.log('\n✅ Payload is valid');
        process.exit(0);
      } else {
        console.log('\n❌ Payload is INVALID');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Error reading or parsing file:', error);
    process.exit(1);
  }
}

function printResult(result: { valid: boolean; errors: string[]; warnings: string[] }, label: string) {
  console.log(`${result.valid ? '✅' : '❌'} ${label}`);
  
  if (result.errors.length > 0) {
    console.log('\n  Errors:');
    result.errors.forEach(err => {
      console.log(`    ❌ ${err}`);
    });
  }
  
  if (result.warnings.length > 0) {
    console.log('\n  Warnings:');
    result.warnings.forEach(warn => {
      console.log(`    ⚠️  ${warn}`);
    });
  }
  
  if (result.valid && result.errors.length === 0 && result.warnings.length === 0) {
    console.log('  No issues found');
  }
}

main();
