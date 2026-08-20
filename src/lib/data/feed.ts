/**
 * Unified feed + search API.
 * Orchestrates adapters + cache to serve items with stale-while-revalidate.
 */

import type { ContentItem, SourceConfig, DataFilters, FeedResult } from './types';
import type { SourceId } from './types';
import { adapters } from './adapters';
import { sourceConfigs } from './seed';
import { readStaleCache, refreshSource, getCacheMeta } from './cache';

/** Merge default configs with persisted overrides */
function getEffectiveConfigs(): SourceConfig[] {
  if (typeof window === 'undefined') {
    return Object.values(sourceConfigs).map(c => ({
      id: c.id,
      label: c.label,
      state: 'enabled' as 'enabled' | 'disabled',
      ttlMinutes: c.ttlMinutes,
      fetchItems: adapters[c.id].fetchItems,
    }));
  }
  try {
    const saved = window.localStorage.getItem('microfilm:sources');
    const overrides = saved ? JSON.parse(saved) : {};
    return Object.values(sourceConfigs).map(c => ({
      id: c.id,
      label: c.label,
      state: (overrides[c.id]?.state ?? 'enabled') as 'enabled' | 'disabled',
      ttlMinutes: c.ttlMinutes,
      fetchItems: adapters[c.id].fetchItems,
    }));
  } catch {
    return Object.values(sourceConfigs).map(c => ({
      id: c.id,
      label: c.label,
      state: 'enabled' as 'enabled' | 'disabled',
      ttlMinutes: c.ttlMinutes,
      fetchItems: adapters[c.id].fetchItems,
    }));
  }
}

/** Persist source enable/disable state */
export function saveSourceState(sourceId: SourceId, state: 'enabled' | 'disabled'): void {
  if (typeof window === 'undefined') return;
  try {
    const saved = window.localStorage.getItem('microfilm:sources');
    const overrides = saved ? JSON.parse(saved) : {};
    overrides[sourceId] = { state };
    window.localStorage.setItem('microfilm:sources', JSON.stringify(overrides));
  } catch {
    // ignore
  }
}

/**
 * Main feed fetcher.
 * - Returns cached data immediately (stale-while-revalidate)
 * - Triggers background refresh for enabled sources
 * - Returns source status metadata
 */
let inFlightRefresh: Record<SourceId, Promise<ContentItem[]> | null> = {
  insider: null,
  rottenTomatoes: null,
  tmdb: null,
};

export async function getFeed(): Promise<FeedResult> {
  const configs = getEffectiveConfigs().filter(c => c.state === 'enabled');
  const allItems: ContentItem[] = [];
  const sourceStatuses: FeedResult['sources'] = [];

  for (const config of configs) {
    const adapter = adapters[config.id];
    const ttl = config.ttlMinutes ?? 30;

    // 1. Serve stale cache immediately
    const cached = readStaleCache(config.id);
    if (cached) {
      allItems.push(...cached);
      const meta = getCacheMeta(config.id);
      sourceStatuses.push({
        id: config.id,
        status: meta ? 'ok' : 'stale',
        lastFetchedAt: meta?.fetchedAt ?? null,
        itemCount: cached.length,
      });
    } else {
      sourceStatuses.push({
        id: config.id,
        status: 'ok',
        lastFetchedAt: null,
        itemCount: 0,
      });
    }

    // 2. Kick off background refresh (deduplicated)
    if (!inFlightRefresh[config.id]) {
      inFlightRefresh[config.id] = refreshSource(config.id, adapter.fetchItems, ttl)
        .then(fresh => {
          inFlightRefresh[config.id] = null;
          // Notify any listeners that fresh data arrived
          window.dispatchEvent(new CustomEvent('microfilm:feed-updated', { detail: { sourceId: config.id } }));
          return fresh;
        })
        .catch(() => {
          inFlightRefresh[config.id] = null;
          return [];
        });
    }
  }

  // Deduplicate by id (in case same content appears in multiple sources)
  const seen = new Set<string>();
  const deduped = allItems.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  return { items: deduped, sources: sourceStatuses };
}

/** Force refresh a specific source (user-initiated) */
export async function forceRefreshSource(sourceId: SourceId): Promise<ContentItem[]> {
  const config = getEffectiveConfigs().find(c => c.id === sourceId);
  if (!config) return [];
  inFlightRefresh[sourceId] = null; // allow new refresh
  return refreshSource(sourceId, config.fetchItems!, config.ttlMinutes ?? 30);
}

/**
 * Search & filter content items.
 * Runs client-side over the full aggregated feed.
 */
export function searchContent(items: ContentItem[], filters: DataFilters): ContentItem[] {
  const {
    query = '',
    source = 'all',
    kind = 'all',
    minRating,
    since,
    sort = 'newest',
  } = filters;

  let results = items;

  // Text query
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    results = results.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.genres.some(g => g.toLowerCase().includes(q)) ||
      item.cast?.some(c => c.toLowerCase().includes(q)) ||
      item.director?.toLowerCase().includes(q)
    );
  }

  // Source filter
  if (source !== 'all') {
    results = results.filter(item => item.source === source);
  }

  // Kind filter
  if (kind !== 'all') {
    results = results.filter(item => item.kind === kind);
  }

  // Minimum rating (normalize to 0-100)
  if (minRating !== undefined && minRating > 0) {
    results = results.filter(item => {
      if (!item.rating) return false;
      const critic = item.rating.critic ?? 0;
      const audience = item.rating.audience ?? 0;
      const imdb = (item.rating.imdb ?? 0) * 10; // normalize 0-10 to 0-100
      const best = Math.max(critic, audience, imdb);
      return best >= minRating;
    });
  }

  // Since date filter
  if (since) {
    const sinceMs = new Date(since).getTime();
    if (!isNaN(sinceMs)) {
      results = results.filter(item => new Date(item.publishedAt).getTime() >= sinceMs);
    }
  }

  // Sort
  switch (sort) {
    case 'newest':
      results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      break;
    case 'oldest':
      results.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
      break;
    case 'rating':
      results.sort((a, b) => {
        const aScore = a.rating ? Math.max(a.rating.critic ?? 0, a.rating.audience ?? 0, (a.rating.imdb ?? 0) * 10) : 0;
        const bScore = b.rating ? Math.max(b.rating.critic ?? 0, b.rating.audience ?? 0, (b.rating.imdb ?? 0) * 10) : 0;
        return bScore - aScore;
      });
      break;
    case 'relevance':
    default:
      // Already filtered by query relevance above; stable sort by date desc
      results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      break;
  }

  return results;
}

/** Get all unique genres from the feed */
export function getAllGenres(items: ContentItem[]): string[] {
  const set = new Set<string>();
  items.forEach(item => item.genres.forEach(g => set.add(g)));
  return Array.from(set).sort();
}

/** Get all unique sources from the feed */
export function getAllSources(items: ContentItem[]): SourceId[] {
  const set = new Set<SourceId>();
  items.forEach(item => set.add(item.source));
  return Array.from(set);
}