import React, { useState, useMemo } from 'react';
import {
  Train,
  Bus,
  ArrowRight,
  ArrowUpDown,
  Check,
  ShieldCheck,
  Tag,
  Info,
  Sparkles,
  Ticket,
  CreditCard,
  QrCode,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import {
  CMRL_STATIONS,
  getMetroFare,
  MetroFareProduct,
  MetroFareResult,
} from '../lib/services/metroFareService';
import {
  getMtcFare,
  MtcServiceType,
  MtcFareResult,
} from '../lib/services/mtcFareService';

interface FareCalculatorProps {
  initialMode?: 'metro' | 'mtc';
  className?: string;
}

// Major MTC reference stops for stop picker
const POPULAR_MTC_STOPS = [
  'Broadway Bus Terminus',
  'Puratchi Thalaivar Dr. M.G.R Central',
  'T. Nagar (Panagal Park)',
  'Guindy Station',
  'Adyar Depot',
  'Tambaram Bus Terminus',
  'CMBT Koyambedu',
  'Velachery Bus Terminus',
  'Thiruvanmiyur Bus Depot',
  'Sholinganallur IT Junction',
  'Siruseri SIPCOT I.T. Park',
  'Perambur Bus Stand',
  'Poonamallee Bus Terminus',
  'Ambattur O.T.',
  'Avadi Bus Terminus',
  'Chromepet',
  'Medavakkam Koot Road',
  'Mylapore Luz Corner',
  'Marina Beach',
  'Besant Nagar',
];

export const FareCalculator: React.FC<FareCalculatorProps> = ({
  initialMode = 'metro',
  className = '',
}) => {
  const { language, getStopName, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'metro' | 'mtc'>(initialMode);

  // --- CMRL Metro State ---
  const [metroOrigin, setMetroOrigin] = useState<string>('CMRL_22'); // Guindy
  const [metroDest, setMetroDest] = useState<string>('CMRL_26'); // Airport
  const [metroProduct, setMetroProduct] = useState<MetroFareProduct>('token');

  // --- MTC Bus State ---
  const [mtcOrigin, setMtcOrigin] = useState<string>('Guindy Station');
  const [mtcDest, setMtcDest] = useState<string>('Tambaram Bus Terminus');
  const [mtcStageCount, setMtcStageCount] = useState<number>(4);
  const [mtcServiceType, setMtcServiceType] = useState<MtcServiceType>('ordinary');

  // Swap handler for Metro
  const handleSwapMetro = () => {
    setMetroOrigin(metroDest);
    setMetroDest(metroOrigin);
  };

  // Swap handler for MTC
  const handleSwapMtc = () => {
    setMtcOrigin(mtcDest);
    setMtcDest(mtcOrigin);
  };

  // Metro Fare Calculation
  const metroResult: MetroFareResult | null = useMemo(() => {
    if (!metroOrigin || !metroDest) return null;
    return getMetroFare(metroOrigin, metroDest, metroProduct);
  }, [metroOrigin, metroDest, metroProduct]);

  // MTC Fare Calculation
  const mtcResult: MtcFareResult = useMemo(() => {
    return getMtcFare({
      originStopName: mtcOrigin,
      destinationStopName: mtcDest,
      stageCount: mtcStageCount,
      serviceType: mtcServiceType,
    });
  }, [mtcOrigin, mtcDest, mtcStageCount, mtcServiceType]);

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Container Box */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 md:p-8 bg-neutral-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-neutral-200 text-xs font-semibold tracking-wide backdrop-blur-md">
                <Ticket className="w-3.5 h-3.5 text-sky-400" />
                {t('fare_calculator')}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Official Govt Tariffs
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {language === 'ta' ? 'அதிகாரப்பூர்வ கட்டணக் கால்குலேட்டர்' : 'Official Transit Fare Calculator'}
            </h2>
            <p className="text-sm text-neutral-300 mt-1 max-w-xl">
              {language === 'ta'
                ? 'சென்னை மெட்ரோ மற்றும் மாநகரப் பேருந்து (MTC) கட்டணங்களை துல்லியமாக கணக்கிடுங்கள்.'
                : 'Accurate fare calculation for Chennai Metro Rail & MTC buses driven strictly by official published fare tables.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center bg-neutral-800/90 p-1.5 rounded-2xl border border-neutral-700/60 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('metro')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'metro'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Train className="w-4 h-4" />
              <span>{t('metro_fare')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mtc')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mtc'
                  ? 'bg-amber-500 text-neutral-950 shadow-md font-extrabold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>{t('mtc_fare')}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8">
          {/* ======================================================= */}
          {/* TAB 1: CHENNAI METRO CALCULATOR */}
          {/* ======================================================= */}
          {activeTab === 'metro' && (
            <div className="space-y-8">
              {/* Origin & Destination Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-end">
                {/* Origin */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                    {t('origin_station')}
                  </label>
                  <select
                    value={metroOrigin}
                    onChange={(e) => setMetroOrigin(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-neutral-50/70 text-sm font-semibold text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition cursor-pointer"
                  >
                    {CMRL_STATIONS.map((st) => (
                      <option key={`orig-${st.id}`} value={st.id}>
                        {language === 'ta'
                          ? `${getStopName(st.name, st.id)} (${st.name})`
                          : `${st.name} [${st.line === 'blue' ? 'Blue' : 'Green'}]`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={handleSwapMetro}
                    className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 hover:text-neutral-900 shadow-xs transition cursor-pointer"
                    title="Swap Stations"
                    aria-label="Swap origin and destination stations"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                    {t('destination_station')}
                  </label>
                  <select
                    value={metroDest}
                    onChange={(e) => setMetroDest(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-neutral-50/70 text-sm font-semibold text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition cursor-pointer"
                  >
                    {CMRL_STATIONS.map((st) => (
                      <option key={`dest-${st.id}`} value={st.id}>
                        {language === 'ta'
                          ? `${getStopName(st.name, st.id)} (${st.name})`
                          : `${st.name} [${st.line === 'blue' ? 'Blue' : 'Green'}]`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ticket Product Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-2.5 uppercase tracking-wider">
                  {t('ticket_type')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'token' as MetroFareProduct,
                      name: language === 'ta' ? 'டோக்கன் / காகித QR' : 'Token / Paper QR',
                      badge: 'Standard',
                      icon: Ticket,
                    },
                    {
                      id: 'store_value' as MetroFareProduct,
                      name: language === 'ta' ? 'ஸ்மார்ட் கார்டு (Store Value)' : 'Smart Card / Store Value',
                      badge: '20% OFF',
                      icon: CreditCard,
                    },
                    {
                      id: 'mobile_qr' as MetroFareProduct,
                      name: language === 'ta' ? 'மொபைல் QR (App / WhatsApp)' : 'Mobile QR (CMRL / WhatsApp)',
                      badge: '20% OFF',
                      icon: QrCode,
                    },
                    {
                      id: 'holiday_special' as MetroFareProduct,
                      name: language === 'ta' ? 'ஞாயிறு / விடுமுறை டிக்கெட்' : 'Sunday / Holiday Special',
                      badge: '50% OFF',
                      icon: Calendar,
                    },
                    {
                      id: 'tourist_card' as MetroFareProduct,
                      name: language === 'ta' ? '1-நாள் சுற்றுலா அட்டை' : '1-Day Unlimited Tourist Card',
                      badge: '₹100 Unlimited',
                      icon: Sparkles,
                    },
                    {
                      id: 'group_qr' as MetroFareProduct,
                      name: language === 'ta' ? 'குழு QR டிக்கெட் (20+ நபர்கள்)' : 'Group QR (20+ Travelers)',
                      badge: '20% Group OFF',
                      icon: Tag,
                    },
                  ].map((item) => {
                    const isSelected = metroProduct === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMetroProduct(item.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/60 ring-2 ring-sky-500/20 shadow-xs'
                            : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 ${
                              isSelected ? 'text-sky-600' : 'text-neutral-500'
                            }`}
                          />
                          <span className="text-xs font-semibold text-neutral-900">
                            {item.name}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-sky-600 text-white'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Metro Result Card */}
              {metroResult && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-neutral-900 text-white shadow-lg space-y-6">
                  {/* Stations summary line */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                    <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-white">
                      <span>
                        {language === 'ta'
                          ? metroResult.originStation.nameTamil
                          : metroResult.originStation.name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>
                        {language === 'ta'
                          ? metroResult.destinationStation.nameTamil
                          : metroResult.destinationStation.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <span className="font-mono">
                        {metroResult.distanceKm.toFixed(1)} km track distance
                      </span>
                    </div>
                  </div>

                  {/* Pricing highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Final applicable fare */}
                    <div className="p-4 rounded-xl bg-white/10 border border-white/15">
                      <span className="text-xs font-medium text-neutral-300 block mb-1">
                        {t('fare_result')}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-black text-sky-400">
                          ₹{metroResult.finalFare}
                        </span>
                        {metroResult.isDiscounted && (
                          <span className="text-sm text-neutral-400 line-through">
                            ₹{metroResult.standardFare}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-300 block mt-1">
                        {metroProduct === 'tourist_card'
                          ? 'Valid for full 1-day unlimited travel'
                          : 'Per passenger single journey'}
                      </span>
                    </div>

                    {/* Regular fare */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-xs font-medium text-neutral-400 block mb-1">
                        {t('regular_fare')} (Token)
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold text-neutral-200">
                        ₹{metroResult.standardFare}
                      </span>
                      <span className="text-[11px] text-neutral-400 block mt-1">
                        Standard paper QR / counter token
                      </span>
                    </div>

                    {/* Discount & Savings */}
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-xs font-medium text-emerald-300 block mb-1">
                        {t('discount')}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
                          {metroResult.discountPercent}% OFF
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-300/80 block mt-1">
                        {metroResult.savingsAmount > 0
                          ? `Saves ₹${metroResult.savingsAmount} on this trip`
                          : 'Standard tariff rate'}
                      </span>
                    </div>
                  </div>

                  {/* All Product Comparison Table */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                      Complete CMRL Product Tariff Breakdown
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {metroResult.productBreakdown.map((item) => (
                        <div
                          key={item.productId}
                          className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition ${
                            item.productId === metroProduct
                              ? 'bg-sky-950/60 border-sky-500/60 text-white'
                              : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-neutral-200">
                              {language === 'ta' ? item.nameTamil : item.name}
                            </span>
                            <span className="font-bold text-sm text-sky-400">
                              ₹{item.fare}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400">
                            {item.notes}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Official Citation Footer */}
                  <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {t('source_citation_cmrl')}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500">
                      {metroResult.lastUpdated}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 2: MTC BUS FARE CALCULATOR */}
          {/* ======================================================= */}
          {activeTab === 'mtc' && (
            <div className="space-y-8">
              {/* Origin & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-end">
                {/* Origin Stop */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                    {language === 'ta' ? 'புறப்படும் பேருந்து நிறுத்தம்' : 'Origin Bus Stop'}
                  </label>
                  <select
                    value={mtcOrigin}
                    onChange={(e) => setMtcOrigin(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-neutral-50/70 text-sm font-semibold text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition cursor-pointer"
                  >
                    {POPULAR_MTC_STOPS.map((st) => (
                      <option key={`mtc-orig-${st}`} value={st}>
                        {language === 'ta' ? `${getStopName(st)} (${st})` : st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={handleSwapMtc}
                    className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 hover:text-neutral-900 shadow-xs transition cursor-pointer"
                    title="Swap Stops"
                    aria-label="Swap origin and destination bus stops"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Destination Stop */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                    {language === 'ta' ? 'சேரும் பேருந்து நிறுத்தம்' : 'Destination Bus Stop'}
                  </label>
                  <select
                    value={mtcDest}
                    onChange={(e) => setMtcDest(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-neutral-50/70 text-sm font-semibold text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition cursor-pointer"
                  >
                    {POPULAR_MTC_STOPS.map((st) => (
                      <option key={`mtc-dest-${st}`} value={st}>
                        {language === 'ta' ? `${getStopName(st)} (${st})` : st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stage Count Stepper (MTC Methodology: 1 stage ≈ 2 km) */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">
                    {language === 'ta' ? 'கட்டண நிலைகள் (MTC Stages)' : 'MTC Fare Stage Count'}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {language === 'ta'
                      ? '1 நிலை = சுமார் 2 கி.மீ அல்லது 2-3 பேருந்து நிறுத்தங்கள்.'
                      : '1 MTC Stage ≈ 2 km (or approx 2-3 stops along route sequence).'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white border border-neutral-300 rounded-xl overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => setMtcStageCount((prev) => Math.max(1, prev - 1))}
                      className="px-3.5 py-2 text-neutral-700 hover:bg-neutral-100 font-bold text-sm cursor-pointer transition"
                      aria-label="Decrease stages"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-xs font-bold text-neutral-900 font-mono">
                      Stage {mtcStageCount} (~{mtcStageCount * 2} km)
                    </span>
                    <button
                      type="button"
                      onClick={() => setMtcStageCount((prev) => Math.min(28, prev + 1))}
                      className="px-3.5 py-2 text-neutral-700 hover:bg-neutral-100 font-bold text-sm cursor-pointer transition"
                      aria-label="Increase stages"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Service Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-2.5 uppercase tracking-wider">
                  {t('service_type')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    {
                      id: 'ordinary' as MtcServiceType,
                      name: language === 'ta' ? 'சாதாரண பேருந்து (வெள்ளை போர்டு)' : 'Ordinary (White Board)',
                      tag: 'Vidiyal Payanam Free',
                    },
                    {
                      id: 'express' as MtcServiceType,
                      name: language === 'ta' ? 'விரைவுப் பேருந்து (பச்சை போர்டு)' : 'Express (Green Board)',
                      tag: '1.5x Base',
                    },
                    {
                      id: 'deluxe' as MtcServiceType,
                      name: language === 'ta' ? 'டீலக்ஸ் பேருந்து (நீல போர்டு)' : 'Deluxe (Blue Board)',
                      tag: '2x Base',
                    },
                    {
                      id: 'ac_volvo' as MtcServiceType,
                      name: language === 'ta' ? 'குளிர்சாதனம் (AC Volvo)' : 'AC Electric / Volvo',
                      tag: 'Premium',
                    },
                  ].map((item) => {
                    const isSelected = mtcServiceType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMtcServiceType(item.id)}
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/70'
                        }`}
                      >
                        <span className="text-xs font-bold text-neutral-900 mb-1">
                          {item.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block self-start ${
                            isSelected
                              ? 'bg-amber-600 text-white'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {item.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MTC Result Card */}
              <div className="p-6 rounded-2xl bg-neutral-950 text-white shadow-lg space-y-6">
                {/* Route Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-white">
                    <span>
                      {language === 'ta'
                        ? mtcResult.originStopTamil
                        : mtcResult.originStopName}
                    </span>
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {language === 'ta'
                        ? mtcResult.destinationStopTamil
                        : mtcResult.destinationStopName}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-400 font-mono">
                    Stage {mtcResult.stageCount} · Approx {mtcResult.approxDistanceKm} km
                  </div>
                </div>

                {/* Main pricing highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Selected service fare */}
                  <div className="p-4 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-xs font-medium text-neutral-300 block mb-1">
                      {language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட கட்டணம்' : 'Applicable Ticket Fare'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-amber-400">
                        ₹{mtcResult.fare.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-300 block mt-1">
                      Standard adult single trip ticket
                    </span>
                  </div>

                  {/* Vidiyal Payanam highlight */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 mb-1">
                        <Check className="w-3.5 h-3.5" />
                        {language === 'ta' ? mtcResult.womenFreeScheme.schemeNameTamil : mtcResult.womenFreeScheme.schemeName}
                      </span>
                      <p className="text-xs text-emerald-200/90 mt-1">
                        {language === 'ta'
                          ? 'விடியல் பயணம் திட்டத்தின் கீழ், அனைத்து சாதாரண (வெள்ளை போர்டு) பேருந்துகளிலும் பெண்களுக்கு முழு கட்டண விலக்கு அளிக்கப்பட்டுள்ளது.'
                          : '100% Free bus travel for women, transgender persons, and differently-abled citizens on all Ordinary (White Board) buses.'}
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-semibold mt-2">
                      Ordinary Fare: ₹0 for eligible passengers
                    </span>
                  </div>
                </div>

                {/* Service Comparison Cards */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                    All MTC Service Categories for Stage {mtcResult.stageCount}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {mtcResult.serviceComparison.map((svc) => (
                      <div
                        key={svc.serviceType}
                        className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between transition ${
                          svc.serviceType === mtcServiceType
                            ? 'bg-amber-950/60 border-amber-500/60 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-bold text-neutral-200">
                              {language === 'ta' ? svc.nameTamil : svc.name}
                            </span>
                          </div>
                          <span className="text-xl font-black text-amber-400 block my-1">
                            ₹{svc.fare.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 mt-2 block">
                          {svc.specialNotes}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Citation footer */}
                <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {t('source_citation_mtc')}
                  </span>
                  <span className="font-mono text-[10px] text-neutral-500">
                    {mtcResult.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
