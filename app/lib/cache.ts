// Simple in-memory TTL cache for server-side data (products, etc.)
interface CacheEntry<T> { data: T; expiresAt: number }
const mem = new Map<string, CacheEntry<unknown>>();

export const serverCache = {
  get<T>(key: string): T | null {
    const e = mem.get(key);
    if (!e) return null;
    if (Date.now() > e.expiresAt) { mem.delete(key); return null; }
    return e.data as T;
  },
  set<T>(key: string, data: T, ttlMs = 5 * 60_000): void {
    mem.set(key, { data, expiresAt: Date.now() + ttlMs });
  },
  del(key: string) { mem.delete(key); },
  clear(prefix?: string) {
    if (!prefix) { mem.clear(); return; }
    for (const k of mem.keys()) if (k.startsWith(prefix)) mem.delete(k);
  },
};
