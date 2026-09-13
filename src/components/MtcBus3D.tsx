import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MtcBus3DProps {
  className?: string;
  isStatic?: boolean;
  showWatermark?: boolean;
}

export const MtcBus3D: React.FC<MtcBus3DProps> = ({
  className = '',
  isStatic = false,
  showWatermark = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const busWrapperRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStatic) return;

    const container = containerRef.current;
    const busWrapper = busWrapperRef.current;
    const shadow = shadowRef.current;

    if (!container || !busWrapper) return;

    // Ensure busWrapper is fully visible
    gsap.set(busWrapper, { opacity: 1 });

    // Left-to-right motion driven by scroll
    const handleScroll = () => {
      if (!container || !busWrapper) return;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Progress: -1 (above) to +1 (below), normalized so when scrolling down, progress goes from -1 to +1
      const progress = (windowHeight / 2 - (rect.top + rect.height / 2)) / (windowHeight / 2);
      const clamped = Math.max(-1.5, Math.min(1.5, progress));

      // Translate from Left to Right as the page scrolls down
      // When entering from bottom, clamped is negative (positioned more to the left)
      // As user scrolls down, clamped becomes positive (moves towards the right)
      const targetX = clamped * 90;

      gsap.to(busWrapper, {
        x: targetX,
        duration: 0.6,
        ease: 'power1.out',
      });

      if (shadow) {
        gsap.to(shadow, {
          x: targetX,
          duration: 0.6,
          ease: 'power1.out',
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Ambient forward cruising motion from left to right
    const ambientTween = gsap.to(busWrapper, {
      x: '+=12',
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ambientTween.kill();
    };
  }, [isStatic]);

  return (
    <div
      ref={containerRef}
      id="mtc-bus-photo-container"
      className={`relative select-none w-full flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      <div className="relative w-full max-w-5xl flex items-center justify-center px-4 py-8 overflow-visible">
        {/* Decorative Watermark Behind the Bus (Landing Page Only) */}
        {showWatermark && (
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none whitespace-nowrap overflow-visible w-full text-center px-4"
          >
            <span className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase text-neutral-900/[0.09] leading-none inline-block">
              NEXT STOP: MARINA
            </span>
          </div>
        )}

        {/* Ground shadow following left-to-right translation */}
        <div
          ref={shadowRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/15 blur-xl rounded-full pointer-events-none will-change-transform"
          aria-hidden="true"
        />

        {/* Bus image with left-to-right motion */}
        <div ref={busWrapperRef} className="relative z-10 will-change-transform">
          <img
            id="mtc-bus-original-photo"
            src="/assets/mtc_bus.png"
            alt="MTC Chennai Bus"
            referrerPolicy="no-referrer"
            className="max-h-[480px] w-auto max-w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.2)]"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};
