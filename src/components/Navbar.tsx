import React, { useState } from 'react';
import { Cloud, Bus, Train, Database, Menu, X, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { TransitStats } from '../types/transit';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  stats: TransitStats;
  onOpenDbModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  setActiveSection,
  stats,
  onOpenDbModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'routes', label: 'Routes' },
    { id: 'stops', label: 'Stops' },
    { id: 'mtc', label: 'MTC' },
    { id: 'metro', label: 'Metro' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('hero')}
          className="group flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 shadow-md shadow-blue-500/25">
            <Cloud className="h-5 w-5 text-white" />
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-slate-700">
              <Bus className="h-2.5 w-2.5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white">
                Chennai Transit Cloud
              </span>
              <span className="hidden sm:inline-block rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                GTFS
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              MTC Buses • Chennai Metro • CUMTA
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-3 py-1.5 text-sm font-medium transition rounded-lg ${
                  isActive
                    ? 'text-white bg-slate-800/80 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action: Supabase Status & Modal Trigger */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            id="supabase-status-btn"
            onClick={onOpenDbModal}
            className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-600 hover:bg-slate-800 transition"
            title="Inspect Supabase GTFS Database tables and health"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                stats.dataSource === 'supabase'
                  ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]'
                  : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
              }`}
            />
            <Database className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {stats.dataSource === 'supabase' ? 'Supabase: Connected' : 'Supabase: Ready'}
            </span>
          </button>

          <button
            onClick={() => handleNavClick('routes')}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition"
          >
            <span>Find Route</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenDbModal}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300"
            aria-label="Database status"
          >
            <Database className="h-4 w-4" />
          </button>

          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-5 shadow-2xl md:hidden">
          <div className="grid grid-cols-2 gap-2 pb-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-left ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-800/80 pt-3 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDbModal();
              }}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-300"
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <span>Supabase GTFS Tables</span>
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                {stats.dataSource === 'supabase' ? 'Online' : 'Seed Active'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
