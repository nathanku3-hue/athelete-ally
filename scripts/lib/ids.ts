// Utilities for ID extraction and duplicate checks
import path from 'node:path';
import { readJSON, readYAML, glob } from './fs';

export type Shard = { id: string; path: string };

export async function collectIds(): Promise<Shard[]> {
  const shards: Shard[] = [];

  // docs shards: YAML frontmatter in Markdown (simple regex)
  for (const p of await glob('docs/streams/**/!(*index).md')) {
    const text = await (await import('node:fs/promises')).readFile(p, 'utf8');
    const m = text.match(/---[\s\S]*?id:\s*([^\n\r]+)[\s\S]*?---/i);
    if (m) shards.push({ id: m[1].trim(), path: p });
  }

  // openapi shards: x-id in YAML
  for (const p of await glob(['openapi/paths/**/*.y?(a)ml', 'openapi/components/**/*.y?(a)ml'])) {
    try {
      const y: any = await readYAML(p);
      if (y && typeof y === 'object' && y['x-id']) shards.push({ id: String(y['x-id']), path: p });
    } catch {}
  }

  // alerts: annotations.id in rules
  for (const p of await glob('monitoring/alert_rules.d/**/*.y?(a)ml')) {
    try {
      const y: any = await readYAML(p);
      const groups = Array.isArray(y?.groups) ? y.groups : [];
      for (const g of groups) {
        for (const r of Array.isArray(g?.rules) ? g.rules : []) {
          const id = r?.annotations?.id;
          if (id) shards.push({ id: String(id), path: p });
        }
      }
    } catch {}
  }

  // dashboards: tag 'id:<value>'
  for (const p of await glob('monitoring/grafana/dashboards/**/*.json')) {
    try {
      const j: any = await readJSON(p);
      const tag = (Array.isArray(j?.tags) ? j.tags : []).find(
        (t: string) => typeof t === 'string' && t.startsWith('id:')
      );
      if (tag) shards.push({ id: tag.slice(3), path: p });
    } catch {}
  }

  // registry fragments: JSON with id
  for (const p of await glob('registry/**/*.json')) {
    try {
      const j: any = await readJSON(p);
      if (j?.id) shards.push({ id: String(j.id), path: p });
    } catch {}
  }

  return shards;
}

export function findDuplicates(shards: Shard[]): Map<string, Shard[]> {
  const map = new Map<string, Shard[]>();
  for (const s of shards) {
    const list = map.get(s.id) || [];
    list.push(s);
    map.set(s.id, list);
  }
  const dups = new Map<string, Shard[]>();
  for (const [id, list] of map) if (list.length > 1) dups.set(id, list);
  return dups;
}

export function validateIdFormat(id: string): boolean {
  // {stream}-{domain}-{slug} (ASCII)
  return /^[A-Z0-9]+-[a-z]+-[A-Za-z0-9_-]+$/.test(id);
}
