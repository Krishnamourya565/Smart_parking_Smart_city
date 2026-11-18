import React from 'react';

/**
 * SectionDivider.jsx
 *
 * Futuristic illuminated section separator for the Landing Page:
 * - Ultra-crisp laser lines fading to transparent
 * - Monospace section index pill [ 02 // SECTION NAME ] with neon glow
 * - Geometric node diamond with pulse
 */
export default function SectionDivider({ 
  number = '01', 
  label = 'SECTION',
  subtitle = '',
  glowColor = 'cyan' // 'cyan' | 'emerald' | 'amber' | 'blue'
}) {
  const colorMap = {
    cyan: {
      text: 'text-cyan-400',
      border: 'border-cyan-500/50',
      bg: 'bg-cyan-950/80',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
      gem: 'bg-cyan-400',
      leftLine: 'bg-gradient-to-r from-transparent via-cyan-500/30 to-cyan-400/80',
      rightLine: 'bg-gradient-to-l from-transparent via-cyan-500/30 to-cyan-400/80'
    },
    emerald: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/50',
      bg: 'bg-emerald-950/80',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
      gem: 'bg-emerald-400',
      leftLine: 'bg-gradient-to-r from-transparent via-emerald-500/30 to-emerald-400/80',
      rightLine: 'bg-gradient-to-l from-transparent via-emerald-500/30 to-emerald-400/80'
    },
    amber: {
      text: 'text-amber-400',
      border: 'border-amber-500/50',
      bg: 'bg-amber-950/80',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      gem: 'bg-amber-400',
      leftLine: 'bg-gradient-to-r from-transparent via-amber-500/30 to-amber-400/80',
      rightLine: 'bg-gradient-to-l from-transparent via-amber-500/30 to-amber-400/80'
    },
    blue: {
      text: 'text-blue-400',
      border: 'border-blue-500/50',
      bg: 'bg-blue-950/80',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
      gem: 'bg-blue-400',
      leftLine: 'bg-gradient-to-r from-transparent via-blue-500/30 to-blue-400/80',
      rightLine: 'bg-gradient-to-l from-transparent via-blue-500/30 to-blue-400/80'
    }
  };

  const theme = colorMap[glowColor] || colorMap.cyan;

  return (
    <div className="relative z-20 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center my-4">
      {/* Laser Divider Line with Center Gap */}
      <div className="relative w-full flex items-center justify-center">
        {/* Left Laser Line */}
        <div className={`h-[1px] flex-1 ${theme.leftLine}`} />

        {/* Center Illuminated Badge */}
        <div className={`mx-4 px-4 py-1.5 rounded-full border ${theme.border} ${theme.bg} ${theme.glow} backdrop-blur-md flex items-center gap-2.5 transition-all transform hover:scale-105 select-none shadow-lg`}>
          {/* Pulsing diamond gem */}
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <div className={`absolute w-full h-full rotate-45 ${theme.gem} opacity-40 animate-ping`} />
            <div className={`w-1.5 h-1.5 rotate-45 ${theme.gem}`} />
          </div>

          <span className="font-mono text-[11px] font-extrabold tracking-widest text-slate-300">
            {number}
          </span>
          <span className="text-slate-500 font-mono text-[10px]">///</span>
          <span className={`font-mono text-[11px] font-bold tracking-wider uppercase ${theme.text}`}>
            {label}
          </span>
        </div>

        {/* Right Laser Line */}
        <div className={`h-[1px] flex-1 ${theme.rightLine}`} />
      </div>

      {subtitle && (
        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-2 text-center">
          {subtitle}
        </p>
      )}
    </div>
  );
}
