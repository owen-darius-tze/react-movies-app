// TMDB API response types. Only the fields MicroFilm uses are typed.

export interface Genre {
  id: number
  name: string
}

export interface MediaBase {
  id: number
  backdrop_path: string | null
  poster_path: string | null
  overview: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids?: number[]
  genres?: Genre[]
}

export interface Movie extends MediaBase {
  title: string
  original_title: string
  release_date: string
  runtime: number | null
  tagline: string
  adult?: boolean
  video?: boolean
}

export interface TV extends MediaBase {
  name: string
  original_name: string
  first_air_date: string
  number_of_seasons: number | null
  number_of_episodes: number | null
  episode_run_time: number[]
  status: string
}

// Trending / now_playing / popular responses share the same paged shape.
export interface Paginated<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export type TrendingWindow = 'day' | 'week'
export type MediaType = 'movie' | 'tv'

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
  known_for_department?: string
}

export interface Credits {
  id: number
  cast: CastMember[]
  crew: CrewMember[]
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface Person {
  id: number
  name: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  biography: string
  profile_path: string | null
  known_for_department: string
}

export interface ImageConfig {
  base_url: string
  secure_base_url: string
  profile_sizes: string[]
  poster_sizes: string[]
  backdrop_sizes: string[]
  still_sizes: string[]
}
