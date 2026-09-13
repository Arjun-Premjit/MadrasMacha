import React, { useState, useMemo } from 'react';
import { MapPin, Search, Navigation, Filter, Train, Bus, Globe, Compass, CheckCircle2, Accessibility, X } from 'lucide-react';
import { Stop, Route } from '../types/transit';

interface StopExplorerProps {
  stops: Stop[];
  routes: Route[];
  onSelectRouteById: (routeId: string) => void;
}

export const StopExplorer: React.FC<StopExplorerProps> = ({
  stops,
  routes,
  onSelectRouteById,
}) => {
  const [stopSearch, setStopSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  const filteredStops = useMemo(() => {
    return stops.filter((s) => {
      const matchesSearch =
        s.stop_name.toLowerCase().includes(stopSearch.toLowerCase()) ||
        (s.stop_name_tamil && s.stop_name_tamil.toLowerCase().includes(stopSearch.toLowerCase())) ||
        (s.stop_desc && s.stop_desc.toLowerCase().includes(stopSearch.toLowerCase())) ||
        (s.stop_code && s.stop_code.toLowerCase().includes(stopSearch.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedZone !== 'all') {
        if (selectedZone === 'metro' && !s.is_metro_station) return false;
        if (selectedZone === 'interchange' && !s.interchange_available) return false;
        if (selectedZone === 'omr' && s.zone_id !== 'ZONE-OMR') return false;
        if (selectedZone === 'central' && s.zone_id !== 'ZONE-CENTRAL') return false;
        if (selectedZone === 'south' && s.zone_id !== 'ZONE-SOUTH') return false;
      }

      return true;
    });
  }, [stops, stopSearch, selectedZone]);

  return (
    <section id="stops" className="relative py-14 sm:py-20 border-t border-slate-800/80 bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                GTFS Stops &amp; Geocodes
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Stop &amp; Station Explorer
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              Discover Chennai transit stops with authentic geographical coordinates, Tamil script names, and connecting MTC and Metro lines.
            </p>
          </div>

          {/* Quick Zone Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Stops' },
              { id: 'metro', label: 'Metro Stations' },
              { id: 'interchange', label: 'Interchanges' },
              { id: 'omr', label: 'OMR Corridor' },
              { id: 'central', label: 'Central Zone' },
              { id: 'south', label: 'South Corridor' },
            ].map((z) => (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  selectedZone === z.id
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={stopSearch}
              onChange={(e) => setStopSearch(e.target.value)}
              placeholder="Search stop by English or Tamil (e.g., Central, Guindy, கிண்டி, Airport)..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredStops.length}</strong> stops in Chennai Metropolitan Area
          </div>
        </div>

        {/* MAP-ORIENTED SCHEMATIC VIEW + STOPS LISTING */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Visual Map / Spatial Canvas */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    Chennai Spatial Coordinates Radar
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Lat: 12.8°N–13.2°N • Lon: 80.1°E–80.3°E
                </span>
              </div>

              {/* Schematic Map Representation */}
              <div className="relative mt-4 h-72 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-4">
                {/* Coastal Line Guide on Right (Bay of Bengal) */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-sky-500/10 border-l border-dashed border-sky-400/30 flex items-center justify-center">
                  <span className="text-[9px] text-sky-400/60 uppercase font-mono tracking-widest [writing-mode:vertical-lr] rotate-180">
                    Bay of Bengal
                  </span>
                </div>

                {/* Radar Grid Lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

                {/* Chennai Landmarks plotted visually by normalized lat/lon */}
                {stops.slice(0, 15).map((st) => {
                  // Normalize Chennai lat (12.8 to 13.2) & lon (80.1 to 80.3) to 5-90% box
                  const minLat = 12.82;
                  const maxLat = 13.18;
                  const minLon = 80.10;
                  const maxLon = 80.30;

                  const yPercent = 90 - ((st.stop_lat - minLat) / (maxLat - minLat)) * 80;
                  const xPercent = ((st.stop_lon - minLon) / (maxLon - minLon)) * 75 + 5;

                  const isSelected = selectedStop?.stop_id === st.stop_id;

                  return (
                    <button
                      key={st.stop_id}
                      onClick={() => setSelectedStop(st)}
                      style={{
                        top: `${Math.max(5, Math.min(88, yPercent))}%`,
                        left: `${Math.max(5, Math.min(82, xPercent))}%`,
                      }}
                      className={`group absolute -translate-x-1/2 -translate-y-1/2 p-1 focus:outline-none transition-transform ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                      }`}
                      title={`${st.stop_name} (${st.stop_lat}, ${st.stop_lon})`}
                    >
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border shadow-md transition ${
                          isSelected
                            ? 'bg-emerald-400 border-white ring-4 ring-emerald-500/40'
                            : st.is_metro_station
                            ? 'bg-sky-500 border-sky-300'
                            : 'bg-rose-500 border-rose-300'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                      <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950/90 px-1 py-0.5 text-[8px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition shadow">
                        {st.stop_name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Map Legend */}
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <span>Metro</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span>MTC Bus Hub</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Active</span>
                </span>
              </div>
              <span className="font-mono text-slate-400">EPSG:4326 WGS84</span>
            </div>
          </div>

          {/* Right Column: Searchable Stop Cards Grid */}
          <div className="lg:col-span-7 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredStops.map((stop) => {
                const isSelected = selectedStop?.stop_id === stop.stop_id;

                return (
                  <div
                    key={stop.stop_id}
                    onClick={() => setSelectedStop(stop)}
                    className={`rounded-xl border p-4 transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/20 shadow-lg'
                        : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      {/* Top badges */}
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            stop.is_metro_station
                              ? 'bg-sky-500/20 text-sky-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {stop.is_metro_station ? 'Metro Station' : 'Bus Terminus'}
                        </span>

                        <span className="font-mono text-[10px] text-slate-400">
                          {stop.stop_code || stop.stop_id}
                        </span>
                      </div>

                      {/* Name */}
                      <h4 className="mt-2 text-sm font-bold text-white">
                        {stop.stop_name}
                      </h4>

                      {stop.stop_name_tamil && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {stop.stop_name_tamil}
                        </p>
                      )}

                      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {stop.stop_desc || 'Major transit interchange connecting Chennai passengers.'}
                      </p>
                    </div>

                    {/* Geocodes & Associated Routes count */}
                    <div className="mt-4 border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="font-mono text-emerald-400/90">
                        {stop.stop_lat.toFixed(4)}°N, {stop.stop_lon.toFixed(4)}°E
                      </div>

                      <div className="flex items-center gap-1 text-slate-300">
                        <Navigation className="h-3 w-3 text-sky-400" />
                        <span>{stop.connected_routes?.length || 2} routes</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredStops.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
                <MapPin className="mx-auto h-7 w-7 text-slate-500" />
                <h4 className="mt-2 text-xs font-semibold text-white">No transit stops found</h4>
                <p className="text-[11px] text-slate-400">
                  Try clearing your search or switching to another zone.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Stop Inspector Modal / Drawer */}
        {selectedStop && (
          <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-slate-950 p-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {selectedStop.stop_name}
                    </h3>
                    <span className="text-xs text-slate-400">
                      ({selectedStop.stop_name_tamil})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="font-mono text-emerald-400">
                      Coordinates: {selectedStop.stop_lat}, {selectedStop.stop_lon}
                    </span>
                    <span>•</span>
                    <span>Zone: {selectedStop.zone_id}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStop(null)}
                className="self-end sm:self-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close stop inspector"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stop Description */}
            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              {selectedStop.stop_desc}
            </p>

            {/* Connecting routes */}
            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Transit Routes Serving This Stop:
              </h4>

              <div className="flex flex-wrap gap-2">
                {selectedStop.connected_routes?.map((routeId) => {
                  const match = routes.find((r) => r.route_id === routeId);
                  return (
                    <button
                      key={routeId}
                      onClick={() => onSelectRouteById(routeId)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:border-sky-500 hover:bg-slate-800 transition"
                    >
                      <span
                        className="rounded px-1.5 py-0.2 text-[10px] text-white"
                        style={{
                          backgroundColor:
                            match?.route_color ||
                            (match?.route_type === 1 ? '#0284C7' : '#DC2626'),
                        }}
                      >
                        {match?.route_short_name || routeId}
                      </span>
                      <span>{match?.route_long_name || routeId}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
