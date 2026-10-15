import React from 'react';

interface MachineSvgProps {
  type: string;
  className?: string;
  accentColor?: string;
}

export const MachineSvgIllustration: React.FC<MachineSvgProps> = ({ 
  type, 
  className = '', 
  accentColor = '#00F59B' 
}) => {
  const baseBg = '#131823';
  const frameColor = '#334155';
  const padColor = '#1E293B';
  const steelGlow = 'rgba(0, 245, 155, 0.15)';

  switch (type) {
    case 'chest-press':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
          <rect width="200" height="160" rx="16" fill={baseBg} />
          {/* Base & Frame */}
          <path d="M30 140 H170" stroke={frameColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M60 140 V40 H80" stroke={frameColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M140 140 V40 H120" stroke={frameColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Weight Stack */}
          <rect x="135" y="55" width="26" height="75" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2" />
          <line x1="138" y1="70" x2="158" y2="70" stroke="#64748B" strokeWidth="2" />
          <line x1="138" y1="85" x2="158" y2="85" stroke="#64748B" strokeWidth="2" />
          <line x1="138" y1="100" x2="158" y2="100" stroke="#64748B" strokeWidth="2" />
          <circle cx="148" cy="85" r="3" fill={accentColor} />

          {/* Seat & Backrest */}
          <rect x="68" y="70" width="12" height="55" rx="4" fill={padColor} stroke={accentColor} strokeWidth="1.5" />
          <rect x="74" y="115" width="38" height="10" rx="3" fill={padColor} stroke={accentColor} strokeWidth="1.5" />

          {/* Press Lever Arms */}
          <path d="M55 75 C 55 55, 95 55, 105 75 L 115 85" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
          <circle cx="115" cy="85" r="5" fill="#00D2FF" />
          <rect x="110" y="80" width="10" height="16" rx="3" fill="#38BDF8" />
          
          {/* Cables */}
          <path d="M105 75 L 148 55" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );

    case 'incline-press':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
          <rect width="200" height="160" rx="16" fill={baseBg} />
          <path d="M30 140 H170" stroke={frameColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M50 140 L85 45" stroke={frameColor} strokeWidth="6" strokeLinecap="round" />
          
          {/* Angled Backrest */}
          <rect x="65" y="60" width="12" height="65" rx="4" transform="rotate(-30 65 60)" fill={padColor} stroke={accentColor} strokeWidth="1.5" />
          <rect x="80" y="120" width="30" height="10" rx="3" fill={padColor} stroke={accentColor} strokeWidth="1.5" />
          
          {/* Upward Press Arms */}
          <path d="M70 70 L 105 45" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
          <circle cx="105" cy="45" r="6" fill="#38BDF8" />

          {/* Weight Stack */}
          <rect x="140" y="50" width="24" height="80" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2" />
          <line x1="143" y1="65" x2="161" y2="65" stroke="#64748B" strokeWidth="2" />
          <line x1="143" y1="80" x2="161" y2="80" stroke="#64748B" strokeWidth="2" />
        </svg>
      );

    case 'lat-pulldown':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
          <rect width="200" height="160" rx="16" fill={baseBg} />
          <path d="M30 140 H170" stroke={frameColor} strokeWidth="6" strokeLinecap="round" />
          {/* Overhead Tower & Arch */}
          <path d="M130 140 V30 H80" stroke={frameColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Seat & Thigh Roller */}
          <rect x="70" y="115" width="40" height="10" rx="3" fill={padColor} stroke={accentColor} strokeWidth="1.5" />
          <circle cx="95" cy="100" r="8" fill={padColor} stroke="#38BDF8" strokeWidth="2" />

          {/* Pulley & Wide Bar */}
          <circle cx="80" cy="30" r="5" fill="#64748B" />
          <line x1="80" y1="30" x2="80" y2="55" stroke="#94A3B8" strokeWidth="2" />
          <path d="M45 58 Q 80 52 115 58" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />

          {/* Weight Stack */}
          <rect x="125" y="45" width="22" height="85" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="2" />
          <circle cx="136" cy="75" r="3" fill={accentColor} />
        </svg>
      );

    case 'leg-press':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
          <rect width="200" height="160" rx="16" fill={baseBg} />
          <path d="M25 140 H175" stroke={frameColor} strokeWidth="6" strokeLinecap="round" />
          
          {/* Incline Rails (45 deg) */}
          <line x1="45" y1="135" x2="155" y2="35" stroke={frameColor} strokeWidth="6" strokeLinecap="round" />
          
          {/* Reclined Seat Pad */}
          <rect x="35" y="110" width="12" height="40" rx="3" transform="rotate(-40 35 110)" fill={padColor} stroke={accentColor} strokeWidth="1.5" />
          
          {/* Sled & Footplate */}
          <g transform="translate(90, 55) rotate(-45)">
            <rect x="0" y="0" width="35" height="18" rx="4" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
            <rect x="10" y="-12" width="15" height="12" rx="2" fill={accentColor} />
            <circle cx="28" cy="9" r="10" fill="#0F172A" stroke="#E2E8F0" strokeWidth="3" />
          </g>
        </svg>
      );

    case 'cable-row':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
          <rect width="200" height="160" rx="16" fill={baseBg} />
          <path d="M30 140 H170" stroke={frameColor} strokeWidth="6" strokeLinecap="round" />
          {/* Low Pulley Track */}
          <rect x="50" y="120" width="55" height="8" rx="2" fill={padColor} stroke={accentColor} strokeWidth="1.5" />
          <rect x="110" y="110" width="8" height="24" rx="2" fill="#64748B" />
          
          {/* Low Pulley & V-Bar */}
          <circle cx="135" cy="115" r="5" fill="#475569" />
          <line x1="135" y1="115" x2="85" y2="105" stroke="#94A3B8" strokeWidth="2" />
          <polygon points="80,100 87,105 80,110" fill={accentColor} />

          {/* Tower */}
          <rect x="135" y="45" width="22" height="85" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="2" />
        </svg>
      );

    case 'cable-crossover':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
          <rect width="200" height="160" rx="16" fill={baseBg} />
          {/* Dual Towers & Overhead Crossbar */}
          <path d="M25 140 H175" stroke={frameColor} strokeWidth="4" />
          <path d="M40 140 V35 H160 V140" stroke={frameColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Left & Right Stacks */}
          <rect x="30" y="55" width="18" height="75" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
          <rect x="152" y="55" width="18" height="75" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />

          {/* Pulleys & Cables */}
          <circle cx="48" cy="45" r="4" fill={accentColor} />
          <circle cx="152" cy="45" r="4" fill={accentColor} />
          <path d="M48 45 L 85 85" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M152 45 L 115 85" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="85" cy="85" r="5" fill="#38BDF8" />
          <circle cx="115" cy="85" r="5" fill="#38BDF8" />
        </svg>
      );

    case 'shoulder-press':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
          <rect width="200" height="160" rx="16" fill={baseBg} />
          <path d="M30 140 H170" stroke={frameColor} strokeWidth="6" strokeLinecap="round" />
          {/* Upright Post */}
          <path d="M75 140 V50" stroke={frameColor} strokeWidth="6" strokeLinecap="round" />
          <rect x="70" y="75" width="10" height="50" rx="3" fill={padColor} stroke={accentColor} strokeWidth="1.5" />
          <rect x="75" y="120" width="30" height="8" rx="2" fill={padColor} stroke={accentColor} strokeWidth="1.5" />

          {/* Overhead Lever Pivot */}
          <circle cx="65" cy="65" r="5" fill="#64748B" />
          <path d="M65 65 L 90 35 L 105 35" stroke={accentColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="105" cy="35" r="6" fill="#38BDF8" />
          <rect x="135" y="55" width="22" height="75" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="2" />
        </svg>
      );

    case 'leg-extension':
    case 'leg-curl':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
          <rect width="200" height="160" rx="16" fill={baseBg} />
          <path d="M30 140 H170" stroke={frameColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M65 140 V75 H90" stroke={frameColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          
          <rect x="58" y="70" width="10" height="45" rx="3" fill={padColor} stroke={accentColor} strokeWidth="1.5" />
          <rect x="68" y="105" width="35" height="10" rx="3" fill={padColor} stroke={accentColor} strokeWidth="1.5" />

          {/* Pivot & Shin Roller */}
          <circle cx="105" cy="110" r="6" fill={accentColor} />
          <line x1="105" y1="110" x2="115" y2="80" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
          <circle cx="115" cy="80" r="8" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />

          <rect x="135" y="55" width="22" height="75" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="2" />
        </svg>
      );

    case 'treadmill':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
          <rect width="200" height="160" rx="16" fill={baseBg} />
          {/* Base / Floor */}
          <path d="M20 140 H180" stroke={frameColor} strokeWidth="4" strokeLinecap="round" />
          {/* Treadmill Deck Ramp */}
          <path d="M30 135 L145 115" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
          <path d="M35 133 L140 114" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          {/* Running Belt Speed Streaks */}
          <line x1="55" y1="128" x2="80" y2="124" stroke={accentColor} strokeWidth="2" strokeDasharray="4 3" />
          <line x1="95" y1="121" x2="120" y2="117" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 3" />
          {/* Front Console Post */}
          <path d="M135 115 L150 55" stroke={frameColor} strokeWidth="5" strokeLinecap="round" />
          {/* Handrails */}
          <path d="M100 80 H148 L152 55" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Digital Screen Display */}
          <rect x="140" y="40" width="30" height="22" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="155" cy="51" r="4" fill={accentColor} />
          <line x1="144" y1="46" x2="166" y2="46" stroke="#64748B" strokeWidth="1" />
        </svg>
      );

    case 'stationary-bike':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
          <rect width="200" height="160" rx="16" fill={baseBg} />
          <path d="M25 140 H175" stroke={frameColor} strokeWidth="4" strokeLinecap="round" />
          {/* Front Flywheel */}
          <circle cx="130" cy="105" r="26" fill="#0F172A" stroke={accentColor} strokeWidth="3" />
          <circle cx="130" cy="105" r="10" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          {/* Frame Triangular Structure */}
          <path d="M65 140 L90 85 L130 105 L95 135 Z" stroke={frameColor} strokeWidth="5" strokeLinejoin="round" />
          {/* Seat Post & Saddle */}
          <line x1="90" y1="85" x2="80" y2="65" stroke={frameColor} strokeWidth="5" strokeLinecap="round" />
          <path d="M68 63 Q 82 58 96 63" stroke={padColor} strokeWidth="7" strokeLinecap="round" />
          <path d="M68 63 Q 82 58 96 63" stroke={accentColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Handlebars & Console */}
          <path d="M125 90 L140 50 L125 45" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="135" y="42" width="18" height="14" rx="3" fill="#0F172A" stroke={accentColor} strokeWidth="1.5" />
          {/* Pedal Crank */}
          <line x1="95" y1="135" x2="105" y2="120" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
          <circle cx="105" cy="120" r="4" fill="#00D2FF" />
        </svg>
      );

    case 'ab-crunch':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
          <rect width="200" height="160" rx="16" fill={baseBg} />
          <path d="M30 140 H170" stroke={frameColor} strokeWidth="6" strokeLinecap="round" />
          {/* Seat & Ergonomic Curve */}
          <path d="M55 140 V90 H95" stroke={frameColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="60" y="85" width="38" height="10" rx="3" fill={padColor} stroke={accentColor} strokeWidth="1.5" />
          {/* Curved Back / Pivot Core Arm */}
          <path d="M55 85 C 50 60, 75 45, 100 50" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
          {/* Overhead Crunch Handles & Chest Roller */}
          <circle cx="100" cy="50" r="7" fill="#1E293B" stroke="#38BDF8" strokeWidth="2.5" />
          <path d="M100 50 L115 65" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
          {/* Selectorized Pin Stack */}
          <rect x="135" y="55" width="24" height="75" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="2" />
          <circle cx="147" cy="85" r="3" fill={accentColor} />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
          <rect width="200" height="160" rx="16" fill={baseBg} />
          <path d="M30 140 H170" stroke={frameColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M60 140 V45 H140 V140" stroke={frameColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          
          <rect x="70" y="80" width="60" height="40" rx="6" fill={padColor} stroke={accentColor} strokeWidth="2" />
          <circle cx="100" cy="70" r="14" fill="rgba(0, 245, 155, 0.15)" stroke={accentColor} strokeWidth="2" />
          <path d="M96 66 L 104 74 M 104 66 L 96 74" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};
