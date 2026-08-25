import React from 'react';

export const RecifeBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({ 
  children,
  className = ''
}) => {
  // Generate harmonious wave line paths for top-right and bottom
  const topWaveLines = Array.from({ length: 24 }).map((_, i) => {
    const offset = i * 6.5;
    const opacity = 0.15 + (i % 6) * 0.12;
    const strokeWidth = 0.8 + (i % 3) * 0.4;
    const yStart = -80 + offset * 1.5;
    const cp1x = 1050 - offset * 2.5;
    const cp1y = 60 + offset * 4;
    const cp2x = 1280 + offset * 1.8;
    const cp2y = 260 + offset * 5;
    const cp3x = 1120 - offset * 1.5;
    const cp3y = 480 + offset * 4.5;
    const endX = 1440;
    const endY = 560 + offset * 3.5;

    return (
      <path
        key={`top-wave-${i}`}
        d={`M 980 ${yStart} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${cp3x} ${cp3y} T ${endX} ${endY}`}
        fill="none"
        stroke="url(#cyanGreenGradTop)"
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
      />
    );
  });

  const bottomWaveLines = Array.from({ length: 36 }).map((_, i) => {
    const offset = i * 4.2;
    const opacity = 0.12 + (i % 8) * 0.1;
    const strokeWidth = 0.75 + (i % 4) * 0.35;
    const startY = 820 - offset * 1.8;
    const cp1x = 340 + offset * 1.5;
    const cp1y = 680 - offset * 3.2;
    const cp2x = 680 - offset * 2.2;
    const cp2y = 860 + offset * 2.5;
    const cp3x = 1060 + offset * 3.0;
    const cp3y = 510 - offset * 4.5;
    const endX = 1440;
    const endY = 740 - offset * 1.2;

    return (
      <path
        key={`bot-wave-${i}`}
        d={`M 0 ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${cp3x} ${cp3y} T ${endX} ${endY}`}
        fill="none"
        stroke={i % 3 === 0 ? "url(#cyanGreenGradBot)" : "url(#whiteGlowGrad)"}
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
      />
    );
  });

  return (
    <div className={`relative min-h-screen w-full overflow-hidden bg-[#0005a3] text-white ${className}`}>
      {/* Deep Royal Cobalt Background with Subtle Radial Lighting */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 75% 20%, #030bbb 0%, #00059e 45%, #00037a 85%, #000260 100%)'
        }}
      />

      {/* SVG Wave Mesh Ribbons */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none object-cover"
        viewBox="0 0 1440 900" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cyanGreenGradTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#7effa2" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#00f2fe" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#4facfe" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="cyanGreenGradBot" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#43e97b" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#38f9d7" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#00c6ff" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="whiteGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#d4fc79" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#96e6a1" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Top-Right Glowing Wave Mesh */}
        <g id="top-right-waves">
          {topWaveLines}
        </g>

        {/* Bottom Flowing Sine Waves */}
        <g id="bottom-waves">
          {bottomWaveLines}
        </g>
      </svg>

      {/* Decorative ambient glow flares */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content on top of background */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between">
        {children}
      </div>

      {/* Official Institutional Logos Bar (Bottom-Right matching the reference image) */}
      <div className="relative z-20 pointer-events-none px-4 sm:px-8 py-4 flex items-center justify-end">
        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-5 text-white bg-slate-950/30 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-2 sm:p-0 rounded-xl">
          
          {/* Logo 1: RECIFE CUIDA mais */}
          <div className="flex items-center gap-1.5">
            <svg className="w-8 h-8 shrink-0 drop-shadow-sm" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="8" fill="transparent" />
              {/* Stylized Cross with Heart in Yellow/Green */}
              <path d="M19 12H29V19H36V29H29V36H19V29H12V19H19V12Z" stroke="#84cc16" strokeWidth="3.5" strokeLinejoin="round" fill="#84cc16" fillOpacity="0.2" />
              <path d="M24 16C26 13 31 14 31 18C31 23 24 27 24 27C24 27 17 23 17 18C17 14 22 13 24 16Z" fill="#eab308" />
            </svg>
            <div className="leading-tight text-left">
              <span className="block font-black text-xs sm:text-sm tracking-wider text-white uppercase">RECIFE</span>
              <span className="block font-extrabold text-[10px] sm:text-xs text-[#84cc16] tracking-tight">CUIDA <em className="text-[#eab308] not-italic">mais</em></span>
            </div>
          </div>

          <div className="h-6 w-px bg-white/30 hidden sm:block" />

          {/* Logo 2: SUS */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-white text-[#0005a3] rounded flex items-center justify-center font-black text-xs shadow-xs">
              +
            </div>
            <span className="font-black text-xs tracking-wider text-white">SUS</span>
          </div>

          <div className="h-6 w-px bg-white/30 hidden sm:block" />

          {/* Logo 3: Secretaria de Saúde */}
          <div className="text-left leading-tight hidden sm:block">
            <span className="text-xs font-normal text-slate-200 block">Secretaria de</span>
            <span className="text-xs font-bold text-white block tracking-wide">Saúde</span>
          </div>

          <div className="h-6 w-px bg-white/30 hidden sm:block" />

          {/* Logo 4: PREFEITURA DO RECIFE (Brasão Oficial) */}
          <div className="flex items-center gap-2 border-2 border-white rounded-lg px-2.5 py-1 bg-white/10 backdrop-blur-xs shadow-sm">
            <svg className="w-6 h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 5V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V5L12 2ZM12 4.18L18 6.43V11C18 15.42 15.44 19.54 12 20.91C8.56 19.54 6 15.42 6 11V6.43L12 4.18Z" />
              <path d="M11 7H13V12H16L12 17L8 12H11V7Z" fill="white" />
            </svg>
            <div className="leading-tight text-left">
              <span className="block font-black text-xs tracking-wider text-white uppercase">RECIFE</span>
              <span className="block text-[8px] font-bold text-slate-200 tracking-widest uppercase">PREFEITURA</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
