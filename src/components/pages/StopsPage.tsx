import React, { useState, useEffect, useCallback } from 'react';
import { Stop } from '../../types/transit';
import {
  fetchPaginatedStops,
  fetchStopCounts,
  StopCounts,
} from '../../lib/supabase/transitService';
import {
  Search,
  MapPin,
  Train,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface StopsPageProps {
  onSelectStop: (stopId: string) => void;
  onSelectRouteById?: (routeId: string) => void;
  initialTypeFilter?: 'all' | 'metro' | 'bus';
}

export const StopsPage: React.FC<StopsPageProps> = ({
  onSelectStop,
  onSelectRouteById,
  initialTypeFilter = 'all',
}) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [query, setQuery] = useState<string>('');
  const [queryInput, setQueryInput] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'metro' | 'bus'>(initialTypeFilter);

  const [stops, setStops] = useState<Stop[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [counts, setCounts] = useState<StopCounts>({ total: 5624, metro: 44, bus: 5580 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load counts on mount
  useEffect(() => {
    fetchStopCounts().then(setCounts).catch(console.warn);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(queryInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [queryInput]);

  // Fetch stops from Supabase
  const loadStops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPaginatedStops({
        page,
        pageSize,
        search: query,
        typeFilter: filterType,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setStops(res.stops);
        setTotalCount(res.totalCount);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch stops from Supabase');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query, filterType]);

  useEffect(() => {
    loadStops();
  }, [loadStops]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const fromIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIndex = Math.min(page * pageSize, totalCount);

  const handleFilterChange = (filter: 'all' | 'metro' | 'bus') => {
    setFilterType(filter);
    setPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-24 px-6 sm:px-12 max-w-7xl mx-auto font-sans selection:bg-black selection:text-white">
      {/* Page Header */}
      <div className="pb-8">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-black">
          Stops
        </h1>
        <p className="mt-3 text-lg text-black/75 max-w-xl leading-relaxed">
          Geographic coordinates and transit interchanges cataloged across the Chennai Metropolitan Area.
        </p>

        {/* Filter bar & Search */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleFilterChange('all')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
              }`}
            >
              All Stops ({counts.total.toLocaleString()})
            </button>
            <button
              onClick={() => handleFilterChange('metro')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                filterType === 'metro'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
              }`}
            >
              Metro Stations ({counts.metro})
            </button>
            <button
              onClick={() => handleFilterChange('bus')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                filterType === 'bus'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
              }`}
            >
              MTC Terminals ({counts.bus.toLocaleString()})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-black/40" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search stop name or ID..."
              className="w-full bg-white border border-black/10 rounded-full py-2.5 pl-11 pr-10 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
            />
            {queryInput && (
              <button
                onClick={() => setQueryInput('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-black/50 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results summary bar & Page Size Toggle */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-neutral-600 font-medium">
          <div>
            Showing <span className="font-bold text-black">{fromIndex}–{toIndex}</span> of{' '}
            <span className="font-bold text-black">{totalCount.toLocaleString()}</span> stops
            {query && (
              <span> matching "<span className="font-bold text-black">{query}</span>"</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Show per page:</span>
            <button
              onClick={() => handlePageSizeChange(25)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                pageSize === 25 ? 'bg-black text-white' : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              25
            </button>
            <button
              onClick={() => handlePageSizeChange(50)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                pageSize === 50 ? 'bg-black text-white' : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              50
            </button>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/70 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="text-sm text-red-800 font-medium">
              <span className="font-bold">Supabase Query Notice:</span> {error}
            </div>
          </div>
          <button
            onClick={() => loadStops()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-200" />
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-neutral-200 rounded-md" />
                  <div className="h-4 w-32 bg-neutral-200 rounded-md" />
                </div>
              </div>
              <div className="h-8 w-24 bg-neutral-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        /* Stops Directory Cards */
        <div className="space-y-3">
          {stops.map((stop) => {
            const isMetro = stop.is_metro_station;

            return (
              <div
                key={stop.stop_id}
                onClick={() => onSelectStop(stop.stop_id)}
                className="group p-5 rounded-2xl bg-white hover:bg-neutral-50 border border-black/5 hover:border-black/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md cursor-pointer"
              >
                {/* Left: Name and Coordinates */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isMetro ? 'bg-blue-600 text-white' : 'bg-black text-white'
                    }`}
                  >
                    {isMetro ? <Train className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-bold text-black group-hover:underline">
                        {stop.stop_name}
                      </h3>

                      {isMetro && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-white bg-blue-600 rounded-full px-3 py-0.5">
                          Metro
                        </span>
                      )}

                      <span className="text-xs font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">
                        ID: {stop.stop_id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
                      {stop.stop_lat && stop.stop_lon && (
                        <span className="font-mono">
                          {stop.stop_lat.toFixed(4)}° N, {stop.stop_lon.toFixed(4)}° E
                        </span>
                      )}
                      {stop.stop_desc && <span>· {stop.stop_desc}</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Action Button */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  <span className="rounded-full bg-black text-white px-5 py-2 group-hover:bg-neutral-800 transition-all text-xs font-bold">
                    View Stop Details →
                  </span>
                </div>
              </div>
            );
          })}

          {stops.length === 0 && (
            <div className="py-16 text-center text-base text-black/60 rounded-2xl bg-white border border-black/5">
              No stops found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-black/10">
          <div className="text-xs sm:text-sm text-neutral-500 font-medium">
            Page <span className="font-bold text-black">{page}</span> of{' '}
            <span className="font-bold text-black">{totalPages.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-2 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-1.5 rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            {/* Page number buttons */}
            <div className="hidden sm:flex items-center gap-1 mx-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                let pNum: number;
                if (totalPages <= 5) {
                  pNum = idx + 1;
                } else if (page <= 3) {
                  pNum = idx + 1;
                } else if (page >= totalPages - 2) {
                  pNum = totalPages - 4 + idx;
                } else {
                  pNum = page - 2 + idx;
                }

                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition cursor-pointer ${
                      page === pNum
                        ? 'bg-black text-white'
                        : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3.5 py-1.5 rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-2 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
