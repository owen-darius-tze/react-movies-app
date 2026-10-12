/**
 * Personalized Dashboard Homepage — loads real TMDB movies/TV via hooks
 * Fallback to seed data if TMDB unavailable; shows setup message when key missing.
 */

import React, { useEffect, useState } from 'react';
import { usePopularMovies, usePopularTV, hasApiKey } from '../lib/hooks/useTmdb';
import { MediaCard } from '../components/MediaCard';
import { SetupState } from '../components/States';
import { getFeed } from '../lib/data';

export const Home: React.FC = () => {
  const moviesQ = usePopularMovies();
  const tvQ = usePopularTV();

  // For fallback: load seed feed if TMDB fails or no key
  const [seedMovies, setSeedMovies] = useState<any[]>([]);
  const [usingSeed, setUsingSeed] = useState(false);

  useEffect(() => {
    if (!hasApiKey()) {
      setUsingSeed(true);
      getFeed().then(feed => {
        const items = feed.items.filter(i => i.kind === 'movie').slice(0, 10);
        setSeedMovies(items);
      }).catch(() => setSeedMovies([]));
    } else if (moviesQ.isError || tvQ.isError || (moviesQ.data && moviesQ.data.results.length === 0)) {
      setUsingSeed(true);
      getFeed().then(feed => {
        const items = feed.items.filter(i => i.kind === 'movie').slice(0, 10);
        setSeedMovies(items);
      }).catch(() => setSeedMovies([]));
    } else {
      setUsingSeed(false);
    }
  }, [moviesQ.isError, tvQ.isError, moviesQ.data, tvQ.data]);

  if (!hasApiKey()) {
    return (
      <main aria-label="Dashboard Content" className="ml-64 p-8 bg-slate-900 min-h-screen text-slate-100">
        <header className="mb-8"><h1 className="text-3xl font-extrabold tracking-tight">Popular Now</h1></header>
        <SetupState />
        {seedMovies.length > 0 && (
          <section className="mt-8"><h2 className="text-xl font-bold mb-4">Seed fallback (TMDB not configured)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">{seedMovies.map((m: any) => (
              <a key={m.id} href={m.sourceUrl} className="group bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all" target="_blank" rel="noopener noreferrer">
                <img src={m.image ? `https://image.tmdb.org/t/p/w342${m.image}` : ''} alt={m.title} className="w-full aspect-[2/3] object-cover" loading="lazy" />
                <div className="p-3"><h2 className="font-bold text-sm truncate">{m.title}</h2><span className="text-xs text-slate-400">{m.year}</span></div>
              </a>))}</div>
          </section>
        )}
      </main>
    );
  }

  const movieResults = moviesQ.data?.results ?? [];
  const tvResults = tvQ.data?.results ?? [];
  const hasReal = movieResults.length > 0 || tvResults.length > 0;

  const renderItems = () => {
    if (usingSeed && seedMovies.length > 0) return seedMovies.map((m: any) => (
      <a key={m.id} href={m.sourceUrl} className="group bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all" target="_blank" rel="noopener noreferrer">
        <img src={m.image ? `https://image.tmdb.org/t/p/w342${m.image}` : ''} alt={m.title} className="w-full aspect-[2/3] object-cover" loading="lazy" />
        <div className="p-3"><h2 className="font-bold text-sm truncate">{m.title}</h2><span className="text-xs text-slate-400">{m.year}</span></div>
      </a>
    ));
    return (
      <>
        {movieResults.map((item) => (
          <MediaCard key={`movie-${item.id}`} item={item} media="movie" />
        ))}
        {tvResults.map((item) => (
          <MediaCard key={`tv-${item.id}`} item={item} media="tv" />
        ))}
      </>
    );
  };

  return (
    <main aria-label="Dashboard Content" className="ml-64 p-8 bg-slate-900 min-h-screen text-slate-100">
      <header className="mb-8"><h1 className="text-3xl font-extrabold tracking-tight">Popular Now</h1><p className="text-slate-400 mt-1">Real movies & series from TMDB</p></header>
      {usingSeed && <div className="mb-4 p-3 bg-amber-950/40 border border-amber-800 rounded-xl text-amber-200 text-sm">TMDB unavailable — showing seed fallback.</div>}
      {!hasReal && !usingSeed && moviesQ.isLoading && (
        <section aria-label="Loading movies" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800 rounded-2xl aspect-[2/3] w-full" />
          ))}
        </section>
      )}
      {!moviesQ.isLoading && (
        <section aria-label="Trending Movies" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {renderItems()}
        </section>
      )}
    </main>
  );
};

export default Home;
