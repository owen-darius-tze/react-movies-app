/**
 * Dashboard Widgets - Modular, connectable UI components for the personalized homepage
 */

import { useState, useEffect } from 'react';
import {
  Star, TrendingUp, Zap, Newspaper, Bookmark, Clock, Clock as ClockIcon,
  GripVertical, X, Settings, Eye, EyeOff, ChevronUp, ChevronDown,
  Film, Tv, Newspaper as NewspaperIcon, Sparkles, Target
} from 'lucide-react';
import { MediaCard, detailPath, type MediaItem } from './MediaCard';
import { Rail, SkeletonRail } from './Rail';
import { ScoreBadge } from './Score';
import { imageUrl } from '../lib/tmdb';
import type { ContentItem, SourceId, ContentKind, WidgetConfig, WidgetType } from '../lib/chat/types';
import { getFeed, searchContent, type DataFilters } from '../lib/data';
import { useChatStore, scoreContentItem } from '../lib/chat/store';
import { format } from 'date-fns';

// Import date-fns
import { formatDistanceToNow } from 'date-fns';

// Widget type configurations
export const WIDGET_DEFINITIONS: Record<WidgetType, { icon: React.ReactNode; label: string; description: string }> = {
  recommended: { icon: <Target size={18} />, label: 'Recommended for You', description: 'AI-driven picks from your chat history' },
  trendingInsider: { icon: <Zap size={18} />, label: 'Trending from Insiders', description: 'Latest Insider TV shows & articles' },
  rottenTomatoesTop: { icon: <Star size={18} />, label: 'Rotten Tomatoes Top Rated', description: 'Certified Fresh & highest rated movies' },
  latestNewsReviews: { icon: <NewspaperIcon size={18} />, label: 'Latest News & Reviews', description: 'Combined feed of articles & reviews' },
  watchlist: { icon: <Bookmark size={18} />, label: 'Your Watchlist', description: 'Movies & shows you saved' },
  recentlyDiscussed: { icon: <ClockIcon size={18} />, label: 'Recently Discussed', description: 'Items from your chat history' },
};

type WidgetProps = {
  config: WidgetConfig;
  profile: ReturnType<typeof useChatStore>['profile'];
  onRemove?: (id: string) => void;
  onReorder?: (id: string, direction: 'up' | 'down') => void;
  onToggle?: (id: string, enabled: boolean) => void;
  compact?: boolean;
};

/** Base widget wrapper with common UI */
function WidgetWrapper({
  children,
  config,
  onRemove,
  onReorder,
  onToggle,
  compact,
}: WidgetProps & { children: React.ReactNode }) {
  const def = WIDGET_DEFINITIONS[config.type as WidgetType];

  if (compact) {
    return (
      <div className="widget-compact" data-widget-id={config.id}>
        <div className="widget-compact__header">
          {def && <span>{def.icon}</span>}
          <h3 className="widget-compact__title">{config.title}</h3>
          <div className="widget-compact__actions">
            <button
              className="icon-btn sm"
              onClick={() => onToggle?.(config.id, !config.enabled)}
              aria-label={config.enabled ? 'Disable widget' : 'Enable widget'}
            >
              {config.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            {onReorder && (
              <>
                <button className="icon-btn sm" onClick={() => onReorder(config.id, 'up')} aria-label="Move up">
                  <ChevronUp size={14} />
                </button>
                <button className="icon-btn sm" onClick={() => onReorder(config.id, 'down')} aria-label="Move down">
                  <ChevronDown size={14} />
                </button>
              </>
            )}
            {onRemove && (
              <button className="icon-btn sm" onClick={() => onRemove(config.id)} aria-label="Remove widget">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        {config.enabled && <div className="widget-compact__content">{children}</div>}
      </div>
    );
  }

  return (
    <section className={`widget ${!config.enabled ? 'widget--disabled' : ''}`} data-widget-id={config.id} aria-labelledby={`widget-${config.id}-title`}>
      <div className="widget__header">
        <div className="widget__title-row">
          {def && <span className="widget__icon" aria-hidden="true">{def.icon}</span>}
          <h2 id={`widget-${config.id}-title`} className="widget__title">{config.title}</h2>
        </div>
        <div className="widget__actions">
          <button
            className="icon-btn sm"
            onClick={() => onToggle?.(config.id, !config.enabled)}
            aria-label={config.enabled ? 'Disable widget' : 'Enable widget'}
            aria-pressed={config.enabled}
          >
            {config.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          {onReorder && (
            <>
              <button className="icon-btn sm" onClick={() => onReorder(config.id, 'up')} aria-label="Move up">
                <ChevronUp size={14} />
              </button>
              <button className="icon-btn sm" onClick={() => onReorder(config.id, 'down')} aria-label="Move down">
                <ChevronDown size={14} />
              </button>
            </>
          )}
          {onRemove && (
            <button className="icon-btn sm" onClick={() => onRemove(config.id)} aria-label="Remove widget">
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      {config.enabled && <div className="widget__content">{children}</div>}
    </section>
  );
}

/** Recommended for You Widget */
function RecommendedWidget({ config, profile }: WidgetProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getFeed().then(feed => {
      if (mounted) {
        // Score items based on preferences
        const scored = feed.items
          .map(item => ({ item, score: scoreContentItem(item, profile) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, config.maxItems || 10)
          .map(({ item }) => item);
        setItems(scored);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [config.maxItems, profile]);

  if (loading) return <WidgetWrapper config={config}><SkeletonRail count={6} /></WidgetWrapper>;
  if (!items.length) return <WidgetWrapper config={config}><div className="widget__empty">No recommendations yet. Start chatting to get personalized picks!</div></WidgetWrapper>;

  return (
    <WidgetWrapper config={config}>
      <Rail>
        {items.map(item => (
          <ContentItemCard key={item.id} item={item} />
        ))}
      </Rail>
    </WidgetWrapper>
  );
}

/** Trending from Insiders Widget */
function TrendingInsiderWidget({ config }: WidgetProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getFeed().then(feed => {
      if (mounted) {
        const filtered = feed.items
          .filter(i => i.source === 'insider' && (i.kind === 'show' || i.kind === 'article'))
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, config.maxItems || 10);
        setItems(filtered);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [config.maxItems]);

  if (loading) return <WidgetWrapper config={config}><SkeletonRail count={6} /></WidgetWrapper>;
  if (!items.length) return <WidgetWrapper config={config}><div className="widget__empty">No Insider TV content available</div></WidgetWrapper>;

  return (
    <WidgetWrapper config={config}>
      <Rail>
        {items.map(item => (
          <ContentItemCard key={item.id} item={item} showSource />
        ))}
      </Rail>
    </WidgetWrapper>
  );
}

/** Rotten Tomatoes Top Rated Widget */
function RottenTomatoesTopWidget({ config }: WidgetProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getFeed().then(feed => {
      if (mounted) {
        const filtered = feed.items
          .filter(i => i.source === 'rottenTomatoes' && i.kind === 'movie' && i.rating)
          .sort((a, b) => {
            const aScore = a.rating ? Math.max(a.rating.critic || 0, a.rating.audience || 0) : 0;
            const bScore = b.rating ? Math.max(b.rating.critic || 0, b.rating.audience || 0) : 0;
            return bScore - aScore;
          })
          .slice(0, config.maxItems || 10);
        setItems(filtered);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [config.maxItems]);

  if (loading) return <WidgetWrapper config={config}><SkeletonRail count={6} /></WidgetWrapper>;
  if (!items.length) return <WidgetWrapper config={config}><div className="widget__empty">No Rotten Tomatoes data available</div></WidgetWrapper>;

  return (
    <WidgetWrapper config={config}>
      <Rail>
        {items.map((item, idx) => (
          <ContentItemCard key={item.id} item={item} showRank={idx + 1} showScore />
        ))}
      </Rail>
    </WidgetWrapper>
  );
}

/** Latest News & Reviews Widget */
function LatestNewsReviewsWidget({ config }: WidgetProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getFeed().then(feed => {
      if (mounted) {
        const filtered = feed.items
          .filter(i => i.kind === 'article' || i.kind === 'show')
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, config.maxItems || 10);
        setItems(filtered);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [config.maxItems]);

  if (loading) return <WidgetWrapper config={config}><SkeletonRail count={6} /></WidgetWrapper>;
  if (!items.length) return <WidgetWrapper config={config}><div className="widget__empty">No news & reviews available</div></WidgetWrapper>;

  return (
    <WidgetWrapper config={config}>
      <div className="widget__list">
        {items.map(item => (
          <ContentItemListItem key={item.id} item={item} />
        ))}
      </div>
    </WidgetWrapper>
  );
}

/** Watchlist Widget */
function WatchlistWidget({ config, profile }: WidgetProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { removeFromWatchlist } = useChatStore();

  useEffect(() => {
    let mounted = true;
    getFeed().then(feed => {
      if (mounted) {
        const filtered = feed.items.filter(i => profile.watchlist.includes(i.id));
        setItems(filtered);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [profile.watchlist, config.maxItems]);

  if (loading) return <WidgetWrapper config={config}><SkeletonRail count={6} /></WidgetWrapper>;
  if (!items.length) return <WidgetWrapper config={config}><div className="widget__empty">Your watchlist is empty. Add items from chat or search!</div></WidgetWrapper>;

  return (
    <WidgetWrapper config={config}>
      <Rail>
        {items.map(item => (
          <ContentItemCard key={item.id} item={item} showRemoveWatchlist onRemoveWatchlist={() => removeFromWatchlist(item.id)} />
        ))}
      </Rail>
    </WidgetWrapper>
  );
}

/** Recently Discussed Widget */
function RecentlyDiscussedWidget({ config, profile }: WidgetProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getFeed().then(feed => {
      if (mounted) {
        const filtered = feed.items
          .filter(i => profile.recentlyDiscussed.includes(i.id))
          .sort((a, b) => profile.recentlyDiscussed.indexOf(a.id) - profile.recentlyDiscussed.indexOf(b.id))
          .slice(0, config.maxItems || 10);
        setItems(filtered);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [profile.recentlyDiscussed, config.maxItems]);

  if (loading) return <WidgetWrapper config={config}><SkeletonRail count={6} /></WidgetWrapper>;
  if (!items.length) return <WidgetWrapper config={config}><div className="widget__empty">No recent discussions. Start chatting about movies!</div></WidgetWrapper>;

  return (
    <WidgetWrapper config={config}>
      <Rail>
        {items.map((item, idx) => (
          <ContentItemCard key={item.id} item={item} showRecency={idx} />
        ))}
      </Rail>
    </WidgetWrapper>
  );
}

/** Content Item Card - unified display for widgets */
interface ContentItemCardProps {
  item: ContentItem;
  showRank?: number;
  showScore?: boolean;
  showSource?: boolean;
  showRecency?: number;
  showRemoveWatchlist?: boolean;
  onRemoveWatchlist?: () => void;
}

function ContentItemCard({
  item,
  showRank,
  showScore,
  showSource,
  showRecency,
  showRemoveWatchlist,
  onRemoveWatchlist,
}: ContentItemCardProps) {
  const kindIcons: Record<ContentKind, React.ReactNode> = {
    movie: <Film size={14} />,
    tv: <Tv size={14} />,
    show: <Sparkles size={14} />,
    article: <NewspaperIcon size={14} />,
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
    <article className="content-card" style={{ '--source-color': sourceColors[item.source] }}>
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="content-card__link"
        aria-label={`${item.title} on ${sourceLabels[item.source]}`}
      >
        <div className="content-card__poster">
          {item.image ? (
            <img src={item.image} alt={item.title} loading="lazy" />
          ) : (
            <div className="content-card__placeholder">{kindIcons[item.kind]}</div>
          )}
          {showRank && <span className="content-card__rank">{showRank}</span>}
          {showScore && bestRating && (
            <div className="content-card__score" style={{ background: `var(--source-color)` }}>
              {bestRating}
              {isCertifiedFresh && <span className="certified-fresh-badge">Fresh</span>}
            </div>
          )}
          {showSource && (
            <span className="content-card__source" style={{ borderColor: `var(--source-color)` }}>
              {sourceLabels[item.source]}
            </span>
          )}
        </div>
        <div className="content-card__body">
          <h4 className="content-card__title">{item.title}</h4>
          <p className="content-card__meta">
            {item.year && <span>{item.year}</span>}
            {item.kind === 'article' && (
              <>
                {item.year && <span>·</span>}
                <time dateTime={item.publishedAt}>{formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}</time>
              </>
            )}
          </p>
          <p className="content-card__genres">
            {item.genres.slice(0, 3).map(g => <span key={g} className="genre-chip">{g}</span>)}
          </p>
        </div>
      </a>
      {showRemoveWatchlist && onRemoveWatchlist && (
        <button className="content-card__remove" onClick={onRemoveWatchlist} aria-label={`Remove ${item.title} from watchlist`}>
          <Bookmark size={14} className="filled" />
        </button>
      )}
    </article>
  );
}

/** Content Item List Item (for news/reviews widget) */
function ContentItemListItem({ item }: { item: ContentItem }) {
  const kindIcons: Record<ContentKind, React.ReactNode> = {
    movie: <Film size={16} />,
    tv: <Tv size={16} />,
    show: <Sparkles size={16} />,
    article: <NewspaperIcon size={16} />,
  };

  const sourceLabels: Record<SourceId, string> = {
    insider: 'Insider TV',
    rottenTomatoes: 'Rotten Tomatoes',
    tmdb: 'TMDB',
  };

  return (
    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="content-list-item">
      <div className="content-list-item__image">
        {item.image ? <img src={item.image} alt="" loading="lazy" /> : <div className="placeholder">{kindIcons[item.kind]}</div>}
      </div>
      <div className="content-list-item__content">
        <div className="content-list-item__meta">
          <span className="content-list-item__kind">{kindIcons[item.kind]} {item.kind}</span>
          <span className="content-list-item__source" style={{ color: 'var(--text-muted)' }}>{sourceLabels[item.source]}</span>
        </div>
        <h4 className="content-list-item__title">{item.title}</h4>
        <p className="content-list-item__description">{item.description}</p>
        <div className="content-list-item__footer">
          <time dateTime={item.publishedAt}>{formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}</time>
          {item.rating && (
            <span className="content-list-item__rating">
              <Star size={12} fill="currentColor" /> {Math.max(item.rating.critic || 0, item.rating.audience || 0)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

/** Widget Registry - maps widget types to components */
const WIDGET_COMPONENTS: Record<WidgetType, React.ComponentType<WidgetProps>> = {
  recommended: RecommendedWidget,
  trendingInsider: TrendingInsiderWidget,
  rottenTomatoesTop: RottenTomatoesTopWidget,
  latestNewsReviews: LatestNewsReviewsWidget,
  watchlist: WatchlistWidget,
  recentlyDiscussed: RecentlyDiscussedWidget,
};

/** Main Dashboard Widget Renderer */
export function DashboardWidget({ config, profile, ...props }: WidgetProps) {
  const Component = WIDGET_COMPONENTS[config.type as WidgetType];
  if (!Component) return null;
  return <Component config={config} profile={profile} {...props} />;
}

// Export DEFAULT_WIDGETS for use in other components
export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'w-recommended', type: 'recommended', title: 'Recommended for You', enabled: true, order: 0, maxItems: 10 },
  { id: 'w-trending', type: 'trendingInsider', title: 'Trending from Insiders', enabled: true, order: 1, maxItems: 10 },
  { id: 'w-rt-top', type: 'rottenTomatoesTop', title: 'Rotten Tomatoes Top Rated', enabled: true, order: 2, maxItems: 10 },
  { id: 'w-news', type: 'latestNewsReviews', title: 'Latest News & Reviews', enabled: true, order: 3, maxItems: 10 },
  { id: 'w-watchlist', type: 'watchlist', title: 'Your Watchlist', enabled: true, order: 4, maxItems: 10 },
  { id: 'w-recent', type: 'recentlyDiscussed', title: 'Recently Discussed', enabled: true, order: 5, maxItems: 10 },
];

/** Dashboard Grid - renders all enabled widgets in order */
interface DashboardGridProps {
  widgets: WidgetConfig[];
  profile: ReturnType<typeof useChatStore>['profile'];
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onToggle: (id: string, enabled: boolean) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}

export function DashboardGrid({ widgets, profile, onReorder, onToggle, onRemove, compact }: DashboardGridProps) {
  const enabledWidgets = widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order);

  if (enabledWidgets.length === 0) {
    return (
      <div className="dashboard-empty">
        <Sparkles size={48} />
        <h3>No widgets enabled</h3>
        <p>Enable widgets in Settings to build your personalized dashboard</p>
        <button className="btn btn--primary" onClick={() => window.dispatchEvent(new CustomEvent('dashboard:open-settings'))}>
          Open Settings
        </button>
      </div>
    );
  }

  return (
    <div className={compact ? 'dashboard-grid-compact' : 'dashboard-grid'}>
      {enabledWidgets.map((widget, idx) => (
        <DashboardWidget
          key={widget.id}
          config={widget}
          profile={profile}
          onReorder={onReorder}
          onToggle={onToggle}
          onRemove={onRemove}
          compact={compact}
        />
      ))}
    </div>
  );
}