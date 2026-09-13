import React from 'react';
import { Shield, Clock, Database, ExternalLink, Lock, EyeOff } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-24 px-6 sm:px-12 max-w-4xl mx-auto font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <div className="pb-8 border-b border-black/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-xs font-semibold uppercase tracking-wider text-black/70 mb-4">
          <Shield className="w-3.5 h-3.5" />
          <span>Privacy Disclosure</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black">
          Transit Privacy Policy
        </h1>
        <p className="mt-3 text-base sm:text-lg text-black/70 leading-relaxed max-w-2xl">
          MadrasMacha is an open-source public transit directory and routing utility for Chennai. This policy explains our commitment to commuter data privacy and zero personal data collection.
        </p>
        <p className="mt-2 text-xs font-mono text-neutral-400">
          Effective: September 2026 · Static GTFS Infrastructure
        </p>
      </div>

      {/* Policy Sections */}
      <div className="pt-10 space-y-8">
        {/* Section 1: Static GTFS Data Model */}
        <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              1. Static GTFS Public Transit Data
            </h2>
          </div>
          <p className="text-sm sm:text-base text-black/75 leading-relaxed">
            MadrasMacha operates exclusively as a read-only directory and schedule comparison tool. All transit information—including agencies, corridors, routes, bus stops, metro stations, and timetable stop times—is derived from public General Transit Feed Specification (GTFS) datasets. The application executes read-only queries against our cloud database hosted on Supabase without altering or appending any personal records.
          </p>
        </div>

        {/* Section 2: Local Device Time Usage */}
        <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              2. Device Time &amp; Schedule Calculation
            </h2>
          </div>
          <p className="text-sm sm:text-base text-black/75 leading-relaxed">
            To show relevant upcoming buses and metro departures, MadrasMacha inspects your device’s current system clock locally in the browser (synchronized with the Indian Standard Time <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono">Asia/Kolkata</code> zone, UTC+05:30).
          </p>
          <ul className="mt-4 space-y-2 text-sm text-black/75">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></span>
              <span>Your device time is evaluated strictly in-memory on your local browser.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></span>
              <span>No time stamp, search log, or commuter schedule query is transmitted to any tracking server or retained in any permanent storage.</span>
            </li>
          </ul>
        </div>

        {/* Section 3: No Personal Data Collection */}
        <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              3. Zero Personal Data Collection &amp; No Accounts
            </h2>
          </div>
          <p className="text-sm sm:text-base text-black/75 leading-relaxed">
            We believe public transit tools should respect commuter anonymity. MadrasMacha is built from the ground up without user accounts or tracking mechanisms:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5">
              <h4 className="font-bold text-black mb-1">No Accounts or Passwords</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                You do not need to register, log in, or provide your name, phone number, or email address to use any part of the service.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5">
              <h4 className="font-bold text-black mb-1">No Location Tracking</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                MadrasMacha does not request background geolocation permissions or store any record of commuter journeys or destinations.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5">
              <h4 className="font-bold text-black mb-1">No Advertising Cookies</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                We do not sell advertising space or inject behavioral advertising trackers, marketing pixels, or profiling scripts.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5">
              <h4 className="font-bold text-black mb-1">Anonymous Search</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Route searches and stop lookups are evaluated against public GTFS tables without logging commuter IP addresses or search histories.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Third-Party Transit Authorities */}
        <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <ExternalLink className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              4. External Authority Links &amp; Third-Party Services
            </h2>
          </div>
          <p className="text-sm sm:text-base text-black/75 leading-relaxed">
            The platform includes informational links and contact numbers for official Chennai transportation authorities, including:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-black/75">
            <li>• <strong>Metropolitan Transport Corporation (MTC) Chennai</strong>: mtcbus.tn.gov.in</li>
            <li>• <strong>Chennai Metro Rail Limited (CMRL)</strong>: chennaimetrorail.org</li>
            <li>• <strong>Chennai Unified Metropolitan Transport Authority (CUMTA)</strong>: cumta.tn.gov.in</li>
          </ul>
          <p className="mt-4 text-xs text-neutral-500 leading-relaxed">
            When you navigate to these external government or institutional websites, their respective terms and privacy statements apply.
          </p>
        </div>

        {/* Section 5: Security & Inquiries */}
        <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              5. Open-Source Inquiries
            </h2>
          </div>
          <p className="text-sm sm:text-base text-black/75 leading-relaxed">
            MadrasMacha is developed as a community public utility for Chennai commuters. For questions regarding the GTFS dataset, schema implementation, or privacy practices, commuters and developers can review the open-source repository or connect with the project maintainer via the LinkedIn profile linked in the footer.
          </p>
        </div>
      </div>
    </div>
  );
};
