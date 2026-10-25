import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, UserRound, Film } from 'lucide-react'
import { usePerson, usePersonCredits } from '../lib/hooks/useTmdb'
import { formatDate } from '../lib/format'
import { hasApiKey, imageUrl, TmdbError, type PersonCredit } from '../lib/tmdb'
import { ErrorState, SetupState, EmptyState } from '../components/States'
import { MediaCard } from '../components/MediaCard'
import { Rail, SkeletonRail } from '../components/Rail'
import { getImageOrPlaceholder, getPersonPlaceholder } from '../lib/utils/placeholders'
import type { MediaType, Movie, TV } from '../lib/types'

/** How many titles we show in the "Known for" row. */
const KNOWN_FOR_LIMIT = 12

/** A bio shorter than this fits in ~5 lines, so it needs no "Show more" button. */
const BIO_COLLAPSE_THRESHOLD = 280

/**
 * Line-clamp styles for the collapsed biography. These are the same four
 * properties App.css already uses for `.card__title` / `.hero__overview`,
 * applied inline so no stylesheet has to change. `display: -webkit-box` is not
 * a value React's CSS types allow, hence the cast.
 */
const BIO_CLAMP = {
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 5,
  overflow: 'hidden',
} as unknown as React.CSSProperties

/** Age/lifespan string from birth (+ optional death) dates, e.g. "42". '' if unknown. */
function ageSpan(born: string | null, died: string | null): string {
  if (!born) return ''
  const start = new Date(born)
  if (Number.isNaN(start.getTime())) return ''
  const end = died ? new Date(died) : null
  if (end && Number.isNaN(end.getTime())) return ''
  const ref = end ?? new Date()
  let age = ref.getFullYear() - start.getFullYear()
  const m = ref.getMonth() - start.getMonth()
  if (m < 0 || (m === 0 && ref.getDate() < start.getDate())) age--
  if (age < 0 || age > 125) return '' // bad or unset date
  return String(age)
}

/**
 * The media type of a credit entry, or null when TMDB didn't say.
 * We refuse to guess: a title without a type is skipped rather than linked
 * with the wrong kind of URL.
 */
function knownForKind(item: PersonCredit): MediaType | null {
  return item.media_type === 'movie' || item.media_type === 'tv' ? item.media_type : null
}

/** Turn a partial credit entry into a full Movie/TV object for MediaCard. */
function toMediaItem(item: PersonCredit, kind: MediaType): Movie | TV {
  const base = {
    id: item.id,
    backdrop_path: null,
    poster_path: item.poster_path ?? null,
    overview: item.overview ?? '',
    vote_average: item.vote_average ?? 0,
    vote_count: 0,
    popularity: item.popularity ?? 0,
  }
  const title = item.title ?? item.name ?? 'Untitled'

  if (kind === 'movie') {
    return {
      ...base,
      title,
      original_title: title,
      release_date: item.release_date ?? '',
      runtime: null,
      tagline: '',
    }
  }
  return {
    ...base,
    name: title,
    original_name: title,
    first_air_date: item.first_air_date ?? '',
    number_of_seasons: null,
    number_of_episodes: null,
    episode_run_time: [],
    status: '',
  }
}

export default function PersonPage() {
  // ---- All hooks first, in a fixed order, before any early return. ----
  const { id } = useParams<{ id: string }>()
  const person = usePerson(id)
  const credits = usePersonCredits(id)
  const [showFullBio, setShowFullBio] = useState(false)

  // "Known for": from the person's credits — a known media type, a poster,
  // most popular first, one card per title.
  const knownFor = useMemo(() => {
    const raw = credits.data?.cast ?? []
    const sorted = raw
      .filter((entry) => knownForKind(entry) !== null && Boolean(entry.poster_path))
      .slice()
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))

    // The same title can be credited twice (two roles in one production),
    // so keep only the first hit for each media_type + id.
    const seen = new Set<string>()
    const unique = sorted.filter((entry) => {
      const key = `${entry.media_type}-${entry.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return unique.slice(0, KNOWN_FOR_LIMIT)
  }, [credits.data])

  // ---- Everything below is plain values and JSX-only early returns. ----
  const hasKey = hasApiKey()
  const p = person.data
  const error = person.error
  const loading = person.isLoading && !p
  // Credits have their own state, so a credits failure never hides the page.
  const creditsLoading = credits.isLoading && !credits.data
  const creditsError = credits.error

  if (!hasKey) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <SetupState />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container detail">
        <div className="sk" style={{ height: 220, marginBottom: 'var(--space-4)' }} />
        <div className="sk sk--line" style={{ width: '50%', height: 32 }} />
        <div className="sk sk--line" style={{ width: '35%' }} />
        <div style={{ marginTop: 'var(--space-6)' }}>
          <SkeletonRail count={6} />
        </div>
      </div>
    )
  }

  // A missing person (bad id) deserves a friendly page; other failures get a
  // retry button. Either way we never leave the user on a blank screen.
  if (error && !p) {
    const notFound =
      error instanceof TmdbError && (error.status === 404 || !Number.isFinite(error.status))
    if (notFound) {
      return (
        <div className="container detail">
          <Link to="/" className="back-link">
            <ArrowLeft size={18} /> Back
          </Link>
          <div className="state">
            <div className="state__icon"><UserRound size={30} /></div>
            <h2 className="state__title">Person not found</h2>
            <p className="state__text">
              We couldn't find a person with that ID. It may have been removed, or the link
              may be wrong.
            </p>
            <Link to="/" className="btn btn--primary btn--sm">Go home</Link>
          </div>
        </div>
      )
    }
    return (
      <div className="container detail">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Back
        </Link>
        <ErrorState message={error instanceof Error ? error.message : undefined} />
        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => { void person.refetch() }}
            disabled={person.isFetching}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // Safety net: nothing to show and nothing went wrong.
  if (!p) {
    return (
      <div className="container detail">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Back
        </Link>
        <EmptyState icon={<Film size={30} />} title="No data">
          There's nothing to show for this person right now. Please try again in a moment.
        </EmptyState>
      </div>
    )
  }

  const name = p.name || 'Unknown'
  const alive = !p.deathday
  const age = ageSpan(p.birthday, p.deathday)
  const bio = p.biography?.trim() ?? ''
  const bioIsLong = bio.length > BIO_COLLAPSE_THRESHOLD
  const bioCollapsed = bioIsLong && !showFullBio

  return (
    <div className="detail">
      <div className="container">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      <section className="detail__hero">
        <div className="detail__scrim" />
        <div className="container detail__body">
          <div className="detail__poster detail__poster--person">
            <img
              src={getImageOrPlaceholder(
                p.profile_path ? imageUrl(p.profile_path, 'w500') : null,
                name,
                getPersonPlaceholder,
                500,
              )}
              alt={name}
            />
          </div>
          <div className="detail__head">
            <h1>{name}</h1>
            {p.known_for_department ? (
              <p className="detail__tagline">{p.known_for_department}</p>
            ) : null}
            <div className="detail__meta-row">
              {p.place_of_birth ? (
                <span className="votes">{p.place_of_birth}</span>
              ) : null}
              {p.birthday ? (
                <span className="votes">
                  {formatDate(p.birthday)}
                  {alive && age ? ` · ${age}` : ''}
                </span>
              ) : null}
              {p.deathday ? (
                <span className="votes">Died {formatDate(p.deathday)}</span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {bio ? (
          <>
            <p className="detail__overview" style={bioCollapsed ? BIO_CLAMP : undefined}>
              {bio}
            </p>
            {bioIsLong ? (
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => setShowFullBio((v) => !v)}
                aria-expanded={showFullBio}
              >
                {showFullBio ? 'Show less' : 'Show more'}
              </button>
            ) : null}
          </>
        ) : (
          <p className="detail__overview" style={{ color: 'var(--text-faint)' }}>
            No biography available for this person yet.
          </p>
        )}

        <dl className="detail__facts">
          <div>
            <dt>Known for</dt>
            <dd>{p.known_for_department || '—'}</dd>
          </div>
          {p.birthday ? (
            <div>
              <dt>Born</dt>
              <dd>
                {formatDate(p.birthday)}
                {alive && age ? ` (${age})` : ''}
              </dd>
            </div>
          ) : null}
          {p.deathday ? (
            <div>
              <dt>Died</dt>
              <dd>{formatDate(p.deathday)}</dd>
            </div>
          ) : null}
          {p.place_of_birth ? (
            <div>
              <dt>Place of birth</dt>
              <dd>{p.place_of_birth}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2 className="section__title">Known for</h2>
          </div>
          {creditsLoading ? (
            <SkeletonRail count={6} />
          ) : creditsError ? (
            <div className="state">
              <p className="state__text">We couldn't load this person's titles.</p>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => { void credits.refetch() }}
                disabled={credits.isFetching}
              >
                Try again
              </button>
            </div>
          ) : knownFor.length ? (
            <Rail>
              {knownFor.map((entry) => {
                const kind = knownForKind(entry)
                if (!kind) return null
                return (
                  <MediaCard
                    key={`${kind}-${entry.id}`}
                    item={toMediaItem(entry, kind)}
                    media={kind}
                  />
                )
              })}
            </Rail>
          ) : (
            <p className="detail__overview" style={{ color: 'var(--text-faint)' }}>
              No titles to show for this person yet.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
