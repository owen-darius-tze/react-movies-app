import { Rail, SkeletonRail } from './Rail'
import { ErrorState } from './States'
import { MediaCard, type MediaItem } from './MediaCard'

type Status = 'loading' | 'error' | 'success'

/**
 * Renders a titled rail with the right state for a react-query result,
 * so Home/Detail pages stay declarative. Hides itself entirely when there
 * is data but zero items (e.g. an empty upcoming window).
 */
export function RailSection({
  title,
  status,
  items,
  error,
}: {
  title: string
  status: Status
  items?: MediaItem[]
  error?: unknown
}) {
  const head = (
    <div className="section__head">
      <h2 className="section__title">{title}</h2>
    </div>
  )

  if (status === 'loading') {
    return (
      <section className="section">
        <div className="container">
          {head}
          <SkeletonRail />
        </div>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="section">
        <div className="container">
          {head}
          <ErrorState
            message={error instanceof Error && error.message ? error.message : undefined}
          />
        </div>
      </section>
    )
  }

  if (!items?.length) return null

  return (
    <section className="section">
      <div className="container">
        {head}
        <Rail>
          {items.map((it) => (
            <MediaCard key={it.id} item={it} />
          ))}
        </Rail>
      </div>
    </section>
  )
}
