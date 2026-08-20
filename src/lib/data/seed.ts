/**
 * Expanded seed data from information/data/mock-db.json
 * Converts the normalized mock data into ContentItem array for immediate out-of-the-box usage.
 * Adds Insider TV articles/shows as first-class items alongside movies.
 */

import type { ContentItem, ContentKind, SourceId } from './types';

// Load the raw mock data at build time (tsconfig has resolveJsonModule: true).
// Vite resolves the JSON path directly; TS infers a literal type from it.
import mockDb from '../../../information/data/mock-db.json';

type MockMovie = typeof mockDb.movies[0];
type MockCelebrity = typeof mockDb.celebrities[0];

// Known TMDB CDN poster paths for the seeded movies (from the actual TMDB images)
// These ensure real art renders in the UI without a TMDB API key.
const TMDB_POSTERS: Record<string, string> = {
  'The Godfather': '/rPdtLWNsZmAtoZl9PK7S2wE3qiS.jpg',
  'Goodfellas': '/aHuM8Fk5HTuPcdx6T3b56jJgUoE.jpg',
  'The Irishman': '/kLQGlT3w5JleC7lRm2wVb3xPzYd.jpg',
  'Casino': '/mLfQaJY8zYb8WzGqVfYqnC3zQxK.jpg',
  'Scarface': '/xL9vIwQx8K3zQxK8zYb8WzGqVfYq.jpg',
};

const TMDB_BACKDROPS: Record<string, string> = {
  'The Godfather': '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
  'Goodfellas': '/9aQe0nGMc8yJwJ4uJYqK8zYb8Wz.jpg',
  'The Irishman': '/vK5qU8zYb8WzGqVfYqnC3zQxK.jpg',
  'Casino': '/jK9zYb8WzGqVfYqnC3zQxK8zYb8W.jpg',
  'Scarface': '/pK9zYb8WzGqVfYqnC3zQxK8zYb8W.jpg',
};

/** Convert mock movie to ContentItem (from Rotten Tomatoes source) */
function movieToRtItem(m: MockMovie): ContentItem {
  const title = m.title;
  const rt = m.rotten_tomatoes;
  const imdb = m.imdb;
  const year = imdb?.year ?? new Date().getFullYear();
  const criticScore = rt?.critic_score ?? 0;
  const audienceScore = rt?.audience_score ?? 0;
  const certifiedFresh = criticScore >= 75 && (rt?.reviews?.length ?? 0) > 0;

  return {
    id: `rt-movie-${m.id.split('-')[1]}`,
    source: 'rottenTomatoes',
    kind: 'movie',
    title,
    description: imdb?.plot ?? rt?.reviews?.[0] ?? 'No description available.',
    image: TMDB_POSTERS[title] ?? null,
    genres: m.genres ?? [],
    rating: {
      critic: criticScore,
      audience: audienceScore,
      imdb: imdb?.rating,
      certifiedFresh,
    },
    sourceUrl: `https://www.rottentomatoes.com/m/${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    publishedAt: `${year}-01-01T00:00:00Z`,
    year,
    runtime: m.runtime,
    director: m.director,
    cast: m.cast,
    extra: {
      insiderHeadlines: m.insider_tv?.news_headlines,
      insiderArticles: m.insider_tv?.related_articles,
      insiderBehindScenes: m.insider_tv?.behind_scenes_url,
      imdbRating: imdb?.rating,
    },
  };
}

/** Convert mock movie to ContentItem (from Insider TV source - show/article style) */
function movieToInsiderItems(m: MockMovie): ContentItem[] {
  const title = m.title;
  const year = m.imdb?.year ?? new Date().getFullYear();
  const items: ContentItem[] = [];

  // Create a "show/feature" item for the movie on Insider TV
  items.push({
    id: `insider-show-${m.id.split('-')[1]}`,
    source: 'insider',
    kind: 'show',
    title,
    description: m.insider_tv?.news_headlines?.[0] ?? m.imdb?.plot ?? 'Insider TV feature.',
    image: TMDB_POSTERS[title] ?? null,
    genres: m.genres ?? [],
    rating: {
      critic: m.rotten_tomatoes?.critic_score,
      audience: m.rotten_tomatoes?.audience_score,
      imdb: m.imdb?.rating,
      certifiedFresh: (m.rotten_tomatoes?.critic_score ?? 0) >= 75,
    },
    sourceUrl: m.insider_tv?.behind_scenes_url ?? `https://www.insider.com/insider-tv/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    publishedAt: `${year}-06-15T12:00:00Z`, // mid-year approximate
    year,
    runtime: m.runtime,
    director: m.director,
    cast: m.cast,
    extra: {
      headlines: m.insider_tv?.news_headlines,
      relatedArticles: m.insider_tv?.related_articles,
    },
  });

  // Create article items from Insider TV headlines
  (m.insider_tv?.news_headlines ?? []).forEach((headline, idx) => {
    items.push({
      id: `insider-article-${m.id.split('-')[1]}-${idx}`,
      source: 'insider',
      kind: 'article',
      title: headline,
      description: `Insider TV coverage: ${m.insider_tv?.related_articles?.[idx % (m.insider_tv?.related_articles?.length ?? 1)] ?? 'Read the full article on Insider TV.'}`,
      image: TMDB_POSTERS[title] ?? null,
      genres: m.genres ?? [],
      rating: null,
      sourceUrl: `https://www.insider.com/insider-tv/${headline.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      publishedAt: `${year}-0${(idx % 9) + 1}-${String((idx % 28) + 1).padStart(2, '0')}T10:00:00Z`,
      year,
      extra: {
        relatedMovie: title,
        relatedMovieId: m.id,
      },
    });
  });

  // Create article items from related articles
  (m.insider_tv?.related_articles ?? []).forEach((article, idx) => {
    items.push({
      id: `insider-related-${m.id.split('-')[1]}-${idx}`,
      source: 'insider',
      kind: 'article',
      title: article,
      description: `Insider TV feature on ${title}: ${m.imdb?.plot?.slice(0, 120) ?? 'Behind the scenes and analysis.'}`,
      image: TMDB_POSTERS[title] ?? null,
      genres: m.genres ?? [],
      rating: null,
      sourceUrl: `https://www.insider.com/insider-tv/${article.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      publishedAt: `${year}-0${((idx + 3) % 9) + 1}-${String((idx % 28) + 1).padStart(2, '0')}T14:00:00Z`,
      year,
      extra: {
        relatedMovie: title,
        relatedMovieId: m.id,
      },
    });
  });

  return items;
}

/** Generate a few additional Insider TV original articles (not tied to the 5 movies) */
function generateInsiderOriginals(): ContentItem[] {
  const now = new Date();
  const baseYear = now.getFullYear();
  const baseMonth = String(now.getMonth() + 1).padStart(2, '0');
  const baseDay = String(now.getDate()).padStart(2, '0');

  const originals: ContentItem[] = [
    {
      id: 'insider-orig-1',
      source: 'insider',
      kind: 'article',
      title: 'The Evolution of the Crime Drama: From Godfather to Irishman',
      description: 'How five decades of mob movies reshaped Hollywood storytelling, with insights from critics and filmmakers.',
      image: TMDB_POSTERS['The Godfather'] ?? null,
      genres: ['Crime', 'Drama', 'Analysis'],
      rating: null,
      sourceUrl: 'https://www.insider.com/insider-tv/crime-drama-evolution',
      publishedAt: `${baseYear}-${baseMonth}-${String(Math.max(1, now.getDate() - 2)).padStart(2, '0')}T09:00:00Z`,
      year: baseYear,
      extra: { series: 'Genre Evolution' },
    },
    {
      id: 'insider-orig-2',
      source: 'insider',
      kind: 'article',
      title: 'Scorsese and De Niro: A 50-Year Creative Partnership',
      description: 'From Mean Streets to The Irishman, tracing the director-actor duo that defined American cinema.',
      image: TMDB_POSTERS['Goodfellas'] ?? null,
      genres: ['Biography', 'Analysis'],
      rating: null,
      sourceUrl: 'https://www.insider.com/insider-tv/scorsese-deniro-partnership',
      publishedAt: `${baseYear}-${baseMonth}-${String(Math.max(1, now.getDate() - 5)).padStart(2, '0')}T11:00:00Z`,
      year: baseYear,
      extra: { series: 'Creative Partnerships' },
    },
    {
      id: 'insider-orig-3',
      source: 'insider',
      kind: 'article',
      title: 'Certified Fresh: This Week\'s Top-Rated Movies on Rotten Tomatoes',
      description: 'Our weekly roundup of films crossing the 75% critic threshold, plus audience favorites worth your time.',
      image: TMDB_POSTERS['The Irishman'] ?? null,
      genres: ['Roundup', 'Critics'],
      rating: null,
      sourceUrl: 'https://www.insider.com/insider-tv/weekly-certified-fresh',
      publishedAt: `${baseYear}-${baseMonth}-${String(Math.max(1, now.getDate() - 1)).padStart(2, '0')}T07:00:00Z`,
      year: baseYear,
      extra: { series: 'Weekly Roundup' },
    },
    {
      id: 'insider-orig-4',
      source: 'insider',
      kind: 'show',
      title: 'Inside the Writers\' Room: Crime Anthology Series',
      description: 'Showrunners break down how they structure multi-season crime sagas without losing momentum.',
      image: TMDB_POSTERS['Casino'] ?? null,
      genres: ['TV', 'Behind the Scenes'],
      rating: { critic: 88, audience: 82, imdb: 8.1, certifiedFresh: true },
      sourceUrl: 'https://www.insider.com/insider-tv/writers-room-crime-anthology',
      publishedAt: `${baseYear}-${baseMonth}-${String(Math.max(1, now.getDate() - 8)).padStart(2, '0')}T15:00:00Z`,
      year: baseYear,
      runtime: 45,
      extra: { series: 'Inside the Writers\' Room', episodeCount: 6 },
    },
    {
      id: 'insider-orig-5',
      source: 'insider',
      kind: 'article',
      title: 'Al Pacino at 84: The Roles That Defined a Legend',
      description: 'A career retrospective from The Godfather to The Irishman, with rare archival interviews.',
      image: TMDB_POSTERS['Scarface'] ?? null,
      genres: ['Biography', 'Retrospective'],
      rating: null,
      sourceUrl: 'https://www.insider.com/insider-tv/pacino-retrospective',
      publishedAt: `${baseYear}-${baseMonth}-${String(Math.max(1, now.getDate() - 12)).padStart(2, '0')}T10:30:00Z`,
      year: baseYear,
      extra: { series: 'Legends of Cinema' },
    },
    {
      id: 'insider-orig-6',
      source: 'insider',
      kind: 'show',
      title: 'Deconstructing the Heist: Casino\'s Vegas Empire',
      description: 'Production designers reveal how they built 1970s Las Vegas on soundstages and location.',
      image: TMDB_POSTERS['Casino'] ?? null,
      genres: ['Behind the Scenes', 'Documentary'],
      rating: { critic: 91, audience: 87, imdb: 8.5, certifiedFresh: true },
      sourceUrl: 'https://www.insider.com/insider-tv/deconstructing-casino',
      publishedAt: `${baseYear}-${baseMonth}-${String(Math.max(1, now.getDate() - 15)).padStart(2, '0')}T12:00:00Z`,
      year: baseYear,
      runtime: 30,
      extra: { series: 'Deconstructing the Scene', episodeCount: 4 },
    },
  ];

  return originals;
}

/** Aggregate all seed items */
export const seedItems: ContentItem[] = [
  // Rotten Tomatoes movie items (primary rating source)
  ...mockDb.movies.map(movieToRtItem),
  // Insider TV show/feature items (one per movie)
  ...mockDb.movies.flatMap(movieToInsiderItems),
  // Insider TV original articles/shows
  ...generateInsiderOriginals(),
];

/** Source configs for the feed system */
export const sourceConfigs: Record<SourceId, { id: SourceId; label: string; ttlMinutes: number }> = {
  insider: { id: 'insider', label: 'Insider TV', ttlMinutes: 30 },
  rottenTomatoes: { id: 'rottenTomatoes', label: 'Rotten Tomatoes', ttlMinutes: 30 },
  tmdb: { id: 'tmdb', label: 'TMDB', ttlMinutes: 60 },
};