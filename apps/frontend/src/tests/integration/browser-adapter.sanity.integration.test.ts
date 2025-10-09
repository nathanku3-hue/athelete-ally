import fs from 'fs';
import path from 'path';

describe('browser adapter sanity', () => {
  it('does not import Node core modules', () => {
    const p = path.join(process.cwd(), 'packages', 'logger', 'src', 'adapters', 'browser.ts');
    const src = fs.readFileSync(p, 'utf8');
    const forbidden = ['"fs"', '"path"', '"net"', '"tls"', '"http"', '"https"', '"child_process"'];
    for (const token of forbidden) {
      expect(src.includes(`import ${token}`) || src.includes(`from ${token}`)).toBe(false);
    }
  });
});
