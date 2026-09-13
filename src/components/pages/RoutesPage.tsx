import React, { useState, useEffect, useCallback } from 'react';
import { Route } from '../../types/transit';
import {
  fetchPaginatedRoutes,
  fetchRouteCounts,
  RouteCounts,
} from '../../lib/supabase/transitService';
import {
  Search,
  Bus,
  Train,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface RoutesPageProps {
  onSelectRoute: (routeId: string) => void;
  initialModeFilter?: 'all' | 'mtc' | 'metro';
}

export const RoutesPage: React.FC<RoutesPageProps> = ({
  onSelectRoute,
  initialModeFilter = 'all',
}) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<'all' | 'mtc' | 'metro'>(initialModeFilter);

  const [routes, setRoutes] = useState<Route[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [counts, setCounts] = useState<RouteCounts>({ total: 4614, mtc: 4611, metro: 3 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load counts on mount
  useEffect(() => {
    fetchRouteCounts().then(setCounts).catch(console.warn);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch routes when page, pageSize, search, or modeFilter changes
  const loadRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPaginatedRoutes({
        page,
        pageSize,
        search,
        modeFilter,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setRoutes(res.routes);
        setTotalCount(res.totalCount);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch routes from Supabase');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, modeFilter]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const fromIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIndex = Math.min(page * pageSize, totalCount);

  const handleFilterChange = (filter: 'all' | 'mtc' | 'metro') => {
    setModeFilter(filter);
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
          Routes
        </h1>
        <p className="mt-3 text-lg text-black/75 max-w-xl leading-relaxed">
          Comprehensive MTC bus corridors and Chennai Metro rail services across the metropolitan area.
        </p>

        {/* Filter bar & Search */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleFilterChange('all')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                modeFilter === 'all'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
              }`}
            >
              All Modes ({counts.total.toLocaleString()})
            </button>
            <button
              onClick={() => handleFilterChange('mtc')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                modeFilter === 'mtc'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
              }`}
            >
              MTC Buses ({counts.mtc.toLocaleString()})
            </button>
            <button
              onClick={() => handleFilterChange('metro')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                modeFilter === 'metro'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
              }`}
            >
              Metro Rail ({counts.metro})
            </button>
          </div>

          {/* Minimal Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-black/40" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search route code or place..."
              className="w-full bg-white border border-black/10 rounded-full py-2.5 pl-11 pr-10 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
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
            <span className="font-bold text-black">{totalCount.toLocaleString()}</span> routes
            {search && (
              <span> matching "<span className="font-bold text-black">{search}</span>"</span>
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

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/70 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="text-sm text-red-800 font-medium">
              <span className="font-bold">Supabase Query Notice:</span> {error}
            </div>
          </div>
          <button
            onClick={() => loadRoutes()}
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
                <div className="w-12 h-12 rounded-xl bg-neutral-200" />
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-neutral-200 rounded-md" />
                  <div className="h-4 w-64 bg-neutral-200 rounded-md" />
                </div>
              </div>
              <div className="h-8 w-24 bg-neutral-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        /* Routes List */
        <div className="space-y-3">
          {routes.map((route) => {
            const isMetro = route.route_type === 1 || route.agency_id === 'CMRL';

            return (
              <div
                key={route.route_id}
                onClick={() => onSelectRoute(route.route_id)}
                className="group p-5 rounded-2xl bg-white hover:bg-neutral-50 border border-black/5 hover:border-black/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-bold text-base shrink-0">
                    {isMetro ? <Train className="w-6 h-6" /> : <Bus className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-black">
                        {route.route_short_name}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          isMetro ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {isMetro ? 'Chennai Metro' : 'MTC Bus'}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        ID: {route.route_id}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-black mt-0.5">
                      {route.route_long_name}
                    </h3>

                    {route.origin && route.destination && (
                      <p className="text-sm text-black/70 mt-0.5">
                        {route.origin} → {route.destination}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-5 text-sm text-black/80 font-medium self-end md:self-center">
                  <span className="text-xs text-neutral-500 font-semibold bg-neutral-100 px-3 py-1 rounded-full">
                    Regular Service
                  </span>
                  <span className="rounded-full bg-black text-white px-5 py-2 group-hover:bg-neutral-800 transition-all text-xs font-bold">
                    View →
                  </span>
                </div>
              </div>
            );
          })}

          {routes.length === 0 && (
            <div className="py-16 text-center text-base text-black/60 rounded-2xl bg-white border border-black/5">
              No routes found matching your criteria.
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
