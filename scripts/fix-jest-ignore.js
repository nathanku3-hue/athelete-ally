const fs = require('fs');
const path = 'jest.config.js';
let text = fs.readFileSync(path, 'utf8');
text = text.replace("'<rootDir>/apps/frontend/tests/**'", "'<rootDir>/apps/frontend/tests/.*'");
fs.writeFileSync(path, text, 'utf8');
console.log('Replaced glob with regex');
