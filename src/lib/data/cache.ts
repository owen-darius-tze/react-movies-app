/**
 * localStorage cache for source data.
 * Each source gets a keyed entry: content + fetchedAt + ttl.
 * Stale-while-revalidate pattern: serve cache immediately, refresh in background.
 */

import type { ContentItem, SourceId } from './types';

const CACHE_PREFIX = 'microfilm:feed-cache:';

export interface CacheEntry<T = ContentItem[]> {
  data: T;
  fetchedAt: string; // ISO timestamp
  ttlMinutes: number;
}

function cacheKey(sourceId: SourceId): string {
  return `${CACHE_PREFIX}${sourceId}`;
}

/** Check if a cache entry is still fresh */
function isFresh(entry: CacheEntry, ttlMinutes: number): boolean {
  const ageMs = Date.now() - new Date(entry.fetchedAt).getTime();
  return ageMs < ttlMinutes * 60 * 1000;
}

/** Read cache for a source; returns null if missing or expired */
export function readCache(sourceId: SourceId, ttlMinutes: number): ContentItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(sourceId));
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (!isFresh(entry, ttlMinutes)) return null;
    return entry.data;
  } catch {
    return null;
  }
}

/** Write cache for a source */
export function writeCache(sourceId: SourceId, data: ContentItem[], ttlMinutes: number): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry = {
      data,
      fetchedAt: new Date().toISOString(),
      ttlMinutes,
    };
    window.localStorage.setItem(cacheKey(sourceId), JSON.stringify(entry));
  } catch {
    // Ignore quota/serialization errors
  }
}

/** Read cache regardless of freshness (for stale-while-revalidate) */
export function readStaleCache(sourceId: SourceId): ContentItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(sourceId));
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

/** Get cache metadata without data */
export function getCacheMeta(sourceId: SourceId): { fetchedAt: string | null; ttlMinutes: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(sourceId));
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    return { fetchedAt: entry.fetchedAt, ttlMinutes: entry.ttlMinutes };
  } catch {
    return null;
  }
}

/** Clear cache for a specific source */
export function clearCache(sourceId: SourceId): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(cacheKey(sourceId));
}

/** Clear all feed caches */
export function clearAllCaches(): void {
  if (typeof window === 'undefined') return;
  Object.keys(window.localStorage).forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      window.localStorage.removeItem(key);
    }
  });
}

/** Refresh a source in background: fetch fresh, write cache, return new data */
export async function refreshSource(
  sourceId: SourceId,
  fetchFn: () => Promise<ContentItem[]>,
  ttlMinutes: number
): Promise<ContentItem[]> {
  try {
    const fresh = await fetchFn();
    writeCache(sourceId, fresh, ttlMinutes);
    return fresh;
  } catch {
    // On error, return stale cache if available
    return readStaleCache(sourceId) ?? [];
  }
}