import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchRouteDetails,
  RouteDetailData,
  formatTimeTo12Hour,
  parseGTFSSeconds,
} from '../../lib/supabase/transitService';
import { useChennaiTime } from '../../hooks/useChennaiTime';
import {
  ArrowLeft,
  Bus,
  Train,
  Clock,
  Navigation,
  Share2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  CheckCircle2,
  CalendarOff,
  MapPin,
  Bug,
  Filter,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { LiveVehicleMap } from '../LiveVehicleMap';

interface RouteDetailPageProps {
  routeId: string;
  initialStopId?: string;
  onBack: () => void;
  onSelectStop?: (stopId: string) => void;
}

export const RouteDetailPage: React.FC<RouteDetailPageProps> = ({
  routeId,
  initialStopId,
  onBack,
  onSelectStop,
}) => {
  const { language, getStopName } = useLanguage();
  const [data, setData] = useState<RouteDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDirection, setSelectedDirection] = useState<number>(0);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [selectedStopId, setSelectedStopId] = useState<string>(initialStopId || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>(routeId);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [timetableFilter, setTimetableFilter] = useState<'all' | 'upcoming' | 'departed'>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Dynamic live Chennai clock (Asia/Kolkata UTC+05:30)
  const chennaiTime = useChennaiTime();
  const currentChennaiSecs = useMemo(
    () => parseGTFSSeconds(chennaiTime.currentTimeStr),
    [chennaiTime.currentTimeStr]
  );

  const loadRoute = async (
    targetRouteId = selectedVariantId || routeId,
    tripId?: string,
    dir = selectedDirection,
    stopId = selectedStopId
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRouteDetails(
        targetRouteId,
        tripId,
        dir,
        stopId,
        targetRouteId
      );
      if (res.error || !res.data) {
        setError(res.error || 'Route details could not be retrieved from Supabase.');
      } else {
        setData(res.data);
        if (res.data.selectedTrip) {
          setSelectedTripId(res.data.selectedTrip.trip_id);
        }
        if (res.data.selectedDirection !== undefined) {
          setSelectedDirection(res.data.selectedDirection);
        }
        if (res.data.selectedStopId && !stopId) {
          setSelectedStopId(res.data.selectedStopId);
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
      setSelectedVariantId(routeId);
      if (initialStopId) {
        setSelectedStopId(initialStopId);
      }
      loadRoute(routeId, undefined, selectedDirection, initialStopId || selectedStopId);
    }
  }, [routeId, initialStopId]);

  const handleDirectionChange = (directionId: number) => {
    setSelectedDirection(directionId);
    loadRoute(selectedVariantId, undefined, directionId, selectedStopId);
  };

  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
    loadRoute(selectedVariantId, tripId, selectedDirection, selectedStopId);
  };

  const handleStopChange = (newStopId: string) => {
    setSelectedStopId(newStopId);
    loadRoute(selectedVariantId, undefined, selectedDirection, newStopId);
  };

  const handleVariantChange = (newRouteId: string) => {
    setSelectedVariantId(newRouteId);
    setSelectedStopId('');
    loadRoute(newRouteId, undefined, undefined, '');
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
              onClick={() => loadRoute(selectedVariantId, selectedTripId, selectedDirection, selectedStopId)}
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

  const {
    route,
    agency,
    trips,
    selectedTrip,
    stops,
    directions,
    scheduledTripsCount,
    formattedFirstDeparture,
    formattedLastDeparture,
    originStopName,
    terminusStopName,
    activeServiceNames,
    todaySchedule,
    nextServiceInfo,
    selectedStop,
    allStopsForRoute = [],
    departuresFromSelectedStopCount = todaySchedule.length,
    relatedRouteVariants = [],
    diagnostics,
  } = data;

  const isMetro = route.route_type === 1 || route.agency_id === 'CMRL';
  const hasTrips = trips.length > 0;

  // Dynamic live upcoming departures strictly >= current Chennai time
  const dynamicUpcomingDepartures = todaySchedule.filter(
    (t) => t.departure_time_seconds >= currentChennaiSecs
  );
  const nextDepartureTrip =
    dynamicUpcomingDepartures.length > 0 ? dynamicUpcomingDepartures[0] : null;

  const nextDepartureMinutes = nextDepartureTrip
    ? Math.max(0, Math.round((nextDepartureTrip.departure_time_seconds - currentChennaiSecs) / 60))
    : null;

  // Effective boarding stop name
  const rawBoardingStopName =
    selectedStop?.stop_name || originStopName || (stops.length > 0 ? stops[0]?.stop?.stop_name : 'Origin');
  const effectiveBoardingStopName = getStopName(rawBoardingStopName, selectedStop?.stop_id);
  const rawCorridorTerminus =
    terminusStopName ||
    (stops.length > 0 ? stops[stops.length - 1]?.stop?.stop_name : 'Terminus');
  const corridorTerminus = getStopName(rawCorridorTerminus);

  // Filtered timetable for chronological list
  const filteredTimetable = todaySchedule.filter((t) => {
    if (timetableFilter === 'upcoming') {
      return t.departure_time_seconds >= currentChennaiSecs;
    }
    if (timetableFilter === 'departed') {
      return t.departure_time_seconds < currentChennaiSecs;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-24 px-6 sm:px-12 max-w-5xl mx-auto font-sans selection:bg-black selection:text-white">
      {/* Breadcrumb Navigation & Action Row */}
      <div className="flex items-center justify-between pb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Routes Catalog
        </button>

        <div className="flex items-center gap-2">
          {diagnostics && (
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${
                showDiagnostics
                  ? 'bg-amber-500 text-black border-amber-600'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border-black/10'
              }`}
              title="Toggle GTFS validation diagnostics"
            >
              <Bug className="w-3.5 h-3.5" />
              {showDiagnostics ? 'Hide Diagnostic' : 'GTFS Diagnostic'}
            </button>
          )}

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/10 bg-white hover:bg-neutral-100 text-xs font-semibold text-neutral-700 transition cursor-pointer"
            title="Share route link"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? 'Link Copied!' : 'Share Route'}
          </button>
        </div>
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
                  {route.route_short_name || route.route_id}
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    isMetro ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-white'
                  }`}
                >
                  {isMetro ? 'Chennai Metro' : 'MTC Bus'}
                </span>
                <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-md font-mono">
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
              {effectiveBoardingStopName && corridorTerminus
                ? `${effectiveBoardingStopName} → ${corridorTerminus}`
                : 'N/A'}
            </div>
            <div className="text-xs text-neutral-500 font-medium">
              {hasTrips
                ? `${trips.length} GTFS trips (${scheduledTripsCount} active today)`
                : '0 scheduled trips'}
            </div>
          </div>
        </div>

        {/* Route Variants Selector (if route has distinct GTFS variants) */}
        {relatedRouteVariants.length > 1 && (
          <div className="pt-5 pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Route Variants ({relatedRouteVariants.length} distinct service corridors)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedRouteVariants.map((variant) => {
                const isSelected = (selectedVariantId || route.route_id) === variant.route_id;
                return (
                  <button
                    key={variant.route_id}
                    onClick={() => handleVariantChange(variant.route_id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <span>{variant.route_long_name || `Variant ${variant.route_id}`}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {variant.tripsCount} trips
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Boarding Stop & Direction Selector */}
        <div className="pt-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Boarding Stop Selector */}
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Boarding Stop for Timetable
            </label>
            <div className="relative max-w-md">
              <select
                value={selectedStop?.stop_id || selectedStopId || ''}
                onChange={(e) => handleStopChange(e.target.value)}
                className="w-full appearance-none bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-bold rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer transition"
              >
                {allStopsForRoute.map((s, idx) => {
                  const localizedName = getStopName(s.stop_name, s.stop_id);
                  return (
                    <option key={s.stop_id} value={s.stop_id}>
                      {idx === 0
                        ? `${language === 'ta' ? 'தொடக்க நிறுத்தம்' : 'Origin'}: ${localizedName}`
                        : `${s.stop_sequence}. ${localizedName}`}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Select any stop to view its departure times for this corridor.
            </p>
          </div>

          {/* Direction Selector */}
          {hasTrips && directions.length > 1 && (
            <div className="shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                Travel Direction
              </span>
              <div className="flex items-center gap-2">
                {directions.map((dir) => (
                  <button
                    key={dir}
                    onClick={() => handleDirectionChange(dir)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDirection === dir
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {dir === 0 ? 'Direction 0 (Outbound)' : 'Direction 1 (Inbound)'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Operational Metrics Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Corridor Stops
            </span>
            <span className="text-base sm:text-lg font-black text-neutral-900 mt-0.5 block">
              {stops.length > 0 ? `${stops.length} Stops` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Trips Active Today
            </span>
            <span className="text-base sm:text-lg font-black text-neutral-900 mt-0.5 block">
              {scheduledTripsCount > 0 ? `${scheduledTripsCount} Trips` : '0 Trips'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Departures at Stop
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-700 mt-0.5 block">
              {departuresFromSelectedStopCount} Departures
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              First Departure
            </span>
            <span className="text-base sm:text-lg font-black text-neutral-900 mt-0.5 block">
              {formattedFirstDeparture}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Last Departure
            </span>
            <span className="text-base sm:text-lg font-black text-neutral-900 mt-0.5 block">
              {formattedLastDeparture}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          UPCOMING DEPARTURES TODAY (Real GTFS Timetable & Live Clock)
          ───────────────────────────────────────────────────────────── */}
      {hasTrips && (
        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Live Service Status
                </span>
                <h2 className="text-lg font-black text-neutral-900">
                  Upcoming Departures Today
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-100/80 border border-black/5 px-3.5 py-1.5 rounded-full font-mono">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>
                Chennai Time (UTC+05:30):{' '}
                <strong className="text-neutral-900">{chennaiTime.formattedTime12}</strong>
              </span>
            </div>
          </div>

          {/* If there are upcoming departures remaining today */}
          {nextDepartureTrip ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Next Scheduled Bus Highlight */}
              <div
                onClick={() => handleTripChange(nextDepartureTrip.trip_id)}
                className="md:col-span-1 p-5 rounded-2xl bg-black text-white shadow-md cursor-pointer hover:bg-neutral-900 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">
                    Next Scheduled Bus
                  </span>
                  {nextDepartureMinutes !== null && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-black px-2 py-0.5 rounded-full">
                      {nextDepartureMinutes === 0 ? 'Departing Now' : `In ${nextDepartureMinutes}m`}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-3xl font-black tracking-tight">
                    {route.route_short_name || route.route_id}
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    {nextDepartureTrip.formatted_departure_time}
                  </span>
                </div>

                <p className="mt-2 text-xs text-neutral-300 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-neutral-400 inline shrink-0" />
                  <span className="truncate">From {effectiveBoardingStopName}</span>
                </p>
              </div>

              {/* Subsequent Upcoming Departures Today */}
              <div className="md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2.5">
                  Subsequent Departures Today ({dynamicUpcomingDepartures.length} remaining)
                </span>
                <div className="flex flex-wrap items-center gap-2 max-h-36 overflow-y-auto pr-1">
                  {dynamicUpcomingDepartures.map((item, idx) => {
                    const isSelected = selectedTripId === item.trip_id;
                    const isFirstUpcoming = idx === 0;

                    return (
                      <button
                        key={`${item.trip_id}-${idx}`}
                        onClick={() => handleTripChange(item.trip_id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white border-black shadow-sm'
                            : isFirstUpcoming
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:border-emerald-500'
                            : 'bg-white text-neutral-800 border-neutral-200 hover:border-black/40'
                        }`}
                      >
                        {item.formatted_departure_time}
                        {isFirstUpcoming && ' (Next)'}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 text-[11px] text-neutral-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-neutral-500" />
                  <span>
                    Click any upcoming departure to preview its specific stop sequence below.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* No more departures remaining today */
            <div className="mt-6 rounded-2xl bg-neutral-50 border border-neutral-200 p-6">
              <div className="flex items-start gap-3.5">
                <CalendarOff className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {scheduledTripsCount > 0
                      ? `No more scheduled departures remaining today from ${effectiveBoardingStopName}.`
                      : 'No scheduled service for this route is available today.'}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1">
                    {nextServiceInfo
                      ? nextServiceInfo.isTomorrow
                        ? `Earliest service tomorrow: ${nextServiceInfo.formattedEarliestDeparture || 'Check schedule'}`
                        : `Next scheduled service: ${nextServiceInfo.formattedDate} at ${nextServiceInfo.formattedEarliestDeparture || 'N/A'}`
                      : scheduledTripsCount > 0
                      ? `Earliest service tomorrow: ${formattedFirstDeparture}`
                      : 'This corridor operates on specific service calendar days.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TODAY'S COMPLETE SCHEDULE (Clean Chronological Timetable)
          ───────────────────────────────────────────────────────────── */}
      {hasTrips && todaySchedule.length > 0 && (
        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Full Day Timetable
                </span>
                <h2 className="text-lg font-black text-neutral-900">
                  Today's Schedule ({todaySchedule.length} Departures)
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                From {effectiveBoardingStopName}
              </span>

              {/* Filter Pills */}
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-full text-xs">
                <button
                  onClick={() => setTimetableFilter('all')}
                  className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                    timetableFilter === 'all' ? 'bg-white text-black shadow-xs' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  All ({todaySchedule.length})
                </button>
                <button
                  onClick={() => setTimetableFilter('upcoming')}
                  className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                    timetableFilter === 'upcoming' ? 'bg-white text-black shadow-xs' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Upcoming ({dynamicUpcomingDepartures.length})
                </button>
                <button
                  onClick={() => setTimetableFilter('departed')}
                  className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                    timetableFilter === 'departed' ? 'bg-white text-black shadow-xs' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Departed ({todaySchedule.length - dynamicUpcomingDepartures.length})
                </button>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-neutral-500">
            One departure per active trip at <strong>{effectiveBoardingStopName}</strong> in chronological order. Click any departure to load its specific stop sequence below.
          </p>

          {/* Compact Chronological Timetable Table/List */}
          <div className="mt-5 divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
            {filteredTimetable.map((trip, tIdx) => {
              const isPast = trip.departure_time_seconds < currentChennaiSecs;
              const isNext = nextDepartureTrip?.trip_id === trip.trip_id;
              const isSelected = selectedTripId === trip.trip_id;

              return (
                <div
                  key={`${trip.trip_id}-${tIdx}`}
                  onClick={() => handleTripChange(trip.trip_id)}
                  className={`p-3.5 sm:px-5 flex items-center justify-between gap-4 transition cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white'
                      : isNext
                      ? 'bg-emerald-50/70 hover:bg-emerald-100/60'
                      : isPast
                      ? 'bg-neutral-50/40 hover:bg-neutral-100/60 text-neutral-500'
                      : 'bg-white hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Departure Time */}
                    <div className="flex items-center gap-2 min-w-[90px]">
                      <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-neutral-400' : isNext ? 'text-emerald-600' : 'text-neutral-400'}`} />
                      <span className="text-sm font-mono font-bold tracking-tight">
                        {trip.formatted_departure_time}
                      </span>
                    </div>

                    {/* Route & Stop badge */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {route.route_short_name || route.route_id}
                      </span>
                      <span className={`text-xs font-medium truncate max-w-[140px] sm:max-w-xs ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-600'
                      }`}>
                        {effectiveBoardingStopName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badge */}
                    {isNext && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Next Up
                      </span>
                    )}
                    {isPast && !isSelected && (
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                        Departed
                      </span>
                    )}
                    {!isPast && !isNext && !isSelected && (
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                        Scheduled
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white text-black px-2 py-0.5 rounded-full">
                        Selected Trip
                      </span>
                    )}

                    <span className={`hidden sm:inline font-mono text-[10px] ${
                      isSelected ? 'text-neutral-400' : 'text-neutral-400'
                    }`}>
                      Trip {trip.trip_id}
                    </span>

                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                  </div>
                </div>
              );
            })}

            {filteredTimetable.length === 0 && (
              <div className="p-8 text-center text-xs text-neutral-500">
                No departures match the selected filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ZERO TRIPS HANDLING
          ───────────────────────────────────────────────────────────── */}
      {!hasTrips && (
        <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 bg-white p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-500">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800">
            No Scheduled Trips Available
          </h2>
          <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto">
            No scheduled trips available in the current GTFS dataset for this corridor.
          </p>
          <div className="mt-6">
            <button
              onClick={onBack}
              className="rounded-full bg-black text-white px-6 py-2.5 text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
            >
              Browse Other Corridors
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LIVE GTFS-RT BUS TRACKING & CORRIDOR MAP
          ───────────────────────────────────────────────────────────── */}
      {hasTrips && (
        <div className="mt-10 mb-8">
          <LiveVehicleMap
            routeId={route.route_id}
            routeShortName={route.route_short_name}
            stops={stops.map((s) => s.stop).filter(Boolean) as any}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STOPS SEQUENCE SECTION (Exact Trip Stop Times with Boarding Highlight)
          ───────────────────────────────────────────────────────────── */}
      {hasTrips && (
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  {language === 'ta' ? 'நிறுத்தங்களின் வரிசை' : 'Ordered Stop Sequence'}
                </h2>
                {selectedTrip && (
                  <span className="text-xs font-mono bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-md">
                    Trip {selectedTrip.trip_id}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                {language === 'ta'
                  ? 'இந்த பயணத்திற்கான நிறுத்த வரிசை மற்றும் வருகை நேரங்கள். ஏறும் நிறுத்தம் கீழே முன்னிலைப்படுத்தப்பட்டுள்ளது.'
                  : 'Stop sequence and arrival times for this trip. Boarding stop is highlighted below.'}
              </p>
            </div>

            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-neutral-200 text-neutral-800 shrink-0 self-start sm:self-auto">
              {stops.length} {language === 'ta' ? 'நிறுத்தங்கள்' : 'Stops'}
            </span>
          </div>

          {/* Stops Timeline List */}
          <div className="mt-6 space-y-3">
            {stops.map((item, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === stops.length - 1;
              const isBoardingStop = item.is_boarding_stop || (selectedStopId ? item.stop_id === selectedStopId : isFirst);
              const stop = item.stop;
              const localizedStopName = stop?.stop_name ? getStopName(stop.stop_name, item.stop_id) : `Stop ${item.stop_id}`;

              return (
                <div
                  key={`${item.stop_id}-${item.stop_sequence}`}
                  className={`group relative flex items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl transition-all border ${
                    isBoardingStop
                      ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : isFirst || isLast
                      ? 'bg-white border-black/15 shadow-sm'
                      : 'bg-white/70 hover:bg-white border-black/5 hover:border-black/20'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Sequence Node Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-transform group-hover:scale-105 ${
                        isBoardingStop
                          ? 'bg-emerald-600 text-white'
                          : isFirst || isLast
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
                          {localizedStopName}
                        </button>

                        {language === 'ta' && stop?.stop_name && localizedStopName !== stop.stop_name && (
                          <span className="text-xs text-neutral-400 font-normal">
                            ({stop.stop_name})
                          </span>
                        )}

                        {isBoardingStop && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                            {language === 'ta' ? 'நீங்கள் ஏறும் இடம்' : 'YOU BOARD HERE'}
                          </span>
                        )}
                        {isFirst && !isBoardingStop && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-neutral-900 text-white px-2 py-0.5 rounded-full">
                            {language === 'ta' ? 'தொடக்க இடம்' : 'Origin'}
                          </span>
                        )}
                        {isLast && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-neutral-900 text-white px-2 py-0.5 rounded-full">
                            {language === 'ta' ? 'முனையம்' : 'Terminus'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
                        <span>Stop ID: {item.stop_id}</span>
                        {stop?.stop_lat && stop?.stop_lon && (
                          <span className="font-mono text-[11px]">
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
                        <div className="text-neutral-900 font-bold flex items-center gap-1 font-mono">
                          <Clock className={`w-3.5 h-3.5 ${isBoardingStop ? 'text-emerald-600' : 'text-neutral-400'} inline`} />
                          {formatTimeTo12Hour(item.departure_time)}
                        </div>
                      ) : item.arrival_time ? (
                        <div className="text-neutral-900 font-bold flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-neutral-400 inline" />
                          {formatTimeTo12Hour(item.arrival_time)}
                        </div>
                      ) : (
                        <span className="text-neutral-400">N/A</span>
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
      )}

      {/* ─────────────────────────────────────────────────────────────
          DATABASE DEBUG DIAGNOSTIC PANEL (Section 32 Validation)
          ───────────────────────────────────────────────────────────── */}
      {diagnostics && showDiagnostics && (
        <div className="mt-12 rounded-3xl border border-amber-300 bg-amber-50/70 p-6 sm:p-8 font-mono text-xs shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-amber-700" />
              <span className="font-bold uppercase tracking-wider text-amber-900">
                Database Diagnostic Validation (Section 32)
              </span>
            </div>
            <button
              onClick={() => setShowDiagnostics(false)}
              className="text-amber-800 hover:text-black font-bold cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-800">
            <div>
              <span className="text-neutral-500">ROUTE:</span> <strong>{diagnostics.routeShortName}</strong>
            </div>
            <div>
              <span className="text-neutral-500">ROUTE ID:</span> <strong>{diagnostics.primaryRouteId}</strong>
            </div>
            <div>
              <span className="text-neutral-500">SELECTED STOP:</span> <strong>{diagnostics.selectedStopName || 'N/A'}</strong>
            </div>
            <div>
              <span className="text-neutral-500">SELECTED STOP ID:</span> <strong>{diagnostics.selectedStopId || 'N/A'}</strong>
            </div>
            <div>
              <span className="text-neutral-500">SERVICE DATE:</span> <strong>{diagnostics.serviceDate}</strong>
            </div>
            <div>
              <span className="text-neutral-500">ACTIVE TRIPS FOR ROUTE:</span> <strong>{diagnostics.activeTripCount}</strong>
            </div>
            <div>
              <span className="text-neutral-500">DEPARTURES FROM SELECTED STOP:</span> <strong>{diagnostics.departuresFromSelectedStop}</strong>
            </div>
            <div>
              <span className="text-neutral-500">TOTAL GTFS TRIPS IN DB:</span> <strong>{diagnostics.totalTripsInDb}</strong>
            </div>
          </div>

          {diagnostics.departureRecords && diagnostics.departureRecords.length > 0 && (
            <div className="mt-5 pt-4 border-t border-amber-200">
              <span className="font-bold text-neutral-700 block mb-2">
                Departure Records at Selected Stop ({diagnostics.departureRecords.length}):
              </span>
              <div className="bg-white/80 rounded-xl p-3 border border-amber-200/80 max-h-48 overflow-y-auto space-y-1 text-[11px]">
                {diagnostics.departureRecords.map((rec, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5 border-b border-neutral-100 last:border-0">
                    <span className="text-neutral-600">trip_id: <strong>{rec.trip_id}</strong></span>
                    <span className="text-emerald-700 font-bold">departure_time: {rec.departure_time}</span>
                    <span className="text-neutral-500">stop_id: {rec.stop_id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
