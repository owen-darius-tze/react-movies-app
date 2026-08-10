import { Routes, Route, NavLink, Link } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import HomePage from './pages/Home'
import TitleDetailPage from './pages/TitleDetail'
import PersonPage from './pages/Person'
import NotFoundPage from './pages/NotFound'

// Brand mark for the header: real MicroFilm SVG logo + "MicroFilm" wordmark.
// The logo lives at /logo.svg (public/) so it's cacheable and reusable.
function Brand() {
  return (
    <Link to="/" className="site-header__brand" aria-label="MicroFilm home">
      <img src="/logo.svg" alt="" width="28" height="28" className="site-header__brand-logo" />
      <span className="site-header__brand-name">MicroFilm</span>
    </Link>
  )
}

function App() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="container" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Brand />
          <nav className="site-header__nav" aria-label="Primary">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Home
            </NavLink>
          </nav>
          <div className="site-header__actions">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="app__main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* /title/person/:id is declared before /title/:media/:id so the
              static "person" segment wins regardless of route-ranking behavior. */}
          <Route path="/title/person/:id" element={<PersonPage />} />
          <Route path="/title/:media/:id" element={<TitleDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container">
          MicroFilm · A Flyrank AI internship demo. Data from{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            TMDB
          </a>
          .
        </div>
      </footer>
    </div>
  )
}

export default App
