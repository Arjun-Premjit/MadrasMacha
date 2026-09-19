import React from 'react';
import { ArrowLeft, Ticket, Train, Bus, Info, ShieldCheck } from 'lucide-react';
import { FareCalculator } from '../FareCalculator';
import { useLanguage } from '../../hooks/useLanguage';
import { LanguageToggle } from '../LanguageToggle';

interface FareCalculatorPageProps {
  onBack?: () => void;
  defaultMode?: 'metro' | 'mtc';
}

export const FareCalculatorPage: React.FC<FareCalculatorPageProps> = ({
  onBack,
  defaultMode = 'metro',
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto font-sans selection:bg-black selection:text-white">
      {/* Top Navigation & Language Switch */}
      <div className="flex items-center justify-between gap-4 mb-8">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'முகப்புக்குத் திரும்பு' : 'Back to Home'}</span>
          </button>
        ) : (
          <div />
        )}

        <LanguageToggle variant="pill" />
      </div>

      {/* Hero Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800 mb-3 shadow-xs">
          <Ticket className="w-3.5 h-3.5 text-sky-600" />
          <span>{language === 'ta' ? 'அதிகாரப்பூர்வ கட்டணங்கள்' : 'Official Published Tariffs'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-900 mb-3">
          {language === 'ta' ? 'சென்னை போக்குவரத்து கட்டணக் கால்குலேட்டர்' : 'Chennai Transit Fare Calculator'}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
          {language === 'ta'
            ? 'சென்னை மெட்ரோ மற்றும் மாநகரப் பேருந்துகளுக்கான (MTC) துல்லியமான கட்டணங்களைக் கணக்கிடுங்கள். அனைத்து தகவல்களும் அரசு அதிகாரப்பூர்வ கட்டண விதிகளின் அடிப்படையில் உள்ளன.'
            : 'Calculate authoritative fares for Chennai Metro Rail and Metropolitan Transport Corporation (MTC) buses. Based directly on official published government fare tables.'}
        </p>
      </div>

      {/* Main Interactive Fare Calculator */}
      <FareCalculator initialMode={defaultMode} className="mb-14" />

      {/* Transit Fare Guidelines & Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-neutral-200">
        {/* CMRL Info */}
        <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Train className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              {language === 'ta' ? 'சென்னை மெட்ரோ கட்டண விதிகள்' : 'Chennai Metro Rail Rules'}
            </h3>
          </div>
          <ul className="text-xs text-neutral-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-sky-600 font-bold">•</span>
              <span><strong>Distance-Based Slabs:</strong> Up to 2 km: ₹10, 2-5 km: ₹20, 5-12 km: ₹30, 12-21 km: ₹40, Beyond 21 km: ₹50.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-600 font-bold">•</span>
              <span><strong>Smart Cards & Store Value:</strong> 20% flat discount on single journey fares with Singara Chennai NCMC or CMRL Smart Cards.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-600 font-bold">•</span>
              <span><strong>Mobile QR Ticketing:</strong> 20% discount on QR tickets booked via CMRL mobile app or WhatsApp.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-600 font-bold">•</span>
              <span><strong>Sunday & Holiday Special:</strong> 50% discount on single journey counter token fares on Sundays and declared public holidays.</span>
            </li>
          </ul>
        </div>

        {/* MTC Info */}
        <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Bus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              {language === 'ta' ? 'MTC பேருந்து கட்டண முறைகள்' : 'MTC Bus Stage Fare Structure'}
            </h3>
          </div>
          <ul className="text-xs text-neutral-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Stage System:</strong> Fares are computed by stages where 1 stage is approximately 2 kilometers (approx. 2 bus stops).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Vidiyal Payanam Scheme:</strong> Free fare travel for women, transgender individuals, and differently-abled passengers in all Ordinary (White Board) buses.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Express Buses:</strong> 1.5x of the ordinary stage fare + ₹0.50. Operates as limited stop services along main corridors.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Deluxe Buses:</strong> 2x of ordinary base fare + ₹1.00. High-back cushioned seating with display boards.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
