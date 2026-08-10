
/** Convert TMDB vote_average (0–10) to a 0–100 percentage. */
export function scorePct(voteAverage: number): number {
  if (!Number.isFinite(voteAverage) || voteAverage <= 0) return 0
  return Math.round(voteAverage * 10)
}

/** Classify a percentage into a Micro Meter band for color coding. */
export function meterBand(pct: number): 'fresh' | 'mid' | 'rotten' {
  if (pct >= 75) return 'fresh'
  if (pct >= 50) return 'mid'
  return 'rotten'
}

/** Compact vote count, e.g. 1234 -> "1.2K", 2340000 -> "2.3M". */
export function compactCount(n: number): string {
  if (!Number.isFinite(n) || n < 1000) return String(Math.max(0, Math.round(n)))
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
}

/** Minutes -> "1h 42m"; falls back to empty for null/0. */
export function formatRuntime(min: number | null | undefined): string {
  if (!min || min <= 0) return ''
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`
}

/** "2026-07-26" -> "Jul 26, 2026"; returns '' for falsy. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** "2026-07-26" -> "2026"; useful for compact card captions. */
export function releaseYear(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 4)
}

/**
 * Relative-time caption in the TV-Insider spirit ("2h ago", "3d ago").
 * MicroFilm has no editorial timestamps of its own, so this is exposed as a
 * utility for future use (e.g. release-relative or trending-relative captions).
 */
export function relativeTime(fromIso: string | null | undefined): string {
  if (!fromIso) return ''
  const then = new Date(fromIso).getTime()
  if (Number.isNaN(then)) return ''
  const now = Date.now()
  const diffMs = now - then
  const sec = Math.round(diffMs / 1000)
  if (sec < 60) return 'just now'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 7) return `${day}d ago`
  const wk = Math.round(day / 7)
  if (wk < 5) return `${wk}w ago`
  const mo = Math.round(day / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.round(day / 365)}y ago`
}

/** Shared display title for movie/tv items (Movie.title vs TV.name). */
export function mediaTitle(item: { title?: string; name?: string }): string {
  return item.title ?? item.name ?? 'Untitled'
}

/** Shared display date for movie/tv items (release vs first air). */
export function mediaDate(item: { release_date?: string; first_air_date?: string }): string {
  return item.release_date ?? item.first_air_date ?? ''
}
