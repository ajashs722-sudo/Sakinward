import React from 'react';
import { motion } from 'motion/react';

// ============================================================================
// 1. FAST SCROLL-TRIGGERED TEXT HIGHLIGHT (GPU-Accelerated, zero-jank)
// ============================================================================
interface ScrollHighlightTextProps {
  text: string;
  className?: string;
  highlightColor?: string;
  dimColor?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span';
}

export const ScrollHighlightText: React.FC<ScrollHighlightTextProps> = ({
  text,
  className = '',
  highlightColor = 'text-amber-400 dark:text-[#DBC66E]',
  as = 'p',
}) => {
  const Tag = motion[as] as any;

  return (
    <Tag
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className={`transform-gpu ${highlightColor} ${className}`}
    >
      {text}
    </Tag>
  );
};

// ============================================================================
// 2. SCROLL-TRIGGERED FEATURE CARD WITH DYNAMIC ILLUMINATION
// ============================================================================
interface ScrollHighlightCardProps {
  children: React.ReactNode;
  className?: string;
  isDarkMode?: boolean;
  accentColor?: 'gold' | 'cyan' | 'emerald';
  parallaxOffset?: number;
  delay?: number;
  index?: number;
}

export const ScrollHighlightCard: React.FC<ScrollHighlightCardProps> = ({
  children,
  className = '',
  accentColor = 'gold',
  delay = 0,
  index = 0,
}) => {
  const borderGradient =
    accentColor === 'cyan'
      ? 'from-[#38BDF8] via-[#0284C7] to-transparent'
      : accentColor === 'emerald'
      ? 'from-emerald-400 via-teal-500 to-transparent'
      : 'from-[#DBC66E] via-[#C8B052] to-transparent';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, delay: delay || index * 0.06, ease: [0.25, 1, 0.5, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`group relative rounded-3xl transition-shadow duration-300 transform-gpu ${className}`}
    >
      {/* Dynamic active border accent */}
      <div
        className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-br ${borderGradient} -z-10 opacity-30 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Content */}
      {children}
    </motion.div>
  );
};

// ============================================================================
// 3. LIGHTWEIGHT PARALLAX CONTAINER
// ============================================================================
interface ParallaxLayerProps {
  children: React.ReactNode;
  className?: string;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`transform-gpu ${className}`}>
      {children}
    </div>
  );
};
