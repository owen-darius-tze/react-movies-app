/**
 * Chat interface types for AI-personalized entertainment aggregator.
 * Integrates with AI SDK for streaming responses and preference extraction.
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string
  /** Structured data extracted from assistant response */
  metadata?: ChatMetadata;
}

export interface ChatMetadata {
  /** Extracted user preferences from this message */
  preferences?: UserPreferencesDelta;
  /** Items mentioned in the conversation */
  mentionedItems?: string[]; // ContentItem IDs
  /** Source recommendations */
  sourceRecommendations?: SourceId[];
}

export interface UserPreferencesDelta {
  /** Genres the user showed interest in */
  genres?: string[];
  /** Sources the user mentioned or prefers */
  sources?: SourceId[];
  /** Minimum rating thresholds mentioned */
  minRating?: number;
  /** Content kinds of interest */
  kinds?: ContentKind[];
  /** Time recency preference */
  recency?: 'latest' | 'recent' | 'classic' | 'any';
  /** Explicit watchlist additions */
  watchlistAdditions?: string[];
  /** Explicit watchlist removals */
  watchlistRemovals?: string[];
}

export type SourceId = 'insider' | 'rottenTomatoes' | 'tmdb';
export type ContentKind = 'movie' | 'tv' | 'show' | 'article';

/** Accumulated user preference profile */
export interface UserPreferenceProfile {
  /** Weighted genre preferences (0-1) */
  genreWeights: Record<string, number>;
  /** Source trust/preference weights (0-1) */
  sourceWeights: Record<SourceId, number>;
  /** Minimum rating threshold (0-100) */
  minRating: number;
  /** Preferred content kinds */
  kindWeights: Record<ContentKind, number>;
  /** Recency preference */
  recency: 'latest' | 'recent' | 'classic' | 'any';
  /** Watchlist item IDs */
  watchlist: string[];
  /** Recently discussed item IDs (for "Recently Discussed" widget) */
  recentlyDiscussed: string[];
  /** Total message count for weighting */
  messageCount: number;
  /** Last updated timestamp */
  updatedAt: string;
}

/** Default empty preference profile */
export const DEFAULT_PREFERENCE_PROFILE: UserPreferenceProfile = {
  genreWeights: {},
  sourceWeights: {
    insider: 0.5,
    rottenTomatoes: 0.5,
    tmdb: 0.3,
  },
  minRating: 0,
  kindWeights: {
    movie: 0.5,
    tv: 0.4,
    show: 0.3,
    article: 0.3,
  },
  recency: 'any',
  watchlist: [],
  recentlyDiscussed: [],
  messageCount: 0,
  updatedAt: '',
};

// Helper to create a profile with current timestamp
export function createDefaultProfile(): UserPreferenceProfile {
  return {
    ...DEFAULT_PREFERENCE_PROFILE,
    updatedAt: new Date().toISOString(),
  };
}

/** Chat session state */
export interface ChatSession {
  messages: ChatMessage[];
  profile: UserPreferenceProfile;
  isLoading: boolean;
  error?: string;
}

/** Widget configuration for the modular dashboard */
export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  enabled: boolean;
  order: number;
  /** Source filter for this widget */
  sourceFilter?: SourceId | 'all';
  /** Kind filter */
  kindFilter?: ContentKind | 'all';
  /** Genre filter */
  genreFilter?: string[];
  /** Minimum rating for this widget */
  minRating?: number;
  /** Maximum items to show */
  maxItems?: number;
}

export type WidgetType =
  | 'recommended'           // AI-driven from chat history
  | 'trendingInsider'       // Insider TV trending
  | 'rottenTomatoesTop'     // Certified Fresh / Top Rated
  | 'latestNewsReviews'     // Combined feed
  | 'watchlist'             // User-saved items
  | 'recentlyDiscussed';    // From chat history

/** Dashboard layout configuration */
export interface DashboardLayout {
  widgets: WidgetConfig[];
  sidebarOpen: boolean;
}

/** Chat context for AI (what we send to the LLM) */
export interface ChatContext {
  /** Current user preference profile */
  preferences: UserPreferenceProfile;
  /** Recent messages for context */
  recentMessages: ChatMessage[];
  /** Available content items (summarized) */
  availableContent: {
    totalItems: number;
    sources: Record<SourceId, number>;
    topGenres: string[];
    latestItems: Array<{ id: string; title: string; source: SourceId; kind: ContentKind; rating?: number }>;
  };
}