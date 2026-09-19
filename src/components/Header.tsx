import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Bus,
  Train,
  Loader2,
  Home,
  Navigation,
  MapPin,
  Info,
  Database,
  Ticket,
} from 'lucide-react';
import { Route } from '../types/transit';
import { searchTransitViaRest, TransitSearchResult } from '../../lib/supabase/api';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../hooks/useLanguage';

export type PageView = 'home' | 'routes' | 'route-detail' | 'stops' | 'stop-detail' | 'mtc' | 'metro' | 'fare' | 'about' | 'privacy' | 'terms' | 'test';

interface HeaderProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onSelectRoute?: (route: Route) => void;
  onSelectRouteId?: (routeId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  isMenuOpen,
  setIsMenuOpen,
  onSelectRoute,
  onSelectRouteId,
}) => {
  const { language, t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TransitSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search via Supabase REST API
  useEffect(() => {
    if (!isSearchOpen) return;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchTransitViaRest(searchQuery);
        setSearchResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Keyboard shortcut (CMD/CTRL + K) for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRouteClick = (route: Route) => {
    if (onSelectRouteId) {
      onSelectRouteId(route.route_id);
    } else {
      onSelectRoute?.(route);
      onNavigate('routes');
    }
    setIsSearchOpen(false);
  };

  const navLinks: { id: PageView; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: language === 'ta' ? 'முகப்பு' : 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'mtc', label: language === 'ta' ? 'MTC பேருந்து' : 'MTC Buses', icon: <Bus className="w-4 h-4" /> },
    { id: 'metro', label: language === 'ta' ? 'மெட்ரோ ரயில்' : 'Metro Rail', icon: <Train className="w-4 h-4" /> },
    { id: 'fare', label: language === 'ta' ? 'கட்டணம்' : 'Fare Calculator', icon: <Ticket className="w-4 h-4 text-sky-600" /> },
    { id: 'routes', label: language === 'ta' ? 'வழித்தடங்கள்' : 'All Corridors', icon: <Navigation className="w-4 h-4" /> },
    { id: 'stops', label: language === 'ta' ? 'நிறுத்தங்கள்' : 'Stops & Stations', icon: <MapPin className="w-4 h-4" /> },
    { id: 'about', label: language === 'ta' ? 'பற்றி' : 'About Transit', icon: <Info className="w-4 h-4" /> },
    { id: 'test', label: 'Test Supabase', icon: <Database className="w-4 h-4 text-emerald-600" /> },
  ];

  return (
    <>
      {/* Floating Glassmorphism Navigation Bar */}
      <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none font-sans">
        <nav
          className="pointer-events-auto flex items-center justify-between h-14 px-4 sm:px-6 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 w-full max-w-4xl bg-white/10 hover:bg-white/20 backdrop-blur-2xl border border-white/25"
          aria-label="Main Navigation"
        >
          {/* Minimalist Logo Mark */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-sm font-bold tracking-wider text-black hover:text-neutral-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-xs font-black shadow-xs">
              MM
            </span>
            <span className="hidden sm:inline font-bold tracking-tight text-sm">
              MadrasMacha
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-5 text-xs font-semibold tracking-wide text-neutral-600">
            <button
              onClick={() => onNavigate('home')}
              className={`transition-colors hover:text-black cursor-pointer ${
                currentPage === 'home' ? 'text-black font-bold underline underline-offset-4' : ''
              }`}
            >
              {language === 'ta' ? 'முகப்பு' : 'Home'}
            </button>
            <button
              onClick={() => onNavigate('mtc')}
              className={`transition-colors hover:text-black cursor-pointer ${
                currentPage === 'mtc' ? 'text-black font-bold underline underline-offset-4' : ''
              }`}
            >
              MTC
            </button>
            <button
              onClick={() => onNavigate('metro')}
              className={`transition-colors hover:text-black cursor-pointer ${
                currentPage === 'metro' ? 'text-black font-bold underline underline-offset-4' : ''
              }`}
            >
              Metro
            </button>
            <button
              onClick={() => onNavigate('fare')}
              className={`transition-colors hover:text-black cursor-pointer flex items-center gap-1 ${
                currentPage === 'fare' ? 'text-sky-700 font-bold underline underline-offset-4' : 'text-sky-600 hover:text-sky-800'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'கட்டணம்' : 'Fare'}</span>
            </button>
            <button
              onClick={() => onNavigate('routes')}
              className={`transition-colors hover:text-black cursor-pointer ${
                currentPage === 'routes' ? 'text-black font-bold underline underline-offset-4' : ''
              }`}
            >
              {language === 'ta' ? 'வழித்தடங்கள்' : 'Routes'}
            </button>
            <button
              onClick={() => onNavigate('stops')}
              className={`transition-colors hover:text-black cursor-pointer ${
                currentPage === 'stops' ? 'text-black font-bold underline underline-offset-4' : ''
              }`}
            >
              {language === 'ta' ? 'நிறுத்தங்கள்' : 'Stops'}
            </button>
          </div>

          {/* Glassmorphic Search Bar, Language Toggle & Menu Buttons */}
          <div className="flex items-center gap-2">
            {/* Global Language Toggle (Bilingual Tamil / English) */}
            <LanguageToggle variant="pill" className="shrink-0" />

            {/* Glassmorphism Search Bar in Header */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-2xl border border-white/25 text-neutral-800 text-xs font-medium transition-all duration-200 cursor-pointer shadow-xs"
              aria-label="Search transit network"
            >
              <Search className="w-3.5 h-3.5 text-neutral-700" />
              <span className="hidden sm:inline text-xs text-neutral-700">
                {language === 'ta' ? 'தேடுக...' : 'Search...'}
              </span>
            </button>

            {/* Menu Toggle Button (Three horizontal lines) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-8 h-8 text-neutral-800 hover:text-black transition-colors rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-2xl border border-white/25 cursor-pointer shadow-xs"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <span className="text-base font-bold leading-none mb-0.5">☰</span>}
            </button>
          </div>
        </nav>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          COMPACT GLASSMORPHIC MENU (Reduced size, compatible across all devices)
          ───────────────────────────────────────────────────────────── */}
      {isMenuOpen && (
        <>
          {/* Subtle click-outside dismiss backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[2px] animate-in fade-in duration-150"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Sleek Floating Glassmorphic Dropdown Card */}
          <div
            className="fixed top-20 sm:top-22 right-4 sm:right-6 md:right-auto md:left-1/2 md:-translate-x-1/2 z-50 w-[calc(100vw-32px)] max-w-xs sm:w-76 rounded-2xl bg-white/40 hover:bg-white/50 backdrop-blur-2xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.10)] p-3.5 sm:p-4 animate-in fade-in zoom-in-95 duration-150 font-sans"
            role="dialog"
            aria-label="Navigation Menu"
          >
            {/* Header row inside menu */}
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-black/5 px-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-500">
                Navigation
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Menu Items List - Compact and Ergonomic */}
            <div className="space-y-1">
              {navLinks.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-black text-white font-semibold shadow-xs'
                        : 'text-neutral-700 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-white' : 'text-neutral-500'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Micro footer inside menu */}
            <div className="mt-3 pt-2.5 border-t border-black/5 px-2 text-center text-[10px] text-neutral-400">
              MadrasMacha · Chennai Unified Transit
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DEEP GLASSMORPHIC SEARCH MODAL
          ───────────────────────────────────────────────────────────── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_rgba(0,0,0,0.18)] p-5 sm:p-6 overflow-hidden font-sans">
            {/* Glassmorphic Search Input Bar */}
            <div className="relative flex items-center mb-4">
              <Search className="absolute left-4 w-5 h-5 text-neutral-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by route (e.g. 21G, 570), metro line, or destination..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-black text-sm sm:text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/15 shadow-inner transition-all font-sans"
              />
              {isSearching ? (
                <Loader2 className="absolute right-12 w-5 h-5 animate-spin text-neutral-500" />
              ) : null}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 p-1.5 rounded-full hover:bg-black/10 text-neutral-600 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestions with Glass Pill styling */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-neutral-600">
              <span className="font-semibold text-black">Quick:</span>
              {['21G', '570', '19B', 'Blue Line', 'Green Line', 'Guindy', 'Central'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-2.5 py-1 rounded-full bg-white/60 hover:bg-white/95 backdrop-blur-md border border-white/80 text-neutral-800 text-xs font-medium transition-all shadow-2xs cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {searchResults && searchResults.routes.length > 0 ? (
                searchResults.routes.map((route) => {
                  const isMetro = route.agency_id === 'CMRL' || route.route_type === 1;
                  return (
                    <div
                      key={route.route_id}
                      onClick={() => handleRouteClick(route)}
                      className="p-3 rounded-2xl bg-white/50 hover:bg-white/90 backdrop-blur-md border border-white/70 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {isMetro ? <Train className="w-4 h-4" /> : <Bus className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-black text-sm">
                              {route.route_short_name || route.route_id}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/10 text-black">
                              {isMetro ? 'Metro' : 'MTC Bus'}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 leading-snug line-clamp-1">
                            {route.route_long_name}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-black group-hover:underline pr-1">
                        View →
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-neutral-400">
                  {isSearching ? 'Searching database...' : 'No corridors found. Try "21G" or "Blue Line".'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
