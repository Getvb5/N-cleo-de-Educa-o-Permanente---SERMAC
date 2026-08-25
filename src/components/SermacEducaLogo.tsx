import React from 'react';

interface SermacEducaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full';
  showBackground?: boolean;
}

export const SermacEducaLogo: React.FC<SermacEducaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'icon',
  showBackground = true,
}) => {
  const sizeDimensions = {
    xs: { icon: 28, box: 'w-7 h-7' },
    sm: { icon: 36, box: 'w-9 h-9' },
    md: { icon: 44, box: 'w-11 h-11' },
    lg: { icon: 56, box: 'w-14 h-14' },
    xl: { icon: 72, box: 'w-18 h-18' },
  }[size];

  const svgIcon = (
    <svg
      viewBox="0 0 160 160"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo SERMAC EDUCA - Educação e Saúde"
    >
      <defs>
        {/* Arch Gradient */}
        <linearGradient id="archGrad" x1="20" y1="20" x2="140" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Human Figure & Health Gradient */}
        <linearGradient id="figureGrad" x1="80" y1="40" x2="80" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Outer Book Pages - Deep Orange / Amber */}
        <linearGradient id="bookOuterGrad" x1="80" y1="120" x2="80" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>

        {/* Mid Book Pages - Vibrant Orange */}
        <linearGradient id="bookMidGrad" x1="80" y1="120" x2="80" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Inner Book Pages - Warm Gold / Sun */}
        <linearGradient id="bookInnerGrad" x1="80" y1="120" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* 1. Top Overarching Arch Curve */}
      <path
        d="M 28 85 A 62 62 0 0 1 132 85"
        stroke="url(#archGrad)"
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* 2. Layered Open Book at the Base (Orange / Gold Spectrum) */}
      {/* Outer Layer Pages */}
      <g>
        {/* Left Outer Page */}
        <path
          d="M 80 128 C 66 122 46 116 35 120 L 35 76 C 46 72 66 78 80 84 Z"
          fill="none"
          stroke="url(#bookOuterGrad)"
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Right Outer Page */}
        <path
          d="M 80 128 C 94 122 114 116 125 120 L 125 76 C 114 72 94 78 80 84 Z"
          fill="none"
          stroke="url(#bookOuterGrad)"
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>

      {/* Mid Layer Pages */}
      <g>
        {/* Left Mid Page */}
        <path
          d="M 80 126 C 68 120 50 115 42 119 L 42 82 C 50 78 68 83 80 88 Z"
          fill="none"
          stroke="url(#bookMidGrad)"
          strokeWidth="5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Right Mid Page */}
        <path
          d="M 80 126 C 92 120 110 115 118 119 L 118 82 C 110 78 92 83 80 88 Z"
          fill="none"
          stroke="url(#bookMidGrad)"
          strokeWidth="5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>

      {/* Inner Layer Pages (Thick Warm Core) */}
      <g>
        {/* Left Inner Page Filled */}
        <path
          d="M 80 124 C 70 119 55 115 48 118 L 48 88 C 55 85 70 89 80 94 Z"
          fill="none"
          stroke="url(#bookInnerGrad)"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Right Inner Page Filled */}
        <path
          d="M 80 124 C 90 119 105 115 112 118 L 112 88 C 105 85 90 89 80 94 Z"
          fill="none"
          stroke="url(#bookInnerGrad)"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>

      {/* 3. Central Uplifting Health & Education Human Figure (Cyan / Royal Blue) */}
      <g>
        {/* Stylized Uplifting Body & Reaching Arms forming a Dynamic V and Heart shape */}
        <path
          d="M 80 120 
             C 77 105 73 90 62 70 
             C 56 60 48 52 46 48
             C 45 46 47 44 50 46
             C 58 50 70 65 74 80
             C 76 86 78 88 80 88
             C 82 88 84 86 86 80
             C 90 65 102 50 110 46
             C 113 44 115 46 114 48
             C 112 52 104 60 98 70
             C 87 90 83 105 80 120 Z"
          fill="url(#figureGrad)"
        />

        {/* Head */}
        <circle cx="80" cy="54" r="10.5" fill="url(#figureGrad)" />

        {/* Education Graduation Cap / Mortarboard */}
        <path
          d="M 80 39 L 97 45 L 80 51 L 63 45 Z"
          fill="#0284C7"
        />
        {/* Cap Bottom Rim */}
        <path
          d="M 70 48.5 Q 80 52 90 48.5"
          stroke="#0369A1"
          strokeWidth="2"
          fill="none"
        />
        {/* Cap Tassel */}
        <path
          d="M 94 46 L 97 54"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="97" cy="55" r="1.5" fill="#EA580C" />

        {/* 4. Integrated Health Cross Badge inside the uplifting center */}
        <g transform="translate(80, 84)">
          {/* Subtle white health cross */}
          <rect x="-2" y="-9" width="4" height="13" rx="1.2" fill="#FFFFFF" />
          <rect x="-6" y="-5.5" width="12" height="4" rx="1.2" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showBackground ? (
          <div
            className={`${sizeDimensions.box} rounded-xl bg-white p-1 flex items-center justify-center shadow-sm border border-slate-200 shrink-0`}
          >
            {svgIcon}
          </div>
        ) : (
          <div className={`${sizeDimensions.box} flex items-center justify-center shrink-0`}>
            {svgIcon}
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-white font-black text-lg tracking-tight">SERMAC</span>
            <span className="text-[#38BDF8] font-black text-lg tracking-tight">EDUCA</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-blue-100 font-semibold mt-1">
            Secretaria de Saúde • SUS Recife
          </span>
        </div>
      </div>
    );
  }

  if (showBackground) {
    return (
      <div
        className={`${sizeDimensions.box} rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-slate-200 shrink-0 ${className}`}
        title="SERMAC EDUCA - Sistema de Educação Permanente em Saúde"
      >
        {svgIcon}
      </div>
    );
  }

  return (
    <div className={`${sizeDimensions.box} flex items-center justify-center shrink-0 ${className}`}>
      {svgIcon}
    </div>
  );
};
