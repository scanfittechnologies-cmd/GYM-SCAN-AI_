import { MachineExercise } from '../types';

export const MACHINE_EXERCISES_MAP: Record<string, MachineExercise[]> = {
  'seated-chest-press': [
    {
      id: 'chest-press-standard',
      name: 'Standard Horizontal Chest Press',
      mainMuscle: 'Pectoralis Major (Mid Chest)',
      secondaryMuscles: ['Anterior Deltoids', 'Triceps Brachii'],
      description: 'The foundational horizontal press focusing on overall chest strength and pushing power.',
      difficulty: 'Beginner',
      setupGuidance: [
        'Set seat height so handles line up with mid-chest / nipple line.',
        'Choose starter weight with magnetic pin.',
        'Keep spine neutral and feet flat on the gym floor.'
      ],
      movementSteps: [
        'Exhale and push handles forward smoothly until arms are extended.',
        'Squeeze chest muscles for 1 second at full extension.',
        'Inhale and control the descent back over 3 seconds.'
      ],
      breathingCues: 'Exhale while pressing handles away from body; inhale while returning to chest stretch.',
      commonMistakes: [
        {
          mistake: 'Flaring elbows outward at 90 degrees',
          correction: 'Keep elbows tucked at 45-60 degrees from your torso.'
        }
      ],
      safetyReminder: 'Keep your lower back against the back pad; do not arch aggressively.'
    },
    {
      id: 'chest-press-neutral-grip',
      name: 'Neutral Grip Chest Press',
      mainMuscle: 'Pectoralis Major (Inner/Mid Fibers)',
      secondaryMuscles: ['Triceps Brachii', 'Front Delts'],
      description: 'Uses vertical handles to reduce shoulder strain and emphasize triceps and lower pec recruitment.',
      difficulty: 'Beginner',
      setupGuidance: [
        'Grasp vertical parallel handles with wrists straight.',
        'Retract shoulder blades back into the pad.'
      ],
      movementSteps: [
        'Drive elbows forward in a close-grip pressing pattern.',
        'Lock in upper body tension without shrugging shoulders.'
      ],
      breathingCues: 'Exhale on press, inhale on controlled descent.',
      commonMistakes: [
        {
          mistake: 'Bending wrists backwards',
          correction: 'Keep knuckles pointing forward and wrists rigid.'
        }
      ],
      safetyReminder: 'Excellent shoulder-friendly variation if horizontal grips cause shoulder impingement.'
    }
  ],
  'lat-pulldown': [
    {
      id: 'lat-pulldown-wide',
      name: 'Wide-Grip Front Lat Pulldown',
      mainMuscle: 'Latissimus Dorsi (Back Width)',
      secondaryMuscles: ['Biceps Brachii', 'Rhomboids', 'Rear Delts'],
      description: 'The standard vertical pulling movement for developing upper back width and posture.',
      difficulty: 'Beginner',
      setupGuidance: [
        'Lock thigh pads firmly over your legs.',
        'Grip bar slightly wider than shoulder width with overhand grip.',
        'Sit tall with slight 10-15 degree backward lean.'
      ],
      movementSteps: [
        'Depress shoulder blades down before bending arms.',
        'Pull bar down smoothly to upper chest level.',
        'Hold for 1 count and return slowly overhead.'
      ],
      breathingCues: 'Exhale as you pull down to chest; inhale as bar ascends.',
      commonMistakes: [
        {
          mistake: 'Pulling bar behind the neck',
          correction: 'Always pull in front to upper chest to safeguard cervical spine and rotator cuff.'
        }
      ],
      safetyReminder: 'Never release the bar abruptly at the top of the repetition.'
    },
    {
      id: 'lat-pulldown-close-grip',
      name: 'Close-Grip Underhand Pulldown',
      mainMuscle: 'Lower Lats & Biceps',
      secondaryMuscles: ['Biceps Brachii', 'Middle Traps'],
      description: 'Underhand reverse grip emphasizes lower lats and provides high bicep activation.',
      difficulty: 'Beginner',
      setupGuidance: [
        'Grip bar shoulder-width with palms facing you (supinated).',
        'Secure thighs under roller pads.'
      ],
      movementSteps: [
        'Pull bar down into collarbone while driving elbows down into ribs.',
        'Resist bar back to full overhead extension.'
      ],
      breathingCues: 'Exhale down, inhale up.',
      commonMistakes: [
        {
          mistake: 'Swinging torso excessively',
          correction: 'Keep torso stationary and pull with back muscles.'
        }
      ],
      safetyReminder: 'Maintain a soft wrist position to avoid forearm tendonitis.'
    }
  ],
  '45-leg-press': [
    {
      id: 'leg-press-standard',
      name: 'Standard Stance 45° Leg Press',
      mainMuscle: 'Quadriceps & Gluteus Maximus',
      secondaryMuscles: ['Hamstrings', 'Calves'],
      description: 'Heavy compound lower body press providing massive leg development without direct spinal compression.',
      difficulty: 'Beginner',
      setupGuidance: [
        'Place feet shoulder-width apart in center of sled platform.',
        'Keep lower back and tailbone pressed flush into backrest.',
        'Disengage side safety lock handles.'
      ],
      movementSteps: [
        'Lower sled slowly until knees reach 90 degrees.',
        'Drive through mid-foot and heels to push sled up.',
        'Stop just before full knee lockout (maintain soft micro-bend).'
      ],
      breathingCues: 'Inhale while lowering sled down; exhale while driving sled upward.',
      commonMistakes: [
        {
          mistake: 'Hyperextending and slamming knees locked out',
          correction: 'CRITICAL: Never lock knees straight under load; always keep a soft bend at the top.'
        }
      ],
      safetyReminder: 'Always re-engage safety handles before taking feet off the platform.'
    },
    {
      id: 'leg-press-high-stance',
      name: 'High Foot Placement Leg Press',
      mainMuscle: 'Glutes & Hamstrings',
      secondaryMuscles: ['Quadriceps', 'Adductors'],
      description: 'Placing feet higher on the footplate increases hip flexion, shifting emphasis to posterior chain.',
      difficulty: 'Beginner',
      setupGuidance: [
        'Place feet near top edge of sled platform, shoulder-width apart.',
        'Ensure heels stay grounded on the plate.'
      ],
      movementSteps: [
        'Descend with knees tracking in line with toes.',
        'Push firmly through heels to return sled.'
      ],
      breathingCues: 'Inhale on descent, exhale on drive.',
      commonMistakes: [
        {
          mistake: 'Allowing heels to peel off platform',
          correction: 'Keep entire foot planted firmly to protect knees.'
        }
      ],
      safetyReminder: 'Do not allow tailbone to tuck or round off seat pad at bottom.'
    }
  ],
  'seated-cable-row': [
    {
      id: 'cable-row-v-grip',
      name: 'V-Bar Seated Cable Row',
      mainMuscle: 'Rhomboids, Lats & Mid-Back',
      secondaryMuscles: ['Biceps', 'Erector Spinae'],
      description: 'Horizontal pulling exercise essential for mid-back thickness and upright posture.',
      difficulty: 'Beginner',
      setupGuidance: [
        'Attach V-handle to low cable pulley.',
        'Place feet on footrests with knees slightly bent.',
        'Sit upright with proud chest.'
      ],
      movementSteps: [
        'Pull handle into lower abdomen / navel.',
        'Pinch shoulder blades together for 1 second.',
        'Extend arms forward slowly with straight spine.'
      ],
      breathingCues: 'Exhale while pulling into navel; inhale while extending arms.',
      commonMistakes: [
        {
          mistake: 'Rounding lower back while reaching forward',
          correction: 'Keep core tight and maintain natural spinal arch.'
        }
      ],
      safetyReminder: 'Bend knees when retrieving or releasing handle.'
    }
  ]
};

// Fallback generator for machines without custom explicit exercises
export const getExercisesForMachine = (machineId: string, machineName: string, category: string): MachineExercise[] => {
  if (MACHINE_EXERCISES_MAP[machineId]) {
    return MACHINE_EXERCISES_MAP[machineId];
  }

  return [
    {
      id: `${machineId}-standard`,
      name: `Standard ${machineName}`,
      mainMuscle: `${category} Muscle Group`,
      secondaryMuscles: ['Stabilizers'],
      description: `Primary guided exercise variation on the ${machineName}.`,
      difficulty: 'Beginner',
      setupGuidance: [
        'Adjust seat and pivot pads to align with your body joints.',
        'Select manageable resistance on weight stack pin.',
        'Maintain stable contact with backrest or chest pad.'
      ],
      movementSteps: [
        'Perform the motion smoothly through full range of motion.',
        'Pause at peak contraction for 1 second.',
        'Resist weight back to start over 3 seconds.'
      ],
      breathingCues: 'Exhale on exertion, inhale on the eccentric return phase.',
      commonMistakes: [
        {
          mistake: 'Using momentum or jerking the weight stack',
          correction: 'Use deliberate, slow cadence to isolate the target muscles.'
        }
      ],
      safetyReminder: 'Start with light weight to test alignment before adding resistance.'
    }
  ];
};
