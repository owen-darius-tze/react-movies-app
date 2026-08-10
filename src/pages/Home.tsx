import { Play, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  useNowPlaying,
  usePopularMovies,
  usePopularTV,
  useTopRatedMovies,
  useTopRatedTV,
  useTrending,
  useUpcoming,
} from '../lib/hooks/useTmdb'
import type { Movie, TV } from '../lib/types'
import { mediaDate, mediaTitle, releaseYear } from '../lib/format'
import { imageUrl } from '../lib/tmdb'
import { detailPath } from '../components/MediaCard'
import { MicroMeter } from '../components/Score'
import { RailSection } from '../components/Section'
import { SetupState } from '../components/States'
import { hasApiKey } from '../lib/tmdb'

/** Map a react-query result to the simple status RailSection expects. */
type Status = 'loading' | 'error' | 'success'
function status(q: { isLoading: boolean; isError: boolean; isSuccess: boolean }): Status {
  if (q.isLoading) return 'loading'
  if (q.isError) return 'success' // hide error noise on Home rails
  return 'success'
}

function Hero({ item }: { item: Movie & TV }) {
  const title = mediaTitle(item)
  const year = releaseYear(mediaDate(item))
  const media = 'title' in item ? 'movie' : 'tv'
  return (
    <section className="hero" aria-label="Featured">
      <div
        className="hero__bg"
        style={item.backdrop_path ? { backgroundImage: `url(${imageUrl(item.backdrop_path, 'w1280')})` } : undefined}
      />
      <div className="hero__scrim" />
      <div className="container hero__content">
        <span className="hero__eyebrow">
          <TrendingUp size={14} aria-hidden="true" /> Trending now
        </span>
        <h1 className="hero__title">{title}</h1>
        <p className="hero__overview">{item.overview || 'No description available.'}</p>
        <div className="hero__meta">
          {item.vote_average > 0 ? <MicroMeter voteAverage={item.vote_average} voteCount={item.vote_count} /> : null}
          {year ? <span className="votes">{year}</span> : null}
          <Link to={detailPath(media, item.id)} className="btn btn--primary">
            <Play size={16} fill="currentColor" aria-hidden="true" /> View details
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  if (!hasApiKey()) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <SetupState />
      </div>
    )
  }

  const trending = useTrending('week')
  const nowPlaying = useNowPlaying()
  const upcoming = useUpcoming()
  const popMovies = usePopularMovies()
  const popTv = usePopularTV()
  const topMovies = useTopRatedMovies()
  const topTv = useTopRatedTV()

  // The first trending item with a backdrop drives the hero. Fall back to now-playing.
  const trendingItems = (trending.data?.results ?? []) as (Movie & TV)[]
  const heroCandidate = trendingItems.find((m) => m.backdrop_path) ?? trendingItems[0]
  const heroItem = heroCandidate ?? ((nowPlaying.data?.results ?? []) as (Movie & TV)[])[0]

  return (
    <>
      {heroItem ? <Hero item={heroItem} /> : null}
      <RailSection title="Now Playing" status={status(nowPlaying)} items={nowPlaying.data?.results} />
      <RailSection title="Trending This Week" status={status(trending)} items={trendingItems} />
      <RailSection title="Upcoming" status={status(upcoming)} items={upcoming.data?.results} />
      <RailSection title="Popular Movies" status={status(popMovies)} items={popMovies.data?.results} />
      <RailSection title="Popular Series" status={status(popTv)} items={popTv.data?.results} />
      <RailSection title="Top Rated Movies" status={status(topMovies)} items={topMovies.data?.results} />
      <RailSection title="Top Rated Series" status={status(topTv)} items={topTv.data?.results} />
    </>
  )
}
