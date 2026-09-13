import React from 'react';
import { ExternalLink } from 'lucide-react';
import { PageView } from './Header';

interface FooterProps {
  onNavigate?: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative bg-[#EFF1F4] text-neutral-800 pt-16 pb-12 overflow-hidden font-sans border-t border-black/5">
      {/* ─────────────────────────────────────────────────────────────
          "madras macha" WATERMARK ALIGNED HIGHER
          Subtle light dark grey layer aligned higher behind the content
          ───────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute bottom-4 sm:bottom-8 md:bottom-12 left-0 right-0 z-0 flex justify-center items-end pointer-events-none select-none overflow-hidden"
      >
        <span className="text-[15vw] sm:text-[16vw] md:text-[17vw] font-black tracking-tight leading-none text-black/[0.075] whitespace-nowrap lowercase">
          madras macha
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        {/* ─────────────────────────────────────────────────────────────
            MAIN MIDDLE CONTENT
            Left statement + 3 structured link columns
            ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 pb-16">
          {/* Left Summary Statement */}
          <div className="md:col-span-4 lg:col-span-5 pr-4">
            <p className="text-base sm:text-lg text-neutral-800 font-normal leading-relaxed max-w-sm">
              The public transit directory that connects Chennai. Built for commuters across MTC bus networks and CMRL metro rail corridors.
            </p>
          </div>

          {/* Right Columns (3 columns matching the reference model) */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            {/* Col 1: TRANSIT */}
            <div>
              <h4 className="text-xs font-bold tracking-widest text-black uppercase mb-4">
                TRANSIT
              </h4>
              <ul className="space-y-3 text-neutral-600 text-sm">
                <li>
                  <button
                    onClick={() => onNavigate?.('mtc')}
                    className="hover:text-black transition-colors text-left cursor-pointer"
                  >
                    MTC Bus Network
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate?.('metro')}
                    className="hover:text-black transition-colors text-left cursor-pointer"
                  >
                    Chennai Metro Rail
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate?.('metro')}
                    className="hover:text-black transition-colors text-left cursor-pointer"
                  >
                    Blue Line Corridor
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate?.('metro')}
                    className="hover:text-black transition-colors text-left cursor-pointer"
                  >
                    Green Line Corridor
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate?.('mtc')}
                    className="hover:text-black transition-colors text-left cursor-pointer"
                  >
                    Electric &amp; AC Fleet
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 2: DIRECTORY */}
            <div>
              <h4 className="text-xs font-bold tracking-widest text-black uppercase mb-4">
                DIRECTORY
              </h4>
              <ul className="space-y-3 text-neutral-600 text-sm">
                <li>
                  <button
                    onClick={() => onNavigate?.('routes')}
                    className="hover:text-black transition-colors text-left cursor-pointer"
                  >
                    All Bus Routes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate?.('stops')}
                    className="hover:text-black transition-colors text-left cursor-pointer"
                  >
                    Metro Stations
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate?.('stops')}
                    className="hover:text-black transition-colors text-left cursor-pointer"
                  >
                    Terminuses &amp; Hubs
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate?.('about')}
                    className="hover:text-black transition-colors text-left cursor-pointer"
                  >
                    GTFS Relational Feed
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate?.('about')}
                    className="hover:text-black transition-colors text-left cursor-pointer"
                  >
                    About Platform
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: AUTHORITIES */}
            <div>
              <h4 className="text-xs font-bold tracking-widest text-black uppercase mb-4">
                AUTHORITIES
              </h4>
              <ul className="space-y-3 text-neutral-600 text-sm">
                <li>
                  <a
                    href="https://chennaimetrorail.org"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black transition-colors flex items-center gap-1.5"
                  >
                    <span>CMRL Official</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://mtcbus.tn.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black transition-colors flex items-center gap-1.5"
                  >
                    <span>MTC Tamil Nadu</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://cumta.tn.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black transition-colors flex items-center gap-1.5"
                  >
                    <span>CUMTA Multimodal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="tel:18604251515"
                    className="hover:text-black transition-colors"
                  >
                    Metro Helpline: 1860-425-1515
                  </a>
                </li>
                <li>
                  <a
                    href="tel:1091"
                    className="hover:text-black transition-colors"
                  >
                    Women Safety: 1091
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            BOTTOM BAR (Directly from reference design)
            Privacy Policy / Terms on left, Copyright on right (no line cutting across watermark)
            ───────────────────────────────────────────────────────────── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate?.('about')}
              className="underline underline-offset-4 hover:text-black transition-colors cursor-pointer"
            >
              Transit Privacy Policy
            </button>
            <button
              onClick={() => onNavigate?.('about')}
              className="underline underline-offset-4 hover:text-black transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          <div>
            © {new Date().getFullYear()} MadrasMacha. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
