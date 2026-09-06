import React from 'react';
import { useSettings } from '../hooks/useSettings';
import { LogoScheme } from '../types';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  scheme?: LogoScheme;
}

const SCHEMES: Record<
  LogoScheme,
  {
    stops: { offset: string; color: string }[];
    wordmark: string;
    dotColor: string;
    glowFilter: string;
  }
> = {
  sunset: {
    stops: [
      { offset: '0%', color: '#FF7A00' },   // Radiant Solar Amber
      { offset: '50%', color: '#FF006E' },  // Neon Rose / Hot Magenta
      { offset: '100%', color: '#8338EC' }, // Electric Cosmic Violet
    ],
    wordmark: 'from-amber-400 via-rose-500 to-violet-500',
    dotColor: '#FF006E',
    glowFilter: 'rgba(255, 0, 110, 0.45)',
  },
  aurora: {
    stops: [
      { offset: '0%', color: '#00F5A0' },   // Electric Emerald Mint
      { offset: '50%', color: '#00D9F5' },  // Cyber Cyan
      { offset: '100%', color: '#4361EE' }, // Deep Royal Blue
    ],
    wordmark: 'from-emerald-400 via-cyan-400 to-indigo-500',
    dotColor: '#00D9F5',
    glowFilter: 'rgba(0, 217, 245, 0.45)',
  },
  cyber: {
    stops: [
      { offset: '0%', color: '#00E5FF' },   // Electric Aqua
      { offset: '50%', color: '#7C4DFF' },  // Deep Purple
      { offset: '100%', color: '#FF4081' }, // Hot Pink
    ],
    wordmark: 'from-cyan-400 via-indigo-400 to-pink-500',
    dotColor: '#FF4081',
    glowFilter: 'rgba(124, 77, 255, 0.45)',
  },
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showWordmark = true,
  size = 'md',
  scheme,
}) => {
  const { settings } = useSettings();
  const currentSchemeKey = scheme || settings.logoScheme || 'sunset';
  const currentScheme = SCHEMES[currentSchemeKey] || SCHEMES.sunset;
  const gradId = `zenLogoGrad-${currentSchemeKey}`;

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg
        className={`${iconSizes[size]} transition-all duration-300 hover:scale-105`}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            {currentScheme.stops.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
          <filter id={`glow-${currentSchemeKey}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor={currentScheme.glowFilter} />
          </filter>
        </defs>

        {/* Outer Shield with gradient glow */}
        <path
          d="M24 4L40 10V22C40 32.5 33.2 41.5 24 44C14.8 41.5 8 32.5 8 22V10L24 4Z"
          className="fill-slate-900/90 dark:fill-zen-bg-darkSurface"
          stroke={`url(#${gradId})`}
          strokeWidth="2.5"
          strokeLinejoin="round"
          filter={`url(#glow-${currentSchemeKey})`}
        />

        {/* Geometric Prism Z Path */}
        <path
          d="M17 17H31L17 31H31"
          stroke={`url(#${gradId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Core Pulse Dot */}
        <circle cx="24" cy="24" r="2.5" fill={currentScheme.dotColor} />
      </svg>

      {showWordmark && (
        <span
          className={`font-black tracking-wider uppercase bg-gradient-to-r ${currentScheme.wordmark} bg-clip-text text-transparent drop-shadow-sm ${textSizes[size]}`}
          style={{ letterSpacing: '0.08em' }}
        >
          ZENVORA
        </span>
      )}
    </div>
  );
};

