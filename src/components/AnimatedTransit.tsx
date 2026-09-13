import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Bus, Train, Zap, Compass, Pause, Play, Sparkles } from 'lucide-react';

export const AnimatedTransit: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const { scrollYProgress } = useScroll();

  // Scroll driven subtle parallax offsets
  const busScrollOffset = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const metroScrollOffset = useTransform(scrollYProgress, [0, 1], [0, -140]);

  return (
    <div id="animated-transit-banner" className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-5 shadow-2xl backdrop-blur-xl md:p-7">
      {/* Background Chennai Transit Grid Glow */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-emerald-600/15 blur-3xl" />

      {/* Header controls for animated banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-wide text-slate-200">
                Chennai Active Transit Motion
              </h3>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/30">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Flow Simulation
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Simulating Anna Salai Arterial MTC &amp; Metro Corridor 1
            </p>
          </div>
        </div>

        {/* Speed & Pause micro-controls */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-transit-animation"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause transit animation' : 'Play transit animation'}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            id="speed-toggle-btn"
            onClick={() => setSpeedMultiplier(prev => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1))}
            className="flex h-8 items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
            title="Cycle simulation speed"
          >
            <span>{speedMultiplier}x Speed</span>
          </button>
        </div>
      </div>

      {/* TRACK 1: CHENNAI METRO (BLUE LINE) */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-sky-400">
            <Train className="h-3.5 w-3.5" />
            <span>Chennai Metro (Blue Line • Elevated Viaduct)</span>
          </div>
          <span className="text-slate-400 font-mono">Wimco Nagar ⇄ Airport • 80 km/h max</span>
        </div>

        {/* Metro Rail Track with Train */}
        <div className="relative h-14 w-full overflow-hidden rounded-xl border border-sky-900/40 bg-slate-950/80 p-1.5">
          {/* Overhead catenary wire */}
          <div className="absolute top-2 left-0 right-0 h-px bg-sky-500/20 border-t border-dashed border-sky-400/40" />
          
          {/* Steel Rail Track */}
          <div className="absolute bottom-3 left-0 right-0 h-1.5 bg-slate-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400/30 to-transparent animate-pulse" />
          </div>

          {/* Station Markers on Track */}
          <div className="absolute bottom-5 left-[12%] text-[10px] text-slate-500 font-mono">Central</div>
          <div className="absolute bottom-5 left-[48%] text-[10px] text-sky-400/80 font-mono font-semibold">Alandur (Transfer)</div>
          <div className="absolute bottom-5 right-[10%] text-[10px] text-slate-500 font-mono">Airport</div>

          {/* Animated CMRL 4-Car Train */}
          <motion.div
            className="absolute bottom-2 flex items-center"
            style={{ x: metroScrollOffset }}
            animate={
              isPlaying
                ? {
                    left: ['-25%', '105%'],
                  }
                : {}
            }
            transition={{
              duration: 12 / speedMultiplier,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* CMRL Train Model */}
            <div className="flex items-center rounded-lg border border-sky-400/50 bg-gradient-to-r from-sky-900 via-sky-600 to-slate-200 px-3 py-1 shadow-lg shadow-sky-500/20">
              <div className="mr-2 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-ping" />
                <span className="text-[11px] font-bold text-white tracking-wider">CMRL-01</span>
              </div>
              <div className="flex gap-1">
                <div className="h-3 w-4 rounded-sm bg-sky-200/40 border border-sky-300/60" />
                <div className="h-3 w-4 rounded-sm bg-sky-200/40 border border-sky-300/60" />
                <div className="h-3 w-4 rounded-sm bg-sky-200/40 border border-sky-300/60" />
              </div>
              <div className="ml-2 flex items-center">
                <div className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_8px_#fde047]" title="Front Headlight" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* TRACK 2: MTC BUS ARTERIAL ROAD (ROUTE 21G & 570) */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-rose-400">
            <Bus className="h-3.5 w-3.5" />
            <span>MTC Chennai City Transit (Anna Salai / OMR Expressway)</span>
          </div>
          <span className="text-slate-400 font-mono">Broadway ⇄ Tambaram • Route 21G</span>
        </div>

        {/* Asphalt Roadway with Bus */}
        <div className="relative h-14 w-full overflow-hidden rounded-xl border border-rose-900/30 bg-slate-950/90 p-1.5">
          {/* Road markings (dashed white center lane) */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 border-t border-dashed border-slate-600/70" />
          
          {/* Bus stops along roadway */}
          <div className="absolute bottom-1.5 left-[18%] flex items-center gap-1 text-[10px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span>Adyar Depot</span>
          </div>
          <div className="absolute bottom-1.5 left-[58%] flex items-center gap-1 text-[10px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span>Guindy Kathipara</span>
          </div>

          {/* Animated MTC Red Bus */}
          <motion.div
            className="absolute top-2 flex items-center"
            style={{ x: busScrollOffset }}
            animate={
              isPlaying
                ? {
                    left: ['-20%', '105%'],
                  }
                : {}
            }
            transition={{
              duration: 16 / speedMultiplier,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {/* Chennai MTC Bus Chassis */}
            <div className="flex items-center rounded-md border border-rose-500/60 bg-gradient-to-r from-red-700 via-rose-600 to-amber-100 p-1.5 shadow-md shadow-rose-900/30">
              <div className="flex items-center gap-1.5 pr-2">
                <span className="rounded bg-black/80 px-1 py-0.5 text-[9px] font-black text-amber-300 font-mono">
                  21G
                </span>
                <span className="text-[10px] font-bold text-white">MTC CHENNAI</span>
              </div>
              <div className="flex gap-1 pr-1.5">
                <div className="h-2.5 w-3 rounded-xs bg-slate-900/60" />
                <div className="h-2.5 w-3 rounded-xs bg-slate-900/60" />
                <div className="h-2.5 w-3 rounded-xs bg-slate-900/60" />
              </div>
              {/* Bus wheels */}
              <div className="flex items-center gap-4 -mb-3.5 -ml-12">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-900 border border-slate-600" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-900 border border-slate-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom info ticker */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-800/60 pt-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Integrated CUMTA multimodal network: MTC feeder services synchronized at all 41 CMRL stations.</span>
        </div>
        <div className="font-mono text-slate-400">
          Peak Headway: Metro 5m • MTC 4-8m
        </div>
      </div>
    </div>
  );
};
