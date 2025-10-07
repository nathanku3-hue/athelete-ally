const fs = require('fs');
const file = '.github/workflows/ci.yml';
let s = fs.readFileSync(file, 'utf8');
// Insert Dockerfile validation and dry build before preview push
s = s.replace(/(\n\s+- name: Build and push preview images\n[\s\S]*?uses: docker\/build-push-action@v5\n)/, (m) => {
  const ins = `\n      - name: Validate Dockerfile formatting\n        run: |\n          echo \"Dockerfile lines: $(awk 'END{print NR}' Dockerfile)\"\n          head -n 20 Dockerfile || true\n          echo \"Hex (first 160 bytes):\"\n          hexdump -C Dockerfile | head -n 10 || true\n\n      - name: Dry build (no push)\n        run: |\n          docker build --progress=plain -f Dockerfile .\n`;
  return ins + m;
});
fs.writeFileSync(file, s);
console.log('Inserted Dockerfile validation + dry build into ci.yml preview job');