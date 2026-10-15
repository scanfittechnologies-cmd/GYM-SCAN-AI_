import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useGym } from '../context/GymContext';
import { Machine, MachineCategory } from '../types';
import { MACHINE_CATEGORIES } from '../data/machines';
import {
  Search,
  Sparkles,
  CheckCircle,
  Star,
  X,
  Dumbbell,
  QrCode,
  ChevronDown,
  AlertCircle,
  BookOpen,
  ArrowUpDown,
  Layers,
  LayoutGrid,
  List,
  Info,
  RefreshCw,
  Camera,
  AlertTriangle,
  WifiOff
} from 'lucide-react';
import { MachineCard } from '../components/machines/MachineCard';

/* ─────────────────────────────────────────────────────────────
   Types & Configurations
───────────────────────────────────────────────────────────── */
type SortOption = 'recommended' | 'az' | 'za' | 'recent' | 'difficulty-asc' | 'difficulty-desc';
type ViewMode = 'grid' | 'list';
type DifficultyFilter = 'all' | 'Beginner' | 'Intermediate' | 'Advanced';

const DIFFICULTY_ORDER: Record<string, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };

const SORT_LABELS: Record<SortOption, string> = {
  recommended: 'Recommended',
  az: 'Alphabetical: A–Z',
  za: 'Alphabetical: Z–A',
  recent: 'Recently Added',
  'difficulty-asc': 'Difficulty: Beginner First',
  'difficulty-desc': 'Difficulty: Advanced First',
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Chest:             { bg: 'rgba(255, 99, 102, 0.14)',  border: 'rgba(255, 99, 102, 0.35)',  text: '#FF6366', icon: '🫀' },
  Back:              { bg: 'rgba(56, 189, 248, 0.14)',  border: 'rgba(56, 189, 248, 0.35)',  text: '#38BDF8', icon: '🏋️' },
  Shoulders:         { bg: 'rgba(168, 85, 247, 0.14)',  border: 'rgba(168, 85, 247, 0.35)',  text: '#C084FC', icon: '💪' },
  Arms:              { bg: 'rgba(251, 146, 60, 0.14)',  border: 'rgba(251, 146, 60, 0.35)',  text: '#FB923C', icon: '🦾' },
  Legs:              { bg: 'rgba(34, 197, 94, 0.14)',   border: 'rgba(34, 197, 94, 0.35)',   text: '#22C55E', icon: '🦵' },
  Cardio:            { bg: 'rgba(255, 184, 0, 0.14)',   border: 'rgba(255, 184, 0, 0.35)',   text: '#FFB800', icon: '🏃' },
  Core:              { bg: 'rgba(0, 245, 155, 0.14)',   border: 'rgba(0, 245, 155, 0.35)',   text: '#00F59B', icon: '⚡' },
  'Cable Equipment': { bg: 'rgba(0, 210, 255, 0.14)',   border: 'rgba(0, 210, 255, 0.35)',   text: '#00D2FF', icon: '🔗' },
  Other:             { bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.28)', text: '#94A3B8', icon: '🏗️' },
};

/* ─────────────────────────────────────────────────────────────
   List Mode Machine Row Component
───────────────────────────────────────────────────────────── */
interface MachineListRowProps {
  machine: Machine;
  onSelect: (machine: Machine) => void;
}

const MachineListRow: React.FC<MachineListRowProps> = ({ machine, onSelect }) => {
  const { isMachineDiscovered, isFavorite, toggleFavorite } = useGym();
  const discovered = isMachineDiscovered(machine.id);
  const favorited = isFavorite(machine.id);
  const catColor = CATEGORY_COLORS[machine.category] ?? CATEGORY_COLORS['Other'];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(machine)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(machine);
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.85rem 1rem',
        background: 'linear-gradient(145deg, rgba(26, 32, 46, 0.75) 0%, rgba(18, 22, 32, 0.85) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0, 245, 155, 0.3)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateX(3px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
      }}
    >
      {/* Category Indicator Stripe */}
      <div style={{ width: '4px', height: '48px', borderRadius: '2px', background: catColor.text, flexShrink: 0 }} />

      {/* Meta & Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '3px' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#F1F5F9', fontWeight: 700, margin: 0 }}>{machine.name}</h3>
          <span style={{ fontSize: '0.68rem', color: '#64748B', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: '4px' }}>
            {machine.qrCodeId}
          </span>
          {discovered && (
            <span style={{ fontSize: '0.65rem', color: '#00F59B', background: 'rgba(0,245,155,0.12)', border: '1px solid rgba(0,245,155,0.3)', borderRadius: '999px', padding: '1px 6px', fontWeight: 700 }}>
              ✓ Discovered
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {machine.description || machine.tagline}
        </p>
        <span style={{ fontSize: '0.68rem', color: '#64748B', fontStyle: 'italic' }}>
          Availability not currently provided
        </span>
      </div>

      {/* Category pill */}
      <span style={{ fontSize: '0.72rem', background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}`, borderRadius: '999px', padding: '2px 8px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
        {machine.category}
      </span>

      {/* Primary Muscle */}
      <span style={{ fontSize: '0.72rem', color: '#CBD5E1', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Dumbbell size={12} color="#00F59B" /> {machine.primaryMuscles[0]?.split('(')[0].trim() ?? 'General'}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(machine.id); }}
          style={{
            background: favorited ? 'rgba(255,184,0,0.18)' : 'transparent',
            border: favorited ? '1px solid rgba(255,184,0,0.4)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '6px',
            color: favorited ? '#FFB800' : '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title={favorited ? 'Saved in local favorites' : 'Save to favorites'}
        >
          <Star size={14} fill={favorited ? '#FFB800' : 'none'} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(machine); }}
          style={{
            background: 'rgba(0,245,155,0.1)',
            color: '#00F59B',
            border: '1px solid rgba(0,245,155,0.25)',
            borderRadius: '8px',
            padding: '5px 11px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Sort Dropdown
───────────────────────────────────────────────────────────── */
interface SortDropdownProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options: SortOption[] = ['recommended', 'az', 'za', 'recent', 'difficulty-asc', 'difficulty-desc'];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sort machines"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '0.55rem 0.85rem',
          color: '#CBD5E1',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        <ArrowUpDown size={14} color="#00F59B" />
        <span>{SORT_LABELS[value]}</span>
        <ChevronDown size={13} style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          background: '#161B26',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '14px',
          overflow: 'hidden',
          zIndex: 50,
          minWidth: '220px',
          boxShadow: '0 16px 40px -10px rgba(0,0,0,0.8)',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.65rem 1rem',
                background: value === opt ? 'rgba(0,245,155,0.1)' : 'transparent',
                color: value === opt ? '#00F59B' : '#CBD5E1',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: value === opt ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (value !== opt) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (value !== opt) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              {value === opt ? <CheckCircle size={13} color="#00F59B" /> : <span style={{ width: 13 }} />}
              {SORT_LABELS[opt]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Empty State Component
───────────────────────────────────────────────────────────── */
interface EmptyStateProps {
  searchQuery: string;
  onClear: () => void;
  onNavigate: (tab: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery, onClear, onNavigate }) => (
  <div
    className="glass-card"
    style={{
      padding: '3.5rem 2rem',
      textAlign: 'center',
      maxWidth: '520px',
      margin: '0 auto',
      animation: 'fadeIn 0.25s ease-out',
    }}
  >
    <div style={{
      width: '72px', height: '72px', borderRadius: '22px',
      background: 'rgba(148, 163, 184, 0.08)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#64748B', margin: '0 auto 1.25rem auto',
    }}>
      <Search size={30} />
    </div>

    <h3 style={{ fontSize: '1.25rem', color: '#F1F5F9', marginBottom: '0.5rem' }}>
      No machines found. Try another search or scan a machine.
    </h3>
    <p style={{ fontSize: '0.85rem', color: '#94A3B8', maxWidth: '380px', margin: '0 auto 0.5rem auto', lineHeight: 1.55 }}>
      {searchQuery
        ? <>No equipment records match <strong style={{ color: '#F1F5F9' }}>"{searchQuery}"</strong>. Try checking spelling, using general muscle names, or clearing active filters.</>
        : 'No machines match your active filter combination.'}
    </p>
    <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '1.75rem' }}>
      💡 Popular searches: <em>"Chest Press"</em>, <em>"Lat Pulldown"</em>, <em>"Treadmill"</em>, <em>"Legs"</em>, <em>"Quads"</em>
    </p>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', justifyContent: 'center' }}>
      <button onClick={onClear} className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.65rem 1.3rem' }}>
        <X size={15} /> Clear Search &amp; Filters
      </button>
      <button onClick={() => onNavigate('scan')} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.65rem 1.15rem' }}>
        <QrCode size={15} /> Scan Machine
      </button>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Skeleton Card Loader
───────────────────────────────────────────────────────────── */
const SkeletonCard: React.FC = () => (
  <div className="glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: 0.7 }}>
    <div style={{ height: '150px', background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: 12, left: 12, width: 70, height: 18, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }} />
    </div>
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
      <div style={{ width: '60%', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ width: '90%', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ width: '40%', height: '18px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', marginTop: 'auto' }} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Main Machine Library Page Component
───────────────────────────────────────────────────────────── */
interface MachineLibraryPageProps {
  onSelectMachine: (machine: Machine, source?: 'library') => void;
  onNavigate?: (tab: string, mode?: string) => void;
}

export const MachineLibraryPage: React.FC<MachineLibraryPageProps> = ({ onSelectMachine, onNavigate }) => {
  const { machines, isMachineDiscovered, isFavorite, discoveredMachineIds, favoriteMachineIds } = useGym();

  /* ── State ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyFilter>('all');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [filterDiscoveredOnly, setFilterDiscoveredOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Dev state simulations (loading / offline / empty error test)
  const [isSimulatingLoading, setIsSimulatingLoading] = useState(false);
  const [simulatedError, setSimulatedError] = useState<string | null>(null);
  const [isOfflineSimulation, setIsOfflineSimulation] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  /* ── Quick counts ── */
  const totalFavorites = favoriteMachineIds.length;
  const totalDiscovered = discoveredMachineIds.length;

  /* ── Trigger simulated refresh ── */
  const triggerRefresh = () => {
    setIsSimulatingLoading(true);
    setSimulatedError(null);
    setTimeout(() => {
      setIsSimulatingLoading(false);
    }, 450);
  };

  /* ── Categories List ── */
  const allCategories = useMemo(() => {
    return [
      { id: 'all', name: 'All Machines', count: machines.length, emoji: '🏋️' },
      ...MACHINE_CATEGORIES.map(c => ({
        id: c.id,
        name: c.name,
        count: machines.filter(m => m.category === c.id).length,
        emoji: CATEGORY_COLORS[c.id]?.icon ?? '🔧',
      })),
    ];
  }, [machines]);

  /* ── Muscle Groups List for secondary filter ── */
  const muscleGroups = useMemo(() => {
    const muscles = new Set<string>();
    machines.forEach(m => {
      m.primaryMuscles.forEach(pm => {
        const simpleName = pm.split('(')[0].trim();
        if (simpleName) muscles.add(simpleName);
      });
    });
    return Array.from(muscles).sort();
  }, [machines]);

  /* ── Filter + Sort Logic ── */
  const filteredMachines = useMemo(() => {
    if (simulatedError) return [];

    const query = searchQuery.toLowerCase().trim();

    let result = machines.filter(m => {
      // 1. Universal text search
      const matchesSearch = !query ||
        m.name.toLowerCase().includes(query) ||
        (m.alternativeNames ?? []).some(alt => alt.toLowerCase().includes(query)) ||
        (m.brand && m.brand.toLowerCase().includes(query)) ||
        m.category.toLowerCase().includes(query) ||
        m.tagline.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.primaryMuscles.some(mus => mus.toLowerCase().includes(query)) ||
        m.secondaryMuscles.some(mus => mus.toLowerCase().includes(query)) ||
        m.qrCodeId.toLowerCase().includes(query) ||
        m.matchKeywords.some(kw => kw.toLowerCase().includes(query)) ||
        (m.exercises ?? []).some(ex =>
          ex.name.toLowerCase().includes(query) ||
          ex.mainMuscle.toLowerCase().includes(query) ||
          ex.description.toLowerCase().includes(query)
        );

      // 2. Category filter
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;

      // 3. Muscle group filter
      const matchesMuscle = selectedMuscle === 'all' ||
        m.primaryMuscles.some(mus => mus.toLowerCase().includes(selectedMuscle.toLowerCase())) ||
        m.secondaryMuscles.some(mus => mus.toLowerCase().includes(selectedMuscle.toLowerCase()));

      // 4. Difficulty filter
      const matchesDifficulty = filterDifficulty === 'all' || m.difficulty === filterDifficulty;

      // 5. Favorites filter
      const matchesFavorite = !filterFavoritesOnly || isFavorite(m.id);

      // 6. Discovered filter
      const matchesDiscovered = !filterDiscoveredOnly || isMachineDiscovered(m.id);

      return matchesSearch && matchesCategory && matchesMuscle && matchesDifficulty && matchesFavorite && matchesDiscovered;
    });

    // Sort order
    switch (sortBy) {
      case 'az':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'za':
        result = [...result].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'difficulty-asc':
        result = [...result].sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0));
        break;
      case 'difficulty-desc':
        result = [...result].sort((a, b) => (DIFFICULTY_ORDER[b.difficulty] ?? 0) - (DIFFICULTY_ORDER[a.difficulty] ?? 0));
        break;
      case 'recent':
        // Featured machines or newly indexed machines first
        result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default: // Recommended
        result = [...result].sort((a, b) => {
          const aScore = (a.featured ? 10 : 0) + (isMachineDiscovered(a.id) ? 3 : 0) + (isFavorite(a.id) ? 2 : 0);
          const bScore = (b.featured ? 10 : 0) + (isMachineDiscovered(b.id) ? 3 : 0) + (isFavorite(b.id) ? 2 : 0);
          return bScore - aScore;
        });
    }

    return result;
  }, [machines, searchQuery, selectedCategory, selectedMuscle, sortBy, filterDifficulty, filterFavoritesOnly, filterDiscoveredOnly, isFavorite, isMachineDiscovered, simulatedError]);

  /* ── Active Filters Count ── */
  const activeFilterCount = [
    searchQuery !== '',
    selectedCategory !== 'all',
    selectedMuscle !== 'all',
    filterDifficulty !== 'all',
    filterFavoritesOnly,
    filterDiscoveredOnly,
  ].filter(Boolean).length;

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedMuscle('all');
    setFilterDifficulty('all');
    setFilterFavoritesOnly(false);
    setFilterDiscoveredOnly(false);
    setSortBy('recommended');
    setSimulatedError(null);
  }, []);

  const handleSelectMachine = useCallback((machine: Machine) => {
    onSelectMachine(machine, 'library');
  }, [onSelectMachine]);

  const handleNavigate = useCallback((tab: string, mode?: string) => {
    if (onNavigate) onNavigate(tab, mode);
  }, [onNavigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>

      {/* ── Offline Banner Simulation Notice ── */}
      {isOfflineSimulation && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'rgba(255, 184, 0, 0.12)',
          border: '1px solid rgba(255, 184, 0, 0.35)',
          borderRadius: '12px',
          color: '#FFB800',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WifiOff size={16} />
            <span><strong>Offline Mode Active:</strong> Browsing local cached library data. Cloud sync paused.</span>
          </div>
          <button
            onClick={() => setIsOfflineSimulation(false)}
            style={{ background: 'transparent', border: 'none', color: '#FFB800', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.78rem' }}
          >
            Reconnect
          </button>
        </div>
      )}

      {/* ── 1. Page Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(10,14,22,0.98) 100%)',
        border: '1px solid rgba(0,245,155,0.18)',
        borderRadius: '22px',
        padding: '1.75rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow gradients */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,245,155,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,210,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <BookOpen size={10} /> Machine Library
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>• {machines.length} Equipment Records</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold" style={{ fontSize: '0.7rem' }}>
                50 Commercial Machines
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.1rem)', color: '#F1F5F9', margin: '0 0 0.35rem 0', lineHeight: 1.2 }}>
              Machine Library
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0, maxWidth: '560px', lineHeight: 1.5 }}>
              Explore gym equipment, discover exercises, and learn how to use each machine.
            </p>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '0.65rem', flexShrink: 0, flexWrap: 'wrap' }}>
            <button
              id="btn-header-scan"
              onClick={() => handleNavigate('scan', 'qr')}
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.65rem 1.15rem' }}
            >
              <QrCode size={15} /> Scan Machine
            </button>
            <button
              onClick={() => handleNavigate('scan', 'photo')}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.65rem 1.05rem' }}
            >
              <Camera size={15} /> Upload Photo
            </button>
          </div>
        </div>

        {/* Header Stats Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          zIndex: 1,
        }}>
          {[
            { label: 'Total Machines', value: machines.length, color: '#00F59B', icon: <Layers size={14} /> },
            { label: 'Discovered', value: totalDiscovered, color: '#38BDF8', icon: <CheckCircle size={14} /> },
            { label: 'Saved Favorites', value: totalFavorites, color: '#FFB800', icon: <Star size={14} /> },
            { label: 'Categories', value: MACHINE_CATEGORIES.length, color: '#C084FC', icon: <LayoutGrid size={14} /> },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <span style={{ fontSize: '0.82rem', color: stat.color, fontWeight: 700 }}>{stat.value}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. Search Bar ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color="#64748B"
            style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            ref={searchRef}
            id="machine-search"
            type="search"
            aria-label="Search machines"
            placeholder="Search machine name, category, muscle group, or exercise (e.g. Chest Press, Lats, Treadmill, Quads)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-modern"
            style={{
              paddingLeft: '3rem',
              paddingRight: searchQuery ? '2.8rem' : '1rem',
              height: '52px',
              fontSize: '0.9rem',
              borderRadius: '14px',
              border: searchQuery ? '1px solid rgba(0, 245, 155, 0.4)' : '1px solid rgba(255,255,255,0.1)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
              aria-label="Clear search query"
              style={{
                position: 'absolute',
                right: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Quick Search Suggestions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingLeft: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Quick search:</span>
          {['Chest Press', 'Lat Pulldown', 'Treadmill', 'Leg Press', 'Stationary Bike', 'Abdominal'].map(tag => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              style={{
                background: searchQuery === tag ? 'rgba(0, 245, 155, 0.15)' : 'rgba(255,255,255,0.03)',
                color: searchQuery === tag ? '#00F59B' : '#94A3B8',
                border: searchQuery === tag ? '1px solid rgba(0, 245, 155, 0.35)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '0.72rem',
                cursor: 'pointer',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. Category Filter Tabs ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Equipment Categories
          </span>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              style={{ background: 'transparent', border: 'none', color: '#00F59B', fontSize: '0.74rem', cursor: 'pointer' }}
            >
              Reset to All
            </button>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '6px',
          scrollbarWidth: 'none',
        }}>
          {allCategories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const catColor = CATEGORY_COLORS[cat.id];
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={isSelected}
                style={{
                  background: isSelected
                    ? (cat.id === 'all'
                      ? 'linear-gradient(135deg, #00F59B, #00D2B4)'
                      : catColor ? catColor.bg : 'rgba(0,245,155,0.15)')
                    : 'rgba(255,255,255,0.04)',
                  color: isSelected
                    ? (cat.id === 'all' ? '#05140F' : catColor?.text ?? '#00F59B')
                    : '#94A3B8',
                  border: isSelected
                    ? `1.5px solid ${cat.id === 'all' ? '#00F59B' : catColor?.border ?? 'rgba(0,245,155,0.4)'}`
                    : '1px solid rgba(255,255,255,0.08)',
                  padding: '0.5rem 0.95rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
                <span style={{
                  fontSize: '0.68rem',
                  background: isSelected ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)',
                  color: isSelected ? (cat.id === 'all' ? '#05140F' : catColor?.text ?? '#00F59B') : '#64748B',
                  borderRadius: '999px',
                  padding: '1px 6px',
                  fontWeight: 700,
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. Secondary Filter + Sort Toolbar ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.85rem 1.1rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
      }}>
        {/* Left Filters Group */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Filters:
          </span>

          {/* Muscle dropdown filter */}
          <div style={{ position: 'relative' }}>
            <select
              aria-label="Filter by primary muscle group"
              value={selectedMuscle}
              onChange={e => setSelectedMuscle(e.target.value)}
              style={{
                background: selectedMuscle !== 'all' ? 'rgba(0,245,155,0.12)' : 'rgba(255,255,255,0.04)',
                color: selectedMuscle !== 'all' ? '#00F59B' : '#94A3B8',
                border: selectedMuscle !== 'all' ? '1px solid rgba(0,245,155,0.35)' : '1px solid rgba(255,255,255,0.08)',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all" style={{ background: '#161B26', color: '#F1F5F9' }}>All Muscle Groups</option>
              {muscleGroups.map(mus => (
                <option key={mus} value={mus} style={{ background: '#161B26', color: '#F1F5F9' }}>
                  🎯 {mus}
                </option>
              ))}
            </select>
          </div>

          {/* Favorites toggle */}
          <button
            id="filter-favorites"
            onClick={() => setFilterFavoritesOnly(v => !v)}
            aria-pressed={filterFavoritesOnly}
            style={{
              background: filterFavoritesOnly ? 'rgba(255,184,0,0.18)' : 'transparent',
              color: filterFavoritesOnly ? '#FFB800' : '#94A3B8',
              border: filterFavoritesOnly ? '1px solid rgba(255,184,0,0.45)' : '1px solid rgba(255,255,255,0.08)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s',
            }}
          >
            <Star size={12} fill={filterFavoritesOnly ? '#FFB800' : 'none'} />
            Saved Favorites ({totalFavorites})
          </button>

          {/* Discovered toggle */}
          <button
            id="filter-discovered"
            onClick={() => setFilterDiscoveredOnly(v => !v)}
            aria-pressed={filterDiscoveredOnly}
            style={{
              background: filterDiscoveredOnly ? 'rgba(0,245,155,0.12)' : 'transparent',
              color: filterDiscoveredOnly ? '#00F59B' : '#94A3B8',
              border: filterDiscoveredOnly ? '1px solid rgba(0,245,155,0.35)' : '1px solid rgba(255,255,255,0.08)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s',
            }}
          >
            <CheckCircle size={12} />
            Discovered ({totalDiscovered})
          </button>

          {/* Difficulty filter buttons */}
          {(['Beginner', 'Intermediate', 'Advanced'] as const).map(diff => {
            const isActive = filterDifficulty === diff;
            const diffColor = diff === 'Beginner' ? '#00F59B' : diff === 'Intermediate' ? '#FFB800' : '#FF6366';
            return (
              <button
                key={diff}
                id={`filter-diff-${diff}`}
                onClick={() => setFilterDifficulty(isActive ? 'all' : diff)}
                aria-pressed={isActive}
                style={{
                  background: isActive ? `rgba(${diff === 'Beginner' ? '0,245,155' : diff === 'Intermediate' ? '255,184,0' : '255,99,102'},0.14)` : 'transparent',
                  color: isActive ? diffColor : '#94A3B8',
                  border: isActive ? `1px solid ${diffColor}44` : '1px solid rgba(255,255,255,0.08)',
                  padding: '4px 9px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {diff}
              </button>
            );
          })}

          {/* Clear all active filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              style={{
                background: 'rgba(255,71,87,0.1)',
                color: '#FF6B81',
                border: '1px solid rgba(255,71,87,0.3)',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <X size={11} /> Clear All ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Right Sort & View Modes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap' }}>
            <strong style={{ color: '#F1F5F9' }}>{filteredMachines.length}</strong> of {machines.length}
          </span>

          <SortDropdown value={sortBy} onChange={setSortBy} />

          {/* Grid / List View Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['grid', 'list'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                id={`view-${mode}`}
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                title={mode === 'grid' ? 'Grid View' : 'List View'}
                style={{
                  background: viewMode === mode ? 'rgba(0,245,155,0.15)' : 'transparent',
                  color: viewMode === mode ? '#00F59B' : '#64748B',
                  border: 'none',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.15s',
                }}
              >
                {mode === 'grid' ? <LayoutGrid size={15} /> : <List size={15} />}
              </button>
            ))}
          </div>

          {/* Refresh / Re-index button */}
          <button
            onClick={triggerRefresh}
            title="Refresh equipment library data"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94A3B8',
              borderRadius: '10px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RefreshCw size={14} className={isSimulatingLoading ? 'spin-animation' : ''} />
          </button>
        </div>
      </div>

      {/* ── 5. Transparent Demo Data & Availability Notice ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.65rem',
        padding: '0.75rem 1rem',
        background: 'rgba(0,210,255,0.05)',
        border: '1px solid rgba(0,210,255,0.18)',
        borderRadius: '14px',
      }}>
        <Info size={16} color="#00D2FF" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
          <strong style={{ color: '#00D2FF' }}>Demo Data Notice:</strong> All machine records and exercises are sample educational representations for development. Data is not verified by a gym facility or equipment manufacturer.{' '}
          <strong style={{ color: '#CBD5E1' }}>Availability information is not currently provided.</strong> Saved favorites persist locally in your browser storage.
        </p>
      </div>

      {/* ── 6. Simulated Error Banner if Active ── */}
      {simulatedError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          background: 'rgba(255, 71, 87, 0.1)',
          border: '1px solid rgba(255, 71, 87, 0.3)',
          borderRadius: '14px',
          color: '#FF6B81',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            <span><strong>Database Query Error:</strong> {simulatedError}</span>
          </div>
          <button
            onClick={() => setSimulatedError(null)}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '4px 10px', color: '#FF6B81', borderColor: 'rgba(255,71,87,0.3)' }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* ── 7. Machines Grid / List / Skeletons / Empty State ── */}
      {isSimulatingLoading ? (
        <div className="grid-cards">
          {[1, 2, 3, 4, 5, 6].map(n => <SkeletonCard key={n} />)}
        </div>
      ) : filteredMachines.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid-cards" style={{ animation: 'fadeIn 0.2s ease-out' }}>
              {filteredMachines.map(machine => (
                <MachineCard
                  key={machine.id}
                  machine={machine}
                  onSelect={handleSelectMachine}
                />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', animation: 'fadeIn 0.2s ease-out' }}>
              {filteredMachines.map(machine => (
                <MachineListRow
                  key={machine.id}
                  machine={machine}
                  onSelect={handleSelectMachine}
                />
              ))}
            </div>
          )}

          {/* Machine Count Summary Footer */}
          <div style={{ textAlign: 'center', padding: '0.5rem 0', fontSize: '0.78rem', color: '#64748B' }}>
            Showing {filteredMachines.length} of {machines.length} machines in library
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} style={{ background: 'transparent', border: 'none', color: '#00F59B', cursor: 'pointer', marginLeft: '6px', textDecoration: 'underline', fontSize: '0.78rem' }}>
                (clear all filters)
              </button>
            )}
          </div>
        </>
      ) : (
        <EmptyState searchQuery={searchQuery} onClear={clearAllFilters} onNavigate={handleNavigate} />
      )}

    </div>
  );
};
