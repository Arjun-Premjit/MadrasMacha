import React, { useState } from 'react';
import { Search, Compass, Bus, Train, ArrowRight, MapPin, Sparkles, Navigation } from 'lucide-react';
import { AnimatedTransit } from './AnimatedTransit';
import { TransitStats } from '../types/transit';

interface HeroProps {
  onSearch: (query: string) => void;
  onExploreMtc: () => void;
  onExploreMetro: () => void;
  onFindRoute: () => void;
  stats: TransitStats;
}

export const Hero: React.FC<HeroProps> = ({
  onSearch,
  onExploreMtc,
  onExploreMetro,
  onFindRoute,
  stats,
}) => {
  const [heroSearchInput, setHeroSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      onSearch(heroSearchInput.trim());
      onFindRoute();
    }
  };

  const quickHotspots = [
    { name: 'Route 21G', query: '21G' },
    { name: 'Airport Metro', query: 'Airport' },
    { name: 'Koyambedu CMBT', query: 'CMBT' },
    { name: 'Route 570', query: '570' },
    { name: 'Chennai Central', query: 'Central' },
    { name: 'T. Nagar', query: 'T. Nagar' },
  ];

  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
      {/* Background Decorative Ambient Blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-full max-w-7xl bg-radial from-blue-600/15 via-sky-500/5 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-300 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            <span>Official Chennai Unified Transit Directory (CUMTA Ready)</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Move through Chennai,{' '}
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
              smarter.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base text-slate-300 sm:text-lg lg:text-xl font-normal max-w-2xl mx-auto leading-relaxed">
            Explore MTC buses and Chennai Metro routes across the city.
          </p>

          {/* Quick Stats Pill */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5">
              <Bus className="h-3.5 w-3.5 text-rose-400" />
              <span className="font-semibold text-white">{stats.mtcRoutesCount}</span> MTC Bus Corridors
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5">
              <Train className="h-3.5 w-3.5 text-sky-400" />
              <span className="font-semibold text-white">41</span> Metro Stations (Phase 1 &amp; Ext)
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-semibold text-white">{stats.mtcStopsCount + stats.metroStationsCount}</span> Major Hubs &amp; Stops
            </div>
          </div>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="mt-8">
            <div className="relative mx-auto max-w-2xl shadow-2xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Search className="h-5 w-5 text-sky-400" />
              </div>
              <input
                id="hero-transit-search"
                type="text"
                value={heroSearchInput}
                onChange={(e) => setHeroSearchInput(e.target.value)}
                placeholder="Search route (e.g., 21G, 570), stop (Airport, Guindy), or landmark..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-4 pl-12 pr-32 text-sm text-white placeholder-slate-400 shadow-inner focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 backdrop-blur-md"
              />
              <button
                type="submit"
                id="hero-search-button"
                className="absolute inset-y-1.5 right-1.5 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 px-5 text-xs font-semibold text-white shadow-md hover:from-blue-500 hover:to-sky-500 transition focus:outline-none"
              >
                <span>Search</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          {/* Quick Search Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Popular:
            </span>
            {quickHotspots.map((item) => (
              <button
                key={item.query}
                type="button"
                onClick={() => {
                  setHeroSearchInput(item.query);
                  onSearch(item.query);
                  onFindRoute();
                }}
                className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              id="action-find-route"
              onClick={onFindRoute}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition"
            >
              <Compass className="h-4 w-4" />
              <span>Find a Route</span>
            </button>

            <button
              id="action-explore-mtc"
              onClick={onExploreMtc}
              className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 transition"
            >
              <Bus className="h-4 w-4 text-rose-400" />
              <span>Explore MTC Buses</span>
            </button>

            <button
              id="action-explore-metro"
              onClick={onExploreMetro}
              className="flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-5 py-3 text-sm font-semibold text-sky-300 hover:bg-sky-500/20 hover:border-sky-400 transition"
            >
              <Train className="h-4 w-4 text-sky-400" />
              <span>Explore Metro</span>
            </button>
          </div>
        </div>

        {/* Scroll-Reactive Animated Transit Banner */}
        <div className="mt-12 sm:mt-16">
          <AnimatedTransit />
        </div>
      </div>
    </section>
  );
};
