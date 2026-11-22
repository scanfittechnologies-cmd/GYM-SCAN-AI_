import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useGym } from '../context/GymContext';
import { Machine } from '../types';
import { MACHINE_CATEGORIES } from '../data/machines';
import {
  Search,
  X,
  Star,
  CheckCircle,
  Dumbbell
} from 'lucide-react';
import { getMachinePhotos } from '../data/machinePhotos';
import { MachineSvgIllustration } from '../components/machines/MachineSvgIllustrations';
import { useSoftGate } from '../hooks/useSoftGate';

/* ─────────────────────────────────────────────────────────────
   Main Machine Library Page Component
───────────────────────────────────────────────────────────── */
interface MachineLibraryPageProps {
  onSelectMachine: (machine: Machine, source?: 'library') => void;
  onNavigate?: (tab: string, mode?: string) => void;
}

export const MachineLibraryPage: React.FC<MachineLibraryPageProps> = ({ onSelectMachine }) => {
  const { machines, isMachineDiscovered, isFavorite, toggleFavorite } = useGym();
  const { requireAuth } = useSoftGate();

  /* ── State ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const searchRef = useRef<HTMLInputElement>(null);

  /* ── Non-Cardio dataset count ── */
  const libraryTotal = useMemo(() => {
    return machines.filter(m => m.category !== 'Cardio' && !m.equipmentType?.toLowerCase().includes('cardio')).length;
  }, [machines]);

  /* ── Muscle & Equipment Filter categories (All, Chest, Back, Legs, Shoulders, Arms, Core) ── */
  const filterPills = useMemo(() => {
    const list = [
      { id: 'all', label: 'All' },
      { id: 'Chest', label: 'Chest' },
      { id: 'Back', label: 'Back' },
      { id: 'Legs', label: 'Legs' },
      { id: 'Shoulders', label: 'Shoulders' },
      { id: 'Arms', label: 'Arms' },
      { id: 'Core', label: 'Core' },
      { id: 'Cable Equipment', label: 'Cables' }
    ];
    return list;
  }, []);

  /* ── Filtering Logic ── */
  const filteredMachines = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const nonCardioMachines = machines.filter(m => m.category !== 'Cardio' && !m.equipmentType?.toLowerCase().includes('cardio'));

    return nonCardioMachines.filter(m => {
      // 1. Text Search
      const matchesSearch = !query ||
        m.name.toLowerCase().includes(query) ||
        (m.alternativeNames ?? []).some(alt => alt.toLowerCase().includes(query)) ||
        m.category.toLowerCase().includes(query) ||
        m.primaryMuscles.some(mus => mus.toLowerCase().includes(query)) ||
        m.secondaryMuscles.some(mus => mus.toLowerCase().includes(query));

      // 2. Category / Muscle Filter
      const matchesCategory = selectedCategory === 'all' || 
        m.category.toLowerCase() === selectedCategory.toLowerCase() ||
        m.primaryMuscles.some(mus => mus.toLowerCase().includes(selectedCategory.toLowerCase()));

      return matchesSearch && matchesCategory;
    });
  }, [machines, searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* 1. Compact Header: Clean mobile header with count pill */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">
            Machine Library
          </h1>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
            Browse strength machines & target muscles
          </p>
        </div>

        {/* Subtle Machine Count Pill */}
        <div className="px-2.5 py-1 rounded-full bg-[#141716] border border-[#222624] text-[11px] font-bold text-white tracking-wide shrink-0">
          <span className="text-[#22C55E] font-mono">{filteredMachines.length}</span>
          <span className="text-[#9CA3AF] font-normal text-[10px] ml-1">
            {filteredMachines.length === libraryTotal ? `/${libraryTotal}` : 'found'}
          </span>
        </div>
      </div>

      {/* 2. Search Bar: Dark rounded search input */}
      <div className="relative w-full">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
        />
        <input
          ref={searchRef}
          type="search"
          aria-label="Search machines or muscles"
          placeholder="Search machines or muscles..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-[#141716] border border-[#222624] focus:border-[#22C55E] text-white text-xs placeholder-[#6B7280] rounded-xl pl-9 pr-9 py-2.5 outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
            aria-label="Clear search query"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#222624] text-[#9CA3AF] hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* 3. Muscle Filter Strip: Smooth horizontal scrollable row with hidden scrollbars */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none -mx-4 px-4 py-0.5">
        {filterPills.map(pill => {
          const isActive = selectedCategory === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setSelectedCategory(pill.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer select-none ${
                isActive
                  ? 'bg-[#22C55E] text-black shadow-sm'
                  : 'bg-[#141716] border border-[#222624] text-[#9CA3AF] hover:text-white hover:border-[#2C312E]'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* 4. Clean 2-Column Mobile Machine Card Grid */}
      {filteredMachines.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {filteredMachines.map(machine => {
            const photos = getMachinePhotos(machine.id);
            const isVerified = machine.verificationStatus === 'Verified' || photos?.verified === true;
            const heroPhotoUrl = isVerified ? (machine.frontReferenceImage ?? photos?.front ?? null) : null;
            const favorited = isFavorite(machine.id);
            const primaryMuscle = machine.primaryMuscles[0]?.split('(')[0].trim() || machine.category;

            return (
              <div
                key={machine.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectMachine(machine, 'library')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectMachine(machine, 'library');
                  }
                }}
                className="group flex flex-col bg-[#141716] hover:bg-[#181A20] border border-[#222624] hover:border-[#2C312E] rounded-2xl overflow-hidden cursor-pointer select-none active:scale-[0.98] transition-all text-left"
              >
                {/* Equipment Photo */}
                <div className="relative aspect-[4/3] w-full bg-[#0A0C0B] overflow-hidden flex items-center justify-center">
                  {heroPhotoUrl ? (
                    <img
                      src={heroPhotoUrl}
                      alt={machine.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full p-3 flex items-center justify-center text-[#6B7280]">
                      <MachineSvgIllustration type={machine.imageSvg} />
                    </div>
                  )}

                  {/* Gradient bottom scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141716] via-transparent to-transparent pointer-events-none" />

                  {/* Favorite Bookmark */}
                  <button
                    aria-label={favorited ? `Remove from favorites` : `Save to favorites`}
                    onClick={(e) => {
                      e.stopPropagation();
                      requireAuth(
                        () => toggleFavorite(machine.id),
                        'Create a free account to bookmark machines!'
                      );
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-[#0A0C0B]/80 hover:bg-[#141716] border border-[#222624] flex items-center justify-center transition-colors z-10"
                  >
                    <Star
                      size={11}
                      className={favorited ? 'text-[#22C55E] fill-[#22C55E]' : 'text-[#6B7280]'}
                    />
                  </button>

                  {/* Category Pill Tag */}
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#0A0C0B]/85 border border-[#222624] text-[#9CA3AF]">
                    {machine.category}
                  </span>
                </div>

                {/* Machine Details */}
                <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 group-hover:text-[#22C55E] transition-colors leading-snug">
                      {machine.name}
                    </h3>
                    <p className="text-sm font-semibold text-[#22C55E] truncate mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                      <span>{primaryMuscle}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#222624]/60 text-xs">
                    <span className="text-[#9CA3AF] font-medium text-[11px]">
                      {machine.difficulty || 'All levels'}
                    </span>
                    <span className="text-[#22C55E] font-bold text-xs">
                      Details →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 text-center bg-[#141716] border border-[#222624] rounded-2xl flex flex-col items-center gap-2 mt-2">
          <div className="w-10 h-10 rounded-xl bg-[#0A0C0B] border border-[#222624] flex items-center justify-center text-[#6B7280]">
            <Search size={18} />
          </div>
          <h3 className="text-sm font-bold text-white mt-1">No machines found</h3>
          <p className="text-xs text-[#9CA3AF] max-w-[240px]">
            {searchQuery
              ? `No equipment matching "${searchQuery}".`
              : 'Try clearing your active filters.'}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-1 px-3 py-1.5 rounded-xl bg-[#22C55E] text-black text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

