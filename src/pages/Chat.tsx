/**
 * Chat Page - Full-screen chat interface with AI assistant
 */

import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, ChevronLeft, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatInterface } from '../components/ChatInterface';
import { SettingsPanel, SettingsTrigger } from '../components/SettingsPanel';
import { useChatStore } from '../lib/chat/store';

export default function ChatPage() {
  const { messages, clearChat, profile } = useChatStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="chat-page">
      {/* Mobile sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Navigation">
        <div className="sidebar__header">
          <Link to="/" className="sidebar__brand" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.svg" alt="" width="28" height={28} />
            <span>MicroFilm</span>
          </Link>
          <button className="icon-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <ChevronLeft size={20} />
          </button>
        </div>
        <nav className="sidebar__nav" aria-label="Main navigation">
          <Link to="/" className="sidebar__link" onClick={() => setSidebarOpen(false)}>
            <Sparkles size={20} /> <span>Home</span>
          </Link>
          <Link to="/search" className="sidebar__link" onClick={() => setSidebarOpen(false)}>
            <ArrowUpRight size={20} /> <span>Search</span>
          </Link>
          <Link to="/chat" className="sidebar__link active" onClick={() => setSidebarOpen(false)}>
            <Sparkles size={20} /> <span>Chat</span>
          </Link>
          <Link to="/watchlist" className="sidebar__link" onClick={() => setSidebarOpen(false)}>
            <ArrowUpRight size={20} /> <span>Watchlist</span>
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

      <main className="chat-page__main">
        <header className="chat-page__header">
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <ChevronLeft size={24} />
          </button>
          <Link to="/" className="chat-page__brand" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.svg" alt="" width={28} height={28} />
            <span>MicroFilm</span>
          </Link>
          <nav className="chat-page__nav desktop-only" aria-label="Primary">
            <Link to="/" className="">Home</Link>
            <Link to="/search" className="">Search</Link>
            <Link to="/chat" className="active">Chat</Link>
            <Link to="/watchlist" className="">Watchlist</Link>
            <Link to="/history" className="">History</Link>
          </nav>
          <div className="chat-page__actions">
            <SettingsTrigger onOpen={() => setSettingsOpen(true)} />
          </div>
        </header>

        <div className="chat-page__container" ref={chatContainerRef}>
          <div className="chat-page__content">
            <ChatInterface />
          </div>

          {/* Sidebar with context */}
          <aside className="chat-page__sidebar">
            <div className="chat-context-panel">
              <h3>Your Preferences</h3>
              <div className="context-section">
                <h4>Top Genres</h4>
                <div className="genre-tags">
                  {Object.entries(profile.genreWeights)
                    .filter(([, w]) => w > 0.2)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([genre]) => (
                      <span key={genre} className="genre-tag">{genre}</span>
                    ))}
                  {Object.keys(profile.genreWeights).length === 0 && (
                    <span className="empty-tag">Chat to build preferences</span>
                  )}
                </div>
              </div>

              <div className="context-section">
                <h4>Preferred Sources</h4>
                <div className="source-bars">
                  {Object.entries(profile.sourceWeights).map(([source, weight]) => (
                    <div key={source} className="source-bar">
                      <span className="source-name">{source === 'rottenTomatoes' ? 'Rotten Tomatoes' : source}</span>
                      <div className="bar">
                        <div className="bar-fill" style={{ width: `${weight * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="context-section">
                <h4>Watchlist ({profile.watchlist.length})</h4>
                <div className="watchlist-preview">
                  {profile.watchlist.length === 0 ? (
                    <span className="empty-tag">Empty</span>
                  ) : (
                    <span>{profile.watchlist.length} items saved</span>
                  )}
                </div>
              </div>

              <div className="context-section">
                <h4>Recently Discussed ({profile.recentlyDiscussed.length})</h4>
                <div className="recent-preview">
                  {profile.recentlyDiscussed.length === 0 ? (
                    <span className="empty-tag">Nothing yet</span>
                  ) : (
                    <span>{profile.recentlyDiscussed.length} items</span>
                  )}
                </div>
              </div>

              <div className="context-actions">
                <button className="btn btn--ghost" onClick={() => clearChat()}>
                  <X size={16} /> Clear Chat & Reset
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}