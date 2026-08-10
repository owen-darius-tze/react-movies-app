import type { ReactNode } from 'react'

export function Rail({ children }: { children: ReactNode }) {
  return <div className="rail" role="list">{children}</div>
}

export function SkeletonRail({ count = 6 }: { count?: number }) {
  return (
    <div className="rail" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="sk sk--poster" />
          <div className="sk sk--line" style={{ width: '80%' }} />
          <div className="sk sk--line" style={{ width: '40%' }} />
        </div>
      ))}
    </div>
  )
}
