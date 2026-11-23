import React from 'react';
import { useGym } from '../context/GymContext';
import { Machine } from '../types';
import { 
  Camera, 
  Upload, 
  ChevronRight
} from 'lucide-react';
import { getMachinePhotos } from '../data/machinePhotos';

interface HomePageProps {
  onNavigate: (tab: string, scanMode?: string) => void;
  onSelectMachine: (machine: Machine) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectMachine }) => {
  const { 
    machines
  } = useGym();

  // Specific starter machines for quick horizontal swipe
  const starterMachineIds = ['seated-chest-press', 'lat-pulldown', 'leg-press-45', 'seated-cable-row'];
  const displayDiscoverMachines = starterMachineIds
    .map(id => machines.find(m => m.id === id))
    .filter((m): m is Machine => Boolean(m));

  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* 1. Main Hero Scan Card (Compact sleek card, min-h-[190px] / h-52) */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-[#222624] bg-[#141716] min-h-[190px] h-52 flex flex-col justify-end p-4 select-none">
        {/* Background photo & dark athletic scrim */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C0B] via-[#0A0C0B]/90 to-[#0A0C0B]/60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-0.5 mb-3">
          <h2 className="text-xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            Snap & Scan Machine
          </h2>
          <p className="text-[11px] text-[#CBD5E1] drop-shadow-sm font-medium">
            Instant setup cues, seat adjustments & form tips
          </p>
        </div>

        {/* Thumb-friendly Scan Actions */}
        <div className="relative z-10 grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate('scan', 'ai_camera')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#22C55E] hover:bg-[#1ED760] active:scale-98 transition-all text-black font-extrabold text-xs shadow-md cursor-pointer"
          >
            <Camera size={16} strokeWidth={2.5} />
            <span>Snap Photo</span>
          </button>

          <button
            onClick={() => onNavigate('scan', 'photo')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#141716]/95 hover:bg-[#1C201E] active:scale-98 transition-all border border-[#222624] text-white font-semibold text-xs cursor-pointer"
          >
            <Upload size={15} strokeWidth={2.2} />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* 2. Quick-Scan Machines Row (Directly below hero card) */}
      <div className="flex flex-col gap-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-bold text-white tracking-tight">
            Quick-Scan Machines
          </span>
          <button
            onClick={() => onNavigate('library')}
            className="flex items-center gap-0.5 text-xs font-semibold text-[#22C55E] hover:underline"
          >
            <span>Library</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Swipeable row — 2 full cards + 3rd peeking from right edge */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none no-scrollbar -mx-4 px-4 scroll-smooth">
          {displayDiscoverMachines.map((machine) => {
            const photos = getMachinePhotos(machine.id);
            const photoUrl = machine.frontReferenceImage || photos?.front || 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=400&q=80';
            const targetMuscle = machine.primaryMuscles[0]?.split('(')[0].trim() || machine.category;

            return (
              <div
                key={machine.id}
                onClick={() => onSelectMachine(machine)}
                className="w-[43%] min-w-[155px] max-w-[175px] bg-[#141716] border border-[#222624] hover:border-[#22C55E]/30 rounded-2xl overflow-hidden shrink-0 cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="relative h-32 w-full bg-[#0A0C0B]">
                  <img
                    src={photoUrl}
                    alt={machine.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141716] via-transparent to-transparent" />
                </div>
                <div className="p-2.5 flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold text-white leading-snug">
                    {machine.name}
                  </h4>
                  <span className="text-[11px] text-[#22C55E] font-semibold">
                    {targetMuscle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
