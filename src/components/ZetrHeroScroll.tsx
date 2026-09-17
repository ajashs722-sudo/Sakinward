import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface ZetrHeroScrollProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  scrollHint?: string;
  isDarkMode?: boolean;
  variant?: 'hero' | 'section';
  badge?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Ultra-Fast Lightweight ZETR Hero & Section Scroll
 * Optimized for 120fps smooth scrolling, zero main-thread jank, and high Web Vitals:
 * - Direct GPU-accelerated transforms (no heavy CPU spring physics)
 * - Viewport-based one-time transitions for section cards to eliminate continuous scroll listeners
 * - CSS-only lightweight ambient lighting without heavy rasterizing blur filters
 */
export const ZetrHeroScroll: React.FC<ZetrHeroScrollProps> = ({
  header,
  children,
  scrollHint,
  isDarkMode = false,
  variant = 'hero',
  badge,
  title,
  subtitle,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- HERO VARIANT (Smooth direct scroll-linked presentation) ---
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroRotateX = useTransform(heroScrollProgress, [0, 0.6], [isMobile ? 10 : 14, 0]);
  const heroScale = useTransform(
    heroScrollProgress,
    [0, 0.6],
    [isMobile ? 0.95 : 0.9, isMobile ? 1.0 : 1.02]
  );
  const heroTranslateY = useTransform(heroScrollProgress, [0, 0.6], [0, isMobile ? -10 : -20]);
  const heroHeaderOpacity = useTransform(heroScrollProgress, [0, 0.4], [1, 0.4]);
  const heroHeaderY = useTransform(heroScrollProgress, [0, 0.4], [0, -20]);
  const heroHintOpacity = useTransform(heroScrollProgress, [0, 0.15], [1, 0]);

  if (variant === 'section') {
    return (
      <div
        ref={containerRef}
        className={`relative w-full max-w-2xl sm:max-w-3xl mx-auto px-4 py-4 sm:py-8 ${className}`}
        style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 500px' }}
      >
        {/* Optional Section Header */}
        {(header || title || badge) && (
          <div className="w-full mb-5 text-center sm:text-left">
            {header ? (
              header
            ) : (
              <div className="space-y-1.5">
                {badge && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#DBC66E]/15 text-[#8A7410] dark:text-[#DBC66E] border border-[#DBC66E]/30">
                    <Sparkles className="w-3.5 h-3.5 text-[#DBC66E]" />
                    <span>{badge}</span>
                  </div>
                )}
                {title && (
                  <h2 className="font-brand-display text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#DBC66E] via-[#F7F4EC] to-[#C8B052] bg-clip-text text-transparent">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-sm sm:text-base text-[#5A6482] dark:text-[#A6B2D4]">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Lightweight GPU-accelerated Section Card Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="relative w-full transform-gpu"
        >
          {/* Card Chassis */}
          <div className="relative w-full rounded-[36px] overflow-hidden shadow-xl border border-[#DBC66E]/20 bg-gradient-to-b from-white/5 to-transparent">
            {children}
          </div>
        </motion.div>
      </div>
    );
  }

  // DEFAULT HERO VARIANT
  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[130vh] sm:min-h-[150vh] flex flex-col items-center justify-start overflow-visible"
    >
      {/* Pinned / Sticky presentation viewport */}
      <div className="sticky top-0 w-full min-h-screen flex flex-col justify-between py-6 sm:py-8 px-4 sm:px-8 z-20 overflow-hidden">
        
        {/* Hero Header with parallax lift */}
        <motion.div
          style={{ opacity: heroHeaderOpacity, y: heroHeaderY }}
          className="w-full max-w-4xl mx-auto pt-14 sm:pt-16 pb-4 sm:pb-6 text-center sm:text-left transform-gpu z-10"
        >
          {header}
        </motion.div>

        {/* 3D Perspective Showcase Container (ZETR Architectural Chassis) */}
        <div 
          className="relative flex-1 flex items-center justify-center py-2 sm:py-4"
          style={{ perspective: isMobile ? '800px' : '1100px' }}
        >
          <motion.div
            style={{
              rotateX: heroRotateX,
              scale: heroScale,
              y: heroTranslateY,
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full max-w-[320px] sm:max-w-[360px] flex items-center justify-center transform-gpu"
          >
            {/* Showcase Wrapper */}
            <div className="relative w-full rounded-[48px] overflow-hidden shadow-2xl">
              {children}
            </div>
          </motion.div>
        </div>

        {/* Interactive Scroll Hint Badge */}
        {scrollHint && (
          <motion.div
            style={{ opacity: heroHintOpacity }}
            className="w-full flex justify-center items-center pb-2 pointer-events-none"
          >
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-[#DBC66E]/30 text-[11px] font-semibold text-[#DBC66E]">
              <span>{scrollHint}</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#DBC66E]" />
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default ZetrHeroScroll;
