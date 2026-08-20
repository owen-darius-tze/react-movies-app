/**
 * Pluggable source adapters.
 * Each adapter implements fetchItems() returning ContentItem[].
 * Currently backed by seed data; designed so live scrapers/APIs can be dropped in.
 */

import type { ContentItem, SourceId, SourceConfig } from './types';
import { seedItems, sourceConfigs } from './seed';

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
    // Simulate network delay for realistic loading states
    await new Promise(r => setTimeout(r, 300));
    return seedItems.filter(item =>
      item.source === 'rottenTomatoes' && item.kind === 'movie'
    );
  },
};

/** Insider TV adapter - articles, shows, features from seed */
export const insiderAdapter: SourceAdapter = {
  id: 'insider',
  label: 'Insider TV',
  realTime: false,
  async fetchItems(): Promise<ContentItem[]> {
    await new Promise(r => setTimeout(r, 250));
    return seedItems.filter(item => item.source === 'insider');
  },
};

/** TMDB adapter - would use real TMDB API when key is present; currently empty */
export const tmdbAdapter: SourceAdapter = {
  id: 'tmdb',
  label: 'TMDB',
  realTime: true,
  async fetchItems(): Promise<ContentItem[]> {
    // When a TMDB key is configured, this would call the TMDB endpoints
    // For now returns empty - the existing TMDB hooks in src/lib/hooks/useTmdb.ts
    // handle live TMDB data for the detail pages
    return [];
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