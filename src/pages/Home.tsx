/**
 * Personalized Dashboard Homepage
 * Modular widgets driven by AI preferences from chat
 */

import { useEffect, useState } from 'react';
import { Sparkles, Menu, Search, MessageSquare, Bookmark, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { DashboardGrid, DEFAULT_WIDGETS, type WidgetConfig } from '../components/DashboardWidgets';
import { SettingsPanel, SettingsTrigger } from '../components/SettingsPanel';
import { ChatInterface, ChatFloatButton } from '../components/ChatInterface';
import { useChatStore } from '../lib/chat/store';
import { getFeed } from '../lib/data';
import { saveSourceState } from '../lib/data';

export default function HomePage() {
  const location = useLocation();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_WIDGETS;
    try {
      const saved = localStorage.getItem('microfilm:dashboard');
      return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedLoaded, setFeedLoaded] = useState(false);
  const { profile, clearChat } = useChatStore();

  // Sync widgets with localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'microfilm:dashboard' && e.newValue) {
        try {
          setWidgets(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Load feed on mount to populate cache
  useEffect(() => {
    let mounted = true;
    getFeed().then(() => {
      if (mounted) setFeedLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  const handleReorder = (id: string, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const index = prev.findIndex(w => w.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newWidgets = [...prev];
      [newWidgets[index], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[index]];
      newWidgets.forEach((w, i) => { w.order = i; });
      return newWidgets;
    });
  };

  const handleToggle = (id: string, enabled: boolean) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, enabled } : w));
  };

  const handleRemove = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home', icon: <Sparkles size={20} /> },
    { path: '/search', label: 'Search', icon: <Search size={20} /> },
    { path: '/chat', label: 'Chat', icon: <MessageSquare size={20} /> },
    { path: '/watchlist', label: 'Watchlist', icon: <Bookmark size={20} /> },
    { path: '/history', label: 'History', icon: <Clock size={20} /> },
  ];

  return (
    <div className="app-shell">
      {/* Mobile sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Navigation">
        <div className="sidebar__header">
          <Link to="/" className="sidebar__brand" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.svg" alt="" width="28" height={28} />
            <span>MicroFilm</span>
          </Link>
          <button className="icon-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <Menu size={20} />
          </button>
        </div>
        <nav className="sidebar__nav" aria-label="Main navigation">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar__link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar__footer">
          <SettingsTrigger onOpen={() => { setSettingsOpen(true); setSidebarOpen(false); }} />
        </div>
      </aside>

      {/* Sidebar overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="main-content">
        {/* Top bar */}
        <header className="top-bar">
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
          <Link to="/" className="top-bar__brand" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.svg" alt="" width="28" height={28} />
            <span>MicroFilm</span>
          </Link>
          <nav className="top-bar__nav desktop-only" aria-label="Primary">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="top-bar__actions">
            <SettingsTrigger onOpen={() => setSettingsOpen(true)} />
            <button className="icon-btn" onClick={() => { setChatOpen(true); setSidebarOpen(false); }} aria-label="Open chat">
              <MessageSquare size={20} />
            </button>
          </div>
        </header>

        {/* Dashboard */}
        <div className="dashboard-container">
          {!feedLoaded ? (
            <div className="dashboard-loading">
              <div className="sk" style={{ width: 48, height: 48, margin: '0 auto var(--space-4)' }} />
              <p>Loading your personalized dashboard...</p>
            </div>
          ) : (
            <DashboardGrid
              widgets={widgets}
              profile={profile}
              onReorder={handleReorder}
              onToggle={handleToggle}
              onRemove={handleRemove}
            />
          )}
        </div>

        {/* Empty state for new users */}
        {widgets.filter(w => w.enabled).length === 0 && feedLoaded && (
          <div className="dashboard-empty-state">
            <Sparkles size={64} />
            <h2>Welcome to MicroFilm!</h2>
            <p>Your personalized entertainment dashboard is empty. Let's set it up:</p>
            <div className="empty-actions">
              <button className="btn btn--primary" onClick={() => setSettingsOpen(true)}>
                <Sparkles size={16} /> Configure Widgets
              </button>
              <button className="btn btn--ghost" onClick={() => setChatOpen(true)}>
                <MessageSquare size={16} /> Start Chatting
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ChatInterface
        minimized={!chatOpen}
        onToggleMinimize={() => setChatOpen(false)}
      />

      {/* Floating chat button for mobile */}
      <ChatFloatButton onOpen={() => setChatOpen(true)} />
    </div>
  );
}