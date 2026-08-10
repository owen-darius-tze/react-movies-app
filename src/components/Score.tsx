import { Star } from 'lucide-react'
import { compactCount, meterBand, scorePct } from '../lib/format'

/** Small score pill overlaid on a poster. */
export function ScoreBadge({ voteAverage }: { voteAverage: number }) {
  const pct = scorePct(voteAverage)
  const band = meterBand(pct)
  return (
    <span className={`meter meter--${band}`} aria-label={`${pct}% score`}>
      {pct}%
    </span>
  )
}

/** Larger hero/detail chip: big percentage + vote count. */
export function MicroMeter({
  voteAverage,
  voteCount,
}: {
  voteAverage: number
  voteCount: number
}) {
  const pct = scorePct(voteAverage)
  const band = meterBand(pct)
  return (
    <span className={`meter-chip meter-chip--${band}`} aria-label={`Micro Meter ${pct}%, ${voteCount} votes`}>
      <Star size={16} strokeWidth={2.5} fill="currentColor" aria-hidden="true" />
      {pct}%
      <span className="votes" aria-hidden="true">
        ({compactCount(voteCount)})
      </span>
    </span>
  )
}

/** Ghost meter used when a card has no score yet (vote 0 / missing). */
export function NoScore() {
  return <span className="meter meter--ghost">NR</span>
}

/** Defensive score for items whose vote_average may be undefined (search results). */
export function SafeScore({ voteAverage }: { voteAverage?: number | null }) {
  if (voteAverage === undefined || voteAverage === null) return <NoScore />
  return <ScoreBadge voteAverage={voteAverage} />
}
