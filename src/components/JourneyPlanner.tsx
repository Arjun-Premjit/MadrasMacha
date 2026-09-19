import React, { useState, useEffect, useRef } from 'react';
import {
  searchStopsForPlanner,
  findTransitJourneys,
  findDirectJourneys,
  findConnectingJourneys,
  fetchCompleteJourney,
  JourneyMatch,
  GroupedRouteJourney,
  CompleteJourneyResult,
  formatTimeTo12Hour,
  MIN_TRANSFER_MINUTES,
} from '../lib/supabase/transitService';
import { GroupedStop, Stop, MultiLegJourney, JourneyLeg } from '../types/transit';
import { useChennaiTime } from '../hooks/useChennaiTime';
import {
  Search,
  ArrowRight,
  ArrowUpDown,
  Clock,
  MapPin,
  Bus,
  Train,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Compass,
  GitFork,
  ArrowRightCircle,
  Footprints,
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

  const [selectedFromStop, setSelectedFromStop] = useState<GroupedStop | null>(null);
  const [selectedToStop, setSelectedToStop] = useState<GroupedStop | null>(null);

  // Autocomplete dropdowns
  const [fromSuggestions, setFromSuggestions] = useState<GroupedStop[]>([]);
  const [toSuggestions, setToSuggestions] = useState<GroupedStop[]>([]);
  const [isSearchingFrom, setIsSearchingFrom] = useState(false);
  const [isSearchingTo, setIsSearchingTo] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Journey results state
  const [groupedJourneys, setGroupedJourneys] = useState<GroupedRouteJourney[] | null>(null);
  const [flatJourneys, setFlatJourneys] = useState<JourneyMatch[] | null>(null);
  const [multiLegJourneys, setMultiLegJourneys] = useState<MultiLegJourney[] | null>(null);
  const [directJourneys, setDirectJourneys] = useState<MultiLegJourney[] | null>(null);
  const [connectingJourneys, setConnectingJourneys] = useState<MultiLegJourney[] | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'direct' | 'connecting'>('all');
  const [expandedLegCards, setExpandedLegCards] = useState<Record<string, boolean>>({});

  const [resolvedFromStop, setResolvedFromStop] = useState<Stop | null>(null);
  const [resolvedToStop, setResolvedToStop] = useState<Stop | null>(null);
  const [viewMode, setViewMode] = useState<'grouped' | 'chronological'>('grouped');
  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({});

  const [isFindingRoutes, setIsFindingRoutes] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Live Chennai clock
  const { formattedTime12 } = useChennaiTime();

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
    if (!fromQuery.trim() || selectedFromStop?.displayName === fromQuery) {
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
    if (!toQuery.trim() || selectedToStop?.displayName === toQuery) {
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
    setFromQuery(selectedToStop?.displayName || toQuery);
    setSelectedToStop(prevFrom);
    setToQuery(prevFrom?.displayName || prevFromQuery);
    setGroupedJourneys(null);
    setFlatJourneys(null);
  };

  // Toggle route trip expansion
  const toggleRouteExpand = (routeId: string) => {
    setExpandedRoutes((prev) => ({
      ...prev,
      [routeId]: !prev[routeId],
    }));
  };

  // Run Transit Journey algorithm (Direct + Connecting)
  const handleFindRoutes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFromStop || !selectedToStop) {
      setSearchError('Please select both Origin and Destination stops from the suggestions.');
      return;
    }

    if (
      selectedFromStop.id === selectedToStop.id ||
      selectedFromStop.displayName.toLowerCase() === selectedToStop.displayName.toLowerCase()
    ) {
      setSearchError('Origin and destination cannot be the same stop location.');
      return;
    }

    setIsFindingRoutes(true);
    setSearchError(null);
    setGroupedJourneys(null);
    setFlatJourneys(null);
    setMultiLegJourneys(null);
    setDirectJourneys(null);
    setConnectingJourneys(null);

    try {
      // 1. Search for direct journeys first
      const directRes = await findDirectJourneys(selectedFromStop, selectedToStop);

      // 2. If direct journeys exist, display them immediately
      const hasDirect =
        !directRes.error &&
        ((directRes.groupedJourneys && directRes.groupedJourneys.length > 0) ||
          (directRes.directJourneys && directRes.directJourneys.length > 0));

      if (hasDirect) {
        setGroupedJourneys(directRes.groupedJourneys || []);
        setFlatJourneys(directRes.journeys || []);
        setDirectJourneys(directRes.directJourneys || []);
        setMultiLegJourneys(directRes.multiLegJourneys || []);
        setResolvedFromStop(directRes.fromStop);
        setResolvedToStop(directRes.toStop);
        setFilterTab('all');
      }

      // 3. Independently search for connecting journeys
      const connectingRes = await findConnectingJourneys(selectedFromStop, selectedToStop);

      const allDirect = directRes.directJourneys || [];
      const allConnecting = connectingRes.connectingJourneys || [];
      const mergedMultiLeg = [
        ...(directRes.multiLegJourneys || []),
        ...(connectingRes.multiLegJourneys || []),
      ];

      setDirectJourneys(allDirect);
      setConnectingJourneys(allConnecting);
      setMultiLegJourneys(mergedMultiLeg);
      setGroupedJourneys(directRes.groupedJourneys || []);
      setFlatJourneys(directRes.journeys || []);
      if (connectingRes.fromStop) setResolvedFromStop(connectingRes.fromStop);
      if (connectingRes.toStop) setResolvedToStop(connectingRes.toStop);

      // 4. If connecting journeys exist, display them even when zero direct journeys exist
      if (allDirect.length === 0 && allConnecting.length > 0) {
        setFilterTab('connecting');
      } else if (allDirect.length > 0 && !hasDirect) {
        setFilterTab('all');
      }

      // 5. Only display a final "No services found" message if BOTH direct and connecting searches return no valid journey
      if (allDirect.length === 0 && allConnecting.length === 0) {
        if (directRes.error && connectingRes.error) {
          setSearchError(directRes.error || connectingRes.error);
        }
      }
    } catch (err: any) {
      console.error('Find routes error:', err);
      setSearchError(err?.message || 'Failed to search journeys in GTFS database.');
    } finally {
      setIsFindingRoutes(false);
    }
  };

  // Open complete journey modal for a direct journey
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
        selectedFromStop ? selectedFromStop.stopIds : journey.from_stop.stop_id,
        selectedToStop ? selectedToStop.stopIds : journey.to_stop.stop_id
      );
      if (res.error || !res.data) {
        setCompleteJourneyError(res.error || 'Unable to retrieve complete journey stop sequence.');
      } else {
        setCompleteJourney(res.data);
      }
    } catch (err: any) {
      console.error('Fetch journey modal error:', err);
      setCompleteJourneyError(err?.message || 'Failed to fetch complete journey details');
    } finally {
      setLoadingCompleteJourney(false);
    }
  };

  // Open complete journey modal for an individual leg of a multi-leg journey
  const handleViewLeg = async (leg: JourneyLeg) => {
    setActiveModalTrip({
      tripId: leg.tripId,
      fromStopId: leg.boardStopId,
      toStopId: leg.alightingStopId,
    });
    setLoadingCompleteJourney(true);
    setCompleteJourneyError(null);
    setCompleteJourney(null);

    try {
      const res = await fetchCompleteJourney(
        leg.tripId,
        leg.boardStopId,
        leg.alightingStopId
      );
      if (res.error || !res.data) {
        setCompleteJourneyError(res.error || 'Unable to retrieve complete journey stop sequence.');
      } else {
        setCompleteJourney(res.data);
      }
    } catch (err: any) {
      console.error('Fetch leg journey modal error:', err);
      setCompleteJourneyError(err?.message || 'Failed to fetch leg details');
    } finally {
      setLoadingCompleteJourney(false);
    }
  };

  const toggleLegCard = (journeyId: string) => {
    setExpandedLegCards((prev) => ({
      ...prev,
      [journeyId]: !prev[journeyId],
    }));
  };

  const totalDirectTrips = flatJourneys ? flatJourneys.length : 0;
  const totalDirectRoutes = groupedJourneys ? groupedJourneys.length : 0;

  return (
    <div className="w-full">
      <div className="bg-white rounded-3xl border border-black/10 p-6 sm:p-8 shadow-xs">
        {/* Header with Live Dynamic Chennai Clock */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black/5 text-[11px] font-bold uppercase tracking-wider text-black/70 mb-1.5">
              <Compass className="w-3.5 h-3.5 text-black" />
              <span>GTFS Routing Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
              Plan Your Journey
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Find direct MTC buses and Metro rail connections across Greater Chennai
            </p>
          </div>

          {/* Dynamic Live Chennai Time (Asia/Kolkata UTC+05:30) */}
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 bg-neutral-100/90 border border-neutral-200/80 px-4 py-2 rounded-full font-mono self-start sm:self-auto shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Clock className="w-3.5 h-3.5 text-neutral-600" />
            <span>Chennai Time: <strong className="text-neutral-900 font-bold">{formattedTime12}</strong></span>
          </div>
        </div>

        {/* Journey Planner Form */}
        <form onSubmit={handleFindRoutes} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
            {/* FROM Stop Input */}
            <div ref={fromRef} className="relative">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                From (Origin Stop)
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={fromQuery}
                  onChange={(e) => {
                    setFromQuery(e.target.value);
                    if (selectedFromStop && selectedFromStop.displayName !== e.target.value) {
                      setSelectedFromStop(null);
                    }
                  }}
                  onFocus={() => {
                    if (fromSuggestions.length > 0) setShowFromDropdown(true);
                  }}
                  placeholder="Search origin stop (e.g. SRP Tools, Broadway)..."
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
                    className="absolute right-3 p-1 text-neutral-400 hover:text-black cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown for FROM */}
              {showFromDropdown && fromSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1.5 rounded-2xl bg-white border border-neutral-200 shadow-xl max-h-64 overflow-y-auto p-1.5 space-y-1">
                  {fromSuggestions.map((stop, sIdx) => {
                    const isMetro = stop.isMetro ?? Boolean(stop.id && typeof stop.id === 'string' && stop.id.startsWith('CMRL'));
                    return (
                      <button
                        key={`${stop.id}-${sIdx}`}
                        type="button"
                        onClick={() => {
                          setSelectedFromStop(stop);
                          setFromQuery(stop.displayName);
                          setShowFromDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm hover:bg-neutral-100 flex items-center justify-between cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isMetro ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {isMetro ? <Train className="w-3.5 h-3.5" /> : <Bus className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-neutral-900 block truncate group-hover:text-black">
                              {stop.displayName}
                            </span>
                            <span className="text-[11px] text-neutral-400 block truncate">
                              {stop.stopIds.length > 1
                                ? `Grouped stop (${stop.stopIds.length} nearby platforms)`
                                : `Stop ID: ${stop.id}`}
                            </span>
                          </div>
                        </div>

                        {stop.lat != null && stop.lon != null && (
                          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-md shrink-0 ml-2">
                            {Number(stop.lat).toFixed(3)}°, {Number(stop.lon).toFixed(3)}°
                          </span>
                        )}
                      </button>
                    );
                  })}
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
                To (Destination Stop)
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={toQuery}
                  onChange={(e) => {
                    setToQuery(e.target.value);
                    if (selectedToStop && selectedToStop.displayName !== e.target.value) {
                      setSelectedToStop(null);
                    }
                  }}
                  onFocus={() => {
                    if (toSuggestions.length > 0) setShowToDropdown(true);
                  }}
                  placeholder="Search destination stop (e.g. Marina Beach, Central)..."
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
                    className="absolute right-3 p-1 text-neutral-400 hover:text-black cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown for TO */}
              {showToDropdown && toSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1.5 rounded-2xl bg-white border border-neutral-200 shadow-xl max-h-64 overflow-y-auto p-1.5 space-y-1">
                  {toSuggestions.map((stop, sIdx) => {
                    const isMetro = stop.isMetro ?? Boolean(stop.id && typeof stop.id === 'string' && stop.id.startsWith('CMRL'));
                    return (
                      <button
                        key={`${stop.id}-${sIdx}`}
                        type="button"
                        onClick={() => {
                          setSelectedToStop(stop);
                          setToQuery(stop.displayName);
                          setShowToDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm hover:bg-neutral-100 flex items-center justify-between cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isMetro ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {isMetro ? <Train className="w-3.5 h-3.5" /> : <Bus className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-neutral-900 block truncate group-hover:text-black">
                              {stop.displayName}
                            </span>
                            <span className="text-[11px] text-neutral-400 block truncate">
                              {stop.stopIds.length > 1
                                ? `Grouped stop (${stop.stopIds.length} nearby platforms)`
                                : `Stop ID: ${stop.id}`}
                            </span>
                          </div>
                        </div>

                        {stop.lat != null && stop.lon != null && (
                          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-md shrink-0 ml-2">
                            {Number(stop.lat).toFixed(3)}°, {Number(stop.lon).toFixed(3)}°
                          </span>
                        )}
                      </button>
                    );
                  })}
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
              Direct &amp; connecting routes · Enforces 5-min minimum transfer buffer between legs
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
            JOURNEY RESULTS SECTION
            ───────────────────────────────────────────────────────────── */}
        {(groupedJourneys !== null || multiLegJourneys !== null) && (
          <div className="mt-10 pt-8 border-t border-neutral-100 animate-in fade-in duration-200">
            {/* Results Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
              <div>
                <h3 className="text-xl font-black text-neutral-900">
                  Available Scheduled Services
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {selectedFromStop?.displayName} → {selectedToStop?.displayName}
                </p>
              </div>

              {/* Filter Tabs: All, Direct, Connecting */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center p-1 bg-neutral-100 rounded-full text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    className={`px-3 py-1.5 rounded-full cursor-pointer transition flex items-center gap-1.5 ${
                      filterTab === 'all'
                        ? 'bg-white text-black shadow-2xs'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    <span>All Options</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700">
                      {multiLegJourneys ? multiLegJourneys.length : 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterTab('direct')}
                    className={`px-3 py-1.5 rounded-full cursor-pointer transition flex items-center gap-1.5 ${
                      filterTab === 'direct'
                        ? 'bg-white text-black shadow-2xs'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    <span>Direct</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700">
                      {directJourneys ? directJourneys.length : totalDirectRoutes}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterTab('connecting')}
                    className={`px-3 py-1.5 rounded-full cursor-pointer transition flex items-center gap-1.5 ${
                      filterTab === 'connecting'
                        ? 'bg-white text-black shadow-2xs'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    <GitFork className="w-3 h-3" />
                    <span>Connecting</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700">
                      {connectingJourneys ? connectingJourneys.length : 0}
                    </span>
                  </button>
                </div>

                {/* Sub-view switcher for direct mode */}
                {filterTab === 'direct' && totalDirectRoutes > 0 && (
                  <div className="hidden sm:inline-flex items-center p-0.5 bg-neutral-100 rounded-full text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setViewMode('grouped')}
                      className={`px-3 py-1 rounded-full cursor-pointer transition ${
                        viewMode === 'grouped'
                          ? 'bg-white text-black shadow-2xs'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      By Route
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('chronological')}
                      className={`px-3 py-1 rounded-full cursor-pointer transition ${
                        viewMode === 'chronological'
                          ? 'bg-white text-black shadow-2xs'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      All Departures
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Connecting Journeys Status Banner if Direct = 0 */}
            {totalDirectRoutes === 0 && (connectingJourneys?.length ?? 0) > 0 && (
              <div className="mb-6 p-5 rounded-3xl bg-amber-50 border-2 border-amber-200/80 text-neutral-900 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <GitFork className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                        No Direct Bus · Connecting Route Available
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                        No Direct Bus, but Connecting Journeys are Available
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        No single bus serves both stops, but you can reach your destination by changing buses at{' '}
                        <strong>{connectingJourneys[0]?.transfersInfo[0]?.transferStopName || 'the transfer hub'}</strong>.
                      </p>
                    </div>
                  </div>

                  {connectingJourneys[0] && (
                    <div className="p-3 rounded-2xl bg-white/80 border border-amber-200/80 shrink-0 self-start sm:self-auto">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Suggested Connection
                      </div>
                      <div className="flex items-center gap-1.5">
                        {connectingJourneys[0].legs.map((leg, idx) => (
                          <React.Fragment key={leg.tripId + idx}>
                            <span className="px-2.5 py-1 rounded-lg bg-black text-white text-xs font-black">
                              {leg.routeShortName}
                            </span>
                            {idx < connectingJourneys[0].legs.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RESULTS RENDERING */}
            {filterTab === 'direct' ? (
              totalDirectRoutes > 0 ? (
              viewMode === 'grouped' ? (
                /* GROUPED BY ROUTE VIEW */
                <div className="mt-4 space-y-5">
                  {groupedJourneys.map((group) => {
                    const isMetro = group.route.route_type === 1 || group.route.agency_id === 'CMRL';
                    const allTrips = group.allTripsToday || group.trips || [];
                    const nextTrip = group.nextScheduledDeparture || group.nextTrip || allTrips[0] || null;
                    const subsequentTrips = group.subsequentDepartures || group.subsequentTrips || [];
                    const isExpanded = !!expandedRoutes[group.route.route_id];

                    return (
                      <div
                        key={group.route.route_id}
                        className="rounded-3xl border border-black/10 bg-white p-6 shadow-xs hover:border-black/20 transition"
                      >
                        {/* Route Banner Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-2xs">
                              {isMetro ? <Train className="w-6 h-6" /> : <Bus className="w-6 h-6" />}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-2xl font-black text-neutral-900 tracking-tight">
                                  {group.route.route_short_name || group.route.route_id}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                    isMetro ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-white'
                                  }`}
                                >
                                  {isMetro ? 'Chennai Metro' : 'MTC Bus'}
                                </span>
                                <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full font-mono">
                                  Route ID: {group.route.route_id}
                                </span>
                              </div>

                              <p className="text-xs text-neutral-600 font-medium mt-1">
                                {group.route.route_long_name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start md:self-auto">
                            {onSelectRoute && (
                              <button
                                onClick={() => onSelectRoute(group.route.route_id)}
                                className="text-xs font-bold text-neutral-600 hover:text-black border border-neutral-200 hover:border-black/30 rounded-full px-3.5 py-1.5 transition cursor-pointer"
                              >
                                View Timetable
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Next Scheduled Departure Highlight */}
                        <div className="py-5 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                          {/* Next Bus Card */}
                          <div className="md:col-span-1 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                Next Scheduled Departure
                              </span>
                              {nextTrip && nextTrip.is_upcoming && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  {nextTrip.departs_in_minutes === 0 ? 'Now' : `In ${nextTrip.departs_in_minutes} min`}
                                </span>
                              )}
                            </div>

                            {nextTrip ? (
                              <div>
                                <div className="text-2xl font-black text-neutral-900 font-mono">
                                  {formatTimeTo12Hour(nextTrip.departure_time)}
                                </div>
                                <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
                                  <span>Arrives at {formatTimeTo12Hour(nextTrip.arrival_time)}</span>
                                  <span className="font-semibold text-neutral-700">{nextTrip.duration_minutes} min</span>
                                </div>
                                <div className="mt-3">
                                  <button
                                    onClick={() => handleViewJourney(nextTrip)}
                                    className="w-full rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs py-2.5 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <span>View Stop Sequence</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-500 mt-1">
                                No scheduled trips remaining today
                              </p>
                            )}
                          </div>

                          {/* Subsequent Departures Pills */}
                          <div className="md:col-span-2 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                Subsequent Scheduled Departures Today ({allTrips.length} Total)
                              </span>

                              <button
                                type="button"
                                onClick={() => toggleRouteExpand(group.route.route_id)}
                                className="text-xs font-bold text-neutral-700 hover:text-black flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isExpanded ? 'Hide Schedule' : 'Show All'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {subsequentTrips.slice(0, 8).map((trip, sIdx) => (
                                <button
                                  key={`${trip.trip_id}-${sIdx}`}
                                  onClick={() => handleViewJourney(trip)}
                                  className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200/80 transition cursor-pointer"
                                  title={`Departure at ${formatTimeTo12Hour(trip.departure_time)} - Click for stop sequence`}
                                >
                                  {formatTimeTo12Hour(trip.departure_time)}
                                </button>
                              ))}

                              {subsequentTrips.length === 0 && (
                                <span className="text-xs text-neutral-400">
                                  This is the final scheduled departure for today.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Full Route Timetable for Selected Route */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-neutral-100 animate-in fade-in duration-150">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                              All {allTrips.length} Scheduled Trips Between These Stops
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                              {allTrips.map((trip, tIdx) => (
                                <div
                                  key={`${trip.trip_id}-${tIdx}`}
                                  onClick={() => handleViewJourney(trip)}
                                  className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 flex items-center justify-between cursor-pointer transition text-xs"
                                >
                                  <div>
                                    <span className="font-mono font-bold text-neutral-900">
                                      {formatTimeTo12Hour(trip.departure_time)}
                                    </span>
                                    <span className="text-neutral-400 mx-1.5">→</span>
                                    <span className="font-mono text-neutral-600">
                                      {formatTimeTo12Hour(trip.arrival_time)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-neutral-500 font-semibold">
                                      {trip.duration_minutes}m
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ALL DEPARTURES CHRONOLOGICAL VIEW */
                <div className="mt-4 space-y-3">
                  {flatJourneys && flatJourneys.map((j, idx) => {
                    const isMetro = j.route.route_type === 1 || j.route.agency_id === 'CMRL';
                    return (
                      <div
                        key={`${j.trip_id}-${idx}`}
                        className="p-4 sm:p-5 rounded-2xl border border-black/10 bg-white hover:border-black/25 transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {idx === 0 && j.is_upcoming && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-full">
                                NEXT UP
                              </span>
                            )}
                            <span className="text-lg font-black text-neutral-900">
                              {j.route.route_short_name || j.route.route_id}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isMetro ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-white'
                              }`}
                            >
                              {isMetro ? 'Metro' : 'MTC Bus'}
                            </span>
                            {j.is_upcoming ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                {j.departs_in_minutes === 0 ? 'Departs now' : `In ${j.departs_in_minutes} min`}
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                                Departed
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-neutral-600 font-medium line-clamp-1">
                            {j.route.route_long_name}
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                              Departs
                            </span>
                            <span className="font-mono font-bold text-sm text-neutral-900">
                              {formatTimeTo12Hour(j.departure_time)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                              Arrives
                            </span>
                            <span className="font-mono font-bold text-sm text-neutral-900">
                              {formatTimeTo12Hour(j.arrival_time)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                              Duration
                            </span>
                            <span className="font-bold text-neutral-900">
                              {j.duration_minutes} min
                            </span>
                          </div>

                          <button
                            onClick={() => handleViewJourney(j)}
                            className="rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2 transition shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <span>Stops</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* No Direct Journeys Found Empty State */
              <div className="rounded-3xl border border-dashed border-neutral-300 p-8 sm:p-12 text-center mt-4 bg-neutral-50/50">
                <div className="w-12 h-12 rounded-2xl bg-neutral-200 text-neutral-600 flex items-center justify-center mx-auto mb-3">
                  <Bus className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-neutral-900">
                  No Direct Scheduled Services Found
                </h4>
                <p className="text-xs text-neutral-600 max-w-md mx-auto mt-1.5 leading-relaxed">
                  No direct MTC bus routes or Metro corridors currently serve both selected stops on a single continuous trip in the GTFS database.
                </p>
                {(connectingJourneys?.length ?? 0) > 0 ? (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => setFilterTab('connecting')}
                      className="rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold px-6 py-3 transition shadow-sm cursor-pointer inline-flex items-center gap-2"
                    >
                      <GitFork className="w-3.5 h-3.5" />
                      <span>View {connectingJourneys?.length} Connecting Journey Options</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 p-3.5 rounded-2xl bg-white border border-neutral-200 max-w-md mx-auto text-xs text-neutral-500 text-left">
                    <strong className="text-neutral-800 block mb-1">Transit Commuter Tips:</strong>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Try selecting a major junction (e.g. Guindy, Saidapet, T. Nagar, Central).</li>
                      <li>Verify stop directionality or try swapping Origin and Destination.</li>
                      <li>Browse full corridor lists on the Routes tab.</li>
                    </ul>
                  </div>
                )}
              </div>
            )
          ) : (
            /* ALL OR CONNECTING MULTI-LEG JOURNEYS VIEW */
            (() => {
              const displayJourneys =
                filterTab === 'connecting'
                  ? (connectingJourneys || [])
                  : (multiLegJourneys || []);

              if (displayJourneys.length === 0) {
                return (
                  <div className="rounded-3xl border border-dashed border-neutral-300 p-8 sm:p-12 text-center mt-4 bg-neutral-50/50">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-200 text-neutral-600 flex items-center justify-center mx-auto mb-3">
                      <Bus className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-neutral-900">
                      No Scheduled Journey Found
                    </h4>
                    <p className="text-xs text-neutral-600 max-w-md mx-auto mt-1.5 leading-relaxed">
                      No direct or connecting scheduled bus journey was found for the selected stops and requested time in the GTFS database.
                    </p>
                    <div className="mt-4 p-3.5 rounded-2xl bg-white border border-neutral-200 max-w-md mx-auto text-xs text-neutral-500 text-left">
                      <strong className="text-neutral-800 block mb-1">Transit Commuter Tips:</strong>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Try selecting a major transit hub (e.g. Broadway, Central, Tambaram, Guindy, Koyambedu).</li>
                        <li>Verify stop directionality or try swapping Origin and Destination.</li>
                        <li>Check if the service operates only at specific times or weekdays.</li>
                      </ul>
                    </div>
                  </div>
                );
              }

              return (
                <div className="mt-4 space-y-4">
                  {displayJourneys.map((journey, journeyIdx) => {
                    const isExpanded = !!expandedLegCards[journey.id];
                    const isDirect = journey.type === 'direct';

                    return (
                      <div
                        key={`${journey.id}-${journeyIdx}`}
                        className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs hover:border-black/20 transition"
                      >
                        {/* Card Header: Route Badge Chain & Transfer Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                          {/* Route Chain Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            {journey.legs.map((leg, idx) => (
                              <React.Fragment key={`${leg.tripId}-${idx}`}>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 text-white text-xs font-bold shadow-2xs">
                                  {leg.routeType === 1 || leg.agencyId === 'CMRL' ? (
                                    <Train className="w-3.5 h-3.5 text-blue-400" />
                                  ) : (
                                    <Bus className="w-3.5 h-3.5 text-white" />
                                  )}
                                  <span>{leg.routeShortName}</span>
                                </div>

                                {idx < journey.legs.length - 1 && (
                                  <div className="flex items-center gap-1 text-neutral-400">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </React.Fragment>
                            ))}

                            {/* Transfer Type Badge */}
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                isDirect
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : journey.transfers === 1
                                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                  : 'bg-purple-50 text-purple-900 border border-purple-200'
                              }`}
                            >
                              {isDirect
                                ? 'Direct (0 transfers)'
                                : journey.transfers === 1
                                ? '1 Transfer'
                                : '2 Transfers'}
                            </span>

                            {/* Departure Timing Status */}
                            {journey.isUpcoming ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                {journey.departsInMinutes === 0 ? 'Now' : `In ${journey.departsInMinutes} min`}
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                                Departed
                              </span>
                            )}
                          </div>

                          {/* Duration Summary */}
                          <div className="text-right sm:self-auto self-start">
                            <span className="text-base font-black text-neutral-900">
                              {journey.totalDurationMinutes} min
                            </span>
                            {!isDirect && (
                              <div className="text-[11px] text-neutral-500">
                                Ride {journey.inVehicleDurationMinutes}m · Transfer wait {journey.waitingTimeMinutes}m
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Departure & Arrival Time Overview */}
                        <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0" />
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                                Board Origin ({journey.origin.stop_name})
                              </span>
                              <span className="text-sm font-bold text-neutral-900 font-mono">
                                {formatTimeTo12Hour(journey.departureTime)}
                              </span>
                            </div>
                          </div>

                          {/* Transfer Callout in middle */}
                          {!isDirect ? (
                            <div className="p-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-center">
                              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center justify-center gap-1">
                                <GitFork className="w-3 h-3 text-amber-600" />
                                <span>Transfer Hub</span>
                              </div>
                              <div className="text-xs font-bold text-neutral-800 truncate mt-0.5">
                                {journey.transfersInfo[0]?.transferStopName}
                              </div>
                              <div className="text-[10px] text-neutral-500">
                                Wait {journey.transfersInfo[0]?.waitMinutes} min · min {MIN_TRANSFER_MINUTES}m buffer
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-xs text-neutral-400">
                              <span>Single continuous service</span>
                            </div>
                          )}

                          <div className="flex items-center gap-3 justify-start sm:justify-end">
                            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 ring-4 ring-neutral-100 shrink-0 order-first sm:order-last" />
                            <div className="sm:text-right">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                                Alight Destination ({journey.destination.stop_name})
                              </span>
                              <span className="text-sm font-bold text-neutral-900 font-mono">
                                {formatTimeTo12Hour(journey.arrivalTime)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Step-by-Step Leg Details */}
                        <div className="pt-2 border-t border-neutral-100">
                          <button
                            type="button"
                            onClick={() => toggleLegCard(journey.id)}
                            className="w-full py-2 text-xs font-bold text-neutral-600 hover:text-black flex items-center justify-between cursor-pointer transition"
                          >
                            <span className="flex items-center gap-1.5">
                              <Footprints className="w-3.5 h-3.5 text-neutral-500" />
                              <span>
                                {isExpanded
                                  ? 'Hide step-by-step leg breakdown'
                                  : `View step-by-step itinerary (${journey.legs.length} ${
                                      journey.legs.length === 1 ? 'leg' : 'legs'
                                    })`}
                              </span>
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-neutral-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-neutral-400" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-3 space-y-3 pt-2 border-t border-neutral-100">
                              {journey.legs.map((leg, legIdx) => {
                                const transferAfter = journey.transfersInfo[legIdx];

                                return (
                                  <React.Fragment key={`${leg.tripId}-leg-${leg.legNumber}`}>
                                    {/* Individual Leg Box */}
                                    <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-900 text-white">
                                            Leg {leg.legNumber}
                                          </span>
                                          <span className="text-xs font-bold text-neutral-900">
                                            {leg.routeShortName} · {leg.routeLongName}
                                          </span>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleViewLeg(leg)}
                                          className="text-[11px] font-bold text-black underline hover:text-neutral-700 cursor-pointer"
                                        >
                                          View Stops ({leg.stopsCount})
                                        </button>
                                      </div>

                                      <div className="space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2 text-neutral-700">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span>Board: <strong>{leg.boardStopName}</strong></span>
                                          </div>
                                          <span className="font-mono font-bold text-neutral-900">
                                            {formatTimeTo12Hour(leg.departureTime)}
                                          </span>
                                        </div>

                                        <div className="text-[11px] text-neutral-500 pl-4">
                                          Ride for {leg.durationMinutes} min ({leg.stopsCount} intermediate stops)
                                        </div>

                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2 text-neutral-700">
                                            <span className="w-2 h-2 rounded-full bg-neutral-900" />
                                            <span>Alight: <strong>{leg.alightingStopName}</strong></span>
                                          </div>
                                          <span className="font-mono font-bold text-neutral-900">
                                            {formatTimeTo12Hour(leg.arrivalTime)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Transfer Callout between legs */}
                                    {transferAfter && (
                                      <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs flex items-center justify-between gap-3 my-2">
                                        <div className="flex items-center gap-2 text-amber-900">
                                          <GitFork className="w-4 h-4 text-amber-600 shrink-0" />
                                          <div>
                                            <span className="font-bold block">
                                              Transfer at {transferAfter.transferStopName}
                                            </span>
                                            <span className="text-[11px] text-amber-700">
                                              Arrival: {formatTimeTo12Hour(transferAfter.fromLegArrival)} → Next departure: {formatTimeTo12Hour(transferAfter.toLegDeparture)}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                          <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                            Wait {transferAfter.waitMinutes} min
                                          </span>
                                          <span className="text-[10px] text-amber-700 block mt-0.5">
                                            ≥ {MIN_TRANSFER_MINUTES} min buffer
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COMPLETE JOURNEY MODAL
          ───────────────────────────────────────────────────────────── */}
      {activeModalTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col font-sans">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black text-white">
                    {completeJourney?.route.route_short_name || 'Direct Service'}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    Trip #{activeModalTrip.tripId}
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
                                  <span> · ({Number(step.stop_lat).toFixed(4)}, {Number(step.stop_lon).toFixed(4)})</span>
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
