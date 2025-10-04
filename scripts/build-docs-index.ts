import { glob, readFile, writeFile, headerWithSources } from './lib/fs';

function parseFrontmatter(md: string): { id?: string; title?: string } {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = m[1];
  const id = fm.match(/\nid:\s*([^\n\r]+)/)?.[1]?.trim();
  const title = fm.match(/\ntitle:\s*([^\n\r]+)/)?.[1]?.trim();
  return { id, title } as any;
}

async function build() {
  const sources = await glob('docs/streams/**/!(*index).md');

  // Per-stream index sections
  const perStream = new Map<string, { title: string; file: string }[]>();
  for (const p of sources.sort()) {
    const md = await readFile(p);
    const { id, title } = parseFrontmatter(md);
    const stream = p.split('/')[2]; // docs/streams/<stream>/file
    if (!perStream.has(stream)) perStream.set(stream, []);
    perStream.get(stream)!.push({ title: title || p, file: p });
  }

  const header = headerWithSources('Docs Index (docs/README.md)', sources);
  let readme = header + '\n\n';
  readme += '# Documentation Index\n\n';
  for (const [stream, items] of Array.from(perStream.entries()).sort()) {
    readme += `## Stream ${stream}\n\n`;
    for (const it of items) readme += `- ${it.title} (${it.file})\n`;
    readme += '\n';
  }
  await writeFile('docs/README.md', readme);

  const rbHeader = headerWithSources('Runbook Index (docs/runbook/index.md)', sources);
  let runbook = rbHeader + '\n\n# Runbook Index\n\n';
  for (const [stream, items] of Array.from(perStream.entries()).sort()) {
    runbook += `## ${stream}\n\n`;
    for (const it of items) runbook += `- ${it.title} (${it.file})\n`;
    runbook += '\n';
  }
  await writeFile('docs/runbook/index.md', runbook);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
