import React from 'react';
import { Agency, Route, Stop, Calendar } from '../types/transit';
import {
  Database,
  Route as RouteIcon,
  MapPin,
  Building2,
  Calendar as CalendarIcon,
  AlertCircle,
  RefreshCw,
  Lock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Filter,
} from 'lucide-react';

interface SupabaseTransitSectionProps {
  agencies: Agency[];
  routes: Route[];
  stops: Stop[];
  calendar: Calendar[];
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  maskedUrl?: string;
  selectedAgencyId: string;
  onSelectAgencyId: (agencyId: string) => void;
  onRefresh: () => void;
  onSelectRoute?: (route: Route) => void;
}

export const SupabaseTransitSection: React.FC<SupabaseTransitSectionProps> = ({
  agencies,
  routes,
  stops,
  calendar,
  loading,
  error,
  isConfigured,
  maskedUrl,
  selectedAgencyId,
  onSelectAgencyId,
  onRefresh,
  onSelectRoute,
}) => {
  // Derive filtered routes based on agency selection
  const displayedRoutes = React.useMemo(() => {
    if (!selectedAgencyId || selectedAgencyId === 'all') {
      return routes;
    }
    return routes.filter(
      (r) =>
        r.agency_id?.toLowerCase() === selectedAgencyId.toLowerCase() ||
        (selectedAgencyId === 'MTC' && r.route_type === 3) ||
        (selectedAgencyId === 'CMRL' && r.route_type === 1)
    );
  }, [routes, selectedAgencyId]);

  return (
    <section
      id="supabase-database-section"
      className="relative py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/[0.08]"
    >
      {/* Header bar with read-only badge and security guarantee */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider uppercase bg-[#72D7FF]/10 text-[#72D7FF] border border-[#72D7FF]/20">
              <Database className="w-3 h-3 text-[#72D7FF]" />
              Supabase PostgreSQL
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
              Public Read-Only
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider uppercase bg-white/5 text-[#94A3B8] border border-white/10 hidden sm:inline-flex">
              <ShieldCheck className="w-2.5 h-2.5 text-[#94A3B8]" />
              Zero Secrets Exposed
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-white">
            Connected Transit Database.
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#94A3B8]">
            Source of truth: <code className="text-white font-mono bg-white/5 px-1.5 py-0.5 rounded text-[11px]">agencies</code> · <code className="text-white font-mono bg-white/5 px-1.5 py-0.5 rounded text-[11px]">routes</code> · <code className="text-white font-mono bg-white/5 px-1.5 py-0.5 rounded text-[11px]">stops</code> · <code className="text-white font-mono bg-white/5 px-1.5 py-0.5 rounded text-[11px]">calendar</code>
          </p>
        </div>

        {/* Database status & refresh control */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-mono text-[#94A3B8]">Project Host</div>
            <div className="text-xs font-mono text-white truncate max-w-[200px]">
              {maskedUrl || (isConfigured ? 'Supabase Connected' : 'NEXT_PUBLIC_SUPABASE_URL')}
            </div>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 px-4 py-2 text-xs font-mono transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Reload from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#72D7FF]' : 'text-white'}`} />
            <span>{loading ? 'Querying...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ERROR STATE: Clear message and recovery guidance
          ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="my-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 text-amber-200">
          <div className="flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs">
              <div className="font-semibold text-amber-300 font-mono tracking-wide">
                Database Status / Connection Notice
              </div>
              <p className="text-amber-200/90 leading-relaxed font-mono">
                {error}
              </p>
              {!isConfigured && (
                <div className="pt-2 text-[11px] text-amber-300/80 leading-relaxed">
                  Provide <code className="bg-black/30 px-1 py-0.5 rounded text-white">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-black/30 px-1 py-0.5 rounded text-white">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in your environment settings to connect directly to your PostgreSQL database.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          METRICS BAR: Agency Count, Route Count, Stop Count, Calendar Count
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        {/* Metric 1: Agency Count */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="font-mono text-xs tracking-wider uppercase">Agencies</span>
            <Building2 className="w-4 h-4 text-[#F5C542]" />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
          ) : (
            <div className="text-3xl font-light text-white tracking-tight">
              {agencies.length}
            </div>
          )}
          <div className="mt-1 text-[11px] font-mono text-[#94A3B8]/70">
            {loading ? 'Checking table...' : `${agencies.length} ${agencies.length === 1 ? 'operator' : 'operators'} connected`}
          </div>
        </div>

        {/* Metric 2: Route Count */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="font-mono text-xs tracking-wider uppercase">Routes</span>
            <RouteIcon className="w-4 h-4 text-[#72D7FF]" />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
          ) : (
            <div className="text-3xl font-light text-white tracking-tight">
              {routes.length}
            </div>
          )}
          <div className="mt-1 text-[11px] font-mono text-[#94A3B8]/70">
            {loading ? 'Checking table...' : `${routes.length} published routes`}
          </div>
        </div>

        {/* Metric 3: Stop Count */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="font-mono text-xs tracking-wider uppercase">Stops</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
          ) : (
            <div className="text-3xl font-light text-white tracking-tight">
              {stops.length}
            </div>
          )}
          <div className="mt-1 text-[11px] font-mono text-[#94A3B8]/70">
            {loading ? 'Checking table...' : `${stops.length} stops & stations`}
          </div>
        </div>

        {/* Metric 4: Calendar / Services */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="font-mono text-xs tracking-wider uppercase">Calendar</span>
            <CalendarIcon className="w-4 h-4 text-purple-400" />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
          ) : (
            <div className="text-3xl font-light text-white tracking-tight">
              {calendar.length}
            </div>
          )}
          <div className="mt-1 text-[11px] font-mono text-[#94A3B8]/70">
            {loading ? 'Checking table...' : `${calendar.length} active service days`}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          AGENCY NAMES & FILTERING CONTROLS
          ───────────────────────────────────────────────────────────── */}
      <div className="my-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#72D7FF]" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">
              Agencies &amp; Route Filter
            </h3>
          </div>
          <span className="text-xs text-[#94A3B8] font-mono">
            Filter by agency_id
          </span>
        </div>

        {/* Agency Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSelectAgencyId('all')}
            className={`rounded-full px-4 py-2 text-xs font-mono transition-all cursor-pointer border ${
              selectedAgencyId === 'all'
                ? 'bg-white text-[#040817] font-medium border-white shadow-md'
                : 'bg-white/5 text-[#94A3B8] border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            All Agencies ({routes.length})
          </button>

          {loading ? (
            <>
              <div className="h-8 w-28 bg-white/10 rounded-full animate-pulse" />
              <div className="h-8 w-36 bg-white/10 rounded-full animate-pulse" />
            </>
          ) : agencies.length > 0 ? (
            agencies.map((agency) => {
              const agencyRouteCount = routes.filter(
                (r) =>
                  r.agency_id?.toLowerCase() === agency.agency_id.toLowerCase() ||
                  (agency.agency_id === 'MTC' && r.route_type === 3) ||
                  (agency.agency_id === 'CMRL' && r.route_type === 1)
              ).length;
              const isSelected = selectedAgencyId.toLowerCase() === agency.agency_id.toLowerCase();

              return (
                <button
                  key={agency.agency_id}
                  type="button"
                  onClick={() => onSelectAgencyId(agency.agency_id)}
                  className={`rounded-full px-4 py-2 text-xs font-mono transition-all cursor-pointer border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#72D7FF] text-[#040817] font-medium border-[#72D7FF] shadow-md'
                      : 'bg-white/5 text-[#94A3B8] border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{agency.agency_name || agency.agency_id}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isSelected ? 'bg-[#040817]/20 text-[#040817]' : 'bg-white/10 text-white'
                    }`}
                  >
                    {agencyRouteCount}
                  </span>
                </button>
              );
            })
          ) : (
            <span className="text-xs text-[#94A3B8]/60 font-mono italic">
              No agency records found in table
            </span>
          )}
        </div>

        {/* Agency Names Details Card */}
        {agencies.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {agencies.map((agency) => (
              <div
                key={`detail-${agency.agency_id}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[#94A3B8]"
              >
                <div>
                  <div className="text-white font-medium">{agency.agency_name}</div>
                  <div className="text-[10px] text-[#94A3B8]/60">
                    ID: {agency.agency_id} · TZ: {agency.agency_timezone || 'Asia/Kolkata'}
                  </div>
                </div>
                {agency.agency_url && (
                  <a
                    href={agency.agency_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#72D7FF] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROUTE INFORMATION: Cards with real information from database
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-wider text-white flex items-center gap-2">
            <span>Route Information</span>
            <span className="text-xs text-[#94A3B8] font-normal">
              ({displayedRoutes.length} {displayedRoutes.length === 1 ? 'route' : 'routes'})
            </span>
          </h3>
          {selectedAgencyId !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectAgencyId('all')}
              className="text-xs font-mono text-[#72D7FF] hover:underline cursor-pointer"
            >
              Clear agency filter
            </button>
          )}
        </div>

        {/* ── LOADING STATE ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-3 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-6 w-16 bg-white/10 rounded-md" />
                  <div className="h-4 w-12 bg-white/10 rounded-full" />
                </div>
                <div className="h-5 w-3/4 bg-white/10 rounded" />
                <div className="h-4 w-1/2 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && displayedRoutes.length === 0 && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-10 text-center space-y-3">
            <RouteIcon className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
            <h4 className="text-base font-light text-white">
              No routes found in PostgreSQL database
            </h4>
            <p className="text-xs font-mono text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              {selectedAgencyId !== 'all'
                ? `No routes matched agency_id: "${selectedAgencyId}". Try viewing all agencies.`
                : 'The routes table is currently empty or inaccessible. Ensure the "routes" table exists and has public SELECT permissions.'}
            </p>
            {selectedAgencyId !== 'all' && (
              <button
                type="button"
                onClick={() => onSelectAgencyId('all')}
                className="mt-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-mono transition-all"
              >
                Reset Agency Filter
              </button>
            )}
          </div>
        )}

        {/* ── REAL ROUTES LIST ── */}
        {!loading && displayedRoutes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedRoutes.map((route) => {
              const isMetro = route.route_type === 1 || route.agency_id === 'CMRL';
              const badgeColor = isMetro ? 'bg-[#72D7FF]/15 text-[#72D7FF] border-[#72D7FF]/30' : 'bg-[#F5C542]/15 text-[#F5C542] border-[#F5C542]/30';

              return (
                <div
                  key={route.route_id}
                  onClick={() => onSelectRoute && onSelectRoute(route)}
                  className="rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Top line: Route Short Name and Agency ID */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-base font-semibold tracking-wide text-white flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: route.route_color ? `#${route.route_color.replace('#', '')}` : (isMetro ? '#72D7FF' : '#F5C542') }}
                        />
                        {route.route_short_name}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border uppercase tracking-wider ${badgeColor}`}>
                        {route.agency_id || (isMetro ? 'CMRL' : 'MTC')}
                      </span>
                    </div>

                    {/* Route Long Name */}
                    <h4 className="text-sm font-medium text-white group-hover:text-[#72D7FF] transition-colors line-clamp-2 leading-snug mb-2">
                      {route.route_long_name || route.route_desc || 'Route Details'}
                    </h4>

                    {/* Description or route details */}
                    {route.route_desc && route.route_desc !== route.route_long_name && (
                      <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed mb-3">
                        {route.route_desc}
                      </p>
                    )}
                  </div>

                  {/* Bottom details footer */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]/70">
                    <span>
                      {isMetro ? 'Rail Transit' : 'Bus Transit'}
                      {route.stops_count ? ` · ${route.stops_count} stops` : ''}
                    </span>
                    <span className="flex items-center gap-1 text-[#72D7FF] group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
