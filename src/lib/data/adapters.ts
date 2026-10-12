/**
 * Pluggable source adapters.
 * Each adapter implements fetchItems() returning ContentItem[].
 * Currently backed by seed data; designed so live scrapers/APIs can be dropped in.
 */

import type { ContentItem, SourceId, SourceConfig } from './types';
import { seedItems } from './seed';

/** Adapter interface for any content source */
export interface SourceAdapter {
  id: SourceId;
  label: string;
  realTime: boolean; // false = seed only; true = live fetch
  fetchItems: () => Promise<ContentItem[]>;
}

/** Rotten Tomatoes adapter - top-rated / Certified Fresh movies from seed */
export const rottenTomatoesAdapter: SourceAdapter = {
  id: 'rottenTomatoes',
  label: 'Rotten Tomatoes',
  realTime: false,
  async fetchItems(): Promise<ContentItem[]> {
    console.log('[rottenTomatoesAdapter] fetchItems called, seedItems:', seedItems.length);
    // Simulate network delay for realistic loading states
    await new Promise(r => setTimeout(r, 300));
    const result = seedItems.filter(item =>
      item.source === 'rottenTomatoes' && item.kind === 'movie'
    );
    console.log('[rottenTomatoesAdapter] returning', result.length, 'items');
    return result;
  },
};

/** Insider TV adapter - articles, shows, features from seed */
export const insiderAdapter: SourceAdapter = {
  id: 'insider',
  label: 'Insider TV',
  realTime: false,
  async fetchItems(): Promise<ContentItem[]> {
    console.log('[insiderAdapter] fetchItems called, seedItems:', seedItems.length);
    await new Promise(r => setTimeout(r, 250));
    const result = seedItems.filter(item => item.source === 'insider');
    console.log('[insiderAdapter] returning', result.length, 'items');
    return result;
  },
};

/**
 * Convert a TMDB multi-search / trending result into a unified ContentItem.
 */
function tmdbResultToContentItem(item: {
  id: number
  media_type?: 'movie' | 'tv' | 'person'
  title?: string
  name?: string
  poster_path?: string | null
  profile_path?: string | null
  release_date?: string
  first_air_date?: string
  overview?: string
  vote_average?: number
  known_for_department?: string
}): ContentItem {
  const title = item.title ?? item.name ?? 'Untitled'
  const year =
    item.release_date?.slice(0, 4) ?? item.first_air_date?.slice(0, 4) ?? undefined
  const rating =
    item.vote_average !== undefined
      ? { critic: Math.round((item.vote_average ?? 0) * 10), imdb: item.vote_average }
      : null

  return {
    id: `tmdb-${item.id}`,
    source: 'tmdb',
    kind: item.media_type === 'person' ? 'article' : (item.media_type ?? 'movie'),
    title,
    description: item.overview ?? '',
    image: item.poster_path ?? item.profile_path ?? null,
    genres: [],
    rating,
    sourceUrl:
      item.media_type === 'movie'
        ? `https://www.themoviedb.org/movie/${item.id}`
        : item.media_type === 'tv'
          ? `https://www.themoviedb.org/tv/${item.id}`
          : `https://www.themoviedb.org/person/${item.id}`,
    publishedAt: `${year ?? new Date().getFullYear()}-01-01T00:00:00Z`,
    year,
    extra: { media_type: item.media_type, tmdb_id: item.id },
  }
}

/** TMDB adapter - fetches real trending content when a TMDB key is configured. */
export const tmdbAdapter: SourceAdapter = {
  id: 'tmdb',
  label: 'TMDB',
  realTime: true,
  async fetchItems(): Promise<ContentItem[]> {
    const key = import.meta.env.VITE_TMDB_API_KEY
    if (!key) return []
    try {
      const [trendingRes, popularRes, peopleRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${key}`, { cache: 'no-store' }),
        fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${key}`, { cache: 'no-store' }),
        fetch(`https://api.themoviedb.org/3/trending/person/day?api_key=${key}`, { cache: 'no-store' }),
      ])

      const [trendingData, popularData, peopleData] = await Promise.all([
        trendingRes.json(),
        popularRes.json(),
        peopleRes.json(),
      ])

      const results: ContentItem[] = []
      if (trendingRes.ok && trendingData.results) {
        for (const r of trendingData.results) results.push(tmdbResultToContentItem(r))
      }
      if (popularRes.ok && popularData.results) {
        for (const r of popularData.results) results.push(tmdbResultToContentItem(r))
      }
      if (peopleRes.ok && peopleData.results) {
        for (const r of peopleData.results) results.push(tmdbResultToContentItem(r))
      }

      const seen = new Set<string>()
      const deduped: ContentItem[] = []
      for (const item of results) {
        if (!seen.has(item.id)) {
          seen.add(item.id)
          deduped.push(item)
        }
      }
      return deduped.slice(0, 30)
    } catch {
      return []
    }
  },
};

/** Registry of all adapters */
export const adapters: Record<SourceId, SourceAdapter> = {
  insider: insiderAdapter,
  rottenTomatoes: rottenTomatoesAdapter,
  tmdb: tmdbAdapter,
};

/** Get adapter by source id */
export function getAdapter(sourceId: SourceId): SourceAdapter {
  return adapters[sourceId];
}

/** Get enabled adapters based on SourceConfig state */
export function getEnabledAdapters(configs: SourceConfig[]): SourceAdapter[] {
  return configs
    .filter(c => c.state === 'enabled')
    .map(c => adapters[c.id])
    .filter(Boolean);
}