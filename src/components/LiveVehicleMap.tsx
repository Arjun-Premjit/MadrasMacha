import React, { useState, useEffect, useRef } from 'react';
import {
  Bus,
  Radio,
  RefreshCw,
  AlertCircle,
  Clock,
  Layers,
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import {
  LiveVehicle,
  RealtimeFeedResponse,
  getVehiclePositions,
  getVehicleStaleStatus,
} from '../lib/services/gtfsRealtimeService';
import { Stop } from '../types/transit';

interface LiveVehicleMapProps {
  routeId?: string;
  routeShortName?: string;
  stops?: Stop[];
  className?: string;
}

export const LiveVehicleMap: React.FC<LiveVehicleMapProps> = ({
  routeId,
  routeShortName,
  stops = [],
  className = '',
}) => {
  const { language, getStopName } = useLanguage();

  const [isLiveEnabled, setIsLiveEnabled] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'route'>(routeId ? 'route' : 'all');
  const [feedState, setFeedState] = useState<RealtimeFeedResponse>({
    available: false,
    message: 'Checking verified GTFS-RT feed...',
    vehicles: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<LiveVehicle | null>(null);

  // Poll realtime positions
  const fetchPositions = async () => {
    if (!isLiveEnabled) return;
    setIsLoading(true);
    try {
      const filter = filterMode === 'route' && routeId ? { routeId, routeShortName } : undefined;
      const res = await getVehiclePositions(filter);
      setFeedState(res);
    } catch {
      setFeedState({
        available: false,
        message: 'Live bus locations are currently unavailable.',
        vehicles: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 20000); // 20s poll
    return () => clearInterval(interval);
  }, [isLiveEnabled, filterMode, routeId]);

  // Center coordinate: First stop or Chennai Central (13.0827, 80.2707)
  const centerLat = stops[0]?.stop_lat || 13.0827;
  const centerLon = stops[0]?.stop_lon || 80.2707;

  return (
    <div className={`w-full rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs ${className}`}>
      {/* Top Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/70">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                feedState.available ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
              }`}
            />
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">
              <Bus className="w-4 h-4 text-neutral-700" />
              <span>{language === 'ta' ? 'நேரடி பேருந்து கண்காணிப்பு' : 'Live MTC Bus Tracking'}</span>
            </h3>
          </div>

          <span className="text-xs text-neutral-500 font-mono">
            {feedState.available ? `${feedState.vehicles.length} active` : 'GTFS-RT'}
          </span>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tracking toggle */}
          <button
            type="button"
            onClick={() => setIsLiveEnabled((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isLiveEnabled
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveEnabled ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span>{isLiveEnabled ? 'Tracking ON' : 'Paused'}</span>
          </button>

          {/* Filter options */}
          {routeShortName && (
            <div className="flex items-center bg-neutral-200/80 p-0.5 rounded-full text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterMode('route')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                  filterMode === 'route'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Route {routeShortName}
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                All Buses
              </button>
            </div>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchPositions}
            disabled={isLoading}
            className="w-8 h-8 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition cursor-pointer disabled:opacity-50"
            title="Refresh Live Data"
            aria-label="Refresh live transit positions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Realtime Status Banner */}
      {!feedState.available ? (
        <div className="px-4 py-3 bg-amber-50/80 border-b border-amber-200/80 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {language === 'ta'
                ? 'நேரடி பேருந்து இருப்பிடங்கள் தற்போது கிடைக்கவில்லை. திட்டமிடப்பட்ட கால அட்டவணை மற்றும் நிலையான வழித்தடம் காட்டப்படுகிறது.'
                : 'Live bus locations are currently unavailable. Showing verified static scheduled routes and stops.'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-700 shrink-0">
            Feed: CUMTA Open Transit API
          </span>
        </div>
      ) : (
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live MTC Feed Connected · {feedState.vehicles.length} buses transmitting positions
          </span>
          <span className="font-mono text-[11px] text-emerald-700">
            Updated {feedState.lastUpdated ? new Date(feedState.lastUpdated * 1000).toLocaleTimeString() : 'Just now'}
          </span>
        </div>
      )}

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-neutral-100">
        {/* Google Maps iframe embed as base interactive transit canvas */}
        <iframe
          title="Chennai Transit Map"
          className="w-full h-full border-0"
          loading="lazy"
          src={`https://maps.google.com/maps?q=${centerLat},${centerLon}&z=13&output=embed`}
        />

        {/* Live Overlay Pill */}
        <div className="absolute top-3 left-3 z-10">
          <div className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 shadow-md flex items-center gap-2 text-xs font-semibold text-neutral-800">
            <Navigation className="w-3.5 h-3.5 text-sky-600" />
            <span>
              {stops.length > 0
                ? `${stops.length} Scheduled Stops Loaded`
                : 'Chennai Metro & Bus Corridor'}
            </span>
          </div>
        </div>

        {/* Overlay when live vehicles are active */}
        {feedState.available && feedState.vehicles.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 z-10 flex gap-2 overflow-x-auto pb-1">
            {feedState.vehicles.slice(0, 5).map((veh) => {
              const stale = getVehicleStaleStatus(veh.timestamp);
              return (
                <div
                  key={veh.vehicleId}
                  onClick={() => setSelectedVehicle(veh)}
                  className="px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-neutral-200 shadow-md text-xs shrink-0 cursor-pointer hover:border-neutral-400 transition"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-neutral-900">
                      🚌 {veh.routeShortName || 'MTC'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        stale.color === 'emerald'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {stale.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block font-mono">
                    ID: {veh.vehicleId}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating action to open in full Google Maps */}
        <div className="absolute top-3 right-3 z-10">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLon}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-900 text-white text-xs font-medium flex items-center gap-1.5 shadow-md transition"
          >
            <span>Open Google Maps</span>
            <ExternalLink className="w-3 h-3 text-neutral-300" />
          </a>
        </div>
      </div>

      {/* Selected Vehicle Detail Drawer/Modal */}
      {selectedVehicle && (
        <div className="p-4 bg-neutral-900 text-white border-t border-neutral-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-sky-400">
                Vehicle #{selectedVehicle.vehicleId}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                Route {selectedVehicle.routeShortName || 'MTC'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Lat: {selectedVehicle.latitude.toFixed(4)}, Lon: {selectedVehicle.longitude.toFixed(4)}
              {selectedVehicle.speed !== undefined && ` · ${Math.round(selectedVehicle.speed * 3.6)} km/h`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedVehicle(null)}
            className="px-3 py-1 text-xs text-neutral-400 hover:text-white border border-neutral-700 rounded-lg"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
