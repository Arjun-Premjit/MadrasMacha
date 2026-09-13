import React, { useState, useMemo } from 'react';
import { Bus, Search, Filter, ArrowRight, Clock, IndianRupee, MapPin, Sparkles, Navigation, Layers } from 'lucide-react';
import { Route, TransitStats } from '../types/transit';
import { formatFare, getRouteTypeBadge } from '../lib/utils';

interface MtcSectionProps {
  routes: Route[];
  stats: TransitStats;
  onSelectRoute: (route: Route) => void;
}

export const MtcSection: React.FC<MtcSectionProps> = ({
  routes,
  stats,
  onSelectRoute,
}) => {
  const [mtcSearch, setMtcSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'deluxe' | 'ac' | 'ordinary' | 'express'>('all');

  const mtcRoutes = useMemo(() => {
    return routes.filter((r) => r.agency_id === 'MTC' || r.route_type === 3);
  }, [routes]);

  const filteredRoutes = useMemo(() => {
    return mtcRoutes.filter((route) => {
      const matchesSearch =
        route.route_short_name.toLowerCase().includes(mtcSearch.toLowerCase()) ||
        route.route_long_name.toLowerCase().includes(mtcSearch.toLowerCase()) ||
        (route.origin && route.origin.toLowerCase().includes(mtcSearch.toLowerCase())) ||
        (route.destination && route.destination.toLowerCase().includes(mtcSearch.toLowerCase()));

      if (!matchesSearch) return false;

      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'deluxe') return route.service_category === 'mtc_deluxe';
      if (categoryFilter === 'ac') return route.service_category === 'mtc_ac';
      if (categoryFilter === 'ordinary') return route.service_category === 'mtc_ordinary';
      if (categoryFilter === 'express') return route.service_category === 'mtc_express';
      return true;
    });
  }, [mtcRoutes, mtcSearch, categoryFilter]);

  return (
    <section id="mtc" className="relative py-14 sm:py-18 border-t border-slate-800/80 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* MTC Section Header with Authentic Branding */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Bus className="h-4 w-4" />
              </span>
              <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-rose-400 border border-rose-500/20">
                State Transit Undertaking
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Metropolitan Transport Corporation (Chennai) Ltd.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              மாநகர போக்குவரத்துக் கழகம் (சென்னை) • Lifeline bus transit network operating across Chennai Metropolitan Area with over 3,000 scheduled trips.
            </p>
          </div>

          {/* Database Counters from Supabase */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                MTC Routes in DB
              </div>
              <div className="text-xl font-extrabold text-rose-400 font-mono">
                {stats.mtcRoutesCount}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                MTC Bus Stops in DB
              </div>
              <div className="text-xl font-extrabold text-amber-400 font-mono">
                {stats.mtcStopsCount}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Data Source
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{stats.dataSource === 'supabase' ? 'Supabase GTFS' : 'Authentic Seed'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="mtc-search-input"
              type="text"
              value={mtcSearch}
              onChange={(e) => setMtcSearch(e.target.value)}
              placeholder="Search MTC route (e.g. 21G, 102, 570, Besant Nagar)..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Service Category Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Fleet:
            </span>
            {[
              { id: 'all', label: 'All Services' },
              { id: 'deluxe', label: 'Deluxe' },
              { id: 'ac', label: 'Volvo AC' },
              { id: 'express', label: 'Express' },
              { id: 'ordinary', label: 'Ordinary' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  categoryFilter === cat.id
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Routes Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutes.map((route) => {
            const badge = getRouteTypeBadge(route.route_type, route.service_category);
            return (
              <div
                key={route.route_id}
                onClick={() => onSelectRoute(route)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-md hover:border-rose-500/50 hover:shadow-rose-950/20 transition cursor-pointer"
              >
                <div>
                  {/* Top card metadata */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center rounded-lg bg-rose-600 px-3 py-1 font-mono text-sm font-black text-white shadow-sm">
                        {route.route_short_name}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border ${badge.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      Agency: {route.agency_id}
                    </span>
                  </div>

                  {/* Route Title */}
                  <h3 className="mt-3 text-base font-bold text-white group-hover:text-rose-300 transition">
                    {route.route_long_name}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {route.route_desc || 'Key trunk transit link operated by MTC Chennai.'}
                  </p>

                  {/* Origin & Destination indicators */}
                  <div className="mt-4 space-y-1.5 rounded-xl bg-slate-950/70 p-3 border border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-slate-400">From:</span>
                      <span className="font-semibold text-white truncate">{route.origin}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0" />
                      <span className="text-slate-400">To:</span>
                      <span className="font-semibold text-white truncate">{route.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Timings, Distance, and Action */}
                <div className="mt-5 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {route.frequency_peak || 'Frequent'}
                    </span>
                    <span className="text-emerald-400 font-semibold font-mono">
                      {formatFare(route.fare_min, route.fare_max)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-semibold text-rose-400 group-hover:translate-x-0.5 transition">
                    <span>View Sequence</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRoutes.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
            <Bus className="mx-auto h-8 w-8 text-slate-500" />
            <h3 className="mt-2 text-sm font-semibold text-white">No MTC routes found</h3>
            <p className="mt-1 text-xs text-slate-400">
              Try adjusting your search query or clear the service filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
