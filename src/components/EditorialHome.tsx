import React from 'react';
import { MtcBus3D } from './MtcBus3D';
import { MetroTrain3D } from './MetroTrain3D';
import { PageView } from './Header';
import { ArrowRight, Bus, Train, Ticket, Radio, Languages } from 'lucide-react';
import { Footer } from './Footer';
import { JourneyPlanner } from './JourneyPlanner';
import { useLanguage } from '../hooks/useLanguage';

interface EditorialHomeProps {
  onNavigate: (page: PageView) => void;
  onSelectRoute?: (routeId: string) => void;
  onSelectStop?: (stopId: string) => void;
}

export const EditorialHome: React.FC<EditorialHomeProps> = ({
  onNavigate,
  onSelectRoute,
  onSelectStop,
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative w-full bg-[#FAFAFA] text-black overflow-x-hidden font-sans">
      {/* ─────────────────────────────────────────────────────────────
          BIG "MADRAS MACHA" OUTSIDE THE HEADER
          Clean, prominent, white/black and glassmorphism styling
          ───────────────────────────────────────────────────────────── */}
      <section className="pt-24 sm:pt-32 pb-4 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-black select-none">
          Madras Macha
        </h1>
        <p className="mt-3 max-w-xl text-sm sm:text-base text-black/60 font-medium">
          {language === 'ta'
            ? 'சென்னை மாநகர பேருந்துகள் (MTC) மற்றும் மெட்ரோ ரயில் பயணங்களுக்கான ஒருங்கிணைந்த வழிகாட்டி.'
            : 'Unified public transportation discovery for Chennai MTC buses, Suburban corridors, and Chennai Metro Rail.'}
        </p>

        {/* New Production Feature Highlights */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl text-left">
          {/* Feature 1: Bilingual Toggle Card */}
          <div
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:shadow-sm hover:border-black/20 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Languages className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                {language === 'ta' ? 'தமிழ்' : 'English'}
              </span>
            </div>
            <h3 className="text-xs font-bold text-neutral-900 group-hover:text-black">
              {language === 'ta' ? 'இருமொழி நிலையப் பெயர்கள்' : 'Bilingual Station Names'}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {language === 'ta' ? 'ஆங்கிலம் / தமிழ் பெயர்களை உடனுக்குடன் மாற்றவும்' : 'Instant Tamil / English stop name toggle'}
            </p>
          </div>

          {/* Feature 2: Official Fare Calculator Card */}
          <div
            onClick={() => onNavigate('fare')}
            className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:shadow-sm hover:border-black/20 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                Official
              </span>
            </div>
            <h3 className="text-xs font-bold text-neutral-900 group-hover:text-black">
              {language === 'ta' ? 'அதிகாரப்பூர்வ கட்டணக் கால்குலேட்டர்' : 'Official Fare Calculator'}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {language === 'ta' ? 'மெட்ரோ தொலைவு & MTC நிலை கட்டணங்கள்' : 'CMRL track slabs & MTC stage fares'}
            </p>
          </div>

          {/* Feature 3: Live GTFS-RT Tracking Card */}
          <div
            onClick={() => onNavigate('routes')}
            className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:shadow-sm hover:border-black/20 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                GTFS-RT
              </span>
            </div>
            <h3 className="text-xs font-bold text-neutral-900 group-hover:text-black">
              {language === 'ta' ? 'நேரடி பேருந்து கண்காணிப்பு' : 'Live GTFS-RT Bus Tracker'}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {language === 'ta' ? 'CUMTA திறந்தநிலை நேரடி தரவு' : 'Verified CUMTA open realtime feed'}
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PROMINENT PLAN YOUR JOURNEY ENGINE (Requirement #8)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-6 px-6 sm:px-12 max-w-7xl mx-auto">
        <JourneyPlanner
          onSelectRoute={onSelectRoute}
          onSelectStop={onSelectStop}
        />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          MTC SECTION: PURE MTC WITH LEFT-TO-RIGHT ANIMATION
          ───────────────────────────────────────────────────────────── */}
      <section
        id="mtc-section"
        className="relative flex flex-col justify-center py-12 sm:py-16 px-6 sm:px-12 max-w-7xl mx-auto"
      >
        <div className="w-full mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-6xl sm:text-8xl md:text-9xl font-light tracking-tight text-black">
                MTC
              </h2>
              <p className="mt-4 max-w-2xl text-lg sm:text-xl text-black/75 font-normal leading-relaxed">
                Over three thousand buses across eight hundred routes connecting North and South Chennai, GST Road, Koyambedu, and the coastal IT corridors.
              </p>
            </div>

            <div className="shrink-0 flex items-center">
              <button
                onClick={() => onNavigate('mtc')}
                className="rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-base px-8 py-4 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl flex items-center gap-3 cursor-pointer"
              >
                <Bus className="w-5 h-5 text-white" />
                <span>Explore MTC Fleet</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Authentic MTC Bus Photo with Decorative Watermark */}
        <div className="w-full my-6 flex justify-center overflow-visible">
          <div className="w-full max-w-5xl">
            <MtcBus3D isStatic={false} showWatermark={true} className="w-full" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          METRO SECTION: PURE METRO WITH DECORATIVE WATERMARK
          ───────────────────────────────────────────────────────────── */}
      <section
        id="metro-section"
        className="relative flex flex-col justify-center py-12 sm:py-16 px-6 sm:px-12 max-w-7xl mx-auto"
      >
        <div className="w-full mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-6xl sm:text-8xl md:text-9xl font-light tracking-tight text-black">
                Metro
              </h2>
              <p className="mt-4 max-w-2xl text-lg sm:text-xl text-black/75 font-normal leading-relaxed">
                Fifty-four kilometers of subterranean tunnels and elevated viaducts. Alstom Metropolis trainsets running every four minutes across Blue and Green lines.
              </p>
            </div>

            <div className="shrink-0 flex items-center">
              <button
                onClick={() => onNavigate('metro')}
                className="rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-base px-8 py-4 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl flex items-center gap-3 cursor-pointer"
              >
                <Train className="w-5 h-5 text-white" />
                <span>View Metro Rail</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Authentic Chennai Metro Photo with Decorative Watermark */}
        <div className="w-full my-6 flex justify-center overflow-visible">
          <div className="w-full max-w-5xl">
            <MetroTrain3D isStatic={false} showWatermark={true} className="w-full" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FOOTER WITH LIGHT GREY & REFERENCE WATERMARK MODEL
          ───────────────────────────────────────────────────────────── */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
