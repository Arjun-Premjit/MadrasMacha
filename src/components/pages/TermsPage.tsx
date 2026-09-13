import React from 'react';
import { FileText, AlertTriangle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TermsPageProps {
  onBack?: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-24 px-6 sm:px-12 max-w-4xl mx-auto font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <div className="pb-8 border-b border-black/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-xs font-semibold uppercase tracking-wider text-black/70 mb-4">
          <FileText className="w-3.5 h-3.5" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black">
          Terms of Service
        </h1>
        <p className="mt-3 text-base sm:text-lg text-black/70 leading-relaxed max-w-2xl">
          Please read these terms carefully prior to using the MadrasMacha Chennai public transit directory, timetable viewer, and journey planner.
        </p>
        <p className="mt-2 text-xs font-mono text-neutral-400">
          Effective: September 2026 · Static GTFS Schedule Edition
        </p>
      </div>

      {/* Terms Sections */}
      <div className="pt-10 space-y-8">
        {/* Section 1: Accuracy & Scope of Transit Data */}
        <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              1. Accuracy &amp; Scope of Transit Data
            </h2>
          </div>
          <p className="text-sm sm:text-base text-black/75 leading-relaxed">
            MadrasMacha compiles schedule, route, stop, and calendar data from published static General Transit Feed Specification (GTFS) tables for Chennai transit networks, including Metropolitan Transport Corporation (MTC) bus routes and Chennai Metro Rail Limited (CMRL) corridors.
          </p>
          <p className="mt-3 text-sm sm:text-base text-black/75 leading-relaxed">
            While every effort is made to accurately reflect published GTFS database records, public transit operations are inherently subject to day-to-day modifications. Factors such as road construction, Chennai weather conditions, traffic congestion along major arterial roads (GST Road, OMR, Mount Road), special event diversions, bus breakdown maintenance, and unscheduled service cancellations by operating authorities may cause real-world transit movements to vary from published schedules.
          </p>
        </div>

        {/* Section 2: Scheduled Timetables vs. Real-Time Operations */}
        <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              2. Scheduled Timetables vs. Real-Time Operations
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs sm:text-sm mb-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <strong className="font-semibold block mb-0.5">Important Transit Notice:</strong>
              MadrasMacha currently uses static GTFS schedule data to provide route, stop, trip, and timetable information. The application does not currently integrate GTFS-Realtime (GTFS-RT), Automatic Vehicle Location (AVL) GPS telemetry, live vehicle congestion feeds, or active delay alerts.
            </div>
          </div>
          <p className="text-sm sm:text-base text-black/75 leading-relaxed">
            Departure times, journey durations, and interval estimates are calculated based solely on planned GTFS timetables. Commuters must never assume that a scheduled time guarantees immediate vehicle arrival at any given stop. Please allow adequate transit buffer times for your journeys.
          </p>
        </div>

        {/* Section 3: Limitation of Liability */}
        <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              3. Limitation of Liability
            </h2>
          </div>
          <p className="text-sm sm:text-base text-black/75 leading-relaxed">
            MadrasMacha is an independent, non-commercial public utility provided free of charge on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-black/75">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></span>
              <span><strong>No Consequential Damages:</strong> Under no circumstances shall MadrasMacha, its developers, contributors, or affiliated transit agencies be held liable for any missed connections, delayed arrivals, employment disruptions, lost business opportunities, transportation expenses, or emotional distress arising from reliance on information presented on this platform.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></span>
              <span><strong>Official Announcements Prevail:</strong> For time-critical travel (including airport connections, railway departures from Chennai Central or Egmore, and examinations), commuters are strongly advised to check official station displays, announcements, or transit operator helplines.</span>
            </li>
          </ul>
        </div>

        {/* Section 4: Acceptable Use */}
        <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              4. Acceptable Use &amp; Platform Availability
            </h2>
          </div>
          <p className="text-sm sm:text-base text-black/75 leading-relaxed">
            You agree to use MadrasMacha exclusively for lawful personal travel planning, transit research, and civic engagement. You agree not to:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-black/75">
            <li>• Execute automated denial-of-service or high-frequency query flooding against our database or API endpoints.</li>
            <li>• Attempt unauthorized access to restricted backend configurations or server environments.</li>
            <li>• Misrepresent or alter GTFS timetable outputs when reproducing transit schedules for third parties.</li>
          </ul>
        </div>

        {/* Section 5: Authority Disclaimers */}
        <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              5. Non-Affiliation &amp; Ticketing Disclaimer
            </h2>
          </div>
          <p className="text-sm sm:text-base text-black/75 leading-relaxed">
            MadrasMacha is an independent civic platform. We are not officially operated by Metropolitan Transport Corporation (MTC) Chennai, Chennai Metro Rail Limited (CMRL), or Southern Railway. We do not sell transit tickets, top up travel smart cards, or collect passenger fares. Ticketing transactions must be conducted through authorized official agency counters, conductors, or designated official ticketing applications.
          </p>
        </div>
      </div>
    </div>
  );
};
