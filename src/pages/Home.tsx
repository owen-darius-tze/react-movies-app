/**
 * Personalized Dashboard Homepage
 * Modular widgets driven by AI preferences from chat
 */

import React, { useEffect, useState } from 'react';
import { Star, Play } from 'lucide-react';
import { getFeed } from '../lib/data';

interface Movie {
  id: number;
  title: string;
  poster: string;
  rating: number;
  year: number;
}

export const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setError(null);

        const feed = await getFeed();
        const dashboardMovies = feed.items
          .filter((item) => item.kind === 'movie')
          .map((item) => ({
            id: Number(item.id.replace(/\D/g, '')) || item.id.length,
            title: item.title,
            poster: item.image?.startsWith('/')
              ? `https://image.tmdb.org/t/p/w500${item.image}`
              : item.image ?? '',
            rating: item.rating?.critic ?? item.rating?.audience ?? item.rating?.imdb ?? 0,
            year: item.year ?? new Date(item.publishedAt).getFullYear(),
          }));
        if (isMounted) setMovies(dashboardMovies);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Unable to load personalized dashboard.');
      } finally {
        // ALWAYS resolves loading state to prevent infinite spinners
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboardData();
    return () => { isMounted = false; };
  }, []);

  return (
    <main aria-label="Dashboard Content" className="ml-64 p-8 bg-slate-900 min-h-screen text-slate-100">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Personalized Dashboard</h1>
        <p className="text-slate-400 mt-1">Recommended for you based on recent activity</p>
      </header>

      {/* Loading Skeleton */}
      {isLoading && (
        <section aria-label="Loading movies" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800 rounded-2xl aspect-[2/3] w-full" />
          ))}
        </section>
      )}

      {/* Error Fallback */}
      {!isLoading && error && (
        <div role="alert" className="p-4 bg-red-950/40 border border-red-800 rounded-xl text-red-300">
          <p className="font-semibold">Dashboard Unavailable</p>
          <p className="text-sm text-red-400 mt-1">{error}</p>
        </div>
      )}

      {/* Movie Database Poster Grid */}
      {!isLoading && !error && (
        <section aria-label="Trending Movies" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <article 
              key={movie.id} 
              className="group relative bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="aspect-[2/3] w-full relative overflow-hidden bg-slate-950">
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <button 
                  aria-label={`Play ${movie.title}`} 
                  className="absolute bottom-3 right-3 p-3 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
              <div className="p-3">
                <h2 className="font-bold text-sm truncate text-slate-100">{movie.title}</h2>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                  <span>{movie.year}</span>
                  <div className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default Home;