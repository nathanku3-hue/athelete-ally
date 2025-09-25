const fs = require('fs');
const path = 'jest.config.js';
let text = fs.readFileSync(path, 'utf8');
const frontNeedle = "displayName: 'frontend'";
const idxFront = text.indexOf(frontNeedle);
if (idxFront < 0) {
  console.error('frontend block not found');
  process.exit(1);
}
const tpipNeedle = 'testPathIgnorePatterns: [';
const idxTPIP = text.indexOf(tpipNeedle, idxFront);
if (idxTPIP < 0) {
  console.error('testPathIgnorePatterns not found');
  process.exit(1);
}
const start = idxTPIP + tpipNeedle.length;
const end = text.indexOf(']', start);
if (end < 0) {
  console.error('closing bracket not found');
  process.exit(1);
}
const block = text.slice(idxTPIP, end + 1);
const ignore1 = "'<rootDir>/apps/frontend/src/__tests__/api/.*'";
if (!block.includes(ignore1)) {
  const insertion = ",\n                " + ignore1;
  text = text.slice(0, end) + insertion + text.slice(end);
  fs.writeFileSync(path, text, 'utf8');
  console.log('Added api ignore');
} else {
  console.log('Already had api ignore');
}
