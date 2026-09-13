import React, { useState, useEffect } from 'react';
import { fetchStopDetails, StopDetailData } from '../../lib/supabase/transitService';
import {
  ArrowLeft,
  MapPin,
  Bus,
  Train,
  Clock,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Navigation,
} from 'lucide-react';

interface StopDetailPageProps {
  stopId: string;
  onBack: () => void;
  onSelectRoute: (routeId: string) => void;
}

export const StopDetailPage: React.FC<StopDetailPageProps> = ({
  stopId,
  onBack,
  onSelectRoute,
}) => {
  const [data, setData] = useState<StopDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStop = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStopDetails(stopId);
      if (res.error || !res.data) {
        setError(res.error || `Stop ID ${stopId} could not be found.`);
      } else {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stopId) {
      loadStop();
    }
  }, [stopId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-20 px-6 sm:px-12 max-w-5xl mx-auto font-sans">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-neutral-200 rounded-full" />
          <div className="h-12 w-3/4 bg-neutral-200 rounded-xl" />
          <div className="h-32 w-full bg-neutral-200 rounded-2xl" />
          <div className="space-y-4 pt-6">
            <div className="h-20 w-full bg-neutral-200 rounded-xl" />
            <div className="h-20 w-full bg-neutral-200 rounded-xl" />
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
          <ArrowLeft className="w-4 h-4" /> Back to Stops
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 sm:p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-neutral-900">Failed to Load Stop</h2>
          <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto">
            {error || `Unable to query GTFS data for stop ID: ${stopId}`}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={loadStop}
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

  const { stop, routesServing, totalTripsSampled } = data;
  const isMetro = stop.is_metro_station;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${stop.stop_lat},${stop.stop_lon}`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-24 px-6 sm:px-12 max-w-5xl mx-auto font-sans selection:bg-black selection:text-white">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between pb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Stops Directory
        </button>
      </div>

      {/* Hero Stop Card */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
          <div className="flex items-start gap-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isMetro ? 'bg-blue-600 text-white' : 'bg-black text-white'
              }`}
            >
              {isMetro ? <Train className="w-8 h-8" /> : <MapPin className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    isMetro
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-900 text-white'
                  }`}
                >
                  {isMetro ? 'Chennai Metro Rail Station' : 'MTC Bus Stop / Terminal'}
                </span>
                <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-md font-mono">
                  Stop ID: {stop.stop_id}
                </span>
                {stop.stop_code && (
                  <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-md">
                    Code: {stop.stop_code}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-2">
                {stop.stop_name}
              </h1>

              {stop.stop_desc && (
                <p className="text-sm text-neutral-600 mt-1">{stop.stop_desc}</p>
              )}
            </div>
          </div>

          {/* Coordinates & External Map Link */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Coordinates
            </div>
            <div className="font-mono text-sm font-bold text-neutral-800">
              {stop.stop_lat.toFixed(6)}° N, {stop.stop_lon.toFixed(6)}° E
            </div>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline mt-1"
            >
              Open in Maps <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Summary Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Routes Cataloged
            </span>
            <span className="text-lg font-black text-neutral-900 mt-0.5 block">
              {routesServing.length} Routes
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Trips Sampled
            </span>
            <span className="text-lg font-black text-neutral-900 mt-0.5 block">
              {totalTripsSampled} Active Stops
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Transit Authority
            </span>
            <span className="text-lg font-black text-neutral-900 mt-0.5 block">
              {isMetro ? 'CMRL Metro' : 'MTC Chennai'}
            </span>
          </div>
        </div>
      </div>

      {/* Routes Serving This Stop */}
      <div className="mt-10">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Corridors &amp; Routes Serving This Stop
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Scheduled transit lines connecting through {stop.stop_name}.
            </p>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-neutral-200 text-neutral-800">
            {routesServing.length} Active Lines
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {routesServing.map((item) => {
            const isRouteMetro = item.route_type === 1 || item.agency_id === 'CMRL';

            return (
              <div
                key={`${item.route_id}-${item.trip_id}`}
                onClick={() => onSelectRoute(item.route_id)}
                className="group p-5 rounded-2xl bg-white hover:bg-neutral-50 border border-black/5 hover:border-black/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-bold text-base shrink-0">
                    {isRouteMetro ? <Train className="w-6 h-6" /> : <Bus className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-neutral-900">
                        {item.route_short_name}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                        {isRouteMetro ? 'Chennai Metro' : 'MTC Bus'}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-neutral-800 mt-0.5">
                      {item.route_long_name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-sm text-neutral-700 font-medium">
                  {item.departure_time && (
                    <div className="flex items-center gap-1 text-xs font-bold text-neutral-600">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      Dep: {item.departure_time}
                    </div>
                  )}

                  <span className="rounded-full bg-black text-white px-4 py-2 text-xs font-semibold group-hover:bg-neutral-800 transition-all">
                    View Route →
                  </span>
                </div>
              </div>
            );
          })}

          {routesServing.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
              No active route corridors currently cataloged for stop ID {stop.stop_id}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
