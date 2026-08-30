import React from 'react';
import { motion } from 'framer-motion';
import { Star, StarHalf } from '@phosphor-icons/react';

const EASE = [0.22, 1, 0.36, 1];

export const Reveal = ({ children, delay = 0, y = 28, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.9, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

export const LineReveal = ({ lines, className = '', lineClassName = '', baseDelay = 0.15, onLoad = false }) => {
  const triggerProps = onLoad
    ? { animate: 'visible' }
    : { whileInView: 'visible', viewport: { once: true, amount: 0.2 } };
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          className="overflow-hidden"
          initial="hidden"
          {...triggerProps}
        >
          <motion.div
            className={lineClassName}
            variants={{ hidden: { y: '110%' }, visible: { y: '0%' } }}
            transition={{ duration: 1.1, delay: baseDelay + i * 0.14, ease: EASE }}
          >
            {line}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export const Overline = ({ children, light = false, className = '' }) => (
  <p
    className={`uppercase tracking-[0.25em] text-xs font-bold ${
      light ? 'text-[#E8B4B8]' : 'text-[#2D2D2D]/60'
    } ${className}`}
  >
    {children}
  </p>
);

export const Stars = ({ rating = 5, size = 14, className = '' }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className={`flex items-center gap-0.5 text-[#E8B4B8] ${className}`} data-testid="star-rating">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={i} size={size} weight="fill" />
      ))}
      {half && <StarHalf size={size} weight="fill" />}
      {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
        <Star key={`e-${i}`} size={size} weight="regular" className="text-[#2D2D2D]/25" />
      ))}
    </div>
  );
};
