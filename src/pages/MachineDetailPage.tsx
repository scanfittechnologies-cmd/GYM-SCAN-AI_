import React, { useState, useEffect } from 'react';
import { Machine, MachineExercise } from '../types';
import { useGym } from '../context/GymContext';
import { 
  ArrowLeft, 
  Star, 
  AlertTriangle, 
  Info, 
  QrCode, 
  Flag, 
  ChevronRight, 
  BookOpen, 
  Camera, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { MachineImageGallery } from '../components/machines/MachineImageGallery';
import { ExerciseDetailModal } from '../components/machines/ExerciseDetailModal';
import { ReportModal } from '../components/machines/ReportModal';
import { MachineSvgIllustration } from '../components/machines/MachineSvgIllustrations';
import { getExercisesForMachine } from '../data/machineExercises';
import { useSoftGate } from '../hooks/useSoftGate';

interface MachineDetailPageProps {
  machine: Machine | null;
  source?: 'qr' | 'photo' | 'library' | 'activity';
  onBack: () => void;
  onNavigate?: (tab: string) => void;
  onSelectMachine?: (machine: Machine, source?: 'qr' | 'photo' | 'library' | 'activity') => void;
}

/**
 * Utility to format instruction text with bold scannable keywords and physical cues.
 */
const formatInstructionText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(mid-chest(?:\s*level)?|chest height|knee joint|pivot axis|10–20\s*lbs|10-20\s*lbs|45–60°|45-60\s*degrees?|90°|90\s*degrees?|neutral spine|scapulae|shoulder blades|rotator cuffs|weight stack|pull-pin|pin clicks?|3-second|3s|1s|1-second|full range of motion|explosive drive|concentric|eccentric)/gi);

  return parts.map((part, index) => {
    const isKeyword = /(mid-chest(?:\s*level)?|chest height|knee joint|pivot axis|10–20\s*lbs|10-20\s*lbs|45–60°|45-60\s*degrees?|90°|90\s*degrees?|neutral spine|scapulae|shoulder blades|rotator cuffs|weight stack|pull-pin|pin clicks?|3-second|3s|1s|1-second|full range of motion|explosive drive|concentric|eccentric)/i.test(part);
    if (isKeyword) {
      return (
        <strong key={index} className="text-white font-semibold underline decoration-[#22C55E]/40 underline-offset-2">
          {part}
        </strong>
      );
    }
    return part;
  });
};

export const MachineDetailPage: React.FC<MachineDetailPageProps> = ({ 
  machine, 
  source = 'library',
  onBack,
  onNavigate,
  onSelectMachine
}) => {
  const { 
    machines,
    isFavorite, 
    toggleFavorite 
  } = useGym();

  const { requireAuth } = useSoftGate();
  const [activeTab, setActiveTab] = useState<'overview' | 'adjustments' | 'exercises' | 'mistakes'>('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<MachineExercise | null>(null);

  // Scroll to top and reset tab whenever machine changes
  useEffect(() => {
    if (machine?.id) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      setActiveTab('overview');
    }
  }, [machine?.id]);

  // Missing or Incomplete Machine state
  if (!machine) {
    return (
      <div className="w-full max-w-[430px] mx-auto bg-[#141716] border border-[#222624] rounded-3xl p-6 text-center my-6">
        <AlertTriangle className="w-12 h-12 text-[#FF6B81] mx-auto mb-3" />
        <h2 className="text-base font-bold text-white mb-1">
          Equipment Information Not Found
        </h2>
        <p className="text-xs text-[#9CA3AF] mb-5">
          Information for this machine is still being reviewed.
        </p>
        <button 
          onClick={onBack} 
          className="w-full py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#1ED760] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <ArrowLeft size={15} /> Return to Machine Library
        </button>
      </div>
    );
  }

  const favorited = isFavorite(machine.id);

  const isInfoComplete = Boolean(
    machine.name && 
    machine.description && 
    machine.primaryMuscles && 
    machine.primaryMuscles.length > 0 &&
    machine.setupInstructions && 
    machine.setupInstructions.length > 0
  );

  // Resolve exercises for this machine
  const exercises = machine.exercises && machine.exercises.length > 0
    ? machine.exercises
    : getExercisesForMachine(machine.id, machine.name, machine.category);

  // Find related machines in the same category or target area
  const relatedMachines = machines
    .filter(m => m.id !== machine.id && (m.category === machine.category || m.difficulty === machine.difficulty))
    .slice(0, 3);

  // Source badge text helper
  const getSourceBadge = () => {
    switch (source) {
      case 'qr':
        return { label: 'QR Scan', icon: QrCode };
      case 'photo':
        return { label: 'AI Vision', icon: Camera };
      case 'activity':
        return { label: 'Activity Log', icon: RotateCcw };
      default:
        return { label: 'Library', icon: BookOpen };
    }
  };

  const sourceBadge = getSourceBadge();
  const SourceIcon = sourceBadge.icon;

  return (
    <div className="w-full flex flex-col gap-4 pb-12 select-none">
      
      {/* Incomplete info notice if review is pending */}
      {!isInfoComplete && (
        <div className="bg-[#141716] border border-[#222624] rounded-2xl p-3 flex items-center gap-2.5 text-xs text-[#9CA3AF]">
          <Info size={16} className="text-[#22C55E] shrink-0" />
          <span>Information for this machine is still being reviewed. Basic orientation guide shown below.</span>
        </div>
      )}

      {/* ── 1. Navigation & Top Control Header ── */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141716] border border-[#222624] text-xs font-semibold text-white hover:border-[#22C55E]/40 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Identification Source Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141716] border border-[#222624] text-[11px] font-medium text-[#9CA3AF]">
            <SourceIcon size={12} className="text-[#22C55E]" />
            <span>{sourceBadge.label}</span>
          </div>

          {/* Favorite Routine Toggle */}
          <button
            type="button"
            onClick={() => requireAuth(
              () => toggleFavorite(machine.id),
              'Create a free account to save your favorite machines and build your workout routine!'
            )}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all cursor-pointer ${
              favorited 
                ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]' 
                : 'bg-[#141716] border-[#222624] text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Star size={12} className={favorited ? 'fill-[#22C55E]' : ''} />
            <span>{favorited ? 'Saved' : 'Save'}</span>
          </button>

          {/* Report Incorrect Info Button */}
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#141716] border border-[#222624] text-[11px] text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
            title="Report inaccurate info"
          >
            <Flag size={11} />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </div>

      {/* ── 2. Machine Header & Image Showcase ── */}
      <div className="bg-[#141716] border border-[#222624] rounded-3xl p-3.5 sm:p-4.5 flex flex-col gap-3.5">
        {/* Gallery Preview */}
        <div className="w-full rounded-2xl overflow-hidden bg-[#0A0C0B] border border-[#222624]">
          <MachineImageGallery machine={machine} />
        </div>

        {/* Header Metadata */}
        <div className="flex flex-col gap-2">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
              {machine.category}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#101211] text-[#9CA3AF] border border-[#222624]">
              {machine.equipmentType}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#101211] text-[#9CA3AF] border border-[#222624]">
              {machine.difficulty} Level
            </span>
          </div>

          {/* Machine Name */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
            {machine.name}
          </h1>

          {/* Primary Purpose */}
          <p className="text-sm text-gray-300 leading-relaxed">
            {machine.description}
          </p>

          {/* Target Muscle Groups */}
          <div className="pt-1 flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#9CA3AF]">
              Target Muscles:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {machine.primaryMuscles.map((muscle, idx) => (
                <span 
                  key={idx} 
                  className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  {muscle}
                </span>
              ))}
              {machine.secondaryMuscles && machine.secondaryMuscles.map((muscle, idx) => (
                <span 
                  key={`sec-${idx}`} 
                  className="text-xs font-medium text-[#9CA3AF] bg-[#101211] border border-[#222624] px-2.5 py-0.5 rounded-lg"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Sub-Navigation Tabs (Concise Labels: Steps, Adjustments, Exercises, Mistakes) ── */}
      <div className="flex flex-col gap-3">
        <div 
          className="w-full grid grid-cols-4 gap-1.5 bg-[#101211] p-1 rounded-2xl border border-[#222624]"
        >
          {[
            { id: 'overview', label: 'Steps' },
            { id: 'adjustments', label: 'Adjustments' },
            { id: 'exercises', label: 'Exercises' },
            { id: 'mistakes', label: 'Mistakes' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 rounded-xl text-xs sm:text-[13px] font-bold text-center transition-all cursor-pointer truncate ${
                  isActive
                    ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 shadow-sm'
                    : 'text-[#9CA3AF] hover:text-white border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── 4. Sub-Tab Content Panels ── */}
        <div className="w-full">
          
          {/* TAB 1: STEPS (ONLY Step-by-Step Usage cards 1, 2, 3, 4) */}
          {activeTab === 'overview' && (() => {
            const getCategoryTailoredExecution = (category: string, primaryMuscles: string[] = [], name: string = '') => {
              const cat = (category || '').toLowerCase();
              const muscles = (primaryMuscles || []).join(' ').toLowerCase();
              const n = (name || '').toLowerCase();

              if (cat.includes('chest') || muscles.includes('pectoral') || cat.includes('shoulder') || muscles.includes('deltoid')) {
                return {
                  title: 'Press & Protect Rotator Cuffs',
                  description: 'Press firmly through palms in a converging arc without locking elbows harshly; keep wrists rigid and maintain a 45–60° elbow angle to torso to safeguard shoulder joints.'
                };
              }
              if (cat.includes('back') || muscles.includes('lat') || muscles.includes('rhomboid') || muscles.includes('trapezius')) {
                return {
                  title: 'Drive Elbows & Squeeze Scapulae',
                  description: 'Lead the movement by driving elbows downward and back toward ribs; squeeze shoulder blades together for 1s at peak contraction and resist over 3s.'
                };
              }
              if (cat.includes('leg') || muscles.includes('quad') || muscles.includes('hamstring') || muscles.includes('glute') || muscles.includes('calf')) {
                return {
                  title: 'Midfoot Drive & Joint Protection',
                  description: 'Drive through midfoot and heels through a controlled 90° range of motion; never violently hyperextend or lock knees at top and maintain knee-toe alignment.'
                };
              }
              if (cat.includes('arm') || muscles.includes('bicep') || muscles.includes('tricep') || n.includes('curl') || n.includes('extension') || n.includes('dip')) {
                return {
                  title: 'Fixed Pivots & Peak Squeeze',
                  description: 'Pin your elbows firmly in place as fixed pivot points; squeeze target biceps or triceps intensely for 1 full second at peak contraction and resist momentum on reset.'
                };
              }
              if (cat.includes('cardio') || n.includes('treadmill') || n.includes('bike') || n.includes('rower') || n.includes('climber')) {
                return {
                  title: 'Cadence Flow & Posture Ramp',
                  description: 'Maintain tall upright spine and relaxed shoulders; begin at a light baseline pace and gradually ramp up speed and resistance while synchronizing breathing cycles.'
                };
              }
              if (cat.includes('core') || muscles.includes('abdominis') || muscles.includes('oblique')) {
                return {
                  title: 'Rib-to-Pelvis Flexion & Hold',
                  description: 'Exhale and curl your ribcage down toward your pelvic line strictly using abdominal flexion; hold the peak contraction for 2s without straining your neck.'
                };
              }
              return {
                title: 'Controlled Execution & Squeeze',
                description: 'Initiate deliberate muscular contraction through full range of motion; pause for 1s at peak tension and control the 3-second negative return under active control.'
              };
            };

            const categoryExec = getCategoryTailoredExecution(machine.category, machine.primaryMuscles, machine.name);

            const displaySteps = machine.steps && machine.steps.length > 0
              ? machine.steps.map((step, idx) => {
                  if (idx === 3 && (!step.description || step.description.length < 20)) {
                    return {
                      ...step,
                      stage: 'Execute',
                      icon: step.icon || '💥',
                      title: step.title || categoryExec.title,
                      description: categoryExec.description,
                    };
                  }
                  return step;
                })
              : [
                  {
                    stage: 'Setup',
                    icon: '🪑',
                    title: 'Machine Setup & Anchoring',
                    description: machine.setupInstructions?.[0] || 'Adjust machine seat, pads, or cables to fit your body height and natural joint alignment.'
                  },
                  {
                    stage: 'Adjust',
                    icon: '🎯',
                    title: 'Select Resistance & Pins',
                    description: machine.setupInstructions?.[1] || 'Insert selector pin into weight stack or load weight plates suited to your current strength level.'
                  },
                  {
                    stage: 'Position',
                    icon: '🧘',
                    title: 'Body Stance & Core Brace',
                    description: machine.setupInstructions?.[2] || 'Sit or stand with torso braced, feet planted flat on floor, and grip handles securely.'
                  },
                  {
                    stage: 'Execute',
                    icon: '💥',
                    title: categoryExec.title,
                    description: categoryExec.description
                  }
                ];

            return (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2.5">
                  {displaySteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-[#141716] border border-[#222624] hover:border-[#22C55E]/30 rounded-2xl p-4 flex flex-col gap-2.5 transition-all"
                    >
                      {/* Step Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-[#0A0C0B] border border-[#222624] text-xs font-black text-[#22C55E] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-base font-semibold text-white tracking-tight">
                            {step.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded-md">
                          {step.stage || `Step ${idx + 1}`}
                        </span>
                      </div>

                      {/* Description with readable text-[15px] and bold scannable physical cues */}
                      <p className="text-[15px] text-gray-200 leading-relaxed break-words pl-9">
                        {formatInstructionText(step.description)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* TAB 2: ADJUSTMENTS (ONLY Machine Adjustment Instructions) */}
          {activeTab === 'adjustments' && (
            <div className="bg-[#141716] border border-[#222624] rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-[#22C55E]" />
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Machine Adjustment Instructions
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <div className="bg-[#101211] border border-[#1E2220] p-3.5 rounded-xl flex flex-col gap-1.5">
                  <h4 className="text-sm font-bold text-[#22C55E]">
                    1. Seat Height & Backrest Position
                  </h4>
                  <p className="text-[15px] text-gray-200 leading-relaxed">
                    {formatInstructionText('Locate the pull-pin lever under the seat cushion. Adjust height so the handles or pivot axis align naturally with your target joint at mid-chest level. Make sure the pin clicks securely into place before loading weight.')}
                  </p>
                </div>

                <div className="bg-[#101211] border border-[#1E2220] p-3.5 rounded-xl flex flex-col gap-1.5">
                  <h4 className="text-sm font-bold text-[#22C55E]">
                    2. Weight Stack Pin Selector
                  </h4>
                  <p className="text-[15px] text-gray-200 leading-relaxed">
                    {formatInstructionText('Ensure the selector pin is fully inserted into the weight stack hole. For beginners, select a lightweight plate of 10–20 lbs to test joint comfort and ensure fluid movement throughout the full range of motion.')}
                  </p>
                </div>

                <div className="bg-[#101211] border border-[#1E2220] p-3.5 rounded-xl flex flex-col gap-1.5">
                  <h4 className="text-sm font-bold text-[#22C55E]">
                    3. Range of Motion / Arm Lever Stop
                  </h4>
                  <p className="text-[15px] text-gray-200 leading-relaxed">
                    {formatInstructionText('If equipped with an overhead or base cam limiter, adjust the starting position to allow a comfortable stretch at a 45–60° angle without hyper-extending shoulders, knees, or lower back.')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXERCISES (Exercises You Can Perform + Related Equipment in Facility) */}
          {activeTab === 'exercises' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Exercises You Can Perform
                </h3>
                <span className="text-xs text-[#9CA3AF] font-medium">
                  {exercises.length} variations
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-[#141716] border border-[#222624] hover:border-[#22C55E]/30 rounded-2xl p-4 flex flex-col gap-2 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-0.5 rounded-md">
                        {ex.difficulty}
                      </span>
                      <span className="text-xs font-semibold text-[#9CA3AF]">
                        {ex.mainMuscle}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug">
                      {ex.name}
                    </h4>

                    <p className="text-[15px] text-gray-300 leading-relaxed">
                      {ex.description}
                    </p>

                    <div className="pt-2 border-t border-[#1E2220]">
                      <button
                        type="button"
                        onClick={() => setSelectedExercise(ex)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#101211] border border-[#222624] hover:border-[#22C55E]/40 text-xs font-semibold text-white flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span>View Exercise Details</span>
                        <ChevronRight size={14} className="text-[#22C55E]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Related Equipment in Gym Facility placed ONLY on Exercises tab */}
              {relatedMachines.length > 0 && (
                <div className="bg-[#141716] border border-[#222624] rounded-2xl p-4 flex flex-col gap-3 mt-2">
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    Related Equipment in Facility
                  </h3>
                  <div className="flex flex-col gap-2">
                    {relatedMachines.map((rel) => (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => onSelectMachine ? onSelectMachine(rel, source) : undefined}
                        className="w-full bg-[#101211] border border-[#1E2220] hover:border-[#22C55E]/40 p-2.5 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer active:scale-[0.99]"
                      >
                        <div className="w-10 h-10 bg-[#0A0C0B] border border-[#222624] rounded-lg p-1 shrink-0 flex items-center justify-center">
                          <MachineSvgIllustration type={rel.imageSvg} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">
                            {rel.name}
                          </div>
                          <div className="text-xs text-[#22C55E] font-medium truncate">
                            {rel.category} • {rel.difficulty}
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-[#9CA3AF] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MISTAKES (ONLY Common Mistakes & Fixes) */}
          {activeTab === 'mistakes' && (() => {
            const mistakesList = machine.commonMistakes && machine.commonMistakes.length > 0
              ? machine.commonMistakes
              : [
                  {
                    mistake: 'Using momentum or torso swinging to heave the weight',
                    fix: 'Lock your core solid, maintain neutral spine, and isolate the target muscles with zero swinging.',
                    correction: 'Lock your core solid, maintain neutral spine, and isolate the target muscles with zero swinging.'
                  },
                  {
                    mistake: 'Letting weight stack slam down uncontrollably',
                    fix: 'Control the 3-second eccentric return so the weight stack hovers smoothly without slamming.',
                    correction: 'Control the 3-second eccentric return so the weight stack hovers smoothly without slamming.'
                  }
                ];

            return (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    Common Mistakes & Fixes
                  </h3>
                  <span className="text-[11px] font-semibold text-[#FF6B81] bg-[#FF6B81]/10 border border-[#FF6B81]/25 px-2.5 py-0.5 rounded-full">
                    Form Check
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {mistakesList.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#141716] border border-[#222624] rounded-2xl p-4 flex flex-col gap-3"
                    >
                      {/* Mistake callout */}
                      <div className="bg-[#101211] border border-[#FF6B81]/30 p-3 rounded-xl flex flex-col gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B81] flex items-center gap-1.5">
                          <XCircle size={14} />
                          Mistake #{idx + 1}
                        </span>
                        <p className="text-[15px] font-medium text-[#FCA5A5] leading-relaxed">
                          {item.mistake}
                        </p>
                      </div>

                      {/* Correct form callout */}
                      <div className="bg-[#101211] border border-[#22C55E]/30 p-3 rounded-xl flex flex-col gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#22C55E] flex items-center gap-1.5">
                          <CheckCircle2 size={14} />
                          Correct Form
                        </span>
                        <p className="text-[15px] font-medium text-gray-200 leading-relaxed">
                          {formatInstructionText(item.fix || item.correction || '')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* Interactive Exercise & Report Modals */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          machine={machine}
          onClose={() => setSelectedExercise(null)}
        />
      )}

      {showReportModal && (
        <ReportModal
          machine={machine}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
};
