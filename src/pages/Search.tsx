/**
 * Search Page - Global search across TMDB (live) with Insider TV / Rotten
 * Tomatoes seed fallback. Movie, TV and people cards link inside the site;
 * article cards open their source in a new tab.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search as SearchIcon,
  X,
  SlidersHorizontal,
  Star,
  Zap,
  Newspaper,
  Film,
  Tv,
  Clock,
  UserRound,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { SkeletonRail } from '../components/Rail';
import { useSearch, hasApiKey } from '../lib/hooks/useTmdb';
import { getFeed, searchContent, type ContentItem, type DataFilters, type SourceId, type ContentKind } from '../lib/data';
import { imageUrl, type MultiSearchItem } from '../lib/tmdb';
import { scorePct } from '../lib/format';
import { getImageOrPlaceholder, getMediaPlaceholder, getPersonPlaceholder } from '../lib/utils/placeholders';
import { useChatStore } from '../lib/chat/store';

/** How long we wait after typing stops before hitting TMDB. */
const DEBOUNCE_MS = 400;

/** A search hit: either a live TMDB result or a seeded (article/show) item. */
export type SearchHit =
  | {
      key: string;
      origin: 'tmdb';
      mediaType: 'movie' | 'tv' | 'person';
      id: number;
      title: string;
      description: string;
      image: string | null;
      year?: string;
      rating?: number;
      department?: string;
    }
  | {
      key: string;
      origin: 'seed';
      item: ContentItem;
    };

/** Convert a TMDB multi-search result into a SearchHit. */
function tmdbHit(item: MultiSearchItem): SearchHit {
  const title = item.title ?? item.name ?? 'Untitled';
  return {
    key: `tmdb-${item.media_type}-${item.id}`,
    origin: 'tmdb',
    mediaType: item.media_type,
    id: item.id,
    title,
    description: item.overview ?? '',
    image: item.poster_path ?? item.profile_path ?? null,
    year: item.release_date?.slice(0, 4) ?? item.first_air_date?.slice(0, 4),
    rating: item.vote_average,
    department: item.known_for_department,
  };
}

/** Route for a TMDB hit. People open the person detail page inside the site. */
function tmdbPath(hit: Extract<SearchHit, { origin: 'tmdb' }>): string {
  if (hit.mediaType === 'person') return `/title/person/${hit.id}`;
  return `/title/${hit.mediaType}/${hit.id}`;
}

/** Article cards open their source site in a new tab. */
const EXTERNAL_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;

/** Poster / profile photo with a neat initials placeholder for people. */
function HitImage({ hit }: { hit: SearchHit }) {
  if (hit.origin === 'tmdb') {
    const size = hit.mediaType === 'person' ? 'w185' : 'w342';
    const alt = hit.title;
    const url = hit.image ? imageUrl(hit.image, size) : null;
    const placeholder = hit.mediaType === 'person' ? getPersonPlaceholder : getMediaPlaceholder;
    return <img src={getImageOrPlaceholder(url, alt, placeholder, size === 'w185' ? 185 : 342)} alt={alt} loading="lazy" />;
  }
  const item = hit.item;
  return item.image ? (
    <img src={imageUrl(item.image, 'w342')} alt={item.title} loading="lazy" />
  ) : (
    <div className="search-result-card__placeholder">
      <span className="search-result-card__placeholder-title">{item.title}</span>
    </div>
  );
}

/** Kind icon chip shown on the card. */
const KIND_ICONS: Record<ContentKind, React.ReactNode> = {
  movie: <Film size={14} />,
  tv: <Tv size={14} />,
  show: <Zap size={14} />,
  article: <Newspaper size={14} />,
};

const SOURCE_LABELS: Record<SourceId, string> = {
  insider: 'Insider TV',
  rottenTomatoes: 'Rotten Tomatoes',
  tmdb: 'TMDB',
};

const SOURCE_COLORS: Record<SourceId, string> = {
  insider: 'var(--brand)',
  rottenTomatoes: 'var(--meter-fresh)',
  tmdb: 'var(--accent)',
};

/** One card in the results grid. */
function SearchResultCard({ hit }: { hit: SearchHit }) {
  const { addToWatchlist, removeFromWatchlist } = useChatStore();
  const watchlist = useChatStore(s => s.profile.watchlist);

  if (hit.origin === 'tmdb') {
    const isWatchlisted = watchlist.includes(`tmdb-${hit.id}`);
    const href = tmdbPath(hit);
    return (
      <article className="search-result-card" style={{ '--source-color': 'var(--accent)' } as React.CSSProperties}>
        <Link to={href} className="search-result-card__link">
          <div className="search-result-card__image">
            <HitImage hit={hit} />
            {typeof hit.rating === 'number' && hit.rating > 0 && (
              <div className="search-result-card__score" style={{ background: 'var(--source-color)' }}>
                {scorePct(hit.rating)}
              </div>
            )}
            <span className="search-result-card__source" style={{ borderColor: 'var(--accent)' }}>
              TMDB
            </span>
            <span className="search-result-card__kind">
              {hit.mediaType === 'person' ? <UserRound size={14} /> : KIND_ICONS[hit.mediaType]}
              {hit.mediaType === 'person' ? (hit.department ?? 'person') : hit.mediaType}
            </span>
          </div>
          <div className="search-result-card__content">
            <h3 className="search-result-card__title">{hit.title}</h3>
            <p className="search-result-card__description">{hit.description || 'No overview available.'}</p>
            <div className="search-result-card__meta">
              {hit.year && <span>{hit.year}</span>}
            </div>
          </div>
        </Link>
        <div className="search-result-card__actions">
          <button
            className={`icon-btn sm ${isWatchlisted ? 'watchlisted' : ''}`}
            onClick={() => (isWatchlisted ? removeFromWatchlist(`tmdb-${hit.id}`) : addToWatchlist(`tmdb-${hit.id}`))}
            aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Star size={16} className={isWatchlisted ? 'filled' : ''} />
          </button>
        </div>
      </article>
    );
  }

  // Seed item (Insider TV / Rotten Tomatoes) — article/show cards open the source site.
  const item = hit.item;
  const isWatchlisted = watchlist.includes(item.id);
  const bestRating = item.rating
    ? Math.max(item.rating.critic || 0, item.rating.audience || 0, (item.rating.imdb || 0) * 10)
    : null;

  return (
    <article className="search-result-card" style={{ '--source-color': SOURCE_COLORS[item.source] } as React.CSSProperties}>
      <a href={item.sourceUrl} {...EXTERNAL_LINK_PROPS} className="search-result-card__link">
        <div className="search-result-card__image">
          <HitImage hit={hit} />
          {bestRating && (
            <div className="search-result-card__score" style={{ background: 'var(--source-color)' }}>
              {bestRating}
              {item.rating?.certifiedFresh && <span className="certified-fresh-badge">Fresh</span>}
            </div>
          )}
          <span className="search-result-card__source" style={{ borderColor: `var(--source-color)` }}>
            {SOURCE_LABELS[item.source]}
          </span>
          <span className="search-result-card__kind">{KIND_ICONS[item.kind]} {item.kind}</span>
        </div>
        <div className="search-result-card__content">
          <h3 className="search-result-card__title">{item.title}</h3>
          <p className="search-result-card__description">{item.description}</p>
          <div className="search-result-card__meta">
            {item.year && <span>{item.year}</span>}
            {item.genres.length > 0 && (
              <span className="search-result-card__genres">
                {item.genres.slice(0, 3).map(g => <span key={g} className="genre-chip">{g}</span>)}
              </span>
            )}
          </div>
        </div>
      </a>
      <div className="search-result-card__actions">
        <button
          className={`icon-btn sm ${isWatchlisted ? 'watchlisted' : ''}`}
          onClick={() => (isWatchlisted ? removeFromWatchlist(item.id) : addToWatchlist(item.id))}
          aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star size={16} className={isWatchlisted ? 'filled' : ''} />
        </button>
      </div>
    </article>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<DataFilters>({
    source: 'all',
    kind: 'all',
    minRating: undefined,
    sort: 'relevance',
  });
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('microfilm:recent-searches') || '[]');
    } catch {
      return [];
    }
  });
  const [seedItems, setSeedItems] = useState<ContentItem[]>([]);
  const timer = useRef<number | null>(null);

  const tmdbAvailable = hasApiKey();

  // Live TMDB multi-search, debounced ~400ms.
  const searchQ = useSearch(debounced);

  // 400ms debounce: only update the debounced query after typing stops.
  useEffect(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = null;
    };
  }, [query]);

  // Track loading state from react-query (only while a query is actually active).
  useEffect(() => {
    setLoading(searchQ.isFetching && debounced.trim().length > 1);
  }, [searchQ.isFetching, debounced]);

  // Error state with a retry counter ("Try again" bumps attempt).
  useEffect(() => {
    if (searchQ.isError && debounced.trim().length > 1) {
      setError(searchQ.error instanceof Error ? searchQ.error.message : 'Search request failed.');
    } else {
      setError(null);
    }
  }, [searchQ.isError, searchQ.error, debounced]);

  // Seed fallback: used when no TMDB key is configured (offline demo mode).
  useEffect(() => {
    if (tmdbAvailable) return;
    let mounted = true;
    getFeed()
      .then(feed => { if (mounted) setSeedItems(feed.items); })
      .catch(() => undefined);
    return () => { mounted = false; };
  }, [tmdbAvailable]);

  // Apply kind/source/rating/sort filters. TMDB results are filtered locally
  // so the existing filter panel keeps working; seed search reuses searchContent.
  const results = useMemo(() => {
    if (tmdbAvailable) {
      const hits: SearchHit[] = (searchQ.data?.results ?? []).map(tmdbHit);
      return applyFilters(hits, filters, debounced);
    }
    const filtered = searchContent(seedItems, { ...filters, query });
    return filtered.map(item => ({ key: item.id, origin: 'seed' as const, item }));
  }, [tmdbAvailable, searchQ.data, filters, debounced, query, seedItems]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const trimmed = searchQuery.trim();
    if (trimmed) {
      const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('microfilm:recent-searches', JSON.stringify(updated));
    }
  };

  const clearFilters = () => {
    setFilters({ source: 'all', kind: 'all', minRating: undefined, sort: 'relevance' });
  };

  const hasActiveFilters = filters.source !== 'all' || filters.kind !== 'all' || filters.minRating !== undefined || filters.sort !== 'relevance';

  const sourceOptions: { value: DataFilters['source']; label: string }[] = [
    { value: 'all', label: 'All Sources' },
    { value: 'insider', label: 'Insider TV' },
    { value: 'rottenTomatoes', label: 'Rotten Tomatoes' },
    { value: 'tmdb', label: 'TMDB' },
  ];

  const kindOptions: { value: DataFilters['kind']; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'movie', label: 'Movies' },
    { value: 'tv', label: 'TV Series' },
    { value: 'show', label: 'Shows/Features' },
    { value: 'article', label: 'Articles/Reviews' },
  ];

  const sortOptions: { value: DataFilters['sort']; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  // Stats for results
  const stats = useMemo(() => {
    const bySource: Record<string, number> = {};
    const byKind: Record<string, number> = {};
    let rated = 0;
    for (const hit of results) {
      if (hit.origin === 'tmdb') {
        bySource.tmdb = (bySource.tmdb || 0) + 1;
        byKind[hit.mediaType === 'person' ? 'person' : hit.mediaType] = (byKind[hit.mediaType === 'person' ? 'person' : hit.mediaType] || 0) + 1;
        if (typeof hit.rating === 'number' && hit.rating > 0) rated++;
      } else {
        bySource[hit.item.source] = (bySource[hit.item.source] || 0) + 1;
        byKind[hit.item.kind] = (byKind[hit.item.kind] || 0) + 1;
        if (hit.item.rating) rated++;
      }
    }
    return { bySource, byKind, rated, total: results.length };
  }, [results]);

  const searching = debounced.trim().length > 1;

  return (
    <div className="search-page">
      {/* Search Header */}
      <header className="search-header">
        <div className="container">
          <div className="search-header__content">
            <h1>Search</h1>
            <p className="search-header__subtitle">
              Find movies, shows, people, articles & reviews
            </p>
          </div>
        </div>
      </header>

      {/* Search Bar & Filters */}
      <div className="search-toolbar">
        <div className="container">
          <div className="search-input-wrapper">
            <SearchIcon size={20} className="search-icon" />
            <input
              type="search"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search movies, shows, people, articles, reviews..."
              className="search-input"
              autoFocus
            />
            {query && (
              <button className="search-clear" onClick={() => handleSearch('')} aria-label="Clear search">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="search-actions">
            <button
              className={`btn ${showFilters ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
              {hasActiveFilters && <span className="filter-badge">{Object.values(filters).filter(v => v !== 'all' && v !== undefined && v !== 'relevance').length}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="container">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Source</label>
                <select value={filters.source} onChange={e => setFilters({ ...filters, source: e.target.value as DataFilters['source'] })}>
                  {sourceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label>Content Type</label>
                <select value={filters.kind} onChange={e => setFilters({ ...filters, kind: e.target.value as DataFilters['kind'] })}>
                  {kindOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label>Min Rating (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={filters.minRating || ''}
                  onChange={e => setFilters({ ...filters, minRating: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Any"
                />
              </div>

              <div className="filter-group">
                <label>Sort By</label>
                <select value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value as DataFilters['sort'] })}>
                  {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              {hasActiveFilters && (
                <div className="filter-group filter-actions">
                  <button className="btn btn--ghost" onClick={clearFilters}>
                    <X size={16} /> Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Searches (when no query) */}
      {!query && recentSearches.length > 0 && results.length === 0 && (
        <div className="recent-searches container">
          <div className="recent-searches__header">
            <h3>Recent Searches</h3>
            <button className="btn btn--ghost sm" onClick={() => { setRecentSearches([]); localStorage.removeItem('microfilm:recent-searches'); }}>
              <X size={14} /> Clear
            </button>
          </div>
          <div className="recent-searches__list">
            {recentSearches.map(search => (
              <button key={search} className="recent-search-btn" onClick={() => handleSearch(search)}>
                <Clock size={16} /> {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Stats */}
      {(query || hasActiveFilters) && (
        <div className="results-stats container">
          <span>{stats.total} result{stats.total !== 1 ? 's' : ''}</span>
          {stats.rated > 0 && <span>· {stats.rated} with ratings</span>}
          <span className="results-breakdown">
            {Object.entries(stats.bySource).map(([source, count]) => (
              <span key={source} className="stat-chip">{source}: {count}</span>
            ))}
          </span>
        </div>
      )}

      {/* Results */}
      <div className="search-results container">
        {error ? (
          <div className="state state--error">
            <div className="state__icon"><WifiOff size={30} /></div>
            <h2 className="state__title">Search failed</h2>
            <p className="state__text">{error}</p>
            <button className="btn btn--primary" onClick={() => searchQ.refetch()}>
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        ) : loading ? (
          <div className="search-loading">
            <SkeletonRail count={8} />
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty">
            <SearchIcon size={48} />
            <h3>No results found</h3>
            <p>{searching ? `No matches for "${debounced}"` : 'Start searching to discover content'}</p>
            {searching && (
              <button className="btn btn--primary" onClick={() => handleSearch('')}>
                <X size={16} /> Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="results-grid">
            {results.map(hit => (
              <SearchResultCard key={hit.key} hit={hit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Apply kind / source / minRating / sort to a mixed hit list. */
function applyFilters(hits: SearchHit[], filters: DataFilters, query: string): SearchHit[] {
  let out = hits;

  // Text query: match title or overview (TMDB multi already searches, but
  // local filtering also covers genre/department words and keeps it snappy).
  const q = query.trim().toLowerCase();
  if (q) {
    out = out.filter(hit => {
      if (hit.origin === 'tmdb') {
        return hit.title.toLowerCase().includes(q) || hit.description.toLowerCase().includes(q) || (hit.department ?? '').toLowerCase().includes(q);
      }
      return hit.item.title.toLowerCase().includes(q) || hit.item.description.toLowerCase().includes(q);
    });
  }

  if (filters.kind && filters.kind !== 'all') {
    out = out.filter(hit => {
      if (hit.origin === 'tmdb') {
        // People only show under "All Types".
        return hit.mediaType === filters.kind;
      }
      return hit.item.kind === filters.kind;
    });
  }

  if (filters.source && filters.source !== 'all') {
    out = out.filter(hit => (hit.origin === 'tmdb' ? filters.source === 'tmdb' : hit.item.source === filters.source));
  }

  if (filters.minRating !== undefined && filters.minRating > 0) {
    out = out.filter(hit => {
      if (hit.origin === 'tmdb') {
        if (typeof hit.rating !== 'number' || hit.rating <= 0) return false;
        return scorePct(hit.rating) >= filters.minRating!;
      }
      const r = hit.item.rating;
      if (!r) return false;
      const best = Math.max(r.critic || 0, r.audience || 0, (r.imdb || 0) * 10);
      return best >= filters.minRating!;
    });
  }

  const sorted = [...out];
  switch (filters.sort) {
    case 'newest':
      sorted.sort((a, b) => (yearOf(b) ?? '').localeCompare(yearOf(a) ?? ''));
      break;
    case 'oldest':
      sorted.sort((a, b) => (yearOf(a) ?? '').localeCompare(yearOf(b) ?? ''));
      break;
    case 'rating':
      sorted.sort((a, b) => (ratingOf(b) ?? 0) - (ratingOf(a) ?? 0));
      break;
    case 'relevance':
    default:
      // TMDB returns by relevance already; keep stable order.
      break;
  }
  return sorted;
}

/** Best 0-100 score for a hit (TMDB vote_average or seeded ratings). */
function ratingOf(hit: SearchHit): number | null {
  if (hit.origin === 'tmdb') {
    return typeof hit.rating === 'number' && hit.rating > 0 ? scorePct(hit.rating) : null;
  }
  const r = hit.item.rating;
  if (!r) return null;
  return Math.max(r.critic || 0, r.audience || 0, (r.imdb || 0) * 10);
}

/** Release year as a string, for sorting (TMDB hits carry it; seed items too). */
function yearOf(hit: SearchHit): string | undefined {
  if (hit.origin === 'tmdb') return hit.year;
  return hit.item.year !== undefined ? String(hit.item.year) : undefined;
}
