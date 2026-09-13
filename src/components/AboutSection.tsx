import React from 'react';
import { Cloud, Database, Cpu, Compass, Layers, GitBranch, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative py-14 sm:py-20 border-t border-slate-800/80 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-sky-400 border border-blue-500/20">
            Open Transit Infrastructure
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            About Chennai Transit Cloud
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
            Unifying Chennai’s multimodal public transport ecosystem under the General Transit Feed Specification (GTFS) open standard, built for Chennai citizens, commuters, and mobility developers.
          </p>
        </div>

        {/* Feature & Architecture Bento Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: CUMTA Vision */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">
                Multimodal CUMTA Alignment
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Designed to realize the Chennai Unified Metropolitan Transport Authority (CUMTA) goal of seamless single-journey interchange between MTC city buses, CMRL Metro Rail, Suburban local trains, and MRTS.
              </p>
            </div>
            <div className="mt-6 border-t border-slate-800 pt-3 text-xs text-sky-400 font-semibold flex items-center justify-between">
              <span>Integrated Ticketing Ready</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
          </div>

          {/* Card 2: Supabase GTFS Schema */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">
                PostgreSQL GTFS Schema
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Connected directly to Supabase with native GTFS tables: <code>agencies</code>, <code>routes</code>, <code>stops</code>, and <code>calendar</code>. Architected for zero-downtime additions of <code>trips</code> and <code>stop_times</code> tables.
              </p>
            </div>
            <div className="mt-6 border-t border-slate-800 pt-3 text-xs text-emerald-400 font-mono flex items-center justify-between">
              <span>Postgres + PostGIS Compatible</span>
              <GitBranch className="h-4 w-4" />
            </div>
          </div>

          {/* Card 3: Future Live Telemetry */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">
                GTFS-Realtime (GTFS-RT)
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Clear architectural distinction between static timetables and live telemetry. The data ingestion engine is prepared for real-time Protocol Buffer vehicle positions and arrival predictions.
              </p>
            </div>
            <div className="mt-6 border-t border-slate-800 pt-3 text-xs text-purple-400 font-semibold flex items-center justify-between">
              <span>Phase 2 Live GPS Feed Hook</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
