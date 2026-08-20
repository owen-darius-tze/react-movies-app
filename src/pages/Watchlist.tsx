/**
 * Watchlist Page - User's saved items
 */

import { useEffect, useState } from 'react';
import { Bookmark, X, Trash2, Sparkles, ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MediaCard, detailPath } from '../components/MediaCard';
import { Rail, SkeletonRail } from '../components/Rail';
import { ScoreBadge } from '../components/Score';
import { getFeed, type ContentItem } from '../lib/data';
import { useChatStore, removeFromWatchlist } from '../lib/chat/store';
import { SettingsPanel, SettingsTrigger } from '../components/SettingsPanel';

export default function WatchlistPage() {
  const location = useLocation();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, clearChat } = useChatStore();

  useEffect(() => {
    let mounted = true;
    getFeed().then(feed => {
      if (mounted) {
        const watchlistItems = feed.items.filter(item => profile.watchlist.includes(item.id));
        // Sort by watchlist order
        watchlistItems.sort((a, b) => profile.watchlist.indexOf(a.id) - profile.watchlist.indexOf(b.id));
        setItems(watchlistItems);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [profile.watchlist]);

  // Re-sync when feed updates
  useEffect(() => {
    const handleUpdate = () => {
      getFeed().then(feed => {
        const watchlistItems = feed.items.filter(item => profile.watchlist.includes(item.id));
        watchlistItems.sort((a, b) => profile.watchlist.indexOf(a.id) - profile.watchlist.indexOf(b.id));
        setItems(watchlistItems);
      });
    };
    window.addEventListener('microfilm:feed-updated', handleUpdate);
    return () => window.removeEventListener('microfilm:feed-updated', handleUpdate);
  }, [profile.watchlist]);

  return (
    <div className="watchlist-page">
      {/* Mobile sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Navigation">
        <div className="sidebar__header">
          <Link to="/" className="sidebar__brand" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.svg" alt="" width="28" height={28} />
            <span>MicroFilm</span>
          </Link>
          <button className="icon-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <ArrowUpRight size={20} />
          </button>
        </div>
        <nav className="sidebar__nav" aria-label="Main navigation">
          <Link to="/" className="sidebar__link" onClick={() => setSidebarOpen(false)}>
            <Sparkles size={20} /> <span>Home</span>
          </Link>
          <Link to="/search" className="sidebar__link" onClick={() => setSidebarOpen(false)}>
            <ArrowUpRight size={20} /> <span>Search</span>
          </Link>
          <Link to="/chat" className="sidebar__link" onClick={() => setSidebarOpen(false)}>
            <Sparkles size={20} /> <span>Chat</span>
          </Link>
          <Link to="/watchlist" className="sidebar__link active" onClick={() => setSidebarOpen(false)}>
            <Bookmark size={20} /> <span>Watchlist</span>
          </Link>
          <Link to="/history" className="sidebar__link" onClick={() => setSidebarOpen(false)}>
            <ArrowUpRight size={20} /> <span>History</span>
          </Link>
        </nav>
        <div className="sidebar__footer">
          <SettingsTrigger onOpen={() => { setSettingsOpen(true); setSidebarOpen(false); }} />
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="watchlist-page__main">
        <header className="watchlist-page__header">
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <ArrowUpRight size={24} />
          </button>
          <Link to="/" className="watchlist-page__brand" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.svg" alt="" width={28} height={28} />
            <span>MicroFilm</span>
          </Link>
          <nav className="watchlist-page__nav desktop-only" aria-label="Primary">
            <Link to="/" className="">Home</Link>
            <Link to="/search" className="">Search</Link>
            <Link to="/chat" className="">Chat</Link>
            <Link to="/watchlist" className="active">Watchlist</Link>
            <Link to="/history" className="">History</Link>
          </nav>
          <div className="watchlist-page__actions">
            <span className="watchlist-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            <SettingsTrigger onOpen={() => setSettingsOpen(true)} />
          </div>
        </header>

        <div className="watchlist-page__content container">
          <div className="watchlist-header">
            <h1>Your Watchlist</h1>
            <p>Movies, shows & articles you've saved for later</p>
          </div>

          {loading ? (
            <SkeletonRail count={8} />
          ) : items.length === 0 ? (
            <div className="watchlist-empty">
              <Bookmark size={64} />
              <h2>Your watchlist is empty</h2>
              <p>Save movies, shows, and articles from search, chat, or the dashboard</p>
              <div className="empty-actions">
                <Link to="/search" className="btn btn--primary">
                  <Sparkles size={16} /> Browse & Search
                </Link>
                <Link to="/chat" className="btn btn--ghost">
                  <Sparkles size={16} /> Ask for Recommendations
                </Link>
              </div>
            </div>
          ) : (
            <Rail>
              {items.map(item => (
                <WatchlistItem key={item.id} item={item} />
              ))}
            </Rail>
          )}
        </div>
      </main>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function WatchlistItem({ item }: { item: ContentItem }) {
  const { removeFromWatchlist } = useChatStore();

  const kindIcons: Record<ContentItem['kind'], React.ReactNode> = {
    movie: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    tv: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>,
    show: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    article: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  };

  const sourceLabels: Record<ContentItem['source'], string> = {
    insider: 'Insider TV',
    rottenTomatoes: 'Rotten Tomatoes',
    tmdb: 'TMDB',
  };

  const sourceColors: Record<ContentItem['source'], string> = {
    insider: 'var(--brand)',
    rottenTomatoes: 'var(--meter-fresh)',
    tmdb: 'var(--accent)',
  };

  const bestRating = item.rating
    ? Math.max(item.rating.critic || 0, item.rating.audience || 0, (item.rating.imdb || 0) * 10)
    : null;

  const isCertifiedFresh = item.rating?.certifiedFresh;

  return (
    <article className="watchlist-item" style={{ '--source-color': sourceColors[item.source] }}>
      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="watchlist-item__link">
        <div className="watchlist-item__image">
          {item.image ? (
            <img src={item.image} alt={item.title} loading="lazy" />
          ) : (
            <div className="watchlist-item__placeholder">{kindIcons[item.kind]}</div>
          )}
          {bestRating && (
            <div className="watchlist-item__score" style={{ background: `var(--source-color)` }}>
              {bestRating}
              {isCertifiedFresh && <span className="certified-fresh-badge">Fresh</span>}
            </div>
          )}
          <span className="watchlist-item__source" style={{ borderColor: `var(--source-color)` }}>
            {sourceLabels[item.source]}
          </span>
        </div>
        <div className="watchlist-item__content">
          <h3 className="watchlist-item__title">{item.title}</h3>
          <p className="watchlist-item__description">{item.description}</p>
          <div className="watchlist-item__meta">
            {item.year && <span>{item.year}</span>}
            {item.genres.length > 0 && (
              <span className="watchlist-item__genres">
                {item.genres.slice(0, 3).map(g => <span key={g} className="genre-chip">{g}</span>)}
              </span>
            )}
          </div>
        </div>
      </a>
      <button
        className="watchlist-item__remove"
        onClick={() => removeFromWatchlist(item.id)}
        aria-label={`Remove ${item.title} from watchlist`}
      >
        <X size={20} />
      </button>
    </article>
  );
}