const RAW_BASE = import.meta.env.BASE_URL;
const BASE = RAW_BASE.endsWith('/') ? RAW_BASE : `${RAW_BASE}/`;

export function withBase(path: string): string {
  if (!path) return BASE;
  if (/^(https?:|mailto:|tel:|#)/i.test(path)) return path;
  const trimmed = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE}${trimmed}`;
}
