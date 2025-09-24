// Simple artifact aggregator for v3 workflow
// Scans test-results/* (downloaded artifacts) and produces test-results/report.html
const fs = require('fs');
const path = require('path');

// 确保脚本在正确的工作目录中运行
const scriptDir = __dirname;
const projectRoot = path.resolve(scriptDir, '..');
process.chdir(projectRoot);

console.log('Current working directory:', process.cwd());
console.log('Script directory:', scriptDir);
console.log('Project root:', projectRoot);

const root = path.resolve('test-results');
console.log('Looking for test-results directory at:', root);

if (!fs.existsSync(root)) {
  console.log('No test-results/ directory found, creating one...');
  fs.mkdirSync(root, { recursive: true });
  
  // 创建一个基本的测试报告
  const html = `
<!doctype html>
<meta charset="utf-8">
<title>Test Report</title>
<h1>Test Artifacts</h1>
<p>No test artifacts found. This is normal for CI environments without test artifacts.</p>
<p>Generated at: ${new Date().toISOString()}</p>
  `;
  
  fs.writeFileSync(path.join(root, 'report.html'), html);
  console.log('Created basic test-results/report.html');
  process.exit(0);
}

const entries = fs.readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory());
let html = '<!doctype html><meta charset="utf-8"><title>Test Report</title><h1>Test Artifacts</h1>';
html += `<p>Generated at: ${new Date().toISOString()}</p>`;

if (entries.length === 0) {
  html += '<p>No test artifact directories found.</p>';
} else {
  for (const dirent of entries) {
    const dir = dirent.name;
    html += '<h2>' + dir + '</h2><ul>';
    const files = fs.readdirSync(path.join(root, dir));
    for (const f of files) html += '<li>' + f + '</li>';
    html += '</ul>';
  }
}

fs.writeFileSync(path.join(root, 'report.html'), html);
console.log('Wrote test-results/report.html');
