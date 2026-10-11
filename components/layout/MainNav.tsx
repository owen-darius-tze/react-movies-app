'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationLinks = [
  { label: 'Home', href: '/' },
  { label: 'Search', href: '/search' },
  { label: 'Chat', href: '/chat' },
  { label: 'Watchlist', href: '/watchlist' },
  { label: 'History', href: '/history' },
] as const;

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main Navigation">
      <ul className="flex items-center gap-2" role="list">
        {navigationLinks.map(({ label, href }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border border-red-600/30 bg-red-600/20 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}