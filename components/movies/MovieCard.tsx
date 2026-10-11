'use client';

import { Star, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FC } from 'react';

export interface Movie {
    id: number | string;
    title: string;
    posterPath: string;
    rating: number;
    releaseYear: number | string;
}

interface MovieCardProps {
    movie: Movie;
}

export const MovieCard: FC<MovieCardProps> = ({ movie }) => {
    return (
        <article className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl">
        <Link
            to={`/movies/${movie.id}`}
            tabIndex={0}
            aria-label={`${movie.title} (${movie.releaseYear})`}
        >
        {/* 2:3 Aspect Ratio Container */}
        <div className="aspect-[2/3] w-full relative overflow-hidden bg-slate-950">
            <img
            src={movie.posterPath}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            <div className="absolute bottom-3 right-3 p-3 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            </div>
        </div>

        <div className="p-3">
            <h3 className="font-bold text-sm text-slate-100 truncate group-hover:text-red-500 transition-colors">
                {movie.title}
            </h3>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                <span>{movie.releaseYear}</span>
                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>{movie.rating.toFixed(1)}</span>
                </div>
            </div>
            </div>
        </Link>
        </article>
    );
};