const fs = require('fs');
const path = require('path');

function fixCjsImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  files.forEach(f => {
    const filePath = path.join(dir, f.name);

    if (f.isDirectory()) {
      fixCjsImports(filePath);
    } else if (f.name.endsWith('.cjs')) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Replace require("./file.js") with require("./file.cjs")
      content = content.replace(/require\(["']\.\/([^"']+)\.js["']\)/g, 'require("./$1.cjs")');

      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports in: ${filePath}`);
    }
  });
}

fixCjsImports(path.join(__dirname, '..', 'dist'));
console.log('CJS import fixing complete!');
