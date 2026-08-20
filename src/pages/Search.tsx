/**
 * Search Page - Global search across Insider TV, Rotten Tomatoes, and TMDB
 */

import { useState, useEffect, useMemo } from 'react';
import { Search as SearchIcon, Filter, X, SlidersHorizontal, Star, Zap, Newspaper, Film, Tv, Clock } from 'lucide-react';
import { MediaCard, detailPath } from '../components/MediaCard';
import { Rail, SkeletonRail } from '../components/Rail';
import { ScoreBadge } from '../components/Score';
import { getFeed, searchContent, type ContentItem, type DataFilters, type SourceId, type ContentKind } from '../lib/data';
import { useChatStore, addToWatchlist, removeFromWatchlist } from '../lib/chat/store';
import { imageUrl } from '../lib/tmdb';
import type { MediaType } from '../lib/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<DataFilters>({
    source: 'all',
    kind: 'all',
    minRating: undefined,
    sort: 'relevance',
  });
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('microfilm:recent-searches') || '[]');
    } catch {
      return [];
    }
  });
  const { profile } = useChatStore();

  // Load feed for initial results
  useEffect(() => {
    let mounted = true;
    getFeed().then(feed => {
      if (mounted) setResults(feed.items);
    });
    return () => { mounted = false; };
  }, []);

  // Perform search when query or filters change
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const feed = await getFeed();
        const filtered = searchContent(feed.items, { ...filters, query });
        setResults(filtered);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, filters]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    // Add to recent searches
    const trimmed = searchQuery.trim();
    if (trimmed) {
      const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('microfilm:recent-searches', JSON.stringify(updated));
    }
  };

  const clearFilters = () => {
    setFilters({
      source: 'all',
      kind: 'all',
      minRating: undefined,
      sort: 'relevance',
    });
  };

  const hasActiveFilters = filters.source !== 'all' || filters.kind !== 'all' || filters.minRating !== undefined || filters.sort !== 'relevance';

  const sourceOptions: { value: SourceId | 'all'; label: string }[] = [
    { value: 'all', label: 'All Sources' },
    { value: 'insider', label: 'Insider TV' },
    { value: 'rottenTomatoes', label: 'Rotten Tomatoes' },
    { value: 'tmdb', label: 'TMDB' },
  ];

  const kindOptions: { value: ContentKind | 'all'; label: string }[] = [
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
    for (const item of results) {
      bySource[item.source] = (bySource[item.source] || 0) + 1;
      byKind[item.kind] = (byKind[item.kind] || 0) + 1;
      if (item.rating) rated++;
    }
    return { bySource, byKind, rated, total: results.length };
  }, [results]);

  return (
    <div className="search-page">
      {/* Search Header */}
      <header className="search-header">
        <div className="container">
          <div className="search-header__content">
            <h1>Search</h1>
            <p className="search-header__subtitle">
              Find movies, shows, articles & reviews across all sources
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
              placeholder="Search movies, shows, articles, reviews..."
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
        {loading ? (
          <div className="search-loading">
            <SkeletonRail count={8} />
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty">
            <SearchIcon size={48} />
            <h3>No results found</h3>
            <p>{query ? `No matches for "${query}"` : 'Start searching to discover content'}</p>
            {query && (
              <button className="btn btn--primary" onClick={() => handleSearch('')}>
                <X size={16} /> Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="results-grid">
            {results.map(item => (
              <SearchResultCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Search Result Card */
function SearchResultCard({ item }: { item: ContentItem }) {
  const { addToWatchlist, removeFromWatchlist } = useChatStore();
  const isWatchlisted = false; // Could check profile.watchlist

  const kindIcons: Record<ContentKind, React.ReactNode> = {
    movie: <Film size={14} />,
    tv: <Tv size={14} />,
    show: <Zap size={14} />,
    article: <Newspaper size={14} />,
  };

  const sourceLabels: Record<SourceId, string> = {
    insider: 'Insider TV',
    rottenTomatoes: 'Rotten Tomatoes',
    tmdb: 'TMDB',
  };

  const sourceColors: Record<SourceId, string> = {
    insider: 'var(--brand)',
    rottenTomatoes: 'var(--meter-fresh)',
    tmdb: 'var(--accent)',
  };

  const bestRating = item.rating
    ? Math.max(item.rating.critic || 0, item.rating.audience || 0, (item.rating.imdb || 0) * 10)
    : null;

  const isCertifiedFresh = item.rating?.certifiedFresh;

  return (
    <article className="search-result-card" style={{ '--source-color': sourceColors[item.source] }}>
      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="search-result-card__link">
        <div className="search-result-card__image">
          {item.image ? (
            <img src={item.image} alt={item.title} loading="lazy" />
          ) : (
            <div className="search-result-card__placeholder">{kindIcons[item.kind]}</div>
          )}
          {bestRating && (
            <div className="search-result-card__score" style={{ background: `var(--source-color)` }}>
              {bestRating}
              {isCertifiedFresh && <span className="certified-fresh-badge">Fresh</span>}
            </div>
          )}
          <span className="search-result-card__source" style={{ borderColor: `var(--source-color)` }}>
            {sourceLabels[item.source]}
          </span>
          <span className="search-result-card__kind">{kindIcons[item.kind]} {item.kind}</span>
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
          onClick={() => isWatchlisted ? removeFromWatchlist(item.id) : addToWatchlist(item.id)}
          aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star size={16} className={isWatchlisted ? 'filled' : ''} />
        </button>
      </div>
    </article>
  );
}