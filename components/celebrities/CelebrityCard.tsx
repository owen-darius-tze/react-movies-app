'use client';

import { Star, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FC } from 'react';

export interface Celebrity {
  id: number | string;
  name: string;
  profilePath: string;
  knownFor: string;
  popularity: number;
}

interface CelebrityCardProps {
  celebrity: Celebrity;
}

export const CelebrityCard: FC<CelebrityCardProps> = ({ celebrity }) => {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    target.src = 'https://via.placeholder.com/200x300?text=No+Photo';
    target.alt = `${celebrity.name} (placeholder)`;
    target.setAttribute('aria-hidden', 'true');
    target.nextElementSibling?.setAttribute('data-loaded', 'false');
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    target.setAttribute('data-loaded', 'true');
    target.nextElementSibling?.setAttribute('data-loaded', 'true');
  };

  return (
    <article className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl">
      <Link
        to={`/celebrities/${celebrity.id}`}
        tabIndex={0}
        aria-label={`${celebrity.name} — ${celebrity.knownFor}`}
      >
        {/* 2:3 Aspect Ratio Container */}
        <div className="aspect-[2/3] w-full relative overflow-hidden bg-slate-950">
          <img
            src={celebrity.profilePath}
            alt={celebrity.name}
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            data-loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          <div className="absolute bottom-3 right-3 p-2 bg-amber-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" aria-label="View details">
            <Award className="w-4 h-4 fill-current" aria-hidden="true" />
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-bold text-sm text-slate-100 truncate group-hover:text-amber-400 transition-colors">
            {celebrity.name}
          </h3>
          <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
            <span className="truncate max-w-[60%]">{celebrity.knownFor}</span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              <span>{celebrity.popularity.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};