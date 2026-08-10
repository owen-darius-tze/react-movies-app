import type { ReactNode } from 'react'
import { KeyRound, Frown, WifiOff } from 'lucide-react'

/**
 * D2 graceful degradation: when no API key is configured the whole app shows
 * a setup CTA rather than a wall of failed requests.
 */
export function SetupState() {
  return (
    <div className="state">
      <div className="state__icon"><KeyRound size={30} /></div>
      <h2 className="state__title">Connect TMDB to start watching</h2>
      <p className="state__text">
        MicroFilm pulls live movie & TV data from The Movie Database (TMDB).
        Create a free API key at{' '}
        <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
          themoviedb.org/settings/api
        </a>
        , copy <code>.env.example</code> to <code>.env</code>, and set{' '}
        <code>VITE_TMDB_API_KEY</code> there. Restart the dev server afterwards.
      </p>
    </div>
  )
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="state state--error">
      <div className="state__icon"><WifiOff size={30} /></div>
      <h2 className="state__title">Couldn't load this section</h2>
      <p className="state__text">
        {message || 'TMDB request failed. It may be a network hiccup or a bad API key.'}
      </p>
    </div>
  )
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="state">
      {icon ? <div className="state__icon">{icon}</div> : <div className="state__icon"><Frown size={30} /></div>}
      <h2 className="state__title">{title}</h2>
      {children ? <p className="state__text">{children}</p> : null}
    </div>
  )
}
