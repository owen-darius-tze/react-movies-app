import { useQuery } from '@tanstack/react-query'
import {
  getCredits,
  getMovieDetail,
  getNowPlaying,
  getPerson,
  getPopularMovies,
  getPopularTV,
  getRecommendations,
  getTopRatedMovies,
  getTopRatedTV,
  getTvDetail,
  getTrending,
  getUpcoming,
  hasApiKey,
  searchMulti,
} from '../tmdb'
import type { CastMember, Credits, MediaType, Movie, Person, TV } from '../types'

const STALE = 1000 * 60 * 5 // 5 min — TMDB trending/now-playing refresh is hourly-ish

/**
 * Shared non-generic query defaults. Intentionally excludes `queryFn` and
 * `select` (the generic-bearing fields) so each hook keeps its own strongly-
 * typed queryFn and react-query v5 can infer the result type. Spread these
 * into `useQuery` *before* setting queryKey/queryFn.
 */
const defaults = {
  enabled: hasApiKey(),
  staleTime: STALE,
  refetchOnWindowFocus: false,
  retry: 1,
} as const

export function useTrending(window: 'day' | 'week' = 'week') {
  return useQuery({
    ...defaults,
    queryKey: ['trending', window],
    queryFn: () => getTrending('all', window),
  })
}

export function useNowPlaying() {
  return useQuery({ ...defaults, queryKey: ['now-playing'], queryFn: getNowPlaying })
}

export function useUpcoming() {
  return useQuery({ ...defaults, queryKey: ['upcoming'], queryFn: getUpcoming })
}

export function usePopularMovies() {
  return useQuery({ ...defaults, queryKey: ['popular', 'movie'], queryFn: getPopularMovies })
}

export function usePopularTV() {
  return useQuery({ ...defaults, queryKey: ['popular', 'tv'], queryFn: getPopularTV })
}

export function useTopRatedMovies() {
  return useQuery({ ...defaults, queryKey: ['top-rated', 'movie'], queryFn: getTopRatedMovies })
}

export function useTopRatedTV() {
  return useQuery({ ...defaults, queryKey: ['top-rated', 'tv'], queryFn: getTopRatedTV })
}

export function useMovieDetail(id: string | undefined) {
  return useQuery({
    ...defaults,
    enabled: hasApiKey() && Boolean(id),
    queryKey: ['movie', id],
    queryFn: () => getMovieDetail(id as string),
  })
}

export function useTvDetail(id: string | undefined) {
  return useQuery({
    ...defaults,
    enabled: hasApiKey() && Boolean(id),
    queryKey: ['tv', id],
    queryFn: () => getTvDetail(id as string),
  })
}

export function useCredits(media: MediaType | undefined, id: string | undefined) {
  return useQuery({
    ...defaults,
    enabled: hasApiKey() && Boolean(media) && Boolean(id),
    queryKey: ['credits', media, id],
    queryFn: () => getCredits(media as MediaType, id as string),
  })
}

export function useRecommendations(media: MediaType | undefined, id: string | undefined) {
  return useQuery({
    ...defaults,
    enabled: hasApiKey() && Boolean(media) && Boolean(id),
    queryKey: ['recommendations', media, id],
    queryFn: () => getRecommendations(media as MediaType, id as string),
  })
}

export function usePerson(id: string | undefined) {
  return useQuery({
    ...defaults,
    enabled: hasApiKey() && Boolean(id),
    queryKey: ['person', id],
    queryFn: () => getPerson(id as string),
  })
}

export function useSearch(query: string | undefined) {
  return useQuery({
    ...defaults,
    enabled: hasApiKey() && Boolean(query && query.trim().length > 1),
    queryKey: ['search', query],
    queryFn: () => searchMulti((query as string).trim()),
  })
}

/** Type helpers for downstream consumers. */
export type { CastMember, Credits, MediaType, Movie, Person, TV }
