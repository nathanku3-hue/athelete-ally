// Minimal fs/helpers with stable sort + IO utilities
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import fg from 'fast-glob';
import yaml from 'js-yaml';

export const readFile = (p: string) => fs.promises.readFile(p, 'utf8');
export const writeFile = (p: string, c: string) => fs.promises.writeFile(p, c, 'utf8');
export const exists = (p: string) =>
  fs.promises
    .access(p, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);

export const glob = (patterns: string | string[], options: fg.Options = {}) =>
  fg(patterns, { dot: true, ...options });

export function sortObjectKeys<T = any>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys) as any;
  if (obj && typeof obj === 'object') {
    const out: any = {};
    Object.keys(obj as any)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
      .forEach((k) => (out[k] = sortObjectKeys((obj as any)[k])));
    return out as T;
  }
  return obj;
}

export function readJSON<T = any>(p: string): Promise<T> {
  return readFile(p).then((x) => JSON.parse(x));
}
export async function writeJSONSorted(p: string, obj: any) {
  const sorted = sortObjectKeys(obj);
  const json = JSON.stringify(sorted, null, 2) + '\n';
  await writeFile(p, json);
}

export function readYAML<T = any>(p: string): Promise<T> {
  return readFile(p).then((x) => yaml.load(x) as any);
}
export async function writeYAMLSorted(p: string, obj: any) {
  const sorted = sortObjectKeys(obj);
  const y = yaml.dump(sorted, { sortKeys: true, lineWidth: 120, noRefs: true }) + '';
  await writeFile(p, y);
}

export function headerWithSources(title: string, sources: string[]): string {
  const lines = [
    `# DO NOT EDIT ? GENERATED: ${title}`,
    `# Sources:`,
    ...sources.map((s) => `#  - ${s}`),
    ``,
  ];
  return lines.join('\n');
}

export function repoRoot(...p: string[]): string {
  return path.join(process.cwd(), ...p);
}
