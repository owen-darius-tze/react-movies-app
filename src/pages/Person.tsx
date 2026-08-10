import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
import { usePerson } from '../lib/hooks/useTmdb'
import { formatDate, mediaTitle } from '../lib/format'
import { hasApiKey, imageUrl } from '../lib/tmdb'
import { ErrorState, SetupState } from '../components/States'

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

export default function PersonPage() {
  const { id } = useParams<{ id: string }>()

  if (!hasApiKey()) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <SetupState />
      </div>
    )
  }

  const person = usePerson(id)
  const loading = person.isLoading && !person.data
  const errored = person.isError && !person.data

  if (loading) {
    return (
      <div className="container detail">
        <div className="sk" style={{ height: 220, marginBottom: 'var(--space-4)' }} />
        <div className="sk sk--line" style={{ width: '50%', height: 32 }} />
        <div className="sk sk--line" style={{ width: '35%' }} />
      </div>
    )
  }

  if (errored || !person.data) {
    return (
      <div className="container detail">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Back
        </Link>
        <ErrorState
          message={person.error instanceof Error ? person.error.message : undefined}
        />
      </div>
    )
  }

  const p = person.data
  const name = mediaTitle({ name: p.name })
  const age = ageSpan(p.birthday, p.deathday)

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
          <div className="detail__poster">
            {p.profile_path ? (
              <img src={imageUrl(p.profile_path, 'w500')} alt={name} />
            ) : (
              <div className="card__placeholder" aria-hidden="true">
                <User size={36} />
              </div>
            )}
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
                  {age ? ` · ${age}` : p.deathday ? '' : ''}
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
        {p.biography ? (
          <p className="detail__overview">{p.biography}</p>
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
              <dd>{formatDate(p.birthday)}{age ? ` (${age})` : ''}</dd>
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
    </div>
  )
}
