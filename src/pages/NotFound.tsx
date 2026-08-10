import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="state" style={{ minHeight: '60vh' }}>
      <div className="state__icon"><Compass size={30} /></div>
      <h1 className="state__title">Page not found</h1>
      <p className="state__text">
        That title or page isn't here. It may have moved, or the link may be wrong.
      </p>
      <Link to="/" className="btn btn--primary">Back to MicroFilm</Link>
    </div>
  )
}
