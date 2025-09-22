// Simple artifact aggregator for v3 workflow
// Scans test-results/* (downloaded artifacts) and produces test-results/report.html
const fs = require('fs');
const path = require('path');
const root = path.resolve('test-results');
if (!fs.existsSync(root)) {
  console.error('No test-results/ directory found');
  process.exit(1);
}
const entries = fs.readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory());
let html = '<!doctype html><meta charset="utf-8"><title>Test Report</title><h1>Test Artifacts</h1>';
for (const dirent of entries) {
  const dir = dirent.name;
  html += '<h2>' + dir + '</h2><ul>';
  const files = fs.readdirSync(path.join(root, dir));
  for (const f of files) html += '<li>' + f + '</li>';
  html += '</ul>';
}
fs.writeFileSync(path.join(root, 'report.html'), html);
console.log('Wrote test-results/report.html');
