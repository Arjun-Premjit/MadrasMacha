import React from 'react';

interface MtcBusVisualProps {
  className?: string;
}

export const MtcBusVisual: React.FC<MtcBusVisualProps> = ({ className = '' }) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      {/* High-Precision Architectural Vector of Chennai MTC Bus */}
      <svg
        viewBox="0 0 1000 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
      >
        <defs>
          {/* Subtle wheel rim filter */}
          <radialGradient id="wheelRim" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#333333" />
            <stop offset="70%" stopColor="#1A1A1A" />
            <stop offset="100%" stopColor="#080808" />
          </radialGradient>
        </defs>

        {/* Bus Shadow on Road */}
        <ellipse cx="500" cy="335" rx="440" ry="12" fill="#000000" opacity="0.9" />

        {/* BUS MAIN BODY */}
        {/* Upper cream/white canopy roof */}
        <path
          d="M130 90 C130 65, 170 55, 230 55 L890 55 C925 55, 940 70, 940 90 L940 120 L130 120 Z"
          fill="#F5F5F5"
        />

        {/* Roof AC Unit / Vents */}
        <rect x="420" y="44" width="220" height="12" rx="4" fill="#E5E5E5" />
        <rect x="440" y="48" width="40" height="4" rx="2" fill="#999999" />
        <rect x="500" y="48" width="40" height="4" rx="2" fill="#999999" />
        <rect x="560" y="48" width="40" height="4" rx="2" fill="#999999" />

        {/* Main Lower Body: Iconic Chennai MTC Red */}
        <path
          d="M85 240 L100 120 L940 120 L940 280 L915 280 C915 240, 815 240, 815 280 L355 280 C355 240, 255 240, 255 280 L120 280 C95 280, 85 260, 85 240 Z"
          fill="#C81E1E"
        />

        {/* Warm Yellow Accent Stripe along the beltline */}
        <rect x="98" y="222" width="842" height="14" fill="#F5C542" />

        {/* WINDOW PILLARS & PASSENGER CABIN BAND */}
        <rect x="100" y="118" width="840" height="98" fill="#111111" />

        {/* Front Aerodynamic Windshield */}
        <path
          d="M102 122 L160 122 L160 212 L92 212 C96 160, 100 135, 102 122 Z"
          fill="#1C242C"
          stroke="#050505"
          strokeWidth="3"
        />
        {/* Windshield Reflection */}
        <path d="M105 130 L135 130 L115 205 L98 205 Z" fill="#FFFFFF" opacity="0.08" />

        {/* Driver Cabin Divider */}
        <line x1="164" y1="120" x2="164" y2="216" stroke="#222222" strokeWidth="4" />

        {/* Front Passenger Door with glass panels */}
        <rect x="170" y="122" width="60" height="152" fill="#181818" stroke="#333333" strokeWidth="2" />
        <rect x="175" y="128" width="22" height="60" rx="3" fill="#1F2937" />
        <rect x="202" y="128" width="22" height="60" rx="3" fill="#1F2937" />
        <rect x="175" y="200" width="22" height="60" rx="3" fill="#1F2937" />
        <rect x="202" y="200" width="22" height="60" rx="3" fill="#1F2937" />

        {/* Passenger Windows (Panoramic modern format) */}
        {/* Window 1 */}
        <rect x="240" y="124" width="95" height="88" rx="4" fill="#161E26" stroke="#050505" strokeWidth="3" />
        <rect x="245" y="130" width="85" height="20" rx="2" fill="#FFFFFF" opacity="0.06" />

        {/* Window 2 */}
        <rect x="345" y="124" width="95" height="88" rx="4" fill="#161E26" stroke="#050505" strokeWidth="3" />
        <rect x="350" y="130" width="85" height="20" rx="2" fill="#FFFFFF" opacity="0.06" />

        {/* Window 3 */}
        <rect x="450" y="124" width="95" height="88" rx="4" fill="#161E26" stroke="#050505" strokeWidth="3" />
        <rect x="455" y="130" width="85" height="20" rx="2" fill="#FFFFFF" opacity="0.06" />

        {/* Window 4 */}
        <rect x="555" y="124" width="95" height="88" rx="4" fill="#161E26" stroke="#050505" strokeWidth="3" />
        <rect x="560" y="130" width="85" height="20" rx="2" fill="#FFFFFF" opacity="0.06" />

        {/* Rear Passenger Door */}
        <rect x="660" y="122" width="60" height="152" fill="#181818" stroke="#333333" strokeWidth="2" />
        <rect x="665" y="128" width="22" height="60" rx="3" fill="#1F2937" />
        <rect x="692" y="128" width="22" height="60" rx="3" fill="#1F2937" />
        <rect x="665" y="200" width="22" height="60" rx="3" fill="#1F2937" />
        <rect x="692" y="200" width="22" height="60" rx="3" fill="#1F2937" />

        {/* Rear Windows */}
        <rect x="730" y="124" width="95" height="88" rx="4" fill="#161E26" stroke="#050505" strokeWidth="3" />
        <rect x="835" y="124" width="95" height="88" rx="4" fill="#161E26" stroke="#050505" strokeWidth="3" />

        {/* LED DESTINATION BOARD (FRONT/TOP) */}
        <rect x="180" y="74" width="240" height="28" rx="3" fill="#000000" />
        <text
          x="192"
          y="93"
          fill="#F5C542"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="13"
          fontWeight="bold"
          letterSpacing="1.5"
        >
          21G BROADWAY ⇄ TAMBARAM
        </text>

        {/* MTC BRANDING ON LOWER FLANK */}
        <text
          x="380"
          y="256"
          fill="#FFFFFF"
          fontFamily="'Host Grotesk', sans-serif"
          fontSize="22"
          fontWeight="300"
          letterSpacing="4"
        >
          MTC CHENNAI
        </text>
        <text
          x="575"
          y="255"
          fill="#F5C542"
          fontFamily="'Host Grotesk', sans-serif"
          fontSize="13"
          fontWeight="400"
          letterSpacing="1"
        >
          மாநகர போக்குவரத்துக் கழகம்
        </text>

        {/* Front Headlights Assembly */}
        <rect x="83" y="235" width="10" height="18" rx="2" fill="#FFFFFF" />
        <circle cx="88" cy="244" r="4" fill="#FFF9D2" />
        <rect x="83" y="258" width="8" height="6" rx="1" fill="#F5C542" />

        {/* Rear Taillights */}
        <rect x="936" y="228" width="6" height="24" rx="2" fill="#EF4444" />
        <rect x="936" y="256" width="6" height="10" rx="1" fill="#F5C542" />

        {/* Lower chassis / skirt */}
        <rect x="120" y="278" width="135" height="8" fill="#111111" />
        <rect x="355" y="278" width="460" height="8" fill="#111111" />
        <rect x="915" y="278" width="25" height="8" fill="#111111" />

        {/* FRONT WHEEL ASSEMBLY */}
        <g>
          {/* Wheel Arch */}
          <path d="M250 282 C250 225, 360 225, 360 282 Z" fill="#0A0A0A" />
          {/* Outer Tire Rubber */}
          <circle cx="305" cy="282" r="48" fill="#141414" stroke="#0A0A0A" strokeWidth="4" />
          {/* Rim */}
          <circle cx="305" cy="282" r="32" fill="url(#wheelRim)" stroke="#444444" strokeWidth="2" />
          {/* Lug bolts */}
          <circle cx="305" cy="282" r="16" fill="#1C1C1C" />
          <circle cx="305" cy="272" r="2.5" fill="#888888" />
          <circle cx="314" cy="277" r="2.5" fill="#888888" />
          <circle cx="314" cy="287" r="2.5" fill="#888888" />
          <circle cx="305" cy="292" r="2.5" fill="#888888" />
          <circle cx="296" cy="287" r="2.5" fill="#888888" />
          <circle cx="296" cy="277" r="2.5" fill="#888888" />
          <circle cx="305" cy="282" r="6" fill="#F5C542" />
        </g>

        {/* REAR DUAL-WHEEL ASSEMBLY */}
        <g>
          {/* Wheel Arch */}
          <path d="M810 282 C810 225, 920 225, 920 282 Z" fill="#0A0A0A" />
          {/* Outer Tire Rubber */}
          <circle cx="865" cy="282" r="48" fill="#141414" stroke="#0A0A0A" strokeWidth="4" />
          {/* Rim */}
          <circle cx="865" cy="282" r="32" fill="url(#wheelRim)" stroke="#444444" strokeWidth="2" />
          {/* Lug bolts */}
          <circle cx="865" cy="282" r="16" fill="#1C1C1C" />
          <circle cx="865" cy="272" r="2.5" fill="#888888" />
          <circle cx="874" cy="277" r="2.5" fill="#888888" />
          <circle cx="874" cy="287" r="2.5" fill="#888888" />
          <circle cx="865" cy="292" r="2.5" fill="#888888" />
          <circle cx="856" cy="287" r="2.5" fill="#888888" />
          <circle cx="856" cy="277" r="2.5" fill="#888888" />
          <circle cx="865" cy="282" r="6" fill="#F5C542" />
        </g>
      </svg>
    </div>
  );
};
