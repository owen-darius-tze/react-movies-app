/**
 * Settings Panel - Dashboard configuration, source toggles, widget management
 */

import { useState, useEffect } from 'react';
import {
  X, Settings, Database, RefreshCw, Trash2, Save, Eye, EyeOff,
  GripVertical, ChevronUp, ChevronDown, Plus, Minus, Sparkles,
  Zap, Star, Newspaper, Bookmark, Clock, Target, Palette, Bell
} from 'lucide-react';
import { useChatStore, type WidgetConfig, type WidgetType } from '../lib/chat/store';
import { DEFAULT_PREFERENCE_PROFILE } from '../lib/chat/types';
import { WIDGET_DEFINITIONS, DEFAULT_WIDGETS } from '../components/DashboardWidgets';
import { saveSourceState, forceRefreshSource, clearAllCaches, getFeed, type SourceConfig, sourceConfigs } from '../lib/data';

const STORAGE_KEY = 'microfilm:dashboard';

export function SettingsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'widgets' | 'sources' | 'preferences' | 'data'>('widgets');
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_WIDGETS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });
  const [sourceStates, setSourceStates] = useState<Record<string, 'enabled' | 'disabled'>>({});
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { profile, clearChat, updateProfile, addToWatchlist, removeFromWatchlist } = useChatStore();

  // Load source states
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('microfilm:sources');
      if (saved) {
        const parsed = JSON.parse(saved);
        const states: Record<string, 'enabled' | 'disabled'> = {};
        for (const [key, value] of Object.entries(parsed)) {
          states[key] = (value as { state: 'enabled' | 'disabled' }).state;
        }
        setSourceStates(states);
      }
    } catch {
      // Use defaults
    }
  }, []);

  // Save widgets to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  // Save source states
  const toggleSource = (sourceId: string, enabled: boolean) => {
    const newState = enabled ? 'enabled' : 'disabled';
    setSourceStates(prev => ({ ...prev, [sourceId]: newState }));
    saveSourceState(sourceId as 'insider' | 'rottenTomatoes' | 'tmdb', newState);
  };

  // Widget actions
  const toggleWidget = (id: string, enabled: boolean) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, enabled } : w));
  };

  const reorderWidget = (id: string, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const index = prev.findIndex(w => w.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newWidgets = [...prev];
      [newWidgets[index], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[index]];
      // Update order values
      newWidgets.forEach((w, i) => { w.order = i; });
      return newWidgets;
    });
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const addWidget = (type: WidgetType) => {
    const existing = widgets.find(w => w.type === type);
    if (existing) {
      toggleWidget(existing.id, true);
      return;
    }
    const newWidget: WidgetConfig = {
      id: `w-${type}-${Date.now()}`,
      type,
      title: WIDGET_DEFINITIONS[type].label,
      enabled: true,
      order: widgets.length,
      maxItems: 10,
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  // Data actions
  const handleRefreshSource = async (sourceId: string) => {
    try {
      await forceRefreshSource(sourceId as 'insider' | 'rottenTomatoes' | 'tmdb');
      // Trigger UI update
      window.dispatchEvent(new CustomEvent('microfilm:feed-updated', { detail: { sourceId } }));
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Clear all cached data? This will force a fresh fetch on next load.')) {
      clearAllCaches();
      // Trigger UI update
      window.dispatchEvent(new CustomEvent('microfilm:feed-updated', { detail: { sourceId: 'all' } }));
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Reset everything? This clears chat history, preferences, watchlist, widgets, and cache.')) {
      clearChat();
      setWidgets(DEFAULT_WIDGETS);
      clearAllCaches();
      localStorage.removeItem('microfilm:sources');
      localStorage.removeItem(STORAGE_KEY);
      setSourceStates({});
      window.dispatchEvent(new CustomEvent('microfilm:feed-updated', { detail: { sourceId: 'all' } }));
    }
  };

  // Tabs
  const tabs = [
    { id: 'widgets', icon: <Palette size={18} />, label: 'Widgets' },
    { id: 'sources', icon: <Database size={18} />, label: 'Sources' },
    { id: 'preferences', icon: <Target size={18} />, label: 'Preferences' },
    { id: 'data', icon: <RefreshCw size={18} />, label: 'Data & Cache' },
  ];

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2 id="settings-title"><Settings size={20} /> Dashboard Settings</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {/* Widgets Tab */}
          {activeTab === 'widgets' && (
            <div className="settings-section">
              <h3>Dashboard Widgets</h3>
              <p className="settings-desc">Drag to reorder, toggle to show/hide. Disabled widgets won't appear on your homepage.</p>

              <div className="widget-list">
                {widgets.map((widget, idx) => {
                  const def = WIDGET_DEFINITIONS[widget.type as WidgetType];
                  return (
                    <div key={widget.id} className={`widget-list-item ${!widget.enabled ? 'disabled' : ''}`}>
                      <div className="widget-list-item__drag" aria-label="Drag to reorder">
                        <GripVertical size={20} />
                      </div>
                      <div className="widget-list-item__info">
                        {def && <span className="widget-list-item__icon">{def.icon}</span>}
                        <div>
                          <span className="widget-list-item__title">{widget.title}</span>
                          <span className="widget-list-item__type">{def?.description}</span>
                        </div>
                      </div>
                      <div className="widget-list-item__actions">
                        <button
                          className={`icon-btn sm ${widget.enabled ? '' : 'disabled'}`}
                          onClick={() => toggleWidget(widget.id, !widget.enabled)}
                          aria-label={widget.enabled ? 'Disable' : 'Enable'}
                          aria-pressed={widget.enabled}
                        >
                          {widget.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button className="icon-btn sm" onClick={() => reorderWidget(widget.id, 'up')} disabled={idx === 0} aria-label="Move up">
                          <ChevronUp size={14} />
                        </button>
                        <button className="icon-btn sm" onClick={() => reorderWidget(widget.id, 'down')} disabled={idx === widgets.length - 1} aria-label="Move down">
                          <ChevronDown size={14} />
                        </button>
                        <button className="icon-btn sm danger" onClick={() => removeWidget(widget.id)} aria-label="Remove">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="settings-divider" />

              <h4>Add Widget</h4>
              <div className="widget-picker">
                {Object.entries(WIDGET_DEFINITIONS).map(([type, def]) => {
                  const exists = widgets.some(w => w.type === type);
                  return (
                    <button
                      key={type}
                      className={`widget-picker-item ${exists ? 'added' : ''}`}
                      onClick={() => addWidget(type as WidgetType)}
                      disabled={exists}
                    >
                      {def.icon}
                      <span>{def.label}</span>
                      {exists && <span className="added-badge">Added</span>}
                    </button>
                  );
                })}
              </div>

              <div className="settings-actions">
                <button className="btn btn--ghost" onClick={resetWidgets}>
                  <ChevronUp size={16} /> Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {/* Sources Tab */}
          {activeTab === 'sources' && (
            <div className="settings-section">
              <h3>Data Sources</h3>
              <p className="settings-desc">Enable/disable content sources. Disabled sources won't appear in your feed or widgets.</p>

              <div className="source-list">
                {Object.entries(defaultSourceConfigs).map(([id, config]) => {
                  const enabled = sourceStates[id] !== 'disabled'; // Default to enabled
                  const itemCount = 0; // Could get from feed
                  return (
                    <div key={id} className="source-list-item">
                      <div className="source-list-item__info">
                        <span className="source-list-item__label">{config.label}</span>
                        <span className="source-list-item__desc">
                          TTL: {config.ttlMinutes} min {itemCount > 0 && `· ${itemCount} items`}
                        </span>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={e => toggleSource(id, e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="settings-divider" />

              <h4>Auto Refresh</h4>
              <label className="setting-row">
                <span>
                  <Bell size={18} />
                  <div>
                    <strong>Auto-refresh enabled</strong>
                    <small>Periodically fetch fresh data in background</small>
                  </div>
                </span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
                  <span className="toggle-slider"></span>
                </label>
              </label>

              <label className="setting-row">
                <span>
                  <RefreshCw size={18} />
                  <div>
                    <strong>Refresh interval</strong>
                    <small>How often to check for new content (minutes)</small>
                  </div>
                </span>
                <select value={refreshInterval} onChange={e => setRefreshInterval(Number(e.target.value))} className="setting-select">
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </label>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h3>AI Preferences</h3>
              <p className="settings-desc">Your learned preferences from chat interactions. These drive the "Recommended for You" widget.</p>

              <div className="preference-grid">
                <div className="preference-card">
                  <h4>Favorite Genres</h4>
                  <div className="genre-weights">
                    {Object.entries(profile.genreWeights)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 10)
                      .map(([genre, weight]) => (
                        <div key={genre} className="genre-weight">
                          <span>{genre}</span>
                          <div className="weight-bar">
                            <div className="weight-fill" style={{ width: `${weight * 100}%` }} />
                          </div>
                          <span className="weight-value">{Math.round(weight * 100)}%</span>
                        </div>
                      ))}
                    {Object.keys(profile.genreWeights).length === 0 && (
                      <p className="empty-state">No genre preferences yet. Chat about movies to build your profile!</p>
                    )}
                  </div>
                </div>

                <div className="preference-card">
                  <h4>Source Trust</h4>
                  <div className="source-weights">
                    {Object.entries(profile.sourceWeights).map(([source, weight]) => (
                      <div key={source} className="source-weight">
                        <span>{source === 'rottenTomatoes' ? 'Rotten Tomatoes' : source}</span>
                        <div className="weight-bar">
                          <div className="weight-fill" style={{ width: `${weight * 100}%` }} />
                        </div>
                        <span className="weight-value">{Math.round(weight * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="preference-card">
                  <h4>Content Types</h4>
                  <div className="kind-weights">
                    {Object.entries(profile.kindWeights).map(([kind, weight]) => (
                      <div key={kind} className="kind-weight">
                        <span>{kind}</span>
                        <div className="weight-bar">
                          <div className="weight-fill" style={{ width: `${weight * 100}%` }} />
                        </div>
                        <span className="weight-value">{Math.round(weight * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="preference-card">
                  <h4>Settings</h4>
                  <div className="preference-settings">
                    <div className="setting-item">
                      <label>Minimum Rating: {profile.minRating}/100</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={profile.minRating}
                        onChange={e => updateProfile({ minRating: Number(e.target.value) })}
                      />
                    </div>
                    <div className="setting-item">
                      <label>Recency Preference</label>
                      <select
                        value={profile.recency}
                        onChange={e => updateProfile({ recency: e.target.value as 'latest' | 'recent' | 'classic' | 'any' })}
                        className="setting-select"
                      >
                        <option value="any">Any</option>
                        <option value="latest">Latest</option>
                        <option value="recent">Recent</option>
                        <option value="classic">Classic</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-divider" />

              <div className="preference-stats">
                <div className="stat">
                  <span className="stat-value">{profile.messageCount}</span>
                  <span className="stat-label">Messages</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{profile.watchlist.length}</span>
                  <span className="stat-label">Watchlist</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{profile.recentlyDiscussed.length}</span>
                  <span className="stat-label">Discussed</span>
                </div>
              </div>

              <div className="settings-actions">
                <button className="btn btn--ghost danger" onClick={() => clearChat()}>
                  <Trash2 size={16} /> Clear Chat & Reset Preferences
                </button>
              </div>
            </div>
          )}

          {/* Data & Cache Tab */}
          {activeTab === 'data' && (
            <div className="settings-section">
              <h3>Data Management</h3>
              <p className="settings-desc">Manage cached data and force refreshes.</p>

              <div className="data-sources">
                {Object.entries(defaultSourceConfigs).map(([id, config]) => (
                  <div key={id} className="data-source-card">
                    <div className="data-source-header">
                      <strong>{config.label}</strong>
                      <span className="source-ttl">TTL: {config.ttlMinutes} min</span>
                    </div>
                    <div className="data-source-actions">
                      <button className="btn btn--sm btn--ghost" onClick={() => handleRefreshSource(id)}>
                        <RefreshCw size={14} /> Refresh Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="settings-divider" />

              <div className="data-actions">
                <button className="btn btn--ghost" onClick={handleClearCache}>
                  <Database size={16} /> Clear All Cache
                </button>
                <button className="btn btn--ghost danger" onClick={handleResetAll}>
                  <Trash2 size={16} /> Reset Everything
                </button>
              </div>

              <div className="settings-divider" />

              <h4>Debug Info</h4>
              <pre className="debug-info">
                {JSON.stringify({
                  widgets: widgets.length,
                  sources: Object.keys(sourceStates),
                  chatMessages: profile.messageCount,
                  watchlist: profile.watchlist.length,
                  recentlyDiscussed: profile.recentlyDiscussed.length,
                  refreshInterval,
                  autoRefresh,
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="btn btn--primary" onClick={onClose}>
            <Save size={16} /> Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}

/** Settings trigger button */
export function SettingsTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="icon-btn settings-trigger" onClick={onOpen} aria-label="Open settings">
      <Settings size={20} />
    </button>
  );
}