    import React from 'react';
    import Link from 'next/link';
    import { ArrowLeft, Star, Bookmark, Play } from 'lucide-react';

    interface MovieDetailPageProps {
    params: Promise<{ id: string }>;
    }

    export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
    const { id } = await params;

    return (
        <article className="max-w-4xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Movies
        </Link>

        <div className="grid md:grid-cols-3 gap-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="aspect-[2/3] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <img
                src="https://via.placeholder.com/400x600?text=Movie+Poster"
                alt={`Movie ${id}`}
                className="w-full h-full object-cover"
            />
            </div>

            <div className="md:col-span-2 space-y-4">
            <h1 className="text-3xl font-extrabold text-white">Movie Title (#{id})</h1>
            
            <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-current" /> 8.5
                </span>
                <span>2026</span>
                <span>2h 15m</span>
            </div>

            <p className="text-slate-300 leading-relaxed">
                Detailed overview and synopsis of the selected movie will render here based on dynamic route parameter lookups.
            </p>

            <div className="flex gap-4 pt-4">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors">
                <Play className="w-4 h-4 fill-current" /> Watch Trailer
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors">
                <Bookmark className="w-4 h-4" /> Add to Watchlist
                </button>
            </div>
            </div>
        </div>
        </article>
    );
    }