import React, { useState } from 'react';
import { Route } from '../../types/transit';
import { MetroTrain3D } from '../MetroTrain3D';
import { Train, ArrowRight } from 'lucide-react';

interface MetroPageProps {
  routes: Route[];
  onSelectRoute: (route: Route) => void;
}

export const MetroPage: React.FC<MetroPageProps> = ({
  routes,
  onSelectRoute,
}) => {
  const [selectedCorridor, setSelectedCorridor] = useState<'blue' | 'green' | 'inter'>('blue');

  const metroRoutes = routes.filter(
    (r) => r.agency_id === 'CMRL' || r.route_type === 1
  );

  const activeRoute = metroRoutes.find((r) => {
    if (selectedCorridor === 'blue') return r.route_id === 'CMRL-BLUE';
    if (selectedCorridor === 'green') return r.route_id === 'CMRL-GREEN';
    return r.route_id === 'CMRL-INTER';
  }) || metroRoutes[0];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-20 px-6 sm:px-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="pb-8">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-black">
          Chennai Metro
        </h1>
        <p className="mt-3 text-lg text-black/75 max-w-2xl leading-relaxed">
          State-of-the-art grade-separated rail network operating standard gauge stainless-steel trains with driverless-ready CBTC signaling, connecting northern terminals to the international airport.
        </p>

        {/* Corridor Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSelectedCorridor('blue')}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition-all cursor-pointer ${
              selectedCorridor === 'blue'
                ? 'bg-black text-white shadow-md'
                : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
            }`}
          >
            Blue Line (Corridor 1)
          </button>
          <button
            onClick={() => setSelectedCorridor('green')}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition-all cursor-pointer ${
              selectedCorridor === 'green'
                ? 'bg-black text-white shadow-md'
                : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
            }`}
          >
            Green Line (Corridor 2)
          </button>
          <button
            onClick={() => setSelectedCorridor('inter')}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition-all cursor-pointer ${
              selectedCorridor === 'inter'
                ? 'bg-black text-white shadow-md'
                : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
            }`}
          >
            Inter-Corridor Loop
          </button>
        </div>
      </div>

      {/* Train Along Viaduct */}
      <div className="my-8 py-4">
        <MetroTrain3D className="w-full max-w-4xl mx-auto" />
      </div>

      {/* Corridor Details & Stations */}
      {activeRoute && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
          {/* Left Column: Corridor Specs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-bold text-black">
                {activeRoute.route_long_name}
              </h2>
              <p className="text-base text-black/70 mt-3 leading-relaxed">
                {activeRoute.route_desc}
              </p>

              <div className="grid grid-cols-2 gap-6 pt-6 mt-6 text-sm">
                <div>
                  <span className="font-semibold text-black/60 block uppercase">Peak Headway</span>
                  <span className="text-black font-bold text-base mt-1 block">{activeRoute.frequency_peak || '4 min'}</span>
                </div>
                <div>
                  <span className="font-semibold text-black/60 block uppercase">Corridor Length</span>
                  <span className="text-black font-bold text-base mt-1 block">{activeRoute.distance_km || '32.1'} km</span>
                </div>
                <div>
                  <span className="font-semibold text-black/60 block uppercase">Service Hours</span>
                  <span className="text-black font-bold text-base mt-1 block">05:00 AM – 11:00 PM</span>
                </div>
                <div>
                  <span className="font-semibold text-black/60 block uppercase">Fare Structure</span>
                  <span className="text-black font-bold text-base mt-1 block">₹{activeRoute.fare_min || 10} – ₹{activeRoute.fare_max || 50}</span>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onSelectRoute(activeRoute)}
                  className="rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-sm px-6 py-3 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>View corridor timetable</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Station Sequence */}
          <div className="lg:col-span-7">
            <h3 className="text-xl font-bold text-black mb-4">
              Stations &amp; Interchanges ({activeRoute.stops_sequence?.length || 0})
            </h3>

            <div className="space-y-2">
              {activeRoute.stops_sequence?.map((stationName, idx) => {
                const isInterchange =
                  stationName.includes('Central') ||
                  stationName.includes('Alandur') ||
                  stationName.includes('Airport');

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-white border border-black/5 hover:border-black/20 text-sm transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-black/50 w-8">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span
                        className={`text-base ${
                          isInterchange ? 'font-bold text-black' : 'font-medium text-black/80'
                        }`}
                      >
                        {stationName}
                      </span>
                    </div>

                    {isInterchange && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-white bg-black rounded-full px-3 py-1">
                        Interchange
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
