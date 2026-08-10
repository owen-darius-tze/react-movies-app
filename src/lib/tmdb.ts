import type {
  CastMember,
  Credits,
  ImageConfig,
  MediaType,
  Movie,
  Paginated,
  Person,
  TV,
  TrendingWindow,
} from './types'

const BASE = 'https://api.themoviedb.org/3'

/** Read the TMDB API key from env. Undefined when not configured. */
export function getApiKey(): string | undefined {
  return import.meta.env.VITE_TMDB_API_KEY || undefined
}

/** True when no TMDB key is configured — callers should show the setup state. */
export function hasApiKey(): boolean {
  return Boolean(getApiKey())
}

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'TmdbError'
  }
}

/** Build an endpoint URL with the api_key query param. Throws when no key is set. */
function buildUrl(path: string, params: Record<string, string | number> = {}): string {
  const key = getApiKey()
  if (!key) {
    // Pages guard with hasApiKey() first; this is a defensive fallback.
    throw new TmdbError('VITE_TMDB_API_KEY is not configured.', 0)
  }
  const search = new URLSearchParams({ api_key: key })
  for (const [k, v] of Object.entries(params)) search.set(k, String(v))
  return `${BASE}${path}?${search.toString()}`
}

async function getJson<T>(
  path: string,
  params?: Record<string, string | number>,
): Promise<T> {
  const url = buildUrl(path, params)
  const res = await fetch(url)
  if (!res.ok) {
    throw new TmdbError(`TMDB request failed: ${res.status} ${res.statusText}`, res.status)
  }
  return (await res.json()) as T
}

// ---- Discovery / browse ----------------------------------------------------

export function getTrending(
  media: MediaType | 'all',
  window: TrendingWindow = 'week',
): Promise<Paginated<Movie & TV>> {
  return getJson<Paginated<Movie & TV>>(`/trending/${media}/${window}`)
}

export function getNowPlaying(): Promise<Paginated<Movie>> {
  return getJson<Paginated<Movie>>('/movie/now_playing')
}

export function getUpcoming(): Promise<Paginated<Movie>> {
  return getJson<Paginated<Movie>>('/movie/upcoming')
}

export function getPopularMovies(): Promise<Paginated<Movie>> {
  return getJson<Paginated<Movie>>('/movie/popular')
}

export function getTopRatedMovies(): Promise<Paginated<Movie>> {
  return getJson<Paginated<Movie>>('/movie/top_rated')
}

export function getPopularTV(): Promise<Paginated<TV>> {
  return getJson<Paginated<TV>>('/tv/popular')
}

export function getTopRatedTV(): Promise<Paginated<TV>> {
  return getJson<Paginated<TV>>('/tv/top_rated')
}

// ---- Details ---------------------------------------------------------------

export function getMovieDetail(id: number | string): Promise<Movie> {
  return getJson<Movie>(`/movie/${id}`)
}

export function getTvDetail(id: number | string): Promise<TV> {
  return getJson<TV>(`/tv/${id}`)
}

export function getCredits(media: MediaType, id: number | string): Promise<Credits> {
  return getJson<Credits>(`/${media}/${id}/credits`)
}

export function getRecommendations(
  media: MediaType,
  id: number | string,
): Promise<Paginated<Movie & TV>> {
  return getJson<Paginated<Movie & TV>>(`/${media}/${id}/recommendations`)
}

// ---- People ----------------------------------------------------------------

export function getPerson(id: number | string): Promise<Person> {
  return getJson<Person>(`/person/${id}`)
}

export function getPersonImages(id: number | string): Promise<{ id: number; profiles: { file_path: string; vote_average: number }[] }> {
  return getJson(`/person/${id}/images`)
}

// ---- Search ----------------------------------------------------------------

export interface MultiSearchItem {
  id: number
  media_type: 'movie' | 'tv' | 'person'
  // movie
  title?: string
  // tv
  name?: string
  // common
  poster_path?: string | null
  profile_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  overview?: string
  known_for_department?: string
}

export function searchMulti(query: string, page = 1): Promise<Paginated<MultiSearchItem>> {
  return getJson<Paginated<MultiSearchItem>>('/search/multi', { query, page })
}

// ---- Image configuration ---------------------------------------------------

let cachedConfig: ImageConfig | null = null

export async function getConfig(): Promise<ImageConfig> {
  if (cachedConfig) return cachedConfig
  cachedConfig = await getJson<ImageConfig>('/configuration')
  return cachedConfig
}

/**
 * Build a full image URL from a TMDB path and a size key (e.g. 'w200', 'original').
 * Falls back to a sensible default size when the configuration endpoint hasn't
 * loaded yet. Returns '' when path is null so callers can render placeholders.
 */
export function imageUrl(
  path: string | null | undefined,
  size: string = 'w500',
  config?: ImageConfig,
): string {
  if (!path) return ''
  const base = config?.secure_base_url ?? 'https://image.tmdb.org/t/p/'
  return `${base}${size}${path}`
}

/** A helper that casts any cast member (movie/tv) to the shared shape. */
export function castThumb(c: CastMember, config?: ImageConfig): {
  id: number
  name: string
  character: string
  image: string
} {
  return {
    id: c.id,
    name: c.name,
    character: c.character,
    image: imageUrl(c.profile_path, 'w300', config),
  }
}
