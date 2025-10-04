const fs = require('fs');
const path = require('path');

const file = path.join('.github', 'workflows', 'ci.yml');
let text = fs.readFileSync(file, 'utf8');
const lines = text.split(/\r?\n/);

function addJobOutput(jobId) {
  // Find job header line index
  const headerIdx = lines.findIndex(l => l.match(new RegExp('^\\s{2}' + jobId + ':\\s*$')));
  if (headerIdx === -1) return false;
  // Find within job header until 'steps:' line at same or greater indent
  let insertAt = -1;
  let alreadyHasOutputs = false;
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s{4}outputs:\s*$/.test(line)) alreadyHasOutputs = true;
    if (/^\s{4}steps:\s*$/.test(line)) { insertAt = i; break; }
  }
  if (alreadyHasOutputs || insertAt === -1) return false;
  // Find a 'needs:' line position to place outputs right after it if possible
  let needsPos = -1;
  for (let i = headerIdx + 1; i < insertAt; i++) {
    if (/^\s{4}needs:/.test(lines[i])) { needsPos = i; break; }
  }
  const outBlock = [
    '    outputs:',
    "      has_artifacts: ${{ steps.results_meta.outputs.has_files }}",
  ];
  const pos = needsPos !== -1 ? needsPos + 1 : insertAt; // if no needs, insert before steps
  lines.splice(pos, 0, ...outBlock);
  return true;
}

function insertResultsMetaBeforeFirstUpload(startIdx) {
  // Find the first 'Upload test results' step from startIdx
  const markerRe = /^\s+- name: Upload test results\s*$/;
  const idx = lines.findIndex((l, i) => i >= startIdx && markerRe.test(l));
  if (idx === -1) return -1;
  // Check if there is already an id: results_meta within previous 10 lines
  const windowStart = Math.max(0, idx - 12);
  if (lines.slice(windowStart, idx).some(l => /id:\s+results_meta/.test(l))) {
    return idx + 1;
  }
  const step = [
    '      - name: Determine if test artifacts exist',
    '        id: results_meta',
    '        if: always()',
    '        run: |',
    '          set -euo pipefail',
    '          files=$( (ls -1 test-results 2>/dev/null || true) | wc -l )',
    '          cov=$( (find coverage -type f 2>/dev/null || true) | wc -l )',
    '          j=0; [ -f junit.xml ] && j=1 || j=0',
    '          if [ "$files" -gt 0 ] || [ "$cov" -gt 0 ] || [ "$j" -gt 0 ]; then',
    '            echo "has_files=true" >> $GITHUB_OUTPUT',
    '          else',
    '            echo "has_files=false" >> $GITHUB_OUTPUT',
    '          fi',
  ];
  lines.splice(idx, 0, ...step);
  return idx + step.length + 1;
}

function ensureIfNoFilesFoundForUploads() {
  for (let i = 0; i < lines.length; i++) {
    if (/^\s+- name: Upload test results\s*$/.test(lines[i])) {
      // scan next 12 lines for 'with:' and 'name:'
      for (let j = i + 1; j < Math.min(lines.length, i + 20); j++) {
        if (/^\s+with:\s*$/.test(lines[j])) {
          // after 'name:' insert if-no-files-found if not present in next 6 lines
          const nextBlock = lines.slice(j + 1, j + 10).join('\n');
          if (!/if-no-files-found:/.test(nextBlock)) {
            // find name line to capture indent
            for (let k = j + 1; k < Math.min(lines.length, j + 8); k++) {
              const m = lines[k].match(/^(\s+)name:\s*(.+)?$/);
              if (m) {
                const indent = m[1];
                lines.splice(k + 1, 0, indent + 'if-no-files-found: ignore');
                break;
              }
            }
          }
          break;
        }
      }
    }
  }
}

function guardDownloadsInTestReport() {
  for (let i = 0; i < lines.length; i++) {
    if (/^\s+- name: Download test artifacts\s*$/.test(lines[i])) {
      // insert an if: line below if not present
      if (!/^\s+if:/.test(lines[i+1] || '')) {
        lines.splice(i + 1, 0, "        if: ${{ needs.test.outputs.has_artifacts == 'true' }}");
      }
    }
    if (/^\s+- name: Download test artifacts \(mandatory\)\s*$/.test(lines[i])) {
      if (!/^\s+if:/.test(lines[i+1] || '')) {
        lines.splice(i + 1, 0, "        if: ${{ needs.test-mandatory.outputs.has_artifacts == 'true' }}");
      }
    }
  }
}

// Apply modifications
addJobOutput('test');
addJobOutput('test-mandatory');

// Insert meta steps before the first and second upload occurrences
let pos = insertResultsMetaBeforeFirstUpload(0);
if (pos !== -1) insertResultsMetaBeforeFirstUpload(pos);

ensureIfNoFilesFoundForUploads();

guardDownloadsInTestReport();

fs.writeFileSync(file, lines.join('\n'));
console.log('Patched .github/workflows/ci.yml');