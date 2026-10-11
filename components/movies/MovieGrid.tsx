    'use client';

    import React from 'react';
    import { MovieCard, Movie } from './MovieCard';

    interface MovieGridProps {
    movies: Movie[];
    isLoading?: boolean;
    }

    export const MovieGrid: React.FC<MovieGridProps> = ({ movies, isLoading = false }) => {
    if (isLoading) {
        return (
        <div aria-label="Loading content" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-900 border border-slate-800 rounded-xl aspect-[2/3] w-full" />
            ))}
        </div>
        );
    }

    if (!movies || movies.length === 0) {
        return (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
            No movies found.
        </div>
        );
    }

    return (
        <section aria-label="Movie Collection" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
        ))}
        </section>
    );
    };