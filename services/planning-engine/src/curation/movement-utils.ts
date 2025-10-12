const slugUnsafeCharacters = /[^a-z0-9]+/g;
const slugEdgeHyphen = /^-+|-+$/g;

export const toMovementSlug = (value: string) => {
  const base = value
    .toLowerCase()
    .trim()
    .replace(slugUnsafeCharacters, '-')
    .replace(slugEdgeHyphen, '');

  return base || 'movement';
};

export const normalizeStringList = (values?: string[]) => {
  if (!values) return [];

  const seen = new Map<string, string>();
  for (const raw of values) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, trimmed);
    }
  }

  return Array.from(seen.values());
};
