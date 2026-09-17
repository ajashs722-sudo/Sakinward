import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface ScrollTextLinesProps {
  type?: 'kinetic' | 'reveal' | 'quote' | 'ribbon';
  badge?: string;
  lines?: string[];
  quote?: string;
  source?: string;
  citation?: string;
  line1?: string[];
  line2?: string[];
  items?: string[];
  isDarkMode?: boolean;
}

/**
 * Majestic Lightweight Scroll Text Lines Component (High Performance)
 */
export const ScrollTextLines: React.FC<ScrollTextLinesProps> = ({
  type = 'kinetic',
  badge,
  lines,
  quote,
  source,
  citation,
  line1,
  line2,
  items,
  isDarkMode = false,
}) => {
  // 1. REVEAL VARIANT — Sacred Divine Verse Contemplation
  if (type === 'reveal' && (lines?.length || quote)) {
    const displayLines = lines || (quote ? [quote] : []);
    const displayCitation = citation || source;

    return (
      <div 
        className="w-full max-w-2xl sm:max-w-3xl mx-auto px-4 py-6 sm:py-10 my-2 select-none"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 240px' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className={`relative rounded-[32px] p-6 sm:p-9 text-center border overflow-hidden shadow-xl transform-gpu ${
            isDarkMode
              ? 'bg-gradient-to-b from-[#0D173E]/90 to-[#070D26]/95 border-[#DBC66E]/30 text-[#F7F4EC]'
              : 'bg-gradient-to-b from-white to-[#FDFBF7] border-[#DBC66E]/35 text-[#0A1233]'
          }`}
        >
          {/* Islamic Geometry Watermark in Background */}
          <div className="absolute right-3 top-3 text-[#DBC66E]/10 text-8xl font-serif select-none pointer-events-none leading-none">
            ۞
          </div>

          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 bg-[#DBC66E]/15 text-[#8A7410] dark:text-[#DBC66E] border border-[#DBC66E]/35 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#DBC66E]" />
              <span>{badge}</span>
              <span className="text-[#DBC66E] text-[10px]">✦</span>
            </div>
          )}

          {/* Staggered Divine Lines */}
          <div className="space-y-2.5 relative z-10 max-w-2xl mx-auto">
            {displayLines.map((line, idx) => (
              <p
                key={idx}
                className={
                  idx === 0
                    ? 'font-brand-display text-lg sm:text-2xl md:text-3xl font-bold tracking-tight leading-snug bg-gradient-to-r from-[#DBC66E] via-[#F7F4EC] to-[#C8B052] bg-clip-text text-transparent dark:from-[#F7F4EC] dark:via-[#DBC66E] dark:to-[#EAD992]'
                    : 'text-sm sm:text-base md:text-lg font-medium opacity-85 leading-relaxed text-[#5A6482] dark:text-[#A6B2D4]'
                }
              >
                {line}
              </p>
            ))}
          </div>

          {/* Sacred Citation */}
          {displayCitation && (
            <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-semibold tracking-wide border bg-[#DBC66E]/10 text-[#8A7410] dark:text-[#DBC66E] border-[#DBC66E]/25">
              <span>— {displayCitation}</span>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // 2. KINETIC DUAL-BAND RIBBON (GPU-Accelerated Marquee)
  const defaultLine1 = line1 || items || [
    "SAKINWARD EKOTIZIMI",
    "QUR'ONI KARIM",
    "130+ MASHHUR QORILAR",
    "ASTRONOMIK NAMOZ VAQTLARI",
    "70+ JAHON TILLARI",
  ];

  const defaultLine2 = line2 || [
    "DATCHIKLI QIBLA KOMPASI",
    "SAKIN AI YORDAMCHI",
    "HIJRIY TAQVIM VA OY FAZALARI",
    "AL-ASMO AL-HUSNO",
    "SOKINLIK VA XOTIRJAMLIK",
  ];

  const stream1 = [...defaultLine1, ...defaultLine1];
  const stream2 = [...defaultLine2, ...defaultLine2];

  return (
    <div 
      className="w-full py-4 sm:py-6 overflow-hidden select-none relative my-2"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 110px' }}
    >
      {/* Edge gradient vignettes for seamless fade */}
      <div className="absolute left-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-r from-[var(--bg-landing,#FAF8F3)] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-l from-[var(--bg-landing,#FAF8F3)] to-transparent z-20 pointer-events-none" />

      <div className="space-y-2">
        {/* ROW 1: Travels Left */}
        <div className={`py-2.5 border-y transition-colors overflow-hidden flex items-center shadow-sm ${
          isDarkMode
            ? 'bg-[#0A1233]/90 border-[#DBC66E]/25 text-[#DBC66E]'
            : 'bg-[#F4EFE6]/90 border-[#8A7410]/20 text-[#8A7410]'
        }`}>
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              duration: 25,
              ease: 'linear',
            }}
            className="flex items-center gap-7 whitespace-nowrap transform-gpu"
          >
            {stream1.map((item, idx) => (
              <div key={idx} className="flex items-center gap-7 shrink-0">
                <span className="text-xs sm:text-sm font-black tracking-widest uppercase font-mono">
                  {item}
                </span>
                <span className="text-[#DBC66E] text-xs sm:text-sm opacity-80">✦ ۞ ✦</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ROW 2: Travels Right in Reverse Direction */}
        <div className={`py-2 border-y transition-colors overflow-hidden flex items-center opacity-90 ${
          isDarkMode
            ? 'bg-[#060C22]/80 border-[#DBC66E]/15 text-[#F7F4EC]'
            : 'bg-[#EDE5D8]/80 border-[#8A7410]/15 text-[#0A1233]'
        }`}>
          <motion.div
            animate={{ x: ['-50%', '0%'] }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              duration: 28,
              ease: 'linear',
            }}
            className="flex items-center gap-7 whitespace-nowrap transform-gpu"
          >
            {stream2.map((item, idx) => (
              <div key={idx} className="flex items-center gap-7 shrink-0">
                <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase font-sans">
                  {item}
                </span>
                <span className="text-[#DBC66E] text-xs opacity-75">✦</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
