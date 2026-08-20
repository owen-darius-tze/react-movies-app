/**
 * History Page - Recently discussed items from chat
 */

import { useEffect, useState } from 'react';
import { Clock, X, Sparkles, ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getFeed, type ContentItem } from '../lib/data';
import { useChatStore, clearChat } from '../lib/chat/store';
import { SettingsPanel, SettingsTrigger } from '../components/SettingsPanel';

export default function HistoryPage() {
  const location = useLocation();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, clearChat: clearChatStore } = useChatStore();

  useEffect(() => {
    let mounted = true;
    getFeed().then(feed => {
      if (mounted) {
        const historyItems = feed.items
          .filter(item => profile.recentlyDiscussed.includes(item.id))
          .sort((a, b) => profile.recentlyDiscussed.indexOf(a.id) - profile.recentlyDiscussed.indexOf(b.id));
        setItems(historyItems);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [profile.recentlyDiscussed]);

  // Re-sync when feed updates
  useEffect(() => {
    const handleUpdate = () => {
      getFeed().then(feed => {
        const historyItems = feed.items
          .filter(item => profile.recentlyDiscussed.includes(item.id))
          .sort((a, b) => profile.recentlyDiscussed.indexOf(a.id) - profile.recentlyDiscussed.indexOf(b.id));
        setItems(historyItems);
      });
    };
    window.addEventListener('microfilm:feed-updated', handleUpdate);
    return () => window.removeEventListener('microfilm:feed-updated', handleUpdate);
  }, [profile.recentlyDiscussed]);

  const handleClearHistory = () => {
    if (window.confirm('Clear your discussion history? This won\'t delete your chat messages.')) {
      clearChatStore({ ...profile, recentlyDiscussed: [] });
    }
  };

  return (
    <div className="history-page">
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
          <Link to="/watchlist" className="sidebar__link" onClick={() => setSidebarOpen(false)}>
            <ArrowUpRight size={20} /> <span>Watchlist</span>
          </Link>
          <Link to="/history" className="sidebar__link active" onClick={() => setSidebarOpen(false)}>
            <Clock size={20} /> <span>History</span>
          </Link>
        </nav>
        <div className="sidebar__footer">
          <SettingsTrigger onOpen={() => { setSettingsOpen(true); setSidebarOpen(false); }} />
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="history-page__main">
        <header className="history-page__header">
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <ArrowUpRight size={24} />
          </button>
          <Link to="/" className="history-page__brand" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.svg" alt="" width={28} height={28} />
            <span>MicroFilm</span>
          </Link>
          <nav className="history-page__nav desktop-only" aria-label="Primary">
            <Link to="/" className="">Home</Link>
            <Link to="/search" className="">Search</Link>
            <Link to="/chat" className="">Chat</Link>
            <Link to="/watchlist" className="">Watchlist</Link>
            <Link to="/history" className="active">History</Link>
          </nav>
          <div className="history-page__actions">
            <span className="history-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            <SettingsTrigger onOpen={() => setSettingsOpen(true)} />
          </div>
        </header>

        <div className="history-page__content container">
          <div className="history-header">
            <h1>Recently Discussed</h1>
            <p>Items mentioned in your chat conversations</p>
            {items.length > 0 && (
              <button className="btn btn--ghost sm" onClick={handleClearHistory}>
                <X size={14} /> Clear History
              </button>
            )}
          </div>

          {loading ? (
            <div className="sk" style={{ width: 48, height: 48, margin: 'var(--space-8) auto' }} />
          ) : items.length === 0 ? (
            <div className="history-empty">
              <Clock size={64} />
              <h2>No discussion history yet</h2>
              <p>Start chatting about movies, shows, or articles to build your history</p>
              <Link to="/chat" className="btn btn--primary">
                <Sparkles size={16} /> Start Chatting
              </Link>
            </div>
          ) : (
            <div className="history-list">
              {items.map((item, idx) => (
                <HistoryItem key={item.id} item={item} index={idx} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function HistoryItem({ item, index }: { item: ContentItem; index: number }) {
  const kindIcons: Record<ContentItem['kind'], React.ReactNode> = {
    movie: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    tv: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>,
    show: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    article: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
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

  return (
    <article className="history-item" style={{ '--source-color': sourceColors[item.source] }}>
      <div className="history-item__index">{index + 1}</div>
      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="history-item__link">
        <div className="history-item__image">
          {item.image ? (
            <img src={item.image} alt={item.title} loading="lazy" />
          ) : (
            <div className="history-item__placeholder">{kindIcons[item.kind]}</div>
          )}
        </div>
        <div className="history-item__content">
          <div className="history-item__meta">
            <span className="history-item__kind">{kindIcons[item.kind]} {item.kind}</span>
            <span className="history-item__source" style={{ borderColor: `var(--source-color)` }}>
              {sourceLabels[item.source]}
            </span>
          </div>
          <h3 className="history-item__title">{item.title}</h3>
          <p className="history-item__description">{item.description}</p>
          <div className="history-item__footer">
            {item.year && <span>{item.year}</span>}
            {item.genres.length > 0 && (
              <span className="history-item__genres">
                {item.genres.slice(0, 3).map(g => <span key={g} className="genre-chip">{g}</span>)}
              </span>
            )}
            {bestRating && (
              <span className="history-item__rating" style={{ color: `var(--source-color)` }}>
                ★ {bestRating}
              </span>
            )}
          </div>
        </div>
      </a>
    </article>
  );
}