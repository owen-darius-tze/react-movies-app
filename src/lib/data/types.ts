/**
 * Unified content model for MicroFilm aggregator.
 * Normalizes Insider TV, Rotten Tomatoes, and TMDB into a single shape.
 */

export type SourceId = 'insider' | 'rottenTomatoes' | 'tmdb';
export type ContentKind = 'movie' | 'tv' | 'show' | 'article';

export interface ContentRating {
  /** Rotten Tomatoes critic score (0-100) */
  critic?: number;
  /** Rotten Tomatoes audience score (0-100) */
  audience?: number;
  /** IMDb rating (0-10) */
  imdb?: number;
  /** TMDB vote_average (0-10) */
  tmdb?: number;
  /** "Certified Fresh" badge from Rotten Tomatoes */
  certifiedFresh?: boolean;
}

export interface ContentItem {
  /** Stable unique id across sources (e.g., "rt-movie-1", "insider-article-5") */
  id: string;
  /** Origin source */
  source: SourceId;
  /** Content type */
  kind: ContentKind;
  /** Display title */
  title: string;
  /** Short description / overview / plot */
  description: string;
  /** Poster / hero image path (may be local placeholder or remote) */
  image: string | null;
  /** Genres / categories */
  genres: string[];
  /** All available ratings */
  rating: ContentRating | null;
  /** Canonical URL back to the source site */
  sourceUrl: string;
  /** Publication / fetch timestamp (ISO string) */
  publishedAt: string;
  /** Year of release / air / publish */
  year?: number;
  /** Runtime in minutes (movies/shows) */
  runtime?: number;
  /** Director (movies) */
  director?: string;
  /** Cast names */
  cast?: string[];
  /** Extra source-specific payload (not used for ranking/search) */
  extra?: Record<string, unknown>;
}

export type SourceState = 'enabled' | 'disabled';

export interface SourceConfig {
  id: SourceId;
  label: string;
  state: SourceState;
  /** TTL minutes for cached data (default 30) */
  ttlMinutes?: number;
  /** Adapter fetch function (provided by the adapter registry, not the config) */
  fetchItems?: () => Promise<ContentItem[]>;
}

export interface DataFilters {
  /** Free-text search across title, description, cast, genres */
  query?: string;
  /** Filter by source */
  source?: SourceId | 'all';
  /** Filter by kind */
  kind?: ContentKind | 'all';
  /** Minimum critic/audience/imdb score (0-100 normalized) */
  minRating?: number;
  /** Only items published since this ISO date */
  since?: string;
  /** Sort: 'newest' | 'oldest' | 'rating' | 'relevance' */
  sort?: 'newest' | 'oldest' | 'rating' | 'relevance';
}

export interface FeedResult {
  items: ContentItem[];
  sources: {
    id: SourceId;
    status: 'ok' | 'error' | 'stale';
    lastFetchedAt: string | null;
    itemCount: number;
  }[];
}