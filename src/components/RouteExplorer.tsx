import React, { useState, useMemo } from 'react';
import { Search, Filter, Bus, Train, ArrowRight, Clock, MapPin, IndianRupee, Layers, X, CheckCircle, Share2 } from 'lucide-react';
import { Route } from '../types/transit';
import { formatFare, getRouteTypeBadge } from '../lib/utils';

interface RouteExplorerProps {
  routes: Route[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRoute: Route | null;
  onSelectRoute: (route: Route | null) => void;
}

export const RouteExplorer: React.FC<RouteExplorerProps> = ({
  routes,
  searchQuery,
  onSearchChange,
  selectedRoute,
  onSelectRoute,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mtc' | 'metro'>('all');
  const [selectedServiceType, setSelectedServiceType] = useState<'all' | 'deluxe' | 'ac' | 'express' | 'ordinary'>('all');

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      // Tab filter
      if (activeTab === 'mtc' && (route.agency_id !== 'MTC' && route.route_type !== 3)) return false;
      if (activeTab === 'metro' && (route.agency_id !== 'CMRL' && route.route_type !== 1)) return false;

      // Service category filter
      if (selectedServiceType !== 'all') {
        if (selectedServiceType === 'deluxe' && route.service_category !== 'mtc_deluxe') return false;
        if (selectedServiceType === 'ac' && route.service_category !== 'mtc_ac') return false;
        if (selectedServiceType === 'express' && route.service_category !== 'mtc_express') return false;
        if (selectedServiceType === 'ordinary' && route.service_category !== 'mtc_ordinary') return false;
      }

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        route.route_short_name.toLowerCase().includes(q) ||
        route.route_long_name.toLowerCase().includes(q) ||
        (route.origin && route.origin.toLowerCase().includes(q)) ||
        (route.destination && route.destination.toLowerCase().includes(q)) ||
        (route.route_desc && route.route_desc.toLowerCase().includes(q))
      );
    });
  }, [routes, activeTab, selectedServiceType, searchQuery]);

  return (
    <section id="routes" className="relative py-14 sm:py-20 border-t border-slate-800/80 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-sky-400 border border-blue-500/20">
              Chennai Unified Transit Directory
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Transit Route Explorer
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              Search and filter across all MTC Bus corridors and Chennai Metro rail routes with schedules, fares, and stop sequences.
            </p>
          </div>

          {/* Mode Tabs: All, MTC, Metro */}
          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>All ({routes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('mtc')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === 'mtc'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bus className="h-3.5 w-3.5" />
              <span>MTC Buses ({routes.filter((r) => r.agency_id === 'MTC' || r.route_type === 3).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('metro')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === 'metro'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Train className="h-3.5 w-3.5" />
              <span>Metro Rail ({routes.filter((r) => r.agency_id === 'CMRL' || r.route_type === 1).length})</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter by route code (21G), terminal (Tambaram), or landmark..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Sub-filters if on MTC or All */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto text-xs">
            <span className="text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Service:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'deluxe', label: 'Deluxe' },
              { id: 'ac', label: 'AC Volvo' },
              { id: 'express', label: 'Express' },
              { id: 'ordinary', label: 'Ordinary' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedServiceType(s.id as any)}
                className={`rounded-lg px-2.5 py-1 transition ${
                  selectedServiceType === s.id
                    ? 'bg-slate-800 text-sky-400 border border-sky-500/40 font-semibold'
                    : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filteredRoutes.length}</strong> transit routes
          </span>
          {searchQuery && (
            <span>
              Searching for: <span className="text-sky-400 font-mono">"{searchQuery}"</span>
            </span>
          )}
        </div>

        {/* Route Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutes.map((route) => {
            const isMetro = route.route_type === 1;
            const badge = getRouteTypeBadge(route.route_type, route.service_category);

            return (
              <div
                key={route.route_id}
                onClick={() => onSelectRoute(route)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-sm hover:border-sky-500/50 hover:bg-slate-900 hover:shadow-lg transition cursor-pointer"
              >
                <div>
                  {/* Top metadata */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-lg px-3 py-1 font-mono text-sm font-black text-white shadow-sm"
                        style={{
                          backgroundColor: route.route_color || (isMetro ? '#0284C7' : '#DC2626'),
                        }}
                      >
                        {route.route_short_name}
                      </span>

                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border ${badge.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {route.agency_id}
                    </span>
                  </div>

                  {/* Route Name */}
                  <h3 className="mt-3 text-base font-bold text-white group-hover:text-sky-300 transition line-clamp-1">
                    {route.route_long_name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {route.route_desc || 'High frequency public transport route in Chennai.'}
                  </p>

                  {/* Route corridor origin / destination */}
                  <div className="mt-4 space-y-1.5 rounded-xl bg-slate-950/80 p-3 border border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-slate-400">Origin:</span>
                      <span className="font-semibold text-white truncate">{route.origin}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0" />
                      <span className="text-slate-400">Destination:</span>
                      <span className="font-semibold text-white truncate">{route.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="mt-5 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {route.frequency_peak || 'Regular'}
                    </span>
                    <span className="text-emerald-400 font-semibold font-mono">
                      {formatFare(route.fare_min, route.fare_max)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-semibold text-sky-400 group-hover:translate-x-0.5 transition">
                    <span>Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredRoutes.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
            <Search className="mx-auto h-8 w-8 text-slate-500" />
            <h3 className="mt-2 text-sm font-semibold text-white">No transit routes found</h3>
            <p className="mt-1 text-xs text-slate-400">
              No routes matched "{searchQuery}". Try searching for popular routes like "21G", "570", "Blue Line", or "102".
            </p>
            <button
              onClick={() => {
                onSearchChange('');
                setActiveTab('all');
                setSelectedServiceType('all');
              }}
              className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ROUTE DETAIL MODAL / DRAWER */}
      {selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            {/* Modal close */}
            <button
              onClick={() => onSelectRoute(null)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              aria-label="Close route details modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl font-mono text-lg font-black text-white shadow-md shrink-0"
                style={{
                  backgroundColor:
                    selectedRoute.route_color ||
                    (selectedRoute.route_type === 1 ? '#0284C7' : '#DC2626'),
                }}
              >
                {selectedRoute.route_short_name}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                    Agency: {selectedRoute.agency_id}
                  </span>
                  <span className="text-xs text-sky-400 font-semibold">
                    {selectedRoute.route_type === 1 ? 'Chennai Metro Rail' : 'MTC Bus Corridor'}
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-bold text-white sm:text-xl">
                  {selectedRoute.route_long_name}
                </h3>
              </div>
            </div>

            {/* Route description */}
            <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedRoute.route_desc || 'Key public transit link in the Chennai Metropolitan Area.'}
            </p>

            {/* Quick Metrics Grid */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400 block text-[10px]">Peak Frequency</span>
                <span className="font-bold text-white mt-0.5 block">{selectedRoute.frequency_peak}</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400 block text-[10px]">Est. Travel Time</span>
                <span className="font-bold text-sky-400 mt-0.5 block">
                  {selectedRoute.estimated_duration_min} mins
                </span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400 block text-[10px]">Total Distance</span>
                <span className="font-bold text-white mt-0.5 block">{selectedRoute.distance_km} km</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400 block text-[10px]">Fares</span>
                <span className="font-bold text-emerald-400 mt-0.5 block font-mono">
                  {formatFare(selectedRoute.fare_min, selectedRoute.fare_max)}
                </span>
              </div>
            </div>

            {/* Terminal Schedule */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">Daily Service Hours:</span>
              </div>
              <div className="font-mono text-slate-200">
                First Trip: <strong>{selectedRoute.first_trip || '05:00 AM'}</strong> • Last Trip: <strong>{selectedRoute.last_trip || '11:00 PM'}</strong>
              </div>
            </div>

            {/* Stop Sequence Timeline */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                Key Stop &amp; Station Sequence ({selectedRoute.stops_sequence?.length || selectedRoute.stops_count || 0} stops)
              </h4>

              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-3 scrollbar-thin">
                {selectedRoute.stops_sequence && selectedRoute.stops_sequence.length > 0 ? (
                  <div className="relative pl-6 space-y-3">
                    {/* Vertical line */}
                    <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-slate-700" />

                    {selectedRoute.stops_sequence.map((stopName, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === selectedRoute.stops_sequence!.length - 1;

                      return (
                        <div key={`${stopName}-${idx}`} className="relative flex items-center gap-3 text-xs">
                          {/* Circle dot */}
                          <div
                            className={`absolute -left-6 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-slate-900 ${
                              isFirst
                                ? 'border-emerald-400 text-emerald-400'
                                : isLast
                                ? 'border-rose-400 text-rose-400'
                                : 'border-slate-500'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isFirst ? 'bg-emerald-400' : isLast ? 'bg-rose-400' : 'bg-slate-400'
                              }`}
                            />
                          </div>

                          <div className="flex items-center justify-between w-full">
                            <span className={`font-medium ${isFirst || isLast ? 'text-white font-bold' : 'text-slate-300'}`}>
                              {stopName}
                            </span>
                            {isFirst && (
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] text-emerald-400 font-bold">
                                Origin Terminus
                              </span>
                            )}
                            {isLast && (
                              <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] text-rose-400 font-bold">
                                Destination Terminus
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Comprehensive GTFS stop sequence for {selectedRoute.route_short_name} spans across {selectedRoute.stops_count || 28} intermediate stops.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => onSelectRoute(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
