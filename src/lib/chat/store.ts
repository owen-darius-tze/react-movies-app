/**
 * Chat store - Zustand-based state management for chat interface and user preferences.
 * Handles message history, preference extraction, and profile persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ChatMessage,
  ChatSession,
  UserPreferenceProfile,
  UserPreferencesDelta,
  ChatMetadata,
  SourceId,
  ContentKind,
} from './types';
import { DEFAULT_PREFERENCE_PROFILE } from './types';

const STORAGE_KEY = 'microfilm:chat';

/**
 * Extract preferences from assistant response using heuristic analysis.
 * In production, this could call a structured extraction LLM.
 */
function extractPreferencesFromResponse(content: string, messageId: string): UserPreferencesDelta {
  const lower = content.toLowerCase();
  const delta: UserPreferencesDelta = {};

  // Genre detection
  const genreKeywords: Record<string, string[]> = {
    'crime': ['crime', 'mob', 'mafia', 'gangster', 'heist'],
    'drama': ['drama', 'dramatic', 'serious'],
    'action': ['action', 'action movie', 'thriller'],
    'comedy': ['comedy', 'funny', 'humor'],
    'sci-fi': ['sci-fi', 'science fiction', 'space', 'futuristic'],
    'horror': ['horror', 'scary', 'frightening'],
    'romance': ['romance', 'romantic', 'love story'],
    'documentary': ['documentary', 'docuseries', 'non-fiction'],
    'animation': ['animation', 'animated', 'anime'],
    'mystery': ['mystery', 'detective', 'whodunit'],
    'fantasy': ['fantasy', 'magical', 'supernatural'],
    'biography': ['biography', 'biopic', 'true story'],
  };

  const detectedGenres: string[] = [];
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some(k => lower.includes(k))) {
      detectedGenres.push(genre);
    }
  }
  if (detectedGenres.length > 0) delta.genres = detectedGenres;

  // Source detection
  if (lower.includes('insider') || lower.includes('insider tv')) {
    delta.sources = ['insider'];
  }
  if (lower.includes('rotten tomatoes') || lower.includes('rotten tomato') || lower.includes('certified fresh')) {
    delta.sources = [...(delta.sources || []), 'rottenTomatoes'];
  }
  if (lower.includes('tmdb') || lower.includes('the movie database')) {
    delta.sources = [...(delta.sources || []), 'tmdb'];
  }

  // Rating threshold detection
  const ratingMatch = lower.match(/(?:rating|score|rated)\s*(?:above|over|at least|minimum|min)?\s*(\d+(?:\.\d+)?)/);
  if (ratingMatch) {
    const rating = parseFloat(ratingMatch[1]);
    if (rating <= 10) delta.minRating = rating * 10; // Convert 0-10 to 0-100
    else if (rating <= 100) delta.minRating = rating;
  }

  // Content kind detection
  const kinds: ContentKind[] = [];
  if (lower.includes('movie') || lower.includes('film')) kinds.push('movie');
  if (lower.includes('tv show') || lower.includes('series') || lower.includes('tv series')) kinds.push('tv');
  if (lower.includes('article') || lower.includes('review') || lower.includes('news')) kinds.push('article');
  if (lower.includes('show') && !lower.includes('tv show')) kinds.push('show');
  if (kinds.length > 0) delta.kinds = kinds;

  // Recency detection
  if (lower.includes('latest') || lower.includes('newest') || lower.includes('just released') || lower.includes('this week')) {
    delta.recency = 'latest';
  } else if (lower.includes('recent') || lower.includes('last few') || lower.includes('last month')) {
    delta.recency = 'recent';
  } else if (lower.includes('classic') || lower.includes('old') || lower.includes('vintage') || lower.includes('90s') || lower.includes('80s') || lower.includes('70s')) {
    delta.recency = 'classic';
  }

  // Watchlist actions
  if (lower.includes('add to watchlist') || lower.includes('save for later') || lower.includes('watch later')) {
    // Would need context about which item - simplified for now
    delta.watchlistAdditions = [];
  }
  if (lower.includes('remove from watchlist') || lower.includes('unwatch') || lower.includes('remove from watch later')) {
    delta.watchlistRemovals = [];
  }

  return delta;
}

/**
 * Merge preference delta into existing profile with decay/weighting.
 */
function mergePreferences(profile: UserPreferenceProfile, delta: UserPreferencesDelta, messageCount: number): UserPreferenceProfile {
  const newProfile = { ...profile };

  // Merge genres with decay - newer mentions get higher weight
  if (delta.genres) {
    const newGenreWeights = { ...newProfile.genreWeights };
    for (const genre of delta.genres) {
      const current = newGenreWeights[genre] || 0;
      // Boost by 0.15 per mention, capped at 1.0, with slight decay for older preferences
      newGenreWeights[genre] = Math.min(1, current + 0.15);
    }
    // Decay old genres slightly
    for (const genre of Object.keys(newGenreWeights)) {
      if (!delta.genres?.includes(genre)) {
        newGenreWeights[genre] = Math.max(0, newGenreWeights[genre] - 0.02);
      }
    }
    newProfile.genreWeights = newGenreWeights;
  }

  // Merge sources
  if (delta.sources) {
    const newSourceWeights = { ...newProfile.sourceWeights };
    for (const source of delta.sources) {
      const current = newSourceWeights[source] || 0;
      newSourceWeights[source] = Math.min(1, current + 0.2);
    }
    newProfile.sourceWeights = newSourceWeights;
  }

  // Update minimum rating (take the maximum mentioned)
  if (delta.minRating !== undefined) {
    newProfile.minRating = Math.max(newProfile.minRating, delta.minRating);
  }

  // Merge kinds
  if (delta.kinds) {
    const newKindWeights = { ...newProfile.kindWeights };
    for (const kind of delta.kinds) {
      const current = newKindWeights[kind] || 0;
      newKindWeights[kind] = Math.min(1, current + 0.15);
    }
    newProfile.kindWeights = newKindWeights;
  }

  // Update recency (last mention wins)
  if (delta.recency) {
    newProfile.recency = delta.recency;
  }

  // Watchlist
  if (delta.watchlistAdditions) {
    for (const id of delta.watchlistAdditions) {
      if (!newProfile.watchlist.includes(id)) {
        newProfile.watchlist.push(id);
      }
    }
  }
  if (delta.watchlistRemovals) {
    newProfile.watchlist = newProfile.watchlist.filter(id => !delta.watchlistRemovals!.includes(id));
  }

  newProfile.messageCount = messageCount;
  newProfile.updatedAt = new Date().toISOString();

  return newProfile;
}

/**
 * Score a content item based on user preferences.
 * Returns a relevance score 0-100.
 */
export function scoreContentItem(
  item: {
    id: string;
    source: SourceId;
    kind: ContentKind;
    genres: string[];
    rating?: { critic?: number; audience?: number; imdb?: number };
    publishedAt: string;
  },
  profile: UserPreferenceProfile
): number {
  let score = 50; // base score

  // Genre match
  for (const genre of item.genres) {
    const weight = profile.genreWeights[genre] || 0;
    score += weight * 30; // up to +30 for strong genre match
  }

  // Source preference
  const sourceWeight = profile.sourceWeights[item.source] || 0;
  score += sourceWeight * 20;

  // Kind preference
  const kindWeight = profile.kindWeights[item.kind] || 0;
  score += kindWeight * 15;

  // Rating threshold
  if (item.rating && profile.minRating > 0) {
    const bestRating = Math.max(
      item.rating.critic || 0,
      item.rating.audience || 0,
      (item.rating.imdb || 0) * 10
    );
    if (bestRating >= profile.minRating) {
      score += 20;
    } else {
      score -= 30; // Penalize below threshold
    }
  }

  // Recency
  const itemDate = new Date(item.publishedAt).getTime();
  const now = Date.now();
  const ageDays = (now - itemDate) / (1000 * 60 * 60 * 24);

  switch (profile.recency) {
    case 'latest':
      if (ageDays <= 7) score += 15;
      else if (ageDays <= 30) score += 5;
      else score -= 10;
      break;
    case 'recent':
      if (ageDays <= 30) score += 10;
      else if (ageDays <= 90) score += 5;
      else score -= 5;
      break;
    case 'classic':
      if (ageDays >= 365 * 10) score += 15;
      else if (ageDays >= 365 * 5) score += 10;
      break;
    case 'any':
    default:
      break;
  }

  // Boost recently discussed items
  if (profile.recentlyDiscussed.includes(item.id)) {
    score += 25;
  }

  // Boost watchlist items
  if (profile.watchlist.includes(item.id)) {
    score += 40;
  }

  return Math.max(0, Math.min(100, score));
}

interface ChatStoreState extends ChatSession {
  /** Add a user message and trigger assistant response */
  addUserMessage: (content: string) => void;
  /** Add an assistant message (from AI response) */
  addAssistantMessage: (content: string, metadata?: ChatMetadata) => void;
  /** Clear chat history and reset preferences */
  clearChat: () => void;
  /** Update preference profile manually */
  updateProfile: (profile: Partial<UserPreferenceProfile>) => void;
  /** Add item to watchlist */
  addToWatchlist: (itemId: string) => void;
  /** Remove item from watchlist */
  removeFromWatchlist: (itemId: string) => void;
  /** Add item to recently discussed */
  addToRecentlyDiscussed: (itemId: string) => void;
  /** Get scored/recommended items from a feed */
  getRecommendations: (items: Array<{
    id: string;
    source: SourceId;
    kind: ContentKind;
    genres: string[];
    rating?: { critic?: number; audience?: number; imdb?: number };
    publishedAt: string;
  }>, limit?: number) => Array<{ item: typeof items[0]; score: number }>;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error state */
  setError: (error?: string) => void;
}

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      messages: [],
      profile: DEFAULT_PREFERENCE_PROFILE,
      isLoading: false,
      error: undefined,

      addUserMessage: (content: string) => {
        const message: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          messages: [...state.messages, message],
          isLoading: true,
          error: undefined,
        }));
      },

      addAssistantMessage: (content: string, metadata?: ChatMetadata) => {
        const message: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          role: 'assistant',
          content,
          timestamp: new Date().toISOString(),
          metadata,
        };

        // Extract preferences from the assistant response
        const delta = extractPreferencesFromResponse(content, message.id);
        const newMessageCount = get().messages.filter(m => m.role === 'assistant').length + 1;
        const newProfile = mergePreferences(get().profile, delta, newMessageCount);

        // Track recently discussed items from metadata
        const recentlyDiscussed = metadata?.mentionedItems
          ? [...metadata.mentionedItems, ...get().profile.recentlyDiscussed].slice(0, 20)
          : get().profile.recentlyDiscussed;

        set(state => ({
          messages: [...state.messages, message],
          profile: {
            ...newProfile,
            recentlyDiscussed,
          },
          isLoading: false,
        }));
      },

      clearChat: () => {
        set({
          messages: [],
          profile: DEFAULT_PREFERENCE_PROFILE,
          isLoading: false,
          error: undefined,
        });
      },

      updateProfile: (partialProfile) => {
        set(state => ({
          profile: { ...state.profile, ...partialProfile },
        }));
      },

      addToWatchlist: (itemId: string) => {
        set(state => ({
          profile: {
            ...state.profile,
            watchlist: state.profile.watchlist.includes(itemId)
              ? state.profile.watchlist
              : [...state.profile.watchlist, itemId],
          },
        }));
      },

      removeFromWatchlist: (itemId: string) => {
        set(state => ({
          profile: {
            ...state.profile,
            watchlist: state.profile.watchlist.filter(id => id !== itemId),
          },
        }));
      },

      addToRecentlyDiscussed: (itemId: string) => {
        set(state => ({
          profile: {
            ...state.profile,
            recentlyDiscussed: [
              itemId,
              ...state.profile.recentlyDiscussed.filter(id => id !== itemId),
            ].slice(0, 20),
          },
        }));
      },

      getRecommendations: (items, limit = 20) => {
        const { profile } = get();
        return items
          .map(item => ({
            item,
            score: scoreContentItem(item, profile),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error?: string) => {
        set({ error, isLoading: false });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: state => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        profile: state.profile,
      }),
    }
  )
);