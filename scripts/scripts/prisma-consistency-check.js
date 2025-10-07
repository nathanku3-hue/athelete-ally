#!/usr/bin/env node

/**
 * Prisma Schema/Import Consistency Checker
 * 
 * Ensures that services with custom Prisma output paths import from the correct location.
 * This prevents the "Prisma client did not initialize yet" error.
 * 
 * Usage: node scripts/prisma-consistency-check.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function findServicesWithPrisma() {
  const servicesDir = path.join(__dirname, '..', 'services');
  const services = [];
  
  try {
    const entries = fs.readdirSync(servicesDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const servicePath = path.join(servicesDir, entry.name);
        const prismaSchemaPath = path.join(servicePath, 'prisma', 'schema.prisma');
        
        if (fs.existsSync(prismaSchemaPath)) {
          services.push({
            name: entry.name,
            path: servicePath,
            schemaPath: prismaSchemaPath
          });
        }
      }
    }
  } catch (error) {
    log(colors.red, `Error reading services directory: ${error.message}`);
    process.exit(1);
  }
  
  return services;
}

function parsePrismaSchema(schemaPath) {
  try {
    const content = fs.readFileSync(schemaPath, 'utf8');
    const outputMatch = content.match(/output\s*=\s*["']([^"']+)["']/);
    
    return {
      hasCustomOutput: !!outputMatch,
      outputPath: outputMatch ? outputMatch[1] : null
    };
  } catch (error) {
    log(colors.red, `Error reading schema ${schemaPath}: ${error.message}`);
    return { hasCustomOutput: false, outputPath: null };
  }
}

function findPrismaImports(servicePath) {
  const imports = [];
  
  function scanDirectory(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
              const importMatch = line.match(/import\s+.*from\s+['"]([^'"]+)['"]/);
              if (importMatch && importMatch[1].includes('prisma')) {
                imports.push({
                  file: path.relative(servicePath, fullPath),
                  line: index + 1,
                  import: importMatch[1],
                  fullLine: line.trim()
                });
              }
            });
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  scanDirectory(servicePath);
  return imports;
}

function checkConsistency() {
  log(colors.blue, '🔍 Checking Prisma schema/import consistency...\n');
  
  const services = findServicesWithPrisma();
  let hasErrors = false;
  let totalServices = 0;
  let inconsistentServices = 0;
  
  for (const service of services) {
    totalServices++;
    log(colors.bold, `📁 Service: ${service.name}`);
    
    const schema = parsePrismaSchema(service.schemaPath);
    const imports = findPrismaImports(service.path);
    
    if (schema.hasCustomOutput) {
      log(colors.yellow, `  📄 Schema: Custom output to "${schema.outputPath}"`);
      
      // Check if imports match the custom output
      const expectedImportPath = `../prisma/${schema.outputPath}`;
      const hasCorrectImport = imports.some(imp => 
        imp.import.includes('prisma/generated/client') || 
        imp.import.includes(expectedImportPath)
      );
      const hasIncorrectImport = imports.some(imp => 
        imp.import === '@prisma/client'
      );
      
      if (hasIncorrectImport && !hasCorrectImport) {
        log(colors.red, `  ❌ INCONSISTENT: Imports from @prisma/client but schema uses custom output`);
        log(colors.red, `     Expected: import from "../prisma/${schema.outputPath}"`);
        log(colors.red, `     Found: import from "@prisma/client"`);
        
        imports.forEach(imp => {
          if (imp.import === '@prisma/client') {
            log(colors.red, `       ${imp.file}:${imp.line} - ${imp.fullLine}`);
          }
        });
        
        hasErrors = true;
        inconsistentServices++;
      } else if (hasCorrectImport) {
        log(colors.green, `  ✅ CONSISTENT: Imports match custom output path`);
      } else {
        log(colors.yellow, `  ⚠️  No Prisma imports found`);
      }
    } else {
      log(colors.green, `  📄 Schema: Default output (no custom path)`);
      
      const hasCorrectImport = imports.some(imp => imp.import === '@prisma/client');
      const hasIncorrectImport = imports.some(imp => 
        imp.import.includes('prisma/generated/client')
      );
      
      if (hasIncorrectImport && !hasCorrectImport) {
        log(colors.red, `  ❌ INCONSISTENT: Imports from custom path but schema uses default output`);
        log(colors.red, `     Expected: import from "@prisma/client"`);
        log(colors.red, `     Found: import from custom path`);
        
        imports.forEach(imp => {
          if (imp.import.includes('prisma/generated/client')) {
            log(colors.red, `       ${imp.file}:${imp.line} - ${imp.fullLine}`);
          }
        });
        
        hasErrors = true;
        inconsistentServices++;
      } else if (hasCorrectImport) {
        log(colors.green, `  ✅ CONSISTENT: Imports match default output`);
      } else {
        log(colors.yellow, `  ⚠️  No Prisma imports found`);
      }
    }
    
    if (imports.length > 0) {
      log(colors.blue, `  📦 Found ${imports.length} Prisma import(s):`);
      imports.forEach(imp => {
        log(colors.blue, `     ${imp.file}:${imp.line} - ${imp.import}`);
      });
    }
    
    console.log('');
  }
  
  // Summary
  log(colors.bold, '📊 Summary:');
  log(colors.blue, `  Total services with Prisma: ${totalServices}`);
  log(colors.green, `  Consistent services: ${totalServices - inconsistentServices}`);
  log(colors.red, `  Inconsistent services: ${inconsistentServices}`);
  
  if (hasErrors) {
    log(colors.red, '\n❌ Consistency check failed!');
    log(colors.yellow, '💡 Recommendation: Fix import paths to match schema output configuration.');
    process.exit(1);
  } else {
    log(colors.green, '\n✅ All services are consistent!');
    process.exit(0);
  }
}

// Run the check
if (require.main === module) {
  checkConsistency();
}

module.exports = { checkConsistency };
