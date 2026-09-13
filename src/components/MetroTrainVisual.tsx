import React from 'react';

interface MetroTrainVisualProps {
  progress?: number; // 0 to 1
  className?: string;
}

export const MetroTrainVisual: React.FC<MetroTrainVisualProps> = ({
  progress = 0.5,
  className = '',
}) => {
  return (
    <div className={`relative w-full select-none ${className}`}>
      {/* MINIMAL HORIZONTAL METRO LINE */}
      <div className="relative h-28 w-full flex items-center justify-center">
        {/* Track Line (#72D7FF light blue) */}
        <div className="absolute left-0 right-0 h-[2px] bg-[#72D7FF]/30">
          {/* Active section of track */}
          <div
            className="h-full bg-[#72D7FF]"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>

        {/* Minimal Station Nodes along the line */}
        <div className="absolute left-[15%] flex flex-col items-center -translate-x-1/2">
          <div className="h-2 w-2 rounded-full border border-[#72D7FF] bg-[#050505]" />
          <span className="mt-3 font-mono text-[11px] text-[#888888] tracking-widest uppercase">
            Central
          </span>
        </div>

        <div className="absolute left-[50%] flex flex-col items-center -translate-x-1/2">
          <div className="h-2.5 w-2.5 rounded-full border border-[#72D7FF] bg-[#72D7FF]" />
          <span className="mt-3 font-mono text-[11px] text-[#FFFFFF] tracking-widest uppercase">
            Alandur
          </span>
        </div>

        <div className="absolute left-[85%] flex flex-col items-center -translate-x-1/2">
          <div className="h-2 w-2 rounded-full border border-[#72D7FF] bg-[#050505]" />
          <span className="mt-3 font-mono text-[11px] text-[#888888] tracking-widest uppercase">
            Airport
          </span>
        </div>

        {/* CHENNAI METRO TRAIN (moves dynamically along the line) */}
        <div
          className="absolute -top-3 transition-transform duration-75 ease-out pointer-events-none"
          style={{
            left: `${Math.min(92, Math.max(8, progress * 100))}%`,
            transform: 'translateX(-50%) translate3d(0, 0, 0)',
          }}
        >
          {/* Minimal 3-Car Metro Train SVG */}
          <svg
            width="220"
            height="36"
            viewBox="0 0 220 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Coach 1 (Lead Cab with aerodynamic nose) */}
            <path
              d="M145 4 L210 4 C216 4, 220 12, 218 24 L215 30 L145 30 Z"
              fill="#D4D4D8"
            />
            {/* Front windshield */}
            <path d="M205 7 L216 16 L213 22 L205 22 Z" fill="#18181B" />
            {/* Blue Livery Stripe */}
            <rect x="145" y="16" width="68" height="4" fill="#72D7FF" />
            {/* Windows */}
            <rect x="152" y="8" width="18" height="12" rx="1" fill="#18181B" />
            <rect x="176" y="8" width="18" height="12" rx="1" fill="#18181B" />
            {/* Headlight */}
            <circle cx="216" cy="25" r="2" fill="#FFFFFF" />

            {/* Inter-coach gangway */}
            <rect x="141" y="8" width="4" height="20" fill="#27272A" />

            {/* Coach 2 (Middle Coach) */}
            <rect x="73" y="4" width="68" height="26" fill="#D4D4D8" />
            <rect x="73" y="16" width="68" height="4" fill="#72D7FF" />
            <rect x="80" y="8" width="18" height="12" rx="1" fill="#18181B" />
            <rect x="104" y="8" width="18" height="12" rx="1" fill="#18181B" />

            {/* Inter-coach gangway */}
            <rect x="69" y="8" width="4" height="20" fill="#27272A" />

            {/* Coach 3 (Rear Coach) */}
            <path
              d="M5 4 L69 4 L69 30 L5 30 C2 30, 0 24, 0 16 C0 8, 2 4, 5 4 Z"
              fill="#D4D4D8"
            />
            <rect x="0" y="16" width="69" height="4" fill="#72D7FF" />
            <rect x="12" y="8" width="18" height="12" rx="1" fill="#18181B" />
            <rect x="36" y="8" width="18" height="12" rx="1" fill="#18181B" />

            {/* Wheels underneath */}
            <circle cx="20" cy="32" r="3" fill="#3F3F46" />
            <circle cx="54" cy="32" r="3" fill="#3F3F46" />
            <circle cx="90" cy="32" r="3" fill="#3F3F46" />
            <circle cx="124" cy="32" r="3" fill="#3F3F46" />
            <circle cx="162" cy="32" r="3" fill="#3F3F46" />
            <circle cx="196" cy="32" r="3" fill="#3F3F46" />
          </svg>
        </div>
      </div>
    </div>
  );
};
