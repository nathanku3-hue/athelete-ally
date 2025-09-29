const fs = require('fs');
const file = '.github/workflows/deploy.yml';
let s = fs.readFileSync(file, 'utf8');
// 1) add id-token: write under permissions
s = s.replace(/(^permissions:\n[\s\S]*?packages:\s*write\n)(?![\s\S]*?id-token:\s*write)/m, `$1  id-token: write\n`);
// 2) add PAT fallback login before GHCR login
if (!s.includes('Log in to GHCR with PAT (fallback)')) {
  const pat = [
    '- name: Log in to GHCR with PAT (fallback)',
    "        if: env.REGISTRY == 'ghcr.io' && secrets.GHCR_TOKEN != ''",
    '        uses: docker/login-action@v3',
    '        with:',
    '          registry: ghcr.io',
    '          username: ${{ github.actor }}',
    '          password: ${{ secrets.GHCR_TOKEN }}',
    ''
  ].join('\n');
  s = s.replace(/- name: Log in to GHCR\n\s+if: env.REGISTRY == 'ghcr.io'[\s\S]*?password: \$\{\{ secrets.GITHUB_TOKEN \}\}[\s\S]*?\n\s*\n/m, (m)=> pat + m);
}
// 3) fix tags to safe sha-
s = s.replace(/type=sha,prefix=\{\{branch\}\}-/g, 'type=sha,format=short,prefix=sha-');
// 4) gate push to non-PR
s = s.replace(/(uses: docker\/build-push-action@v5[\s\S]*?\n\s*push:\s*)true/m, "$1\${{ github.event_name != 'pull_request' }}");
fs.writeFileSync(file, s);
console.log('deploy.yml patched');