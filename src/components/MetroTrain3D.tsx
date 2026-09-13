import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MetroTrain3DProps {
  className?: string;
  isStatic?: boolean;
  showWatermark?: boolean;
}

export const MetroTrain3D: React.FC<MetroTrain3DProps> = ({
  className = '',
  isStatic = false,
  showWatermark = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trainWrapperRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStatic) return;

    const container = containerRef.current;
    const trainWrapper = trainWrapperRef.current;
    const shadow = shadowRef.current;

    if (!container || !trainWrapper) return;

    // Ensure trainWrapper is fully visible
    gsap.set(trainWrapper, { opacity: 1 });

    // Left-to-right motion driven by scroll
    const handleScroll = () => {
      if (!container || !trainWrapper) return;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Progress: -1 (above) to +1 (below), normalized so when scrolling down, progress goes from -1 to +1
      const progress = (windowHeight / 2 - (rect.top + rect.height / 2)) / (windowHeight / 2);
      const clamped = Math.max(-1.5, Math.min(1.5, progress));

      // Translate from Left to Right as the page scrolls down
      const targetX = clamped * 95;

      gsap.to(trainWrapper, {
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
    const ambientTween = gsap.to(trainWrapper, {
      x: '+=15',
      duration: 3.2,
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
      id="metro-train-photo-container"
      className={`relative select-none w-full flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      <div className="relative w-full max-w-5xl flex items-center justify-center px-4 py-8 overflow-visible">
        {/* Ground shadow following left-to-right translation */}
        <div
          ref={shadowRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/15 blur-xl rounded-full pointer-events-none will-change-transform"
          aria-hidden="true"
        />

        {/* Train image with synchronized architectural watermark */}
        <div ref={trainWrapperRef} className="relative z-10 will-change-transform flex items-center justify-center">
          {/* Watermark starting near the big passenger window in the carriage */}
          {showWatermark && (
            <div
              aria-hidden="true"
              className="absolute left-[16%] sm:left-[20%] md:left-[24%] top-[34%] sm:top-[30%] md:top-[28%] z-0 pointer-events-none select-none whitespace-nowrap -rotate-[26deg] origin-top-left"
            >
              <div className="flex flex-col items-start leading-[0.88] uppercase font-black text-neutral-900/[0.13]">
                <span className="text-sm sm:text-xl md:text-2xl lg:text-3xl tracking-tight text-neutral-900/[0.12] pl-0.5">
                  NEXT STOP
                </span>
                <span className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tighter mt-1">
                  CHENNAI CENTRAL
                </span>
              </div>
            </div>
          )}

          <img
            id="metro-train-original-photo"
            src="/assets/metro.png"
            alt="Chennai Metro Train"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('metro_train.png')) {
                target.src = '/assets/metro_train.png';
              }
            }}
            className="relative z-10 max-h-[480px] w-auto max-w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.2)]"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};
