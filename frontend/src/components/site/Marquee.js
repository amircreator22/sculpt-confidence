import React from 'react';
import { Sparkle } from '@phosphor-icons/react';

export const Marquee = ({ items, className = '' }) => {
  const seq = [...items, ...items];
  return (
    <div
      className={`overflow-hidden bg-[#E8B4B8] border-y border-[#2D2D2D]/10 py-5 ${className}`}
      data-testid="editorial-marquee"
    >
      <div className="flex w-max whitespace-nowrap animate-marquee">
        {seq.map((item, i) => (
          <span
            key={i}
            className="font-display uppercase text-2xl md:text-4xl text-[#2D2D2D] tracking-tight flex items-center"
          >
            <span className="px-6">{item}</span>
            <Sparkle size={22} weight="fill" className="text-[#2D2D2D]/50" />
          </span>
        ))}
      </div>
    </div>
  );
};
