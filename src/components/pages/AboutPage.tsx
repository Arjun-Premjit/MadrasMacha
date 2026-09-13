import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pt-28 pb-24 px-6 sm:px-12 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="pb-8">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-black">
          About
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-black/75 leading-relaxed">
          MadrasMacha is an open-source public transit infrastructure designed to unify Chennai's multimodal transportation networks into a single, accessible digital feed.
        </p>
      </div>

      {/* Narrative Sections */}
      <div className="pt-8 space-y-12">
        {/* Paragraph 1: The Vision */}
        <div className="p-8 rounded-2xl bg-white border border-black/10 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
            One city. Different ways to move.
          </h2>
          <p className="text-base text-black/70 leading-relaxed">
            Chennai is home to over eleven million residents across 1,189 square kilometers. Daily travel relies on an intricate combination of MTC bus corridors, Chennai Metro Rail (CMRL), Suburban railway lines, and the MRTS. Historically, schedule and spatial data were siloed in isolated systems. MadrasMacha structures this information into a cohesive, interoperable graph.
          </p>
        </div>

        {/* Paragraph 2: GTFS Specification */}
        <div className="p-8 rounded-2xl bg-white border border-black/10 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
            Built on global transit standards.
          </h2>
          <p className="text-base text-black/70 leading-relaxed">
            The service implements the General Transit Feed Specification (GTFS), utilizing a relational PostgreSQL schema deployed on Supabase. The current deployment manages four foundational tables:
          </p>
          <ul className="mt-4 space-y-3 text-base text-black/80">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span><strong className="text-black font-semibold">agencies</strong> — Authority definitions for MTC and CMRL</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span><strong className="text-black font-semibold">routes</strong> — Bus and metro line corridors, classifications, and colors</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span><strong className="text-black font-semibold">stops</strong> — Geocoded bus terminuses and elevated/underground stations</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span><strong className="text-black font-semibold">calendar</strong> — Operating service periods, weekday frequencies, and schedules</span>
            </li>
          </ul>
        </div>

        {/* Paragraph 3: Static GTFS & Future Live Telemetry */}
        <div className="p-8 rounded-2xl bg-white border border-black/10 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
            Static GTFS Schedules &amp; Future GTFS-Realtime.
          </h2>
          <p className="text-base text-black/70 leading-relaxed">
            MadrasMacha currently uses static GTFS schedule data to provide route, stop, trip, and timetable information. The platform establishes a strict architectural boundary between static schedule data and live vehicle positions: live vehicle locations, GPS Automatic Vehicle Location (AVL) feeds, and GTFS-Realtime protocol buffers will be integrated in future phases.
          </p>
        </div>

        {/* Paragraph 4: CUMTA Alignment */}
        <div className="p-8 rounded-2xl bg-white border border-black/10 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
            Aligned with CUMTA goals.
          </h2>
          <p className="text-base text-black/70 leading-relaxed">
            Developed in harmony with the Chennai Unified Metropolitan Transport Authority (CUMTA) mission: creating an integrated, equitable, and sustainable transport ecosystem with single-ticketing and seamless multimodal interchanges.
          </p>
        </div>
      </div>
    </div>
  );
};
