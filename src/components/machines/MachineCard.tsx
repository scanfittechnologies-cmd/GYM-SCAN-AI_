import React, { useState } from 'react';
import { Machine } from '../../types';
import { useGym } from '../../context/GymContext';
import {
  Star, CheckCircle, ChevronRight,
  ShieldCheck, Dumbbell
} from 'lucide-react';
import { MachineSvgIllustration } from './MachineSvgIllustrations';
import { getMachinePhotos } from '../../data/machinePhotos';

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
  const { isMachineDiscovered, isTutorialCompleted, isFavorite, toggleFavorite } = useGym();
  const [imgError, setImgError] = useState(false);

  const discovered  = isMachineDiscovered(rawMachine.id);
  const machine = {
    ...rawMachine,
    isDiscovered: rawMachine.isDiscovered !== undefined ? rawMachine.isDiscovered : discovered
  };
  const tutorialDone = isTutorialCompleted(machine.id);
  const favorited   = isFavorite(machine.id);
  const catStyle    = CATEGORY_COLORS[machine.category] ?? CATEGORY_COLORS.Other;

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
      className="glass-card w-full max-w-full"
      style={{
        display: 'flex',
        flexDirection: 'column',
        aspectRatio: '1 / 1',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxSizing: 'border-box',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* ── Image Display (Fills top portion of Square) ── */}
      <div style={{
        position: 'relative',
        flex: 1,
        width: '100%',
        background: usePhoto
          ? 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)'
          : 'linear-gradient(180deg, #0E131F 0%, #090C14 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {usePhoto ? (
          <>
            <img
              src={heroPhotoUrl!}
              alt={machine.name}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
            {/* Scrim overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(11,15,25,0.95) 0%, rgba(11,15,25,0.2) 60%, transparent 100%)',
              pointerEvents: 'none',
            }} />
          </>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, rgba(14, 19, 31, 0.9) 0%, rgba(9, 12, 20, 0.95) 100%)',
          }}>
            <MachineSvgIllustration type={machine.imageSvg} />
          </div>
        )}

        {/* ── Favorite Button (top-right) ── */}
        <button
          aria-label={favorited ? `Remove ${machine.name} from favorites` : `Save ${machine.name} to favorites`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(machine.id);
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: favorited ? 'rgba(255, 184, 0, 0.25)' : 'rgba(10,14,22,0.75)',
            border: favorited ? '1px solid rgba(255, 184, 0, 0.5)' : '1px solid rgba(255,255,255,0.14)',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: favorited ? '#FFB800' : '#94A3B8',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            zIndex: 3,
            flexShrink: 0,
          }}
        >
          <Star size={14} fill={favorited ? '#FFB800' : 'none'} />
        </button>

        {/* ── Top-Left Badges (Category & Verification) ── */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: 'flex-start',
          zIndex: 3,
        }}>
          <span style={{
            fontSize: '0.62rem',
            padding: '2px 7px',
            borderRadius: '999px',
            background: catStyle.bg,
            color: catStyle.text,
            border: `1px solid ${catStyle.border}`,
            fontWeight: 800,
            backdropFilter: 'blur(6px)',
          }}>
            {machine.category}
          </span>

          {discovered && (
            <span style={{
              background: 'rgba(0,245,155,0.2)', backdropFilter: 'blur(6px)',
              color: '#00F59B',
              border: '1px solid rgba(0,245,155,0.4)',
              fontSize: '0.6rem', borderRadius: '999px', padding: '1px 6px',
              fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px',
            }}>
              <CheckCircle size={9} /> Discovered
            </span>
          )}
        </div>
      </div>

      {/* ── Bottom Info Content ── */}
      <div style={{
        padding: '0.75rem 0.85rem 0.85rem 0.85rem',
        background: 'rgba(14, 18, 27, 0.95)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '104px',
        gap: '4px',
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
          <h3
            className="text-sm font-bold text-white line-clamp-2"
            style={{
              margin: 0,
              lineHeight: 1.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {machine.name}
          </h3>
        </div>

        {/* Primary Muscle Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
          <Dumbbell size={10} color="#00F59B" style={{ flexShrink: 0 }} />
          <span style={{
            fontSize: '0.68rem',
            color: '#94A3B8',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}>
            {machine.primaryMuscles[0]?.split('(')[0].trim()}
          </span>
        </div>

        {/* In your Discover Machine Card JSX */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
          {/* Left Badge: Completion Status */}
          <div className="flex items-center gap-1.5">
            {machine.isDiscovered ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ✓ Discovered
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800/60 text-slate-400 border border-slate-700/50">
                ○ Unexplored
              </span>
            )}
          </div>

          {/* Right Link / Level Tag */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              {machine.difficulty || 'Beginner'}
            </span>
            <button className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5">
              Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
