/**
 * Chat API - Handles AI streaming responses using Vercel AI SDK.
 * Integrates with the chat store for preference extraction and context.
 */

import { streamText, CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { ChatMessage, UserPreferenceProfile, ChatContext, SourceId, ContentKind } from './types';
import { getFeed, searchContent, type ContentItem, type DataFilters } from '../data';

/**
 * Build context for the AI from current feed data and user preferences
 */
export async function buildChatContext(profile: UserPreferenceProfile): Promise<ChatContext> {
  const feed = await getFeed();
  const items = feed.items;

  // Count by source
  const sources: Record<SourceId, number> = {
    insider: 0,
    rottenTomatoes: 0,
    tmdb: 0,
  };

  for (const item of items) {
    sources[item.source]++;
  }

  // Get top genres
  const genreCount: Record<string, number> = {};
  for (const item of items) {
    for (const genre of item.genres) {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    }
  }
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([genre]) => genre);

  // Get latest items
  const latestItems = [...items]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 10)
    .map(item => ({
      id: item.id,
      title: item.title,
      source: item.source,
      kind: item.kind,
      rating: item.rating ? Math.max(
        item.rating.critic || 0,
        item.rating.audience || 0,
        (item.rating.imdb || 0) * 10
      ) : undefined,
    }));

  return {
    preferences: profile,
    recentMessages: [], // Filled in by caller
    availableContent: {
      totalItems: items.length,
      sources,
      topGenres,
      latestItems,
    },
  };
}

/**
 * Convert chat messages to AI SDK format
 */
function toCoreMessages(messages: ChatMessage[]): CoreMessage[] {
  return messages.map(m => ({
    role: m.role,
    content: m.content,
  }));
}

/**
 * Build system prompt with context about available content and user preferences
 */
function buildSystemPrompt(context: ChatContext): string {
  const { preferences, availableContent } = context;

  const sourceLabels: Record<SourceId, string> = {
    insider: 'Insider TV (articles, shows, behind-the-scenes)',
    rottenTomatoes: 'Rotten Tomatoes (critic/audience scores, Certified Fresh)',
    tmdb: 'TMDB (metadata, posters, trailers)',
  };

  const kindLabels: Record<ContentKind, string> = {
    movie: 'Movies',
    tv: 'TV Series',
    show: 'Shows/Features',
    article: 'Articles/Reviews',
  };

  return `You are MicroFilm's AI entertainment assistant. You help users discover movies, TV shows, articles, and reviews from multiple sources.

AVAILABLE CONTENT:
- Total items: ${availableContent.totalItems}
- Sources: ${Object.entries(availableContent.sources).map(([k, v]) => `${sourceLabels[k as SourceId]}: ${v}`).join(', ')}
- Top genres: ${availableContent.topGenres.join(', ')}
- Recent content: ${availableContent.latestItems.slice(0, 5).map(i => `${i.title} (${kindLabels[i.kind]}, ${sourceLabels[i.source]}, ${i.rating ? `${i.rating}/100` : 'unrated'})`).join('; ')}

USER PREFERENCES:
- Favorite genres: ${Object.entries(preferences.genreWeights).filter(([, w]) => w > 0.3).map(([g]) => g).join(', ') || 'None yet'}
- Preferred sources: ${Object.entries(preferences.sourceWeights).filter(([, w]) => w > 0.5).map(([s]) => sourceLabels[s as SourceId]).join(', ') || 'No strong preference'}
- Minimum rating: ${preferences.minRating > 0 ? `${preferences.minRating}/100` : 'No minimum'}
- Preferred content types: ${Object.entries(preferences.kindWeights).filter(([, w]) => w > 0.4).map(([k]) => kindLabels[k as ContentKind]).join(', ') || 'All types'}
- Recency preference: ${preferences.recency}
- Watchlist: ${preferences.watchlist.length} items
- Recently discussed: ${preferences.recentlyDiscussed.length} items

YOUR ROLE:
- Answer questions about movies, TV, entertainment news
- Make personalized recommendations based on preferences
- Discuss Rotten Tomatoes scores, Insider TV articles, behind-the-scenes content
- Help users build their watchlist
- Be conversational, knowledgeable, and concise
- When recommending, mention source, rating, and why it matches their taste
- If user mentions a specific item, add it to their "recently discussed" implicitly
- Ask clarifying questions when needed

IMPORTANT: You do NOT have direct access to fetch new data. You work with the context provided above. If user asks for something not in context, suggest they use the Search page or check the relevant source directly.`;
}

/**
 * Stream AI response for chat
 */
export async function* streamChatResponse(
  messages: ChatMessage[],
  context: ChatContext
): AsyncGenerator<string, void, unknown> {
  const coreMessages = toCoreMessages(messages);
  const systemPrompt = buildSystemPrompt(context);

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages: coreMessages,
    temperature: 0.7,
    maxTokens: 800,
  });

  for await (const chunk of result.textStream) {
    yield chunk;
  }
}

/**
 * Non-streaming version for simpler usage
 */
export async function getChatResponse(
  messages: ChatMessage[],
  context: ChatContext
): Promise<string> {
  const coreMessages = toCoreMessages(messages);
  const systemPrompt = buildSystemPrompt(context);

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages: coreMessages,
    temperature: 0.7,
    maxTokens: 800,
  });

  return result.text;
}

/**
 * Search content across all sources
 */
export async function searchAllContent(filters: DataFilters): Promise<ContentItem[]> {
  const feed = await getFeed();
  return searchContent(feed.items, filters);
}

/**
 * Get content items for a specific widget type
 */
export async function getWidgetItems(
  widgetType: string,
  profile: UserPreferenceProfile,
  limit: number = 20
): Promise<ContentItem[]> {
  const feed = await getFeed();
  let items = feed.items;

  // Apply widget-specific filters
  switch (widgetType) {
    case 'recommended':
      // Use preference scoring
      const { scoreContentItem } = await import('./store');
      return items
        .map(item => ({ item, score: scoreContentItem(item, profile) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ item }) => item);

    case 'trendingInsider':
      items = items.filter(i => i.source === 'insider' && (i.kind === 'show' || i.kind === 'article'));
      items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      return items.slice(0, limit);

    case 'rottenTomatoesTop':
      items = items.filter(i => i.source === 'rottenTomatoes' && i.kind === 'movie' && i.rating);
      items.sort((a, b) => {
        const aScore = a.rating ? Math.max(a.rating.critic || 0, a.rating.audience || 0) : 0;
        const bScore = b.rating ? Math.max(b.rating.critic || 0, b.rating.audience || 0) : 0;
        return bScore - aScore;
      });
      return items.slice(0, limit);

    case 'latestNewsReviews':
      items = items.filter(i => i.kind === 'article' || i.kind === 'show');
      items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      return items.slice(0, limit);

    case 'watchlist':
      items = items.filter(i => profile.watchlist.includes(i.id));
      return items.slice(0, limit);

    case 'recentlyDiscussed':
      items = items.filter(i => profile.recentlyDiscussed.includes(i.id));
      // Sort by order in recentlyDiscussed
      items.sort((a, b) =>
        profile.recentlyDiscussed.indexOf(a.id) - profile.recentlyDiscussed.indexOf(b.id)
      );
      return items.slice(0, limit);

    default:
      return items.slice(0, limit);
  }
}