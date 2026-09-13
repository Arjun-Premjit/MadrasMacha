import React, { useState, useEffect, useCallback } from 'react';
import { Route } from '../../types/transit';
import { fetchPaginatedRoutes, fetchRouteCounts } from '../../lib/supabase/transitService';
import { MtcBus3D } from '../MtcBus3D';
import {
  Bus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface MtcPageProps {
  routes?: Route[];
  onSelectRoute: (route: Route) => void;
}

export const MtcPage: React.FC<MtcPageProps> = ({ onSelectRoute }) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [searchInput, setSearchInput] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const [routes, setRoutes] = useState<Route[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic count from Supabase
  useEffect(() => {
    fetchRouteCounts()
      .then((c) => {
        setTotalCount(c.mtc);
      })
      .catch(console.warn);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch paginated MTC routes from Supabase
  const loadMtcRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPaginatedRoutes({
        page,
        pageSize,
        search,
        modeFilter: 'mtc',
      });

      if (res.error) {
        setError(res.error);
      } else {
        setRoutes(res.routes);
        setTotalCount(res.totalCount);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch MTC routes from Supabase');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    loadMtcRoutes();
  }, [loadMtcRoutes]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const fromIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIndex = Math.min(page * pageSize, totalCount);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-20 px-6 sm:px-12 max-w-7xl mx-auto font-sans selection:bg-black selection:text-white">
      {/* Header (No dividing line) */}
      <div className="pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-xs font-semibold uppercase tracking-wider text-black/70 mb-4">
          <Bus className="w-3.5 h-3.5 text-black" />
          <span>Metropolitan Transport Corporation · Chennai</span>
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black">
          MTC Bus Network
        </h1>
        <p className="mt-4 text-base sm:text-lg text-black/75 max-w-3xl leading-relaxed">
          Metropolitan Transport Corporation connects the Greater Chennai metropolitan area with over four thousand scheduled bus corridors, providing affordable public mobility from North Chennai to the IT corridors and coastal highways as the backbone of Chennai public transit, operating low-floor, deluxe, and express services with integrated electronic ticketing across all city terminals and bus stops.
        </p>
      </div>

      {/* Bus Visual Feature: Headquarters & Helpline on the left, Animated Bus on the right */}
      <div className="py-6 my-2 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="w-full lg:w-1/2 max-w-lg space-y-4">
          <div className="p-5 rounded-2xl bg-neutral-100/70 border border-black/5">
            <span className="font-bold text-neutral-500 uppercase tracking-wider block text-xs">
              Headquarters
            </span>
            <span className="font-semibold text-neutral-900 mt-1.5 block text-base sm:text-lg leading-relaxed">
              Pallavan House, Anna Salai
            </span>
          </div>
          <div className="p-5 rounded-2xl bg-neutral-100/70 border border-black/5">
            <span className="font-bold text-neutral-500 uppercase tracking-wider block text-xs">
              Transit Helpline
            </span>
            <a
              href="tel:04423455801"
              className="font-semibold text-neutral-900 mt-1.5 block text-base sm:text-lg leading-relaxed hover:underline"
            >
              044-23455801
            </a>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <MtcBus3D isStatic={false} showWatermark={false} className="w-full max-w-lg mx-auto" />
        </div>
      </div>

      {/* Routes & Fleet Discovery from Supabase */}
      <div className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-neutral-900">
              Corridor Directory
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {loading
                ? 'Loading routes from Supabase...'
                : `Showing ${fromIndex}–${toIndex} of ${totalCount.toLocaleString()} MTC bus routes`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 bg-white border border-neutral-200 rounded-full px-3 py-1.5 self-start sm:self-auto">
              <span className="text-neutral-400 font-medium">Per page:</span>
              <button
                type="button"
                onClick={() => {
                  setPageSize(25);
                  setPage(1);
                }}
                className={`px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                  pageSize === 25 ? 'bg-black text-white' : 'text-neutral-700 hover:text-black'
                }`}
              >
                25
              </button>
              <button
                type="button"
                onClick={() => {
                  setPageSize(50);
                  setPage(1);
                }}
                className={`px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                  pageSize === 50 ? 'bg-black text-white' : 'text-neutral-700 hover:text-black'
                }`}
              >
                50
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search MTC route (e.g. 21G, 102)..."
                className="w-full bg-white border border-neutral-200 rounded-full py-2 pl-10 pr-4 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/15 transition"
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="p-16 rounded-3xl bg-white border border-neutral-200 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            <p className="text-sm font-semibold text-neutral-700">Loading MTC routes from Supabase...</p>
            <p className="text-xs text-neutral-400">Querying database range ({fromIndex}–{page * pageSize})</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-neutral-200 text-center">
            <Bus className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-700">No MTC routes match your search.</p>
            <button
              onClick={() => {
                setSearchInput('');
                setSearch('');
              }}
              className="mt-3 text-xs font-bold text-black underline"
            >
              Clear search query
            </button>
          </div>
        ) : (
          /* Real Route Cards List */
          <div className="space-y-3">
            {routes.map((route) => (
              <div
                key={route.route_id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 hover:border-black/30 transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Badge */}
                  <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex flex-col items-center justify-center shrink-0">
                    <span className="text-base font-black tracking-tight leading-tight">
                      {route.route_short_name || route.route_id}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-neutral-400">
                      MTC
                    </span>
                  </div>

                  {/* Route Corridor Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Route {route.route_id}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                        City Bus Service
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-neutral-900 group-hover:text-black transition">
                      {route.route_long_name || `MTC Corridor ${route.route_short_name}`}
                    </h4>

                    <div className="text-xs text-neutral-500 flex items-center gap-3">
                      <span>Agency: <strong>Metropolitan Transport Corporation</strong></span>
                      <span>·</span>
                      <span>GTFS Type 3 (Bus)</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="shrink-0 flex items-center justify-end pt-2 sm:pt-0">
                  <button
                    onClick={() => onSelectRoute(route)}
                    className="rounded-full bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>View Timetable &amp; Stops</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-neutral-500 font-medium">
              Page <span className="font-bold text-neutral-900">{page}</span> of{' '}
              <span className="font-bold text-neutral-900">{totalPages}</span> ({totalCount.toLocaleString()} total routes)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-neutral-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 transition cursor-pointer"
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-neutral-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 transition cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white font-bold font-mono">
                {page}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-neutral-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 transition cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-neutral-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 transition cursor-pointer"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
