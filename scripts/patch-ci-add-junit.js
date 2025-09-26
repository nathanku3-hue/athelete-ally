const fs = require('fs');
const path = require('path');
const file = path.join('.github','workflows','ci.yml');
let text = fs.readFileSync(file, 'utf8');
let lines = text.split(/\r?\n/);
function insertBefore(index, newLines){ lines.splice(index, 0, ...newLines); }
function insertEnvForStep(stepName, envLines){
  const idx = lines.findIndex(l => l.includes(`- name: ${stepName}`));
  if (idx === -1) return false;
  // If next non-empty line already starts with env:, skip
  if (/^\s+env:\s*$/.test(lines[idx+1]||'')) return false;
  const indent = (lines[idx].match(/^(\s*)/)||['',''])[1];
  insertBefore(idx+1, [
    `${indent}  env:`,
    ...envLines.map(l => `${indent}    ${l}`)
  ]);
  return true;
}
function appendReportersInRunBlock(startIdx, searchFrag){
  // find the run block starting at/after startIdx
  const runIdx = lines.findIndex((l,i)=> i>startIdx && /^\s+run:\s*\|\s*$/.test(l));
  if (runIdx === -1) return false;
  // find the command line containing searchFrag after runIdx
  const cmdIdx = lines.findIndex((l,i)=> i>runIdx && l.includes(searchFrag));
  if (cmdIdx === -1) return false;
  if (lines[cmdIdx].includes('--reporters=jest-junit')) return true; // already patched
  lines[cmdIdx] += ' -- --reporters=default --reporters=jest-junit';
  return true;
}
// 1) Ensure test-results dir step before services tests
{
  const idx = lines.findIndex(l => l.includes('- name: Run Services Tests (Known Good Path)'));
  if (idx !== -1) {
    const indent = (lines[idx].match(/^(\s*)/)||['',''])[1];
    // Only insert if not already present just above
    const prev = lines[idx-1]||'';
    if (!prev.includes('Ensure test-results dir (pre-tests)')) {
      insertBefore(idx, [
        `${indent}- name: Ensure test-results dir (pre-tests)`,
        `${indent}  run: mkdir -p test-results`
      ]);
    }
  }
}
// 2) Add env and reporters for services tests
insertEnvForStep('Run Services Tests (Known Good Path)', ['JEST_JUNIT_OUTPUT: test-results/junit-services.xml']);
appendReportersInRunBlock(lines.findIndex(l => l.includes('- name: Run Services Tests (Known Good Path)')), 'npm run test:services');
// 3) Add env and reporters for frontend tests
insertEnvForStep('Run Frontend Tests (Known Good Path)', ['JEST_JUNIT_OUTPUT: test-results/junit-frontend.xml']);
appendReportersInRunBlock(lines.findIndex(l => l.includes('- name: Run Frontend Tests (Known Good Path)')), 'npm run test:frontend');
// 4) Orchestrator (test-mandatory)
insertEnvForStep('Run tests via orchestrator (Non-Blocking)', ['JEST_JUNIT_OUTPUT: test-results/junit-mandatory.xml']);
{
  const idx = lines.findIndex(l => l.includes('- name: Run tests via orchestrator (Non-Blocking)'));
  if (idx !== -1) {
    const runBlockStart = lines.findIndex((l,i)=> i>idx && /^\s+run:\s*\|\s*$/.test(l));
    if (runBlockStart !== -1) {
      const jestLine = lines.findIndex((l,i)=> i>runBlockStart && l.includes('jest ') && l.includes('--passWithNoTests'));
      if (jestLine !== -1 && !lines[jestLine].includes('--reporters=jest-junit')) {
        lines[jestLine] += ' --reporters=default --reporters=jest-junit';
      }
    }
  }
}
fs.writeFileSync(file, lines.join('\n'));
console.log('Jest junit reporters wired into CI');