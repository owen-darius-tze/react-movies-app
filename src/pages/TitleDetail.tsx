import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Film, Bookmark } from 'lucide-react'
import { useCredits, useMovieDetail, useRecommendations, useTvDetail } from '../lib/hooks/useTmdb'
import { TmdbError } from '../lib/tmdb'
import type { CastMember, MediaType, Movie, TV } from '../lib/types'
import { formatDate, formatRuntime, mediaDate, mediaTitle, releaseYear } from '../lib/format'
import { hasApiKey, imageUrl } from '../lib/tmdb'
import { MicroMeter } from '../components/Score'
import { RailSection } from '../components/Section'
import { ErrorState, SetupState } from '../components/States'
import { getImageOrPlaceholder, getPersonPlaceholder } from '../lib/utils/placeholders'
import { useChatStore } from '../lib/chat/store'

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
  const profileUrl = member.profile_path ? imageUrl(member.profile_path, 'w185') : null;

  return (
    <Link to={`/title/person/${member.id}`} className="cast__item" aria-label={member.name}>
      <div className="cast__thumb">
        <img
          src={getImageOrPlaceholder(profileUrl, member.name, getPersonPlaceholder, 185)}
          alt={member.name}
          loading="lazy"
        />
      </div>
      <p className="cast__name">{member.name}</p>
      <p className="cast__role">{member.character || '—'}</p>
    </Link>
  )
}

export default function TitleDetailPage() {
  const { media = 'movie', id } = useParams<{ media: string; id: string }>()
  const kind: MediaType = media === 'tv' ? 'tv' : 'movie'

  // All hooks must run on every render, before any early return.
  const movieQ = useMovieDetail(isMovie(kind) ? id : undefined)
  const tvQ = useTvDetail(kind === 'tv' ? id : undefined)
  const detailStatus = isMovie(kind) ? movieQ : tvQ
  const detail: Movie | TV | undefined = isMovie(kind) ? movieQ.data : tvQ.data
  const credits = useCredits(kind, id)
  const recs = useRecommendations(kind, id)
  const { profile, addToWatchlist, removeFromWatchlist } = useChatStore()

  const inFlight = detailStatus.isFetching && !detail
  if (inFlight && detailStatus.error) {
    // a fresh fetch failed — retry is available
    return (
      <div className="container detail">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Back
        </Link>
        <ErrorState
          message={detailStatus.error instanceof Error ? detailStatus.error.message : undefined}
        />
        <div style={{ marginTop: 'var(--space-4)' }}>
          <button className="btn btn--ghost btn--sm" onClick={() => detailStatus.refetch()}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!hasApiKey()) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <SetupState />
      </div>
    )
  }

  const loading = detailStatus.isLoading && !detail

  if (loading) {
    return (
      <div className="container detail">
        <div className="sk" style={{ height: 220, marginBottom: 'var(--space-4)' }} />
        <div className="sk sk--line" style={{ width: '60%', height: 32 }} />
        <div className="sk sk--line" style={{ width: '40%' }} />
      </div>
    )
  }

  // No data: distinguish a 404 (friendly "not found") from other failures (retry).
  const error = detailStatus.error
  if (!detail && error) {
    const isNotFound =
      error instanceof TmdbError && (error.status === 404 || !Number.isFinite(error.status))
    if (isNotFound) {
      return (
        <div className="container detail">
          <Link to="/" className="back-link">
            <ArrowLeft size={18} /> Back
          </Link>
          <div className="state state--error">
            <div className="state__icon"><Film size={30} /></div>
            <h2 className="state__title">Title not found</h2>
            <p className="state__text">
              We couldn't find a movie or show with that ID. It may have been removed or never
              existed.
            </p>
            <div className="state__actions">
              <Link to="/" className="btn btn--primary btn--sm">Go home</Link>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="container detail">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Back
        </Link>
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
        />
        <div style={{ marginTop: 'var(--space-4)' }}>
          <button className="btn btn--ghost btn--sm" onClick={() => detailStatus.refetch()}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  // Safety net: nothing more to render if detail is absent.
  if (!detail) {
    return (
      <div className="container detail">
        <div className="state">
          <div className="state__icon"><Film size={30} /></div>
          <h2 className="state__title">No data</h2>
          <p className="state__text">Nothing to display right now.</p>
        </div>
      </div>
    )
  }

  const title = mediaTitle(detail)
  const date = mediaDate(detail)
  const year = releaseYear(date)
  const runtime = 'runtime' in detail ? detail.runtime : null
  const genres = detail.genres ?? []
  const cast = credits.data?.cast?.slice(0, 12) ?? []

  const isWatchlisted = profile.watchlist.includes(`tmdb-${detail?.id}`)

  const toggleWatchlist = () => {
    const itemId = detail?.id
    if (!itemId) return
    if (isWatchlisted) {
      removeFromWatchlist(`tmdb-${itemId}`)
    } else {
      addToWatchlist(`tmdb-${itemId}`)
    }
  }

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
              <button
                className="icon-btn sm"
                onClick={toggleWatchlist}
                aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                aria-pressed={isWatchlisted}
                title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <Bookmark
                  size={18}
                  fill={isWatchlisted ? 'currentColor' : 'none'}
                  strokeWidth={2}
                  className={isWatchlisted ? 'filled' : ''}
                />
              </button>
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
