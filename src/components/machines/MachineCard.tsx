import React, { useState } from 'react';
import { Machine } from '../../types';
import { useGym } from '../../context/GymContext';
import {
  Star, CheckCircle, ChevronRight,
  ShieldCheck, Dumbbell
} from 'lucide-react';
import { MachineSvgIllustration } from './MachineSvgIllustrations';
import { getMachinePhotos } from '../../data/machinePhotos';
import { useSoftGate } from '../../hooks/useSoftGate';

interface MachineCardProps {
  machine: Machine;
  onSelect: (machine: Machine) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Chest:             { bg: 'rgba(255, 99, 102, 0.18)',  border: 'rgba(255, 99, 102, 0.4)',   text: '#FF6366' },
  Back:              { bg: 'rgba(56, 189, 248, 0.18)',  border: 'rgba(56, 189, 248, 0.4)',   text: '#38BDF8' },
  Shoulders:         { bg: 'rgba(168, 85, 247, 0.18)',  border: 'rgba(168, 85, 247, 0.4)',   text: '#C084FC' },
  Arms:              { bg: 'rgba(251, 146, 60, 0.18)',  border: 'rgba(251, 146, 60, 0.4)',   text: '#FB923C' },
  Legs:              { bg: 'rgba(34, 197, 94, 0.18)',   border: 'rgba(34, 197, 94, 0.4)',    text: '#22C55E' },
  Cardio:            { bg: 'rgba(255, 184, 0, 0.18)',   border: 'rgba(255, 184, 0, 0.4)',    text: '#FFB800' },
  Core:              { bg: 'rgba(0, 245, 155, 0.18)',   border: 'rgba(0, 245, 155, 0.4)',    text: '#00F59B' },
  'Cable Equipment': { bg: 'rgba(0, 210, 255, 0.18)',   border: 'rgba(0, 210, 255, 0.4)',    text: '#00D2FF' },
  Other:             { bg: 'rgba(148, 163, 184, 0.18)', border: 'rgba(148, 163, 184, 0.35)', text: '#94A3B8' },
};

export const MachineCard: React.FC<MachineCardProps> = ({ machine: rawMachine, onSelect }) => {
  const { isMachineDiscovered, isFavorite, toggleFavorite } = useGym();
  const { requireAuth } = useSoftGate();
  const [imgError, setImgError] = useState(false);

  const discovered  = isMachineDiscovered(rawMachine.id);
  const machine = {
    ...rawMachine,
    isDiscovered: rawMachine.isDiscovered !== undefined ? rawMachine.isDiscovered : discovered
  };
  const favorited   = isFavorite(machine.id);

  // Resolve the best available hero photo
  const photos     = getMachinePhotos(machine.id);
  const isVerified = machine.verificationStatus === 'Verified' || photos?.verified === true;
  const heroPhotoUrl = isVerified ? (machine.frontReferenceImage ?? photos?.front ?? null) : null;
  const usePhoto   = Boolean(heroPhotoUrl) && !imgError;

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
      className="group flex flex-col w-full bg-[#14161A] hover:bg-[#181A20] rounded-xl border border-[#23272F] hover:border-[#2E3440] overflow-hidden cursor-pointer transition-all duration-150 select-none text-left"
    >
      {/* ── Equipment Image ── */}
      <div className="relative aspect-[4/3] w-full bg-[#0D0E11] overflow-hidden flex items-center justify-center">
        {usePhoto ? (
          <img
            src={heroPhotoUrl!}
            alt={machine.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full p-4 flex items-center justify-center text-[#6B7280]">
            <MachineSvgIllustration type={machine.imageSvg} />
          </div>
        )}

        {/* Favorite Icon */}
        <button
          aria-label={favorited ? `Remove ${machine.name} from favorites` : `Save ${machine.name} to favorites`}
          onClick={(e) => {
            e.stopPropagation();
            requireAuth(
              () => toggleFavorite(machine.id),
              'Create a free account to bookmark your favorite machines!'
            );
          }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-[#0D0E11]/80 hover:bg-[#14161A] border border-[#23272F] flex items-center justify-center transition-colors z-10"
        >
          <Star
            size={13}
            className={favorited ? 'text-[#E2FF32] fill-[#E2FF32]' : 'text-[#6B7280]'}
          />
        </button>

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#0D0E11]/80 border border-[#23272F] text-[#9CA3AF]">
            {machine.category}
          </span>
        </div>
      </div>

      {/* ── Machine Information ── */}
      <div className="p-3.5 flex flex-col justify-between gap-2.5 flex-1 bg-[#14161A]">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-[#E2FF32] transition-colors">
            {machine.name}
          </h3>
          <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2FF32]" />
            <span>{machine.primaryMuscles[0]?.split('(')[0].trim() || machine.category}</span>
          </p>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-[#23272F]/60 text-xs">
          <span className="text-[11px] font-medium text-[#6B7280]">
            {machine.difficulty || 'All levels'}
          </span>
          <span className="text-[11px] font-semibold text-[#E2FF32] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Details →
          </span>
        </div>
      </div>
    </div>
  );
};
