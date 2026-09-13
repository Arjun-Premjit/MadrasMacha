import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Train, Info, ArrowRight, ShieldCheck, MapPin, Sparkles, Navigation, Clock, IndianRupee, Layers } from 'lucide-react';
import { Route } from '../types/transit';
import { formatFare } from '../lib/utils';

interface MetroSectionProps {
  routes: Route[];
  onSelectRoute: (route: Route) => void;
}

export const MetroSection: React.FC<MetroSectionProps> = ({ routes, onSelectRoute }) => {
  const [activeLine, setActiveLine] = useState<'blue' | 'green' | 'inter'>('blue');
  const [selectedStationIndex, setSelectedStationIndex] = useState<number>(3); // Default to Central or Alandur

  const blueLineRoute = routes.find(r => r.route_id === 'CMRL-BLUE');
  const greenLineRoute = routes.find(r => r.route_id === 'CMRL-GREEN');
  const interLineRoute = routes.find(r => r.route_id === 'CMRL-INTER');

  // Representative station nodes along the lines
  const blueStations = [
    { name: 'Wimco Nagar', tamil: 'விம்கோ நகர்', type: 'terminal', desc: 'Northern terminal near Tiruvottriyur' },
    { name: 'Tollgate', tamil: 'டோல்கேட்', type: 'standard', desc: 'North Chennai industrial corridor' },
    { name: 'Washermanpet', tamil: 'வண்ணாரப்பேட்டை', type: 'standard', desc: 'Suburban rail integration' },
    { name: 'High Court', tamil: 'உயர் நீதிமன்றம்', type: 'standard', desc: 'Parrys Corner & Broadway MTC hub' },
    { name: 'Puratchi Thalaivar Dr. M.G.R Central', tamil: 'சென்ட்ரல்', type: 'interchange', desc: 'Triple interchange: Blue, Green, Indian Railways' },
    { name: 'Government Estate', tamil: 'அரசு தோட்டம்', type: 'standard', desc: 'Secretariat & Omandurar Estate' },
    { name: 'LIC', tamil: 'எல்.ஐ.சி', type: 'standard', desc: 'Mount Road commercial district' },
    { name: 'AG-DMS', tamil: 'ஏ.ஜி-டி.எம்.எஸ்', type: 'standard', desc: 'Teynampet health directorate' },
    { name: 'Nandanam', tamil: 'நந்தனம்', type: 'standard', desc: 'Chamiers road & arterial junction' },
    { name: 'Saidapet', tamil: 'சைதாப்பேட்டை', type: 'standard', desc: 'Panagal building & bus terminal' },
    { name: 'Guindy', tamil: 'கிண்டி', type: 'interchange', desc: 'Suburban rail & Industrial estate' },
    { name: 'Alandur', tamil: 'ஆலந்தூர்', type: 'interchange', desc: 'Two-tier elevated hub: Blue & Green lines cross' },
    { name: 'Meenambakkam', tamil: 'மீனம்பாக்கம்', type: 'standard', desc: 'Cargo terminal & Old airport' },
    { name: 'Chennai International Airport', tamil: 'விமான நிலையம்', type: 'terminal', desc: 'Integrated passenger walkway to Terminals 1, 2, 4' },
  ];

  const greenStations = [
    { name: 'Puratchi Thalaivar Dr. M.G.R Central', tamil: 'சென்ட்ரல்', type: 'interchange', desc: 'Connects to Blue Line & long distance trains' },
    { name: 'Chennai Egmore', tamil: 'எழும்பூர்', type: 'interchange', desc: 'Suburban & southern express trains' },
    { name: 'Nehru Park', tamil: 'நேரு பூங்கா', type: 'standard', desc: 'Poonamallee High Road' },
    { name: 'Kilpauk', tamil: 'கீழ்ப்பாக்கம்', type: 'standard', desc: 'Kilpauk Medical College' },
    { name: 'Shenoy Nagar', tamil: 'செனாய் நகர்', type: 'standard', desc: 'Thiru Vi Ka Park' },
    { name: 'Anna Nagar East', tamil: 'அண்ணா நகர் கிழக்கு', type: 'standard', desc: 'Roundtana shopping district' },
    { name: 'Anna Nagar Tower', tamil: 'அண்ணா நகர் டவர்', type: 'standard', desc: 'Tower park recreational hub' },
    { name: 'Thirumangalam', tamil: 'திருமங்கலம்', type: 'standard', desc: 'VR Chennai Mall & Ring road' },
    { name: 'Koyambedu CMBT', tamil: 'கோயம்பேடு', type: 'interchange', desc: 'Direct access to Asia’s mega bus terminal' },
    { name: 'Arumbakkam', tamil: 'அரும்பாக்கம்', type: 'standard', desc: 'DG Vaishnav College' },
    { name: 'Vadapalani', tamil: 'வடபழனி', type: 'standard', desc: 'Forum Vijaya Mall direct concourse bridge' },
    { name: 'Ashok Nagar', tamil: 'அசோக் நகர்', type: 'standard', desc: 'Ashok Pillar & 100-ft road' },
    { name: 'Ekkattuthangal', tamil: 'ஈக்காட்டுத்தாங்கல்', type: 'standard', desc: 'Olympia Tech Park & industrial zone' },
    { name: 'Alandur', tamil: 'ஆலந்தூர்', type: 'interchange', desc: 'Two-tier interchange station' },
    { name: 'St. Thomas Mount', tamil: 'பரங்கிமலை', type: 'terminal', desc: 'Southern terminus connecting Suburban & MRTS rail' },
  ];

  const interStations = [
    { name: 'Chennai Central', tamil: 'சென்ட்ரல்', type: 'interchange', desc: 'Origin station' },
    { name: 'Chennai Egmore', tamil: 'எழும்பூர்', type: 'standard', desc: 'Rail connection' },
    { name: 'Shenoy Nagar', tamil: 'செனாய் நகர்', type: 'standard', desc: 'Underground station' },
    { name: 'Koyambedu CMBT', tamil: 'கோயம்பேடு', type: 'interchange', desc: 'Major bus terminal' },
    { name: 'Vadapalani', tamil: 'வடபழனி', type: 'standard', desc: 'Retail & cultural district' },
    { name: 'Alandur', tamil: 'ஆலந்தூர்', type: 'interchange', desc: 'Cross-over to Airport corridor' },
    { name: 'Guindy', tamil: 'கிண்டி', type: 'standard', desc: 'Industrial corridor' },
    { name: 'Chennai International Airport', tamil: 'விமான நிலையம்', type: 'terminal', desc: 'Direct airport terminal arrival' },
  ];

  const currentStations =
    activeLine === 'blue'
      ? blueStations
      : activeLine === 'green'
      ? greenStations
      : interStations;

  const currentRoute =
    activeLine === 'blue'
      ? blueLineRoute
      : activeLine === 'green'
      ? greenLineRoute
      : interLineRoute;

  const activeThemeColor =
    activeLine === 'blue' ? '#0284C7' : activeLine === 'green' ? '#16A34A' : '#9333EA';

  return (
    <section id="metro" className="relative py-14 sm:py-20 border-t border-slate-800/80 bg-slate-900/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Metro Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Train className="h-4 w-4" />
              </span>
              <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-sky-400 border border-sky-500/20">
                CMRL Rapid Transit
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Chennai Metro Rail Network
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              சென்னை மெட்ரோ ரயில் • State-of-the-art air-conditioned driverless-capable trains operating along elevated viaducts and underground tunnels.
            </p>
          </div>

          {/* Static vs Live Disclaimer Badge */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 max-w-md">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-sky-300">
                  GTFS Static Schedules &amp; Headways
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Static routes &amp; station geometries are fully active. Real-time GPS train location feeds will sync with the upcoming CMRL GTFS-RT open API.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Line Selector Tabs: Blue Line / Green Line / Inter-Corridor */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setActiveLine('blue');
              setSelectedStationIndex(4);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold transition shadow-sm ${
              activeLine === 'blue'
                ? 'bg-sky-600 text-white shadow-sky-600/30 border border-sky-400'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-sky-300 shadow-[0_0_8px_#38bdf8]" />
            <span>Blue Line (Corridor 1)</span>
            <span className="text-xs font-normal opacity-80 hidden sm:inline">
              • 32.65 km (26 Stations)
            </span>
          </button>

          <button
            onClick={() => {
              setActiveLine('green');
              setSelectedStationIndex(0);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold transition shadow-sm ${
              activeLine === 'green'
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 border border-emerald-400'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_8px_#34d399]" />
            <span>Green Line (Corridor 2)</span>
            <span className="text-xs font-normal opacity-80 hidden sm:inline">
              • 22.0 km (17 Stations)
            </span>
          </button>

          <button
            onClick={() => {
              setActiveLine('inter');
              setSelectedStationIndex(0);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold transition shadow-sm ${
              activeLine === 'inter'
                ? 'bg-purple-600 text-white shadow-purple-600/30 border border-purple-400'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-purple-300 shadow-[0_0_8px_#c084fc]" />
            <span>Inter-Corridor Direct</span>
            <span className="text-xs font-normal opacity-80 hidden sm:inline">
              • Central ⇄ Airport (via CMBT)
            </span>
          </button>
        </div>

        {/* Metro Line Details Card */}
        {currentRoute && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-md px-2.5 py-1 text-xs font-black text-white"
                    style={{ backgroundColor: activeThemeColor }}
                  >
                    {currentRoute.route_short_name}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Agency: {currentRoute.agency_id}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-white sm:text-xl">
                  {currentRoute.route_long_name}
                </h3>
                <p className="mt-1 text-xs text-slate-400 max-w-2xl">
                  {currentRoute.route_desc}
                </p>
              </div>

              {/* Metro Metrics */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs">
                  <span className="text-slate-400 block text-[10px]">Peak Frequency</span>
                  <span className="font-bold text-white">{currentRoute.frequency_peak}</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs">
                  <span className="text-slate-400 block text-[10px]">Travel Time</span>
                  <span className="font-bold text-sky-400">{currentRoute.estimated_duration_min} mins</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs">
                  <span className="text-slate-400 block text-[10px]">Fare</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatFare(currentRoute.fare_min, currentRoute.fare_max)}
                  </span>
                </div>
                <button
                  onClick={() => onSelectRoute(currentRoute)}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition flex items-center gap-1.5"
                >
                  <span>Full Route Sheet</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* ANIMATED METRO-LINE VISUALIZATION */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span className="font-semibold text-slate-300">
                  Interactive Station Track &amp; Dynamic Train Progression
                </span>
                <span className="text-[11px] text-slate-400">
                  Click any station to reposition CMRL train simulator
                </span>
              </div>

              {/* Horizontal Scrollable Rail Diagram */}
              <div className="relative overflow-x-auto pb-4 pt-8 scrollbar-thin">
                <div className="relative min-w-[760px] px-6">
                  {/* Track Line */}
                  <div
                    className="absolute top-12 left-8 right-8 h-2 rounded-full shadow-lg"
                    style={{ backgroundColor: activeThemeColor }}
                  />

                  {/* Animated CMRL Train moving along the line */}
                  <motion.div
                    className="absolute top-4 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20"
                    animate={{
                      left: `${((selectedStationIndex + 0.5) / currentStations.length) * 100}%`,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 80,
                      damping: 14,
                    }}
                  >
                    <div className="flex items-center gap-1 rounded-lg bg-slate-900 border border-cyan-400/80 px-2 py-0.5 shadow-xl shadow-cyan-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-[10px] font-bold text-white font-mono">CMRL RAKE</span>
                    </div>
                    <div className="h-2 w-0.5 bg-cyan-400" />
                  </motion.div>

                  {/* Station Points */}
                  <div className="relative z-10 flex items-center justify-between">
                    {currentStations.map((st, idx) => {
                      const isSelected = selectedStationIndex === idx;
                      const isInterchange = st.type === 'interchange';
                      const isTerminal = st.type === 'terminal';

                      return (
                        <button
                          key={st.name}
                          onClick={() => setSelectedStationIndex(idx)}
                          className="group flex flex-col items-center focus:outline-none"
                          style={{ width: `${100 / currentStations.length}%` }}
                        >
                          {/* Station Node Marker */}
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                              isSelected
                                ? 'scale-125 border-white bg-slate-950 shadow-lg shadow-white/30 ring-4 ring-sky-500/40'
                                : isInterchange
                                ? 'border-amber-400 bg-slate-900 text-amber-300'
                                : isTerminal
                                ? 'border-rose-400 bg-slate-900 text-rose-300'
                                : 'border-slate-500 bg-slate-950 hover:border-slate-300'
                            }`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                isSelected
                                  ? 'bg-cyan-400 animate-pulse'
                                  : isInterchange
                                  ? 'bg-amber-400'
                                  : isTerminal
                                  ? 'bg-rose-400'
                                  : 'bg-slate-400'
                              }`}
                            />
                          </div>

                          {/* Station Name & Tamil script */}
                          <div className="mt-3 text-center px-1">
                            <span
                              className={`block text-[11px] font-semibold leading-tight transition ${
                                isSelected ? 'text-white font-bold underline decoration-sky-400 underline-offset-4' : 'text-slate-300 group-hover:text-white'
                              }`}
                            >
                              {st.name}
                            </span>
                            <span className="block text-[9px] text-slate-400 font-normal mt-0.5">
                              {st.tamil}
                            </span>
                            {isInterchange && (
                              <span className="mt-1 inline-block rounded bg-amber-500/20 px-1 py-0.2 text-[8px] font-bold text-amber-300">
                                Transfer
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Station Inspector Box */}
              {currentStations[selectedStationIndex] && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-md"
                        style={{ backgroundColor: activeThemeColor }}
                      >
                        #{selectedStationIndex + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            {currentStations[selectedStationIndex].name}
                          </h4>
                          <span className="text-xs text-slate-400 font-normal">
                            ({currentStations[selectedStationIndex].tamil})
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {currentStations[selectedStationIndex].desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-slate-300">
                        Station {selectedStationIndex + 1} of {currentStations.length}
                      </span>
                      <span className="rounded-lg bg-emerald-500/10 text-emerald-400 px-2.5 py-1 border border-emerald-500/20">
                        Platform Screen Doors Equipped
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
