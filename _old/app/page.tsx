'use client'; // Required for Next.js components using useState/useEffect

import React, { useEffect, useState } from 'react';

export default function Home() {
  const [movies, setMovies] = useState<any[]>([]); // Default to empty array []
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/movies');
        const data = await res.json();
        if (isMounted) setMovies(data?.movies || []); // Guard against undefined data
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) return <div className="p-8 text-white">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <main className="p-8 text-white">
      <h1>Dashboard</h1>
      {/* Safe mapping with fallback */}
      <div className="grid grid-cols-4 gap-4">
        {Array.isArray(movies) && movies.map((movie) => (
          <div key={movie.id}>{movie.title}</div>
        ))}
      </div>
    </main>
  );
}