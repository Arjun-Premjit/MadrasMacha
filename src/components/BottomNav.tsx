import React from 'react';
import { Home, Compass, MapPin, Bus, Train } from 'lucide-react';

interface BottomNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeSection, setActiveSection }) => {
  const items = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'routes', label: 'Routes', icon: Compass },
    { id: 'stops', label: 'Stops', icon: MapPin },
    { id: 'mtc', label: 'MTC', icon: Bus },
    { id: 'metro', label: 'Metro', icon: Train },
  ];

  const handleItemClick = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 px-2 py-2 backdrop-blur-lg md:hidden"
    >
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-[11px] font-medium transition ${
                isActive
                  ? 'text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                  isActive ? 'bg-sky-500/20 text-sky-400 scale-105' : 'text-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
