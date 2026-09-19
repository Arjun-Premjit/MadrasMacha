import React, { useState, useEffect } from 'react';
import { Route, Stop } from '../../types/transit';
import { MetroTrain3D } from '../MetroTrain3D';
import { supabase } from '../../lib/supabase';
import {
  Train,
  ArrowRight,
  Info,
  MapPin,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  X,
  Compass,
  Ticket,
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { LanguageToggle } from '../LanguageToggle';

interface MetroPageProps {
  routes?: Route[];
  onSelectRoute: (route: Route) => void;
  onSelectStop?: (stop: Stop) => void;
}

export const MetroPage: React.FC<MetroPageProps> = ({ onSelectRoute, onSelectStop }) => {
  const { language, getStopName } = useLanguage();
  const [metroRoutes, setMetroRoutes] = useState<Route[]>([]);
  const [metroStops, setMetroStops] = useState<Stop[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('CMRL_1');
  const [activeStationModal, setActiveStationModal] = useState<Stop | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetroData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch actual Metro routes from Supabase
        const { data: routesData, error: routesErr } = await supabase
          .from('routes')
          .select('*')
          .eq('agency_id', 'CMRL')
          .order('route_id');

        if (routesErr) throw routesErr;
        setMetroRoutes(routesData || []);

        // Fetch actual CMRL Metro stops from Supabase
        const { data: stopsData, error: stopsErr } = await supabase
          .from('stops')
          .select('*')
          .like('stop_id', 'CMRL%')
          .order('stop_id');

        if (stopsErr) throw stopsErr;
        setMetroStops(stopsData || []);

        if (routesData && routesData.length > 0) {
          setSelectedRouteId(routesData[0].route_id);
        }
      } catch (err: any) {
        console.error('Failed to load Metro data from Supabase:', err);
        setError(err?.message || 'Failed to load Metro data from Supabase');
      } finally {
        setLoading(false);
      }
    }

    loadMetroData();
  }, []);

  const activeRoute = metroRoutes.find((r) => r.route_id === selectedRouteId) || metroRoutes[0];

  // Filter stops associated with the selected route
  // Blue Line: CMRL_01 through CMRL_26
  // Green Line: CMRL_G01 through CMRL_G18 (plus Central & St Thomas Mount interchanges)
  const routeStops = metroStops.filter((s) => {
    if (selectedRouteId === 'CMRL_1') {
      return !s.stop_id.includes('CMRL_G');
    }
    if (selectedRouteId === 'CMRL_2') {
      return s.stop_id.includes('CMRL_G') || s.stop_id === 'CMRL_14' || s.stop_id === 'CMRL_24';
    }
    // Inter-Corridor
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-20 px-6 sm:px-12 max-w-7xl mx-auto font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <div className="pb-8 border-b border-black/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-xs font-semibold uppercase tracking-wider text-black/70 mb-4">
          <Train className="w-3.5 h-3.5 text-black" />
          <span>Chennai Metro Rail Limited (CMRL)</span>
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black">
          Chennai Metro Rail
        </h1>
        <p className="mt-3 text-base sm:text-lg text-black/75 max-w-2xl leading-relaxed">
          The rapid transit rail network connecting Wimco Nagar, Chennai Central, Egmore, Koyambedu, and Chennai International Airport across grade-separated elevated and underground tunnels.
        </p>

        {/* Dynamic Route Switcher Tabs from Supabase */}
        {metroRoutes.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {metroRoutes.map((route) => {
              const isSelected = route.route_id === selectedRouteId;
              const isBlue = route.route_short_name.toLowerCase().includes('blue');
              const isGreen = route.route_short_name.toLowerCase().includes('green');

              return (
                <button
                  key={route.route_id}
                  onClick={() => setSelectedRouteId(route.route_id)}
                  className={`rounded-full px-6 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isBlue ? 'bg-blue-500' : isGreen ? 'bg-emerald-500' : 'bg-neutral-500'
                    }`}
                  />
                  <span>{route.route_short_name}</span>
                  <span className="text-[10px] opacity-70 font-mono">({route.route_id})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Metro Train Visual with Animation */}
      <div className="my-8 py-4 bg-white rounded-3xl border border-black/10 p-6 sm:p-10 shadow-xs flex flex-col items-center justify-center">
        <MetroTrain3D isStatic={false} showWatermark={false} className="w-full max-w-4xl mx-auto" />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-white border border-neutral-200 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          <p className="text-sm font-semibold text-neutral-700">Loading Metro corridors from Supabase...</p>
        </div>
      ) : activeRoute ? (
        /* Corridor Details & Stations */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
          {/* Left Column: Corridor Specs from Supabase */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-xs space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Route {activeRoute.route_id}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    GTFS Route Type 1 (Metro)
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-black leading-snug">
                  {activeRoute.route_long_name}
                </h2>
              </div>

              {/* Data Notice for Metro Dataset */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-600 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-neutral-900">
                  <Info className="w-4 h-4 text-neutral-700 shrink-0" />
                  <span>GTFS Schedule Scope Notice</span>
                </div>
                <p className="leading-relaxed">
                  The static GTFS dataset records published terminal endpoints for CMRL services.
                </p>
                <p className="font-semibold text-neutral-800">
                  Intermediate stop timetable intervals: <span className="text-neutral-500 font-normal">Information unavailable in the current GTFS dataset.</span>
                </p>
              </div>

              {/* Route Attributes */}
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-black/5">
                  <span className="font-bold text-neutral-400 uppercase tracking-wider block text-[10px]">
                    Operating Agency
                  </span>
                  <span className="text-neutral-900 font-semibold text-sm mt-1 block">
                    Chennai Metro Rail Ltd
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Agency ID: CMRL</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-black/5">
                  <span className="font-bold text-neutral-400 uppercase tracking-wider block text-[10px]">
                    Transit Mode
                  </span>
                  <span className="text-neutral-900 font-semibold text-sm mt-1 block">
                    Grade-Separated Rail
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Standard Gauge</span>
                </div>
              </div>

              {/* View Full Route Timetable Button */}
              <div className="pt-2">
                <button
                  onClick={() => onSelectRoute(activeRoute)}
                  className="w-full rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-sm px-6 py-3.5 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>View Route Details &amp; Scheduled Trips</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Official Authority Card */}
            <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Official Agency Portal
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                For live ticketing, smart card recharge, and official station announcements, visit the official Chennai Metro Rail Limited portal.
              </p>
              <a
                href="https://chennaimetrorail.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-black underline underline-offset-4 hover:opacity-80"
              >
                <span>Visit chennaimetrorail.org</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Actual Metro Stations from Supabase */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-xl font-black text-black">
                  Corridor Stations &amp; Interchanges
                </h3>
                <p className="text-xs text-neutral-500">
                  {routeStops.length} stations registered in Supabase GTFS database
                </p>
              </div>

              <span className="text-xs font-mono font-bold bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full">
                {routeStops.length} Stops
              </span>
            </div>

            {routeStops.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-neutral-200 text-center text-neutral-500 text-sm">
                No stations retrieved for this corridor in the database.
              </div>
            ) : (
              <div className="space-y-2">
                {routeStops.map((station, idx) => {
                  const isTerminal =
                    idx === 0 || idx === routeStops.length - 1;
                  const isInterchange =
                    station.stop_name.toLowerCase().includes('central') ||
                    station.stop_name.toLowerCase().includes('alandur') ||
                    station.stop_name.toLowerCase().includes('airport') ||
                    station.stop_name.toLowerCase().includes('mount');

                  return (
                    <div
                      key={station.stop_id}
                      onClick={() => {
                        if (onSelectStop) {
                          onSelectStop(station);
                        } else {
                          setActiveStationModal(station);
                        }
                      }}
                      className={`group flex items-center justify-between p-4 rounded-2xl bg-white border transition-all shadow-2xs cursor-pointer hover:border-black/30 hover:shadow-sm ${
                        isTerminal
                          ? 'border-black/20 bg-neutral-50/60'
                          : 'border-black/5 hover:bg-neutral-50/40'
                      }`}
                      role="button"
                      tabIndex={0}
                      aria-label={`View details for ${station.stop_name}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                            isTerminal
                              ? 'bg-black text-white group-hover:bg-neutral-800'
                              : 'bg-neutral-100 text-neutral-700 group-hover:bg-black group-hover:text-white'
                          }`}
                        >
                          {idx + 1}
                        </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-neutral-900 group-hover:text-black">
                                {getStopName(station.stop_name, station.stop_id)}
                              </span>
                              {language === 'ta' && (
                                <span className="text-xs text-neutral-500 font-medium">
                                  ({station.stop_name})
                                </span>
                              )}
                              {isTerminal && (
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-full">
                                  {language === 'ta' ? 'முனையம்' : 'Terminal'}
                                </span>
                              )}
                              {isInterchange && !isTerminal && (
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                                  {language === 'ta' ? 'இணைப்பு' : 'Interchange'}
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-neutral-400 font-mono mt-0.5 flex items-center gap-2">
                              <span>ID: {station.stop_id}</span>
                              {station.stop_lat && station.stop_lon && (
                                <span>· {Number(station.stop_lat).toFixed(4)}° N, {Number(station.stop_lon).toFixed(4)}° E</span>
                              )}
                            </div>
                          </div>
                      </div>

                      <div className="flex items-center gap-2 text-right shrink-0">
                        <span className="text-[11px] font-medium text-neutral-400 hidden sm:inline">
                          {isTerminal ? 'Scheduled Terminus' : 'Active Station'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Interactive Metro Station Modal */}
      {activeStationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 sm:p-8 font-sans">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                    Metro Station Details
                  </span>
                  <h3 className="text-xl font-black text-neutral-900 mt-0.5">
                    {activeStationModal.stop_name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveStationModal(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Station ID</span>
                  <span className="font-mono font-bold text-neutral-900 mt-1 block">{activeStationModal.stop_id}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Agency</span>
                  <span className="font-bold text-neutral-900 mt-1 block">Chennai Metro (CMRL)</span>
                </div>
              </div>

              {activeStationModal.stop_lat && activeStationModal.stop_lon && (
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-neutral-400 block">GPS Coordinates</span>
                    <span className="font-mono text-neutral-800 mt-0.5 block">
                      {Number(activeStationModal.stop_lat).toFixed(5)}° N, {Number(activeStationModal.stop_lon).toFixed(5)}° E
                    </span>
                  </div>
                  <Compass className="w-4 h-4 text-neutral-400" />
                </div>
              )}

              <p className="text-neutral-500 text-[11px] leading-relaxed">
                Operating on Chennai Metro Rail corridors. Departures and connection timetables are indexed in the MadrasMacha GTFS directory.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                {onSelectStop && (
                  <button
                    onClick={() => {
                      const stopToSelect = activeStationModal;
                      setActiveStationModal(null);
                      onSelectStop(stopToSelect);
                    }}
                    className="w-full rounded-full bg-black hover:bg-neutral-800 text-white font-bold py-3 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Explore Station &amp; Timetable</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
