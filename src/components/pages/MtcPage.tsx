import React, { useState } from 'react';
import { Route } from '../../types/transit';
import { formatFare } from '../../lib/utils';
import { MtcBus3D } from '../MtcBus3D';
import { Bus, Search } from 'lucide-react';

interface MtcPageProps {
  routes: Route[];
  onSelectRoute: (route: Route) => void;
}

export const MtcPage: React.FC<MtcPageProps> = ({
  routes,
  onSelectRoute,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const mtcRoutes = routes.filter(
    (r) => r.agency_id === 'MTC' || r.route_type === 3
  );

  const filteredRoutes = mtcRoutes.filter((r) => {
    if (activeCategory === 'deluxe' && r.service_category !== 'mtc_deluxe') return false;
    if (activeCategory === 'ac' && r.service_category !== 'mtc_ac') return false;
    if (activeCategory === 'ordinary' && r.service_category !== 'mtc_ordinary') return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.route_short_name.toLowerCase().includes(q) ||
      r.route_long_name.toLowerCase().includes(q) ||
      (r.origin && r.origin.toLowerCase().includes(q)) ||
      (r.destination && r.destination.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-20 px-6 sm:px-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="pb-8">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-black">
          MTC Chennai
        </h1>
        <p className="mt-3 text-lg text-black/75 max-w-2xl leading-relaxed">
          Metropolitan Transport Corporation operates Chennai's comprehensive bus transit network, carrying over three million commuters daily across eight hundred city corridors.
        </p>
      </div>

      {/* Bus Visual Feature */}
      <div className="py-8 my-4 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="w-full md:w-1/2 max-w-lg">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">
            SWITCH Electric AC Bus
          </h2>
          <p className="mt-4 text-base text-black/70 leading-relaxed">
            Equipped with synchronous electric drivetrains, kneeling air suspension, surveillance cameras, and contactless digital ticketing across major Chennai corridors.
          </p>

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-black/80">
            <div>
              <span className="font-semibold text-black block">HEADQUARTERS</span>
              <span className="mt-1 block">Pallavan House, Anna Salai</span>
            </div>
            <div>
              <span className="font-semibold text-black block">TRANSIT HELPLINE</span>
              <a href="tel:04423455801" className="mt-1 block underline font-medium">
                044-23455801
              </a>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <MtcBus3D className="w-full max-w-lg mx-auto" />
        </div>
      </div>

      {/* Routes & Fleet Discovery */}
      <div className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {/* Service Filter Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
              }`}
            >
              All Routes ({mtcRoutes.length})
            </button>
            <button
              onClick={() => setActiveCategory('ac')}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                activeCategory === 'ac'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
              }`}
            >
              Electric &amp; AC
            </button>
            <button
              onClick={() => setActiveCategory('deluxe')}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                activeCategory === 'deluxe'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
              }`}
            >
              Deluxe
            </button>
            <button
              onClick={() => setActiveCategory('ordinary')}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                activeCategory === 'ordinary'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-black hover:bg-neutral-100 border border-black/10'
              }`}
            >
              Ordinary
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-black/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search route (e.g. 21G, 102)..."
              className="w-full bg-white border border-black/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
            />
          </div>
        </div>

        {/* Route List */}
        <div className="space-y-3">
          {filteredRoutes.map((route) => (
            <div
              key={route.route_id}
              onClick={() => onSelectRoute(route)}
              className="group p-5 rounded-2xl bg-white hover:bg-neutral-50 border border-black/5 hover:border-black/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-bold text-base">
                  <Bus className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-black">
                      {route.route_short_name}
                    </span>
                    <span className="text-sm font-medium text-black/60">
                      MTC Bus
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-black mt-0.5">
                    {route.route_long_name}
                  </h3>
                  <p className="text-sm text-black/70 mt-0.5">
                    {route.origin} → {route.destination}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-black/80 font-medium">
                <span>Every {route.frequency_peak || '12 min'}</span>
                <span>{formatFare(route.fare_min, route.fare_max)}</span>
                <span className="rounded-full bg-black text-white px-5 py-2 group-hover:bg-neutral-800 transition-all">
                  Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
