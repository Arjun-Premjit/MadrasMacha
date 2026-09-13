import React, { useState, useEffect, useRef } from 'react';
import {
  searchStopsForPlanner,
  findDirectJourneys,
  fetchCompleteJourney,
  JourneyMatch,
  CompleteJourneyResult,
  formatTimeTo12Hour,
  getChennaiDateTime,
} from '../lib/supabase/transitService';
import { Stop } from '../types/transit';
import {
  Search,
  ArrowRight,
  ArrowUpDown,
  Clock,
  MapPin,
  Bus,
  Train,
  ChevronRight,
  Loader2,
  X,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';

interface JourneyPlannerProps {
  onSelectRoute?: (routeId: string) => void;
  onSelectStop?: (stopId: string) => void;
}

export const JourneyPlanner: React.FC<JourneyPlannerProps> = ({
  onSelectRoute,
  onSelectStop,
}) => {
  // Input fields state
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');

  const [selectedFromStop, setSelectedFromStop] = useState<Stop | null>(null);
  const [selectedToStop, setSelectedToStop] = useState<Stop | null>(null);

  // Autocomplete dropdowns
  const [fromSuggestions, setFromSuggestions] = useState<Stop[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Stop[]>([]);
  const [isSearchingFrom, setIsSearchingFrom] = useState(false);
  const [isSearchingTo, setIsSearchingTo] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Journey results state
  const [journeys, setJourneys] = useState<JourneyMatch[] | null>(null);
  const [isFindingRoutes, setIsFindingRoutes] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Complete Journey Modal state
  const [activeModalTrip, setActiveModalTrip] = useState<{
    tripId: string;
    fromStopId: string;
    toStopId: string;
  } | null>(null);
  const [completeJourney, setCompleteJourney] = useState<CompleteJourneyResult | null>(null);
  const [loadingCompleteJourney, setLoadingCompleteJourney] = useState(false);
  const [completeJourneyError, setCompleteJourneyError] = useState<string | null>(null);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Debounced search for "From" stop
  useEffect(() => {
    if (!fromQuery.trim() || selectedFromStop?.stop_name === fromQuery) {
      setFromSuggestions([]);
      setIsSearchingFrom(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingFrom(true);
      const results = await searchStopsForPlanner(fromQuery, 6);
      setFromSuggestions(results);
      setIsSearchingFrom(false);
      setShowFromDropdown(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [fromQuery, selectedFromStop]);

  // Debounced search for "To" stop
  useEffect(() => {
    if (!toQuery.trim() || selectedToStop?.stop_name === toQuery) {
      setToSuggestions([]);
      setIsSearchingTo(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingTo(true);
      const results = await searchStopsForPlanner(toQuery, 6);
      setToSuggestions(results);
      setIsSearchingTo(false);
      setShowToDropdown(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [toQuery, selectedToStop]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Swap From and To stops
  const handleSwap = () => {
    const prevFrom = selectedFromStop;
    const prevFromQuery = fromQuery;
    setSelectedFromStop(selectedToStop);
    setFromQuery(selectedToStop?.stop_name || toQuery);
    setSelectedToStop(prevFrom);
    setToQuery(prevFrom?.stop_name || prevFromQuery);
    setJourneys(null);
  };

  // Run Direct Journey algorithm
  const handleFindRoutes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFromStop || !selectedToStop) {
      setSearchError('Please select both Origin and Destination stops from the suggestions.');
      return;
    }

    if (selectedFromStop.stop_id === selectedToStop.stop_id) {
      setSearchError('Origin and Destination stops must be different.');
      return;
    }

    setIsFindingRoutes(true);
    setSearchError(null);
    setJourneys(null);

    try {
      const res = await findDirectJourneys(selectedFromStop.stop_id, selectedToStop.stop_id);
      if (res.error) {
        setSearchError(res.error);
      } else {
        setJourneys(res.journeys);
      }
    } catch (err: any) {
      setSearchError(err?.message || 'Failed to calculate direct journeys.');
    } finally {
      setIsFindingRoutes(false);
    }
  };

  // Open Complete Journey modal
  const handleViewJourney = async (journey: JourneyMatch) => {
    setActiveModalTrip({
      tripId: journey.trip_id,
      fromStopId: journey.from_stop.stop_id,
      toStopId: journey.to_stop.stop_id,
    });
    setLoadingCompleteJourney(true);
    setCompleteJourneyError(null);
    setCompleteJourney(null);

    try {
      const res = await fetchCompleteJourney(
        journey.trip_id,
        journey.from_stop.stop_id,
        journey.to_stop.stop_id
      );
      if (res.error || !res.data) {
        setCompleteJourneyError(res.error || 'Unable to retrieve complete journey stop sequence.');
      } else {
        setCompleteJourney(res.data);
      }
    } catch (err: any) {
      setCompleteJourneyError(err?.message || 'Failed to fetch complete journey details');
    } finally {
      setLoadingCompleteJourney(false);
    }
  };

  const { formattedTime12 } = getChennaiDateTime(new Date());

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      {/* Container Card */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              GTFS Routing Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 mt-1">
              Plan Your Journey
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-neutral-500 bg-neutral-100 px-3.5 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-neutral-600" />
            <span>Chennai Time: {formattedTime12}</span>
          </div>
        </div>

        {/* Journey Planner Form */}
        <form onSubmit={handleFindRoutes} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
            {/* FROM Stop Input */}
            <div ref={fromRef} className="relative">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                From
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={fromQuery}
                  onChange={(e) => {
                    setFromQuery(e.target.value);
                    if (selectedFromStop && selectedFromStop.stop_name !== e.target.value) {
                      setSelectedFromStop(null);
                    }
                  }}
                  onFocus={() => {
                    if (fromSuggestions.length > 0) setShowFromDropdown(true);
                  }}
                  placeholder="Search origin stop (e.g. Anna Nagar)..."
                  className="w-full pl-10 pr-9 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/15 focus:bg-white transition"
                />
                {isSearchingFrom && (
                  <Loader2 className="absolute right-3 w-4 h-4 animate-spin text-neutral-400" />
                )}
                {selectedFromStop && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFromStop(null);
                      setFromQuery('');
                    }}
                    className="absolute right-3 p-1 text-neutral-400 hover:text-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown for FROM */}
              {showFromDropdown && fromSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1.5 rounded-2xl bg-white border border-neutral-200 shadow-xl max-h-56 overflow-y-auto p-1.5 space-y-1">
                  {fromSuggestions.map((stop) => (
                    <button
                      key={stop.stop_id}
                      type="button"
                      onClick={() => {
                        setSelectedFromStop(stop);
                        setFromQuery(stop.stop_name);
                        setShowFromDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm hover:bg-neutral-100 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="font-semibold text-neutral-900 line-clamp-1">
                          {stop.stop_name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded shrink-0">
                        {stop.stop_id}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center pt-5 md:pt-6">
              <button
                type="button"
                onClick={handleSwap}
                className="w-10 h-10 rounded-full border border-neutral-200 hover:border-black/30 bg-neutral-50 hover:bg-white flex items-center justify-center text-neutral-600 hover:text-black transition shadow-2xs cursor-pointer"
                title="Swap origin and destination"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* TO Stop Input */}
            <div ref={toRef} className="relative">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                To
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={toQuery}
                  onChange={(e) => {
                    setToQuery(e.target.value);
                    if (selectedToStop && selectedToStop.stop_name !== e.target.value) {
                      setSelectedToStop(null);
                    }
                  }}
                  onFocus={() => {
                    if (toSuggestions.length > 0) setShowToDropdown(true);
                  }}
                  placeholder="Search destination stop (e.g. Central)..."
                  className="w-full pl-10 pr-9 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/15 focus:bg-white transition"
                />
                {isSearchingTo && (
                  <Loader2 className="absolute right-3 w-4 h-4 animate-spin text-neutral-400" />
                )}
                {selectedToStop && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedToStop(null);
                      setToQuery('');
                    }}
                    className="absolute right-3 p-1 text-neutral-400 hover:text-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown for TO */}
              {showToDropdown && toSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1.5 rounded-2xl bg-white border border-neutral-200 shadow-xl max-h-56 overflow-y-auto p-1.5 space-y-1">
                  {toSuggestions.map((stop) => (
                    <button
                      key={stop.stop_id}
                      type="button"
                      onClick={() => {
                        setSelectedToStop(stop);
                        setToQuery(stop.stop_name);
                        setShowToDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm hover:bg-neutral-100 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="font-semibold text-neutral-900 line-clamp-1">
                          {stop.stop_name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded shrink-0">
                        {stop.stop_id}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {searchError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-neutral-500">
              Direct bus journeys only · Scheduled GTFS stop-sequence and timetable comparison
            </div>

            <button
              type="submit"
              disabled={isFindingRoutes || !selectedFromStop || !selectedToStop}
              className="rounded-full bg-black hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-bold text-sm px-8 py-3.5 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isFindingRoutes ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Searching GTFS Network...</span>
                </>
              ) : (
                <>
                  <span>Find Routes</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* ─────────────────────────────────────────────────────────────
            JOURNEY RESULTS LIST (Requirement #9)
            ───────────────────────────────────────────────────────────── */}
        {journeys !== null && (
          <div className="mt-10 pt-8 border-t border-neutral-100 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
              <div>
                <h3 className="text-lg font-black text-neutral-900">
                  Available Scheduled Journeys
                </h3>
                <p className="text-xs text-neutral-500">
                  {selectedFromStop?.stop_name} → {selectedToStop?.stop_name}
                </p>
              </div>

              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 self-start">
                {journeys.length} Direct {journeys.length === 1 ? 'Option' : 'Options'}
              </span>
            </div>

            {/* Results Grid */}
            {journeys.length > 0 ? (
              <div className="mt-4 space-y-4">
                {journeys.map((j, idx) => {
                  const isMetro = j.route.route_type === 1 || j.route.agency_id === 'CMRL';
                  return (
                    <div
                      key={`${j.trip_id}-${idx}`}
                      className="p-5 sm:p-6 rounded-2xl border border-black/10 bg-white hover:border-black/25 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-3">
                        {/* Header Badge Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          {idx === 0 && j.is_upcoming && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2.5 py-0.5 rounded-full">
                              NEXT DEPARTURE
                            </span>
                          )}
                          <span className="text-lg font-black text-neutral-900">
                            {j.route.route_short_name || j.route.route_id}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isMetro ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-white'
                            }`}
                          >
                            {isMetro ? 'Metro' : 'MTC Bus'}
                          </span>
                          {j.direction_id !== null && (
                            <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                              Direction {j.direction_id === 0 ? 'Outbound' : 'Inbound'}
                            </span>
                          )}
                          {j.is_upcoming ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              {j.departs_in_minutes === 0 ? 'Departs now' : `In ${j.departs_in_minutes} min`}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                              Departed earlier today
                            </span>
                          )}
                        </div>

                        {/* Origin -> Destination Route Long Name */}
                        <div className="text-xs sm:text-sm font-semibold text-neutral-800">
                          {j.from_stop.stop_name} → {j.to_stop.stop_name}
                        </div>
                        <div className="text-[11px] text-neutral-500 line-clamp-1">
                          Corridor: {j.route.route_long_name}
                        </div>

                        {/* Schedule Metric Columns */}
                        <div className="grid grid-cols-3 gap-4 pt-1 text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                              Departure Stop &amp; Time
                            </span>
                            <span className="font-bold text-neutral-900 font-mono text-sm block">
                              {formatTimeTo12Hour(j.departure_time)}
                            </span>
                            <span className="text-[10px] text-neutral-500 truncate block">
                              {j.from_stop.stop_name}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                              Destination &amp; Arrival
                            </span>
                            <span className="font-bold text-neutral-900 font-mono text-sm block">
                              {formatTimeTo12Hour(j.arrival_time)}
                            </span>
                            <span className="text-[10px] text-neutral-500 truncate block">
                              {j.to_stop.stop_name}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                              Duration &amp; Stops
                            </span>
                            <span className="font-bold text-neutral-900 text-sm block">
                              {j.duration_minutes} min
                            </span>
                            <span className="text-[10px] text-neutral-500 block">
                              {j.stops_count} stops
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 md:pt-0 border-t sm:border-t-0 border-neutral-100">
                        <button
                          onClick={() => handleViewJourney(j)}
                          className="rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs px-5 py-2.5 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>View Journey</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {onSelectRoute && (
                          <button
                            onClick={() => onSelectRoute(j.route.route_id)}
                            className="text-[11px] font-semibold text-neutral-500 hover:text-black underline cursor-pointer"
                          >
                            Route Details
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center mt-4">
                <p className="text-sm font-semibold text-neutral-700">
                  No direct scheduled journeys found between these two stops.
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Try searching for major interchange terminals such as Broadway, Central, Koyambedu, or T. Nagar.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COMPLETE JOURNEY MODAL (Requirement #10)
          ───────────────────────────────────────────────────────────── */}
      {activeModalTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col font-sans">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black text-white">
                    {completeJourney?.route.route_short_name || 'Direct Bus'}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    Trip #{completeJourney?.trip.trip_id}
                  </span>
                </div>
                <h3 className="text-xl font-black text-neutral-900 mt-1">
                  Complete Scheduled Journey
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {completeJourney?.fromStop.stop_name} → {completeJourney?.toStop.stop_name}
                </p>
              </div>

              <button
                onClick={() => setActiveModalTrip(null)}
                className="p-2 rounded-full hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {loadingCompleteJourney && (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-500" />
                  <p className="text-sm text-neutral-500">
                    Retrieving scheduled intermediate stops and arrival times from GTFS database...
                  </p>
                </div>
              )}

              {completeJourneyError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {completeJourneyError}
                </div>
              )}

              {completeJourney && (
                <div>
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-center mb-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Departure
                      </span>
                      <span className="text-sm font-bold text-neutral-900 font-mono">
                        {formatTimeTo12Hour(completeJourney.departureTime)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Arrival
                      </span>
                      <span className="text-sm font-bold text-neutral-900 font-mono">
                        {formatTimeTo12Hour(completeJourney.arrivalTime)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Total Time
                      </span>
                      <span className="text-sm font-bold text-neutral-900">
                        {completeJourney.durationMinutes} min ({completeJourney.totalIntermediateStops} stops)
                      </span>
                    </div>
                  </div>

                  {/* Step-by-Step Stop Timeline */}
                  <div className="space-y-2">
                    {completeJourney.stops.map((step, i) => {
                      const isFirst = i === 0;
                      const isLast = i === completeJourney.stops.length - 1;

                      return (
                        <div key={step.stop_id} className="relative flex items-start gap-4">
                          {/* Vertical Connector Line */}
                          {!isLast && (
                            <div className="absolute left-4 top-7 bottom-0 w-0.5 bg-neutral-200" />
                          )}

                          {/* Node Icon */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                              isFirst
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                                : isLast
                                ? 'bg-neutral-900 text-white ring-4 ring-neutral-100'
                                : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                            }`}
                          >
                            {isFirst ? 'A' : isLast ? 'B' : i + 1}
                          </div>

                          {/* Stop Info & Timetable */}
                          <div
                            className={`flex-1 p-3 rounded-xl border flex items-center justify-between gap-3 ${
                              isFirst || isLast
                                ? 'bg-white border-neutral-300 font-bold'
                                : 'bg-neutral-50/50 border-neutral-100 text-neutral-700'
                            }`}
                          >
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-neutral-900">
                                {step.stop_name}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono">
                                Stop ID: {step.stop_id}
                                {step.stop_lat && step.stop_lon && (
                                  <span> · ({step.stop_lat.toFixed(4)}, {step.stop_lon.toFixed(4)})</span>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-mono font-bold text-neutral-800">
                                {formatTimeTo12Hour(step.departure_time || step.arrival_time)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3 shrink-0">
              {completeJourney && onSelectRoute && (
                <button
                  onClick={() => {
                    const rId = completeJourney.route.route_id;
                    setActiveModalTrip(null);
                    onSelectRoute(rId);
                  }}
                  className="rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 text-xs font-bold px-4 py-2 text-neutral-800 transition cursor-pointer"
                >
                  View Route Catalog
                </button>
              )}
              <button
                onClick={() => setActiveModalTrip(null)}
                className="rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-bold px-5 py-2 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
