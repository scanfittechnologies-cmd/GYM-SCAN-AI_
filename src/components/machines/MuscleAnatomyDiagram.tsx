import React from 'react';

interface MuscleAnatomyDiagramProps {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  category: string;
}

export const MuscleAnatomyDiagram: React.FC<MuscleAnatomyDiagramProps> = ({
  primaryMuscles,
  secondaryMuscles,
  category
}) => {
  const isTargeted = (muscleKeyword: string) => {
    const isPrimary = primaryMuscles.some(m => m.toLowerCase().includes(muscleKeyword.toLowerCase()));
    const isSecondary = secondaryMuscles.some(m => m.toLowerCase().includes(muscleKeyword.toLowerCase()));
    return { isPrimary, isSecondary };
  };

  const getColor = (muscleKeyword: string) => {
    const { isPrimary, isSecondary } = isTargeted(muscleKeyword);
    if (isPrimary) return '#00F59B'; // Primary Cyber Emerald
    if (isSecondary) return '#38BDF8'; // Secondary Cyber Blue
    return '#1E293B'; // Inactive Slate
  };

  const getOpacity = (muscleKeyword: string) => {
    const { isPrimary, isSecondary } = isTargeted(muscleKeyword);
    if (isPrimary) return '0.95';
    if (isSecondary) return '0.7';
    return '0.35';
  };

  return (
    <div style={{
      background: 'rgba(15, 20, 30, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F1F5F9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Muscle Activation Map
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00F59B' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00F59B' }} /> Primary
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38BDF8' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38BDF8' }} /> Secondary
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', width: '100%', maxWidth: '340px' }}>
        {/* Front Body Silhouette */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '4px', fontWeight: 600 }}>ANTERIOR (FRONT)</span>
          <svg viewBox="0 0 100 180" width="110" height="190" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Head & Neck */}
            <circle cx="50" cy="18" r="10" fill="#2A354A" />
            <path d="M46 28 H54 V34 H46 Z" fill="#2A354A" />

            {/* Front Shoulders / Deltoids */}
            <path d="M32 35 C30 40 28 48 30 52 C35 52 38 42 39 36 Z" fill={getColor('deltoid') || getColor('shoulder')} opacity={getOpacity('deltoid')} />
            <path d="M68 35 C70 40 72 48 70 52 C65 52 62 42 61 36 Z" fill={getColor('deltoid') || getColor('shoulder')} opacity={getOpacity('deltoid')} />

            {/* Chest / Pectorals */}
            <path d="M39 36 C42 48 48 50 49 50 V40 H39 Z" fill={getColor('pectoral') || getColor('chest')} opacity={getOpacity('chest')} />
            <path d="M61 36 C58 48 52 50 51 50 V40 H61 Z" fill={getColor('pectoral') || getColor('chest')} opacity={getOpacity('chest')} />

            {/* Biceps */}
            <rect x="26" y="52" width="7" height="18" rx="3.5" fill={getColor('bicep') || getColor('arm')} opacity={getOpacity('bicep')} />
            <rect x="67" y="52" width="7" height="18" rx="3.5" fill={getColor('bicep') || getColor('arm')} opacity={getOpacity('bicep')} />

            {/* Forearms */}
            <rect x="23" y="72" width="6" height="22" rx="3" fill={getColor('forearm')} opacity={getOpacity('forearm')} />
            <rect x="71" y="72" width="6" height="22" rx="3" fill={getColor('forearm')} opacity={getOpacity('forearm')} />

            {/* Core / Abdominals */}
            <rect x="42" y="52" width="16" height="26" rx="3" fill={getColor('abdom') || getColor('core')} opacity={getOpacity('abdom')} />

            {/* Quadriceps (Thighs) */}
            <path d="M36 84 C34 98 35 120 37 128 C42 128 46 112 47 84 Z" fill={getColor('quad') || getColor('leg')} opacity={getOpacity('quad')} />
            <path d="M64 84 C66 98 65 120 63 128 C58 128 54 112 53 84 Z" fill={getColor('quad') || getColor('leg')} opacity={getOpacity('quad')} />

            {/* Front Calves / Shins */}
            <rect x="37" y="134" width="7" height="32" rx="3.5" fill={getColor('tibialis') || getColor('calf')} opacity={getOpacity('calf')} />
            <rect x="56" y="134" width="7" height="32" rx="3.5" fill={getColor('tibialis') || getColor('calf')} opacity={getOpacity('calf')} />
          </svg>
        </div>

        {/* Posterior (Back) Body Silhouette */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '4px', fontWeight: 600 }}>POSTERIOR (BACK)</span>
          <svg viewBox="0 0 100 180" width="110" height="190" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Head & Neck */}
            <circle cx="50" cy="18" r="10" fill="#2A354A" />

            {/* Upper Back / Traps */}
            <path d="M42 28 L50 36 L58 28 L50 24 Z" fill={getColor('trap') || getColor('back')} opacity={getOpacity('trap')} />

            {/* Lats (Upper/Mid Back) */}
            <path d="M34 36 C42 45 48 55 49 68 H37 C34 52 33 42 34 36 Z" fill={getColor('lat') || getColor('back') || getColor('rhomboid')} opacity={getOpacity('lat')} />
            <path d="M66 36 C58 45 52 55 51 68 H63 C66 52 67 42 66 36 Z" fill={getColor('lat') || getColor('back') || getColor('rhomboid')} opacity={getOpacity('lat')} />

            {/* Triceps (Rear Arms) */}
            <rect x="25" y="50" width="7" height="18" rx="3.5" fill={getColor('tricep') || getColor('arm')} opacity={getOpacity('tricep')} />
            <rect x="68" y="50" width="7" height="18" rx="3.5" fill={getColor('tricep') || getColor('arm')} opacity={getOpacity('tricep')} />

            {/* Glutes */}
            <path d="M36 80 C36 90 48 94 49 94 V80 Z" fill={getColor('glute') || getColor('leg')} opacity={getOpacity('glute')} />
            <path d="M64 80 C64 90 52 94 51 94 V80 Z" fill={getColor('glute') || getColor('leg')} opacity={getOpacity('glute')} />

            {/* Hamstrings (Rear Thighs) */}
            <rect x="36" y="96" width="11" height="30" rx="4" fill={getColor('hamstring') || getColor('leg')} opacity={getOpacity('hamstring')} />
            <rect x="53" y="96" width="11" height="30" rx="4" fill={getColor('hamstring') || getColor('leg')} opacity={getOpacity('hamstring')} />

            {/* Calves (Gastrocnemius / Soleus) */}
            <path d="M36 132 C34 142 36 156 38 164 C42 164 43 150 43 132 Z" fill={getColor('calf') || getColor('gastrocnemius')} opacity={getOpacity('calf')} />
            <path d="M64 132 C66 142 64 156 62 164 C58 164 57 150 57 132 Z" fill={getColor('calf') || getColor('gastrocnemius')} opacity={getOpacity('calf')} />
          </svg>
        </div>
      </div>

      {/* Target Muscle Pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {primaryMuscles.map((m, idx) => (
            <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
              ✓ {m}
            </span>
          ))}
          {secondaryMuscles.map((m, idx) => (
            <span key={idx} className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
              + {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
