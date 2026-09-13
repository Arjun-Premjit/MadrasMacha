import React, { useState, useEffect } from 'react';
import {
  fetchRouteDetails,
  RouteDetailData,
  RouteTripDetail,
} from '../../lib/supabase/transitService';
import {
  ArrowLeft,
  Bus,
  Train,
  MapPin,
  Clock,
  Calendar as CalendarIcon,
  Navigation,
  Share2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface RouteDetailPageProps {
  routeId: string;
  onBack: () => void;
  onSelectStop?: (stopId: string) => void;
}

export const RouteDetailPage: React.FC<RouteDetailPageProps> = ({
  routeId,
  onBack,
  onSelectStop,
}) => {
  const [data, setData] = useState<RouteDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDirection, setSelectedDirection] = useState<number>(0);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const loadRoute = async (tripId?: string, dir?: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRouteDetails(routeId, tripId, dir);
      if (res.error || !res.data) {
        setError(res.error || 'Route details could not be retrieved.');
      } else {
        setData(res.data);
        if (res.data.selectedTrip) {
          setSelectedTripId(res.data.selectedTrip.trip_id);
          setSelectedDirection(res.data.selectedTrip.direction_id ?? 0);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeId) {
      loadRoute();
    }
  }, [routeId]);

  const handleDirectionChange = (directionId: number) => {
    setSelectedDirection(directionId);
    if (!data) return;
    const matchingTrip = data.trips.find((t) => (t.direction_id ?? 0) === directionId);
    if (matchingTrip) {
      loadRoute(matchingTrip.trip_id, directionId);
    }
  };

  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
    loadRoute(tripId, selectedDirection);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-20 px-6 sm:px-12 max-w-5xl mx-auto font-sans">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-neutral-200 rounded-full" />
          <div className="h-12 w-3/4 bg-neutral-200 rounded-xl" />
          <div className="h-24 w-full bg-neutral-200 rounded-2xl" />
          <div className="space-y-4 pt-6">
            <div className="h-16 w-full bg-neutral-200 rounded-xl" />
            <div className="h-16 w-full bg-neutral-200 rounded-xl" />
            <div className="h-16 w-full bg-neutral-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-20 px-6 sm:px-12 max-w-3xl mx-auto font-sans">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Routes
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 sm:p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-neutral-900">Failed to Load Route</h2>
          <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto">
            {error || `Unable to locate GTFS data for route ID: ${routeId}`}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => loadRoute(selectedTripId, selectedDirection)}
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry Query
            </button>
            <button
              onClick={onBack}
              className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { route, agency, trips, selectedTrip, stops, directions } = data;
  const isMetro = route.route_type === 1 || route.agency_id === 'CMRL';

  // Extract terminus names
  const firstStop = stops[0]?.stop?.stop_name || 'Origin';
  const lastStop = stops[stops.length - 1]?.stop?.stop_name || 'Terminus';

  const firstDep = stops[0]?.departure_time || null;
  const lastArr = stops[stops.length - 1]?.arrival_time || null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-24 px-6 sm:px-12 max-w-5xl mx-auto font-sans selection:bg-black selection:text-white">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between pb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Routes Catalog
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/10 bg-white hover:bg-neutral-100 text-xs font-semibold text-neutral-700 transition cursor-pointer"
          title="Share route link"
        >
          <Share2 className="w-3.5 h-3.5" />
          {copied ? 'Link Copied!' : 'Share Route'}
        </button>
      </div>

      {/* Main Header Hero Card */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
              {isMetro ? <Train className="w-8 h-8" /> : <Bus className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900">
                  {route.route_short_name}
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    isMetro
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-900 text-white'
                  }`}
                >
                  {isMetro ? 'Chennai Metro' : 'MTC Bus'}
                </span>
                <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-md">
                  Route ID: {route.route_id}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 mt-2 leading-snug">
                {route.route_long_name}
              </h1>

              {agency && (
                <p className="text-xs sm:text-sm font-medium text-neutral-500 mt-1">
                  Operated by {agency.agency_name}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 text-right">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Corridor Span
            </div>
            <div className="text-sm font-bold text-neutral-800">
              {firstStop} ↔ {lastStop}
            </div>
            <div className="text-xs text-neutral-500 font-medium">
              {trips.length} active scheduled trips
            </div>
          </div>
        </div>

        {/* Direction & Trip Selectors */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Direction Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
              Direction:
            </span>
            {directions.length > 0 ? (
              directions.map((dir) => (
                <button
                  key={dir}
                  onClick={() => handleDirectionChange(dir)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedDirection === dir
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {dir === 0 ? 'Direction 0 (Outbound)' : 'Direction 1 (Inbound)'}
                </button>
              ))
            ) : (
              <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                Standard Corridor
              </span>
            )}
          </div>

          {/* Trip Selector if multiple trips available */}
          {trips.length > 1 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 shrink-0">
                Trip:
              </span>
              <select
                value={selectedTripId}
                onChange={(e) => handleTripChange(e.target.value)}
                className="w-full sm:w-auto bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-black/20"
              >
                {trips
                  .filter((t) => (t.direction_id ?? 0) === selectedDirection)
                  .slice(0, 30)
                  .map((t, idx) => (
                    <option key={t.trip_id} value={t.trip_id}>
                      Trip #{idx + 1} ({t.service_id || 'Regular'}) - {t.trip_id}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Operational Metrics Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Total Stops
            </span>
            <span className="text-lg font-black text-neutral-900 mt-0.5 block">
              {stops.length} Stations/Stops
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              First Departure
            </span>
            <span className="text-lg font-black text-neutral-900 mt-0.5 block">
              {firstDep || 'Scheduled'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Terminus Arrival
            </span>
            <span className="text-lg font-black text-neutral-900 mt-0.5 block">
              {lastArr || 'Scheduled'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Active Service
            </span>
            <span className="text-lg font-black text-neutral-900 mt-0.5 block truncate">
              {selectedTrip?.service_id || 'Regular Service'}
            </span>
          </div>
        </div>
      </div>

      {/* Stops Sequence Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Ordered Stop Sequence
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Live GTFS stops with scheduled arrival/departure times along this corridor.
            </p>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-neutral-200 text-neutral-800">
            {stops.length} Stops
          </span>
        </div>

        {/* Stops Timeline List */}
        <div className="mt-6 space-y-3">
          {stops.map((item, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === stops.length - 1;
            const stop = item.stop;

            return (
              <div
                key={`${item.stop_id}-${item.stop_sequence}`}
                className={`group relative flex items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl transition-all border ${
                  isFirst || isLast
                    ? 'bg-white border-black/15 shadow-sm'
                    : 'bg-white/70 hover:bg-white border-black/5 hover:border-black/20'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Sequence Node Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-transform group-hover:scale-105 ${
                      isFirst || isLast
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200'
                    }`}
                  >
                    {item.stop_sequence < 10 ? `0${item.stop_sequence}` : item.stop_sequence}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onSelectStop && stop && onSelectStop(stop.stop_id)}
                        className="text-base font-bold text-neutral-900 hover:text-black hover:underline text-left cursor-pointer transition"
                      >
                        {stop?.stop_name || `Stop ${item.stop_id}`}
                      </button>

                      {isFirst && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Origin
                        </span>
                      )}
                      {isLast && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-neutral-900 text-white px-2 py-0.5 rounded-full">
                          Destination
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
                      <span>Stop ID: {item.stop_id}</span>
                      {stop?.stop_lat && stop?.stop_lon && (
                        <span className="font-mono">
                          ({stop.stop_lat.toFixed(4)}, {stop.stop_lon.toFixed(4)})
                        </span>
                      )}
                      {stop?.stop_desc && <span>· {stop.stop_desc}</span>}
                    </div>
                  </div>
                </div>

                {/* Timings & Stop Detail Navigation */}
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div className="text-xs font-semibold">
                    {item.departure_time ? (
                      <div className="text-neutral-900 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 inline" />
                        {item.departure_time}
                      </div>
                    ) : (
                      <span className="text-neutral-400">Regular</span>
                    )}
                  </div>

                  {onSelectStop && stop && (
                    <button
                      onClick={() => onSelectStop(stop.stop_id)}
                      className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-neutral-700 group-hover:text-black bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full transition cursor-pointer"
                    >
                      Stop Info <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {stops.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
              No stop sequences logged for this trip.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
