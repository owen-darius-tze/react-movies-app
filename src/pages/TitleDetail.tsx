import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Film, User } from 'lucide-react'
import { useCredits, useMovieDetail, useRecommendations, useTvDetail } from '../lib/hooks/useTmdb'
import type { CastMember, MediaType, Movie, TV } from '../lib/types'
import { formatDate, formatRuntime, mediaDate, mediaTitle, releaseYear } from '../lib/format'
import { hasApiKey, imageUrl } from '../lib/tmdb'
import { MicroMeter } from '../components/Score'
import { RailSection } from '../components/Section'
import { ErrorState, SetupState } from '../components/States'

function isMovie(m: MediaType): m is 'movie' {
  return m === 'movie'
}

function Poster({ path, alt }: { path: string | null; alt: string }) {
  if (!path) {
    return (
      <div className="detail__poster card__placeholder" aria-hidden="true">
        <Film size={36} />
      </div>
    )
  }
  return (
    <div className="detail__poster">
      <img src={imageUrl(path, 'w500')} alt={alt} />
    </div>
  )
}

function CastThumb({ member }: { member: CastMember }) {
  return (
    <Link to={`/title/person/${member.id}`} className="cast__item" aria-label={member.name}>
      <div className="cast__thumb">
        {member.profile_path ? (
          <img src={imageUrl(member.profile_path, 'w185')} alt={member.name} loading="lazy" />
        ) : (
          <div className="cast__placeholder" aria-hidden="true">
            <User size={26} />
          </div>
        )}
      </div>
      <p className="cast__name">{member.name}</p>
      <p className="cast__role">{member.character || '—'}</p>
    </Link>
  )
}

export default function TitleDetailPage() {
  const { media = 'movie', id } = useParams<{ media: string; id: string }>()
  const kind: MediaType = media === 'tv' ? 'tv' : 'movie'

  if (!hasApiKey()) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <SetupState />
      </div>
    )
  }

  const movieQ = useMovieDetail(isMovie(kind) ? id : undefined)
  const tvQ = useTvDetail(kind === 'tv' ? id : undefined)
  const detail: Movie | TV | undefined = isMovie(kind) ? movieQ.data : tvQ.data
  const detailStatus = isMovie(kind) ? movieQ : tvQ
  const credits = useCredits(kind, id)
  const recs = useRecommendations(kind, id)

  const loading = detailStatus.isLoading && !detail
  const errored = detailStatus.isError && !detail

  if (loading) {
    return (
      <div className="container detail">
        <div className="sk" style={{ height: 220, marginBottom: 'var(--space-4)' }} />
        <div className="sk sk--line" style={{ width: '60%', height: 32 }} />
        <div className="sk sk--line" style={{ width: '40%' }} />
      </div>
    )
  }

  if (errored || !detail) {
    return (
      <div className="container detail">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Back
        </Link>
        <ErrorState
          message={detailStatus.error instanceof Error ? detailStatus.error.message : undefined}
        />
      </div>
    )
  }

  const title = mediaTitle(detail)
  const date = mediaDate(detail)
  const year = releaseYear(date)
  const runtime = 'runtime' in detail ? detail.runtime : null
  const genres = detail.genres ?? []
  const cast = credits.data?.cast?.slice(0, 12) ?? []

  return (
    <div className="detail">
      <div className="container">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      <section className="detail__hero">
        {detail.backdrop_path ? (
          <div
            className="detail__bg"
            style={{ backgroundImage: `url(${imageUrl(detail.backdrop_path, 'w1280')})` }}
          />
        ) : null}
        <div className="detail__scrim" />
        <div className="container detail__body">
          <Poster path={detail.poster_path} alt={title} />
          <div className="detail__head">
            <h1>{title}</h1>
            {'tagline' in detail && detail.tagline ? (
              <p className="detail__tagline">{detail.tagline}</p>
            ) : null}
            <div className="detail__meta-row">
              {detail.vote_average > 0 ? (
                <MicroMeter voteAverage={detail.vote_average} voteCount={detail.vote_count} />
              ) : null}
              {year ? <span className="votes">{year}</span> : null}
              {runtime ? <span className="votes">{formatRuntime(runtime)}</span> : null}
              {date ? <span className="votes">{formatDate(date)}</span> : null}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {genres.length ? (
          <div className="detail__genres">
            {genres.map((g) => (
              <span key={g.id} className="chip">{g.name}</span>
            ))}
          </div>
        ) : null}

        {detail.overview ? (
          <p className="detail__overview">{detail.overview}</p>
        ) : (
          <p className="detail__overview" style={{ color: 'var(--text-faint)' }}>
            No overview available for this title.
          </p>
        )}

        <dl className="detail__facts">
          {'status' in detail && detail.status ? (
            <div>
              <dt>Status</dt>
              <dd>{detail.status}</dd>
            </div>
          ) : null}
          {'number_of_seasons' in detail && detail.number_of_seasons ? (
            <div>
              <dt>Seasons</dt>
              <dd>{detail.number_of_seasons}</dd>
            </div>
          ) : null}
          {'number_of_episodes' in detail && detail.number_of_episodes ? (
            <div>
              <dt>Episodes</dt>
              <dd>{detail.number_of_episodes}</dd>
            </div>
          ) : null}
          <div>
            <dt>Vote average</dt>
            <dd>{detail.vote_average.toFixed(1)} / 10 ({detail.vote_count.toLocaleString()})</dd>
          </div>
        </dl>
      </div>

      {cast.length ? (
        <section className="section">
          <div className="container">
            <div className="section__head">
              <h2 className="section__title">Cast</h2>
            </div>
            <div className="cast">
              {cast.map((c: any) => (
                <CastThumb key={`${c.id}-${c.order}`} member={c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <RailSection
        title="More Like This"
        status={
          recs.isLoading
            ? 'loading'
            : recs.isError
              ? 'error'
              : 'success'
        }
        items={(recs.data?.results ?? []) as (Movie & TV)[]}
        error={recs.error}
      />
    </div>
  )
}
