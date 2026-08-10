import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'
import { imageUrl } from '../lib/tmdb'
import { mediaDate, mediaTitle, releaseYear } from '../lib/format'
import type { MediaType, Movie, TV } from '../lib/types'
import { ScoreBadge } from './Score'

export type MediaItem = Movie | TV

/** Route to a title detail page. `media` defaults to 'movie' for safety. */
export function detailPath(media: MediaType | undefined, id: number | string): string {
  return `/title/${media ?? 'movie'}/${id}`
}

function Poster({ path, alt }: { path: string | null; alt: string }) {
  if (!path) {
    return (
      <div className="card__placeholder" aria-hidden="true">
        <Film size={28} />
      </div>
    )
  }
  return <img src={imageUrl(path, 'w342')} alt={alt} loading="lazy" />
}

export function MediaCard({ item }: { item: MediaItem }) {
  const title = mediaTitle(item)
  const year = releaseYear(mediaDate(item))
  const media: MediaType = 'title' in item ? 'movie' : 'tv'

  return (
    <Link to={detailPath(media, item.id)} className="card" aria-label={title}>
      <div className="card__poster">
        <Poster path={item.poster_path} alt={title} />
        {(item.vote_average ?? 0) > 0 ? (
          <ScoreBadge voteAverage={item.vote_average} />
        ) : null}
      </div>
      <div className="card__body">
        <h3 className="card__title">{title}</h3>
        <p className="card__meta">{year || '—'}</p>
      </div>
    </Link>
  )
}
