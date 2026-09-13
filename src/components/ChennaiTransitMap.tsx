import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Layers } from 'lucide-react';

interface TransitHub {
  id: string;
  name: string;
  tamilName: string;
  type: 'Multimodal Interchange' | 'Metro Station' | 'Bus Terminus';
  lat: number;
  lng: number;
  routes: string[];
  desc: string;
}

export const CHENNAI_TRANSIT_HUBS: TransitHub[] = [
  {
    id: 'central',
    name: 'Puratchi Thalaivar Dr. M.G.R Central',
    tamilName: 'சென்னை சென்ட்ரல்',
    type: 'Multimodal Interchange',
    lat: 13.0827,
    lng: 80.2707,
    routes: ['Blue Line', 'Green Line', 'MTC 21G', 'MTC 11G', 'MTC 29C'],
    desc: 'Grand nexus uniting Indian Railways suburban/long-distance, Chennai Metro underground interchange, and MTC bus terminal.',
  },
  {
    id: 'koyambedu',
    name: 'CMBT Koyambedu Terminus & Metro',
    tamilName: 'கோயம்பேடு',
    type: 'Multimodal Interchange',
    lat: 13.0694,
    lng: 80.2056,
    routes: ['Green Line', 'MTC 570', 'MTC 70', 'MTC 101'],
    desc: 'Asia’s largest mofussil bus terminal connected directly to CMRL Green Line elevated concourse.',
  },
  {
    id: 'airport',
    name: 'Chennai International Airport (MAA)',
    tamilName: 'சென்னை விமான நிலையம்',
    type: 'Metro Station',
    lat: 12.9864,
    lng: 80.1654,
    routes: ['Blue Line', 'MTC 18D', 'MTC 21G AC'],
    desc: 'Seamless direct connection to domestic and international terminals via elevated metro walkway.',
  },
  {
    id: 'guindy',
    name: 'Guindy Junction & Industrial Estate',
    tamilName: 'கிண்டி',
    type: 'Multimodal Interchange',
    lat: 13.0067,
    lng: 80.2033,
    routes: ['Blue Line', 'MTC 21G', 'MTC 19B', 'MTC 54'],
    desc: 'High-density commuter intersection linking GST Road, Kathipara flyover junction, and industrial corridor.',
  },
  {
    id: 'broadway',
    name: 'Broadway Bus Terminus',
    tamilName: 'பிராட்வே',
    type: 'Bus Terminus',
    lat: 13.0878,
    lng: 80.2885,
    routes: ['MTC 21G', 'MTC 1A', 'MTC 2A', 'MTC 6'],
    desc: 'Historic northern terminus at George Town, connecting the port district and High Court.',
  },
  {
    id: 'tambaram',
    name: 'Tambaram Railway & Bus Hub',
    tamilName: 'தாம்பரம்',
    type: 'Multimodal Interchange',
    lat: 12.9249,
    lng: 80.1180,
    routes: ['MTC 21G', 'MTC 70', 'MTC 570S', 'Suburban South Line'],
    desc: 'Southern gateway to Chennai connecting GST Road suburban line and south-bound bus services.',
  },
];

export const ChennaiTransitMap: React.FC = () => {
  const [activeHub, setActiveHub] = useState<TransitHub>(CHENNAI_TRANSIT_HUBS[0]);
  const [mapZoom, setMapZoom] = useState<number>(15);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${activeHub.lat},${activeHub.lng}`;
  const embedUrl = `https://maps.google.com/maps?q=${activeHub.lat},${activeHub.lng}&z=${mapZoom}&output=embed`;

  return (
    <div className="w-full">
      {/* Glassmorphic Map Container */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/90 shadow-lg bg-white/80">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                <Compass className="w-3.5 h-3.5 text-sky-600" />
                Google Maps Live Navigation
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeHub.lat.toFixed(4)}° N, {activeHub.lng.toFixed(4)}° E
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{activeHub.name}</span>
              <span className="text-sm font-normal text-slate-500 font-sans">
                ({activeHub.tamilName})
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              {activeHub.desc}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Hubs Selector Chips */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200/60 bg-slate-50/70 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Transit Hubs:
          </span>
          {CHENNAI_TRANSIT_HUBS.map((hub) => {
            const isSelected = activeHub.id === hub.id;
            return (
              <button
                key={hub.id}
                onClick={() => setActiveHub(hub)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white font-medium shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                <MapPin className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{hub.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Google Map Embed */}
        <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-100">
          <iframe
            title={`Google Map - ${activeHub.name}`}
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full filter contrast-[1.02]"
          />

          {/* Floating Connected Routes Glass Badge */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md glass-card p-3 rounded-xl border border-slate-200/90 shadow-md bg-white/90 backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-600 block mb-1.5 uppercase tracking-wider">
              Connected Lines &amp; Trunk Corridors:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeHub.routes.map((rt) => (
                <span
                  key={rt}
                  className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {rt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
