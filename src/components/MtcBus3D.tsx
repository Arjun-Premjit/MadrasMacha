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
  const busInnerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStatic) return;

    const container = containerRef.current;
    const busWrapper = busWrapperRef.current;
    const busInner = busInnerRef.current;
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

    // Ambient cruising motion on the inner wrapper (won't conflict with scroll tween)
    let ambientTween: gsap.core.Tween | null = null;
    if (busInner) {
      ambientTween = gsap.to(busInner, {
        x: 12,
        y: -3,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ambientTween?.kill();
    };
  }, [isStatic]);

  return (
    <div
      ref={containerRef}
      id="mtc-bus-photo-container"
      className={`relative select-none w-full flex flex-col items-center justify-center overflow-visible ${className}`}
    >
      <div className="relative w-full max-w-5xl flex items-center justify-center px-4 pt-8 pb-8 overflow-visible">
        {/* Decorative Watermark Behind the Bus (Center Aligned, Shifted Higher Above Bus) */}
        {showWatermark && (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center -translate-y-20 sm:-translate-y-28 md:-translate-y-36 lg:-translate-y-44 z-0 pointer-events-none select-none overflow-visible text-center"
          >
            <span className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight uppercase text-neutral-950/[0.22] leading-none text-center whitespace-nowrap select-none">
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
          <div ref={busInnerRef} className="will-change-transform">
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
    </div>
  );
};
