const fs = require('fs');
const file = '.github/workflows/ci.yml';
let s = fs.readFileSync(file, 'utf8');
// 1) top-level permissions: add packages/id-token
s = s.replace(/(^permissions:\n)([\s\S]*?)(?=\nenv:\n)/m, (m, p1, p2) => {
  if (/packages:\s*write/.test(m) && /id-token:\s*write/.test(m)) return m; 
  // Preserve existing lines
  const kept = p2.split('\n').filter(l => l.trim() !== '').map(l => l).join('\n');
  return p1 + '  contents: read\n  packages: write\n  id-token: write\n' + kept + '\n';
});
// 2) docker job env additions
s = s.replace(/(^\s{2}docker:\n[\s\S]*?runs-on: ubuntu-latest\n)(\s{4}steps:)/m, (m, hdr, steps) => {
  if (/^\s{4}env:\s*\n\s{6}REGISTRY:/.test(hdr)) return m; // already has env
  return hdr + '    env:\n      REGISTRY: ghcr.io\n      IMAGE_NAME: ${{ github.repository }}\n' + steps;
});
// 3) login fallback for GHCR PAT (insert before existing ghcr login)
if (!s.includes('Log in to GHCR with PAT (fallback)')) {
  const patBlock = [
    "- name: Log in to GHCR with PAT (fallback)",
    "        if: env.REGISTRY == 'ghcr.io' && secrets.GHCR_TOKEN != ''",
    "        uses: docker/login-action@v3",
    "        with:",
    "          registry: ghcr.io",
    "          username: ${{ github.actor }}",
    "          password: ${{ secrets.GHCR_TOKEN }}",
    ""
  ].join('\n');
  s = s.replace(/- name: Log in to GHCR\n\s+if: env.REGISTRY == 'ghcr.io'[\s\S]*?password: \$\{\{ secrets.GITHUB_TOKEN \}\}[\s\S]*?\n\s*\n/m, (m) => patBlock + m);
}
// 4) safe tags in docker job metadata-action
s = s.replace(/type=sha,[^\n]*/g, 'type=sha,format=short,prefix=sha-');
// 5) gate push in docker job build-push-action
s = s.replace(/(uses: docker\/build-push-action@v5[\s\S]*?\n\s{10}push: )true/m, "$1\${{ github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository }}");
// 6) gate push in preview job build-push-action
s = s.replace(/(name: Build and push preview images[\s\S]*?\n\s{10}push: )true/m, "$1\${{ github.event.pull_request.head.repo.full_name == github.repository }}");
fs.writeFileSync(file, s);
console.log('ci.yml patched for permissions, docker push gating, and safe tags');