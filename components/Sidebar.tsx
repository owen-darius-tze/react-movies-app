'use client';

import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  MessageSquare,
  Bookmark,
  History,
} from 'lucide-react';

const navigationLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Watchlist', href: '/watchlist', icon: Bookmark },
  { label: 'History', href: '/history', icon: History },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            M
          </span>
          MovieDB
        </h1>
      </div>

      <nav aria-label="Main Navigation" className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1" role="list">
          {navigationLinks.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <li key={href}>
                <a
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-red-600/20 text-white border border-red-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-red-400' : 'text-slate-400'}`} aria-hidden="true" />
                  <span className="font-medium">{label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          Version 1.0.0
        </p>
      </div>
    </aside>
  );
}