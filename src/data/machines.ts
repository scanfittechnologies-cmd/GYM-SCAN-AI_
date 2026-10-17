import { Machine } from '../types';

export const MACHINES_DATABASE: Machine[] = [
  {
    "id": "seated-chest-press",
    "name": "Chest Press Machine",
    "alternativeNames": [
      "Seated Chest Press",
      "Horizontal Machine Press",
      "Pin-Loaded Chest Press"
    ],
    "category": "Chest",
    "tagline": "Safe, guided horizontal pressing for pectoral development and tricep strength",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Pectoralis Major (Mid & Lower Chest)"
    ],
    "secondaryMuscles": [
      "Anterior Deltoid (Front Shoulders)",
      "Triceps Brachii"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-CHEST-01",
    "matchKeywords": [
      "chest press",
      "seated press",
      "chest machine",
      "bench machine",
      "push handles",
      "pecs"
    ],
    "imageSvg": "chest-press",
    "description": "The seated chest press provides a stable, fixed range of motion to build upper body pressing strength without requiring a barbell spotter. It is the premier chest building machine for beginners.",
    "brand": "Life Fitness Signature Series",
    "visualCharacteristics": [
      "Horizontal padded backrest",
      "Dual forward-facing push handles",
      "Enclosed vertical weight stack",
      "Foot assist pedal"
    ],
    "frontReferenceImage": "/machines/seated-chest-press.jpg",
    "sideReferenceImage": "/machines/seated-chest-press.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust seat height so handles align directly with the mid-chest level (nipple line).",
      "Select a moderate starter weight by inserting the magnetic pin into the weight stack.",
      "Sit with your lower back pressed firmly into the backrest pad and plant your feet flat on the floor.",
      "Grasp the horizontal handles with wrists straight and elbows at a 45-60 degree angle from your torso."
    ],
    "movementGuidance": [
      "Exhale and push the handles forward in a controlled arc until arms are extended (do not lock elbows harshly).",
      "Pause for 1 second at full extension to squeeze the pectoral muscles.",
      "Inhale and slowly lower the handles back over 3 seconds until you feel a gentle chest stretch.",
      "Avoid letting the weight stack slam down between repetitions."
    ],
    "commonMistakes": [
      {
        "mistake": "Flaring elbows outward at 90 degrees",
        "fix": "Tuck elbows slightly inward at ~45-60 degrees to protect the rotator cuff and shoulder joint.",
        "correction": "Tuck elbows slightly inward at ~45-60 degrees to protect the rotator cuff and shoulder joint."
      },
      {
        "mistake": "Shrugging shoulders upward during the press",
        "fix": "Retract and depress shoulder blades down and back against the seat.",
        "correction": "Retract and depress shoulder blades down and back against the seat."
      },
      {
        "mistake": "Arching the lower back off the pad",
        "fix": "Keep core engaged and maintain neutral spine contact with the backrest.",
        "correction": "Keep core engaged and maintain neutral spine contact with the backrest."
      }
    ],
    "safetyReminders": [
      "Ensure the weight stack pin is fully inserted into the selector hole before starting.",
      "If you feel sharp shoulder pain, immediately release handles and lower weight.",
      "Always use foot assist pedals if equipped when beginning and ending your set."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Seat Alignment Check",
        "description": "Verify handles align with the middle of your sternum, not your throat or collarbone.",
        "tip": "If your shoulders feel crowded at the start, drop the seat one notch lower."
      },
      {
        "stepNumber": 2,
        "title": "Scapular Retraction",
        "description": "Pinch shoulder blades together like you are holding a pencil between them.",
        "tip": "This creates a solid base and isolates chest activation."
      },
      {
        "stepNumber": 3,
        "title": "Controlled 3-Second Cadence",
        "description": "1 second pushing forward, 1 second pause, 3 seconds lowering back.",
        "tip": "Time under tension creates the safest muscle stimulation."
      }
    ],
    "videoDurationSec": 45,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust seat height so handles align directly with the mid-chest level (nipple line)."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Select a moderate starter weight by inserting the magnetic pin into the weight stack."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit with your lower back pressed firmly into the backrest pad and plant your feet flat on the floor."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Converging Press & Pec Lockout",
        "description": "Exhale and press handles forward in a smooth converging arc without locking elbows harshly, squeeze pecs for 1s at extension, and lower over 3s."
      }
    ],
    "movementCues": {
      "exhale": "On pressing the weight away from your body",
      "inhale": "On 3-second controlled descent back to starting position",
      "tempo": "1s Explosive Press | 1s Muscle Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "incline-chest-press",
    "name": "Incline Chest Press Machine",
    "alternativeNames": [
      "Upper Chest Press Machine",
      "Incline Hammer Strength Press",
      "Converging Incline Press"
    ],
    "category": "Chest",
    "tagline": "Target upper clavicular chest fibers and shoulders on an upward converging arc",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Clavicular Head (Upper Chest)"
    ],
    "secondaryMuscles": [
      "Anterior Deltoid (Front Shoulder)",
      "Triceps Brachii"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-CHEST-02",
    "matchKeywords": [
      "incline press",
      "upper chest",
      "inclined machine",
      "angled press",
      "upper pecs"
    ],
    "imageSvg": "incline-press",
    "description": "Designed with a 30 to 45-degree upward pressing angle, this machine emphasizes the clavicular head of the pectorals while maintaining shoulder safety.",
    "brand": "Hammer Strength MTS",
    "visualCharacteristics": [
      "Angled backrest at 35 degrees",
      "Upward converging push levers",
      "Overhead pivot arms",
      "Dual independent weight horns/stacks"
    ],
    "frontReferenceImage": "/machines/incline-chest-press.jpg",
    "sideReferenceImage": "/machines/incline-chest-press.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust seat so the handles sit level with your upper chest / collarbone area.",
      "Choose a manageable load on the weight stack or plate horns.",
      "Sit tall with your head, upper back, and glutes resting firmly against the back pad."
    ],
    "movementGuidance": [
      "Drive the handles upward and slightly inward along the machine’s natural trajectory.",
      "Focus on contracting the upper chest fibers at peak contraction.",
      "Lower under strict control, resisting the weight back to starting position."
    ],
    "commonMistakes": [
      {
        "mistake": "Pushing from neck level with flared shoulders",
        "fix": "Keep grip slightly wider than shoulders and maintain elbows angled down.",
        "correction": "Keep grip slightly wider than shoulders and maintain elbows angled down."
      },
      {
        "mistake": "Letting head jut forward during heavy reps",
        "fix": "Keep neck in neutral alignment resting lightly against head pad.",
        "correction": "Keep neck in neutral alignment resting lightly against head pad."
      }
    ],
    "safetyReminders": [
      "Do not bounce at the bottom of the movement.",
      "Keep wrists rigid and aligned over the forearms."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Seat Height for Collarbone Line",
        "description": "Position seat so handle resting point is right at your collarbone level."
      },
      {
        "stepNumber": 2,
        "title": "Converging Upward Drive",
        "description": "Push upward in the natural inward sweeping motion without shrugging traps."
      }
    ],
    "videoDurationSec": 40,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust seat so the handles sit level with your upper chest / collarbone area."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Choose a manageable load on the weight stack or plate horns."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit tall with your head, upper back, and glutes resting firmly against the back pad."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Upward Incline Press to Eye Level",
        "description": "Drive handles upward and inward along the converging incline track toward eye level, squeeze upper clavicular pecs, and lower until handles reach collarbone."
      }
    ],
    "movementCues": {
      "exhale": "On pressing the weight away from your body",
      "inhale": "On 3-second controlled descent back to starting position",
      "tempo": "1s Explosive Press | 1s Muscle Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "decline-chest-press",
    "name": "Decline Chest Press Machine",
    "alternativeNames": [
      "Lower Chest Press Machine",
      "Decline Machine Press",
      "Seated Decline Press"
    ],
    "category": "Chest",
    "tagline": "Isolate lower sternal pectoral head with reduced shoulder joint stress",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Pectoralis Major (Lower Sternal Head)"
    ],
    "secondaryMuscles": [
      "Triceps Brachii",
      "Anterior Deltoid"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-CHEST-03",
    "matchKeywords": [
      "decline press",
      "lower chest",
      "downward press",
      "lower pecs"
    ],
    "imageSvg": "chest-press",
    "description": "A downward-angled pressing station designed to activate lower pectoral muscle fibers while placing minimal shearing force on the anterior shoulder capsule.",
    "brand": "Matrix Ultra Series",
    "visualCharacteristics": [
      "Slight downward thrust handle path",
      "Upright or slight reclined backrest",
      "Low pivot arm axis"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Set the seat height so the handles align across the bottom border of your chest.",
      "Plant feet securely or tuck legs under thigh rollers if equipped.",
      "Retract scapulae and stabilize your torso before grasping handles."
    ],
    "movementGuidance": [
      "Press handles downward and forward in a smooth sweeping arc.",
      "Squeeze the lower chest firmly for 1 count at full arm extension.",
      "Return weight slowly over 3 seconds to feel a deep stretch in the lower pecs."
    ],
    "commonMistakes": [
      {
        "mistake": "Rounding shoulders at lockout",
        "fix": "Maintain pinched shoulder blades against the back pad throughout.",
        "correction": "Maintain pinched shoulder blades against the back pad throughout."
      }
    ],
    "safetyReminders": [
      "Ensure the weight stack pin is completely locked before pressing."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Lower Sternum Target",
        "description": "Verify handle trajectory targets the bottom edge of your pectoral muscle."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Set the seat height so the handles align across the bottom border of your chest."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Plant feet securely or tuck legs under thigh rollers if equipped."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Retract scapulae and stabilize your torso before grasping handles."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Downward Decline Arc & Lower Pec Squeeze",
        "description": "Press downward and forward focusing tension strictly on lower pectoral fibers, avoid shrugging shoulders, and control the upward reset smoothly."
      }
    ],
    "movementCues": {
      "exhale": "On pressing the weight away from your body",
      "inhale": "On 3-second controlled descent back to starting position",
      "tempo": "1s Explosive Press | 1s Muscle Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "pec-deck-machine",
    "name": "Pec Deck Machine",
    "alternativeNames": [
      "Butterfly Machine",
      "Seated Machine Fly",
      "Chest Fly Machine",
      "Reverse Fly Station"
    ],
    "category": "Chest",
    "tagline": "Pure chest isolation with continuous horizontal adduction resistance",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Pectoralis Major (Sternal & Clavicular)"
    ],
    "secondaryMuscles": [
      "Anterior Deltoid",
      "Serratus Anterior"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-CHEST-04",
    "matchKeywords": [
      "pec deck",
      "butterfly",
      "chest fly",
      "machine fly",
      "fly machine",
      "pec fly"
    ],
    "imageSvg": "pec-deck",
    "description": "The pec deck guides your arms through pure horizontal chest adduction, isolating the pectorals without taxing tricep pressing strength.",
    "brand": "Nautilus Inspiration",
    "visualCharacteristics": [
      "Vertical seat with narrow backrest",
      "Dual curved swivel lever arms with elbow/wrist pads",
      "Selectorized central tower"
    ],
    "frontReferenceImage": "/machines/pec-deck-machine.jpg",
    "sideReferenceImage": "/machines/pec-deck-machine.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust seat height so handles/pads rest level with your mid-chest line.",
      "Select starting arm range (setting 1 or 2 for beginner shoulder mobility).",
      "Sit flush against the back pad, plant feet wide, and grip vertical handles."
    ],
    "movementGuidance": [
      "Keep a slight, rigid bend in your elbows (10-15 degrees).",
      "Exhale and bring both handles together in front of your chest in a sweeping hugging arc.",
      "Squeeze chest muscles together for 1-2 seconds at the peak.",
      "Inhale and slowly open arms outward until elbows are in line with your torso."
    ],
    "commonMistakes": [
      {
        "mistake": "Allowing arms to travel too far back behind shoulders",
        "fix": "Adjust the range limiter so elbows never travel past the plane of your torso.",
        "correction": "Adjust the range limiter so elbows never travel past the plane of your torso."
      },
      {
        "mistake": "Turning fly into a press by excessively bending elbows",
        "fix": "Lock your elbow angle at a constant 10° and rotate strictly through your shoulder joint.",
        "correction": "Lock your elbow angle at a constant 10° and rotate strictly through your shoulder joint."
      }
    ],
    "safetyReminders": [
      "Never force extreme horizontal abduction stretch beyond comfortable shoulder joint mobility."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Range Cam Pin Setting",
        "description": "Select a comfortable starting stretch setting (usually pin 1, 2, or 3)."
      },
      {
        "stepNumber": 2,
        "title": "Hug the Tree Squeeze",
        "description": "Imagine wrapping your arms around a large tree trunk for peak chest contraction."
      }
    ],
    "videoDurationSec": 40,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Align Seat Height to Mid-Chest",
        "description": "Adjust seat height so the handles or forearm pads align directly with the center of your sternum."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Set Arm Range Limiter",
        "description": "Pull overhead lever pin to adjust start angle (setting 1 or 2) allowing a safe chest stretch without overstretching shoulders."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Flat Back & Soft Elbow Bend",
        "description": "Sit flush with back and head against pad, plant feet wide on floor, and grasp handles with a soft 10° elbow bend."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Sweeping Fly & Center Squeeze",
        "description": "Lock a rigid 10° elbow bend, sweep arm pads inward in a wide hugging arc until pads meet in center, squeeze inner pecs hard for 1-2s, and resist outward slowly."
      }
    ],
    "movementCues": {
      "exhale": "On sweeping handles together in front of chest",
      "inhale": "On 3-second controlled return opening chest",
      "tempo": "1s Sweeping Arc | 1s Pectoral Squeeze | 3s Controlled Negative"
    }
  },
  {
    "id": "cable-crossover",
    "name": "Cable Crossover",
    "alternativeNames": [
      "Cable Crossover Station",
      "Dual Cable Cross",
      "High-to-Low Cable Fly"
    ],
    "category": "Chest",
    "tagline": "Versatile multi-angle cable tension for complete upper and lower chest sculpting",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "Pectoralis Major (All Angles)"
    ],
    "secondaryMuscles": [
      "Anterior Deltoids",
      "Core Stabilizers",
      "Biceps Short Head"
    ],
    "equipmentType": "Cable Pulley",
    "qrCodeId": "GYM-CHEST-05",
    "matchKeywords": [
      "cable crossover",
      "cable cross",
      "dual pulley fly",
      "cable flyes"
    ],
    "imageSvg": "cable-station",
    "description": "A wide dual-pulley frame that delivers constant continuous tension throughout chest adduction across high, middle, and low vectors.",
    "brand": "Cybex Dual Cable Station",
    "visualCharacteristics": [
      "Wide overhead bridging frame",
      "Two opposing height-adjustable pulley columns",
      "Single D-handles attached to steel cables"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Set pulleys to the top notch for high-to-low flyes, or chest height for horizontal crossovers.",
      "Attach standard D-handles to both carabiners and select equal weight on both stacks.",
      "Step forward into a staggered stance with a slight forward torso lean."
    ],
    "movementGuidance": [
      "Bring handles together in front of your lower chest or waist.",
      "Cross hands slightly at the bottom for intense pectoral contraction.",
      "Resist cable tension smoothly on the eccentric return."
    ],
    "commonMistakes": [
      {
        "mistake": "Bending elbows into a pressing motion when fatiguing",
        "fix": "Keep a fixed 10–15° soft bend in your elbows and move exclusively from the shoulder joint in a hugging motion.",
        "correction": "Keep a fixed 10–15° soft bend in your elbows and move exclusively from the shoulder joint in a hugging motion."
      },
      {
        "mistake": "Rocking torso back and forth to heave the cables",
        "fix": "Plant your staggered feet like tree roots and lock your torso completely stationary.",
        "correction": "Plant your staggered feet like tree roots and lock your torso completely stationary."
      },
      {
        "mistake": "Letting cables yank arms backward past shoulder plane",
        "fix": "Stop the eccentric stretch once elbows align with your torso to protect the anterior shoulder capsule.",
        "correction": "Stop the eccentric stretch once elbows align with your torso to protect the anterior shoulder capsule."
      }
    ],
    "safetyReminders": [
      "Maintain equal weight pin settings on both towers."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Staggered Stance Foundation",
        "description": "Step one foot forward with core braced to prevent cable pull from rocking your posture."
      }
    ],
    "videoDurationSec": 50,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Adjust Pulley Height on Towers",
        "description": "Set both left and right pulley sliders to top notch (for high-to-low flyes) or chest height (for mid flyes). Clip single D-handles to each."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Symmetrical Weight",
        "description": "Insert selector pins into the exact same weight plate on both left and right cable towers."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Staggered Stance & Forward Lean",
        "description": "Grasp both handles, step forward into the center with a staggered foot stance, and hinge forward 15° with core braced."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Wide Hugging Arc & Pec Squeeze",
        "description": "Maintain soft elbow bend, sweep handles forward in a wide hugging arc until hands meet in front of chest, squeeze pecs, and control the return stretch."
      }
    ],
    "movementCues": {
      "exhale": "On bringing handles together across front chest",
      "inhale": "On 3-second controlled return feeling chest stretch",
      "tempo": "1s Explosive Fly | 1s Peak Pec Squeeze | 3s Controlled Negative"
    }
  },
  {
    "id": "smith-machine-chest",
    "name": "Smith Machine",
    "alternativeNames": [
      "Guided Barbell Rack",
      "Smith Press Machine",
      "Counterbalanced Smith System"
    ],
    "category": "Chest",
    "tagline": "Fixed vertical track barbell system for controlled flat, incline, and decline benching",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Pectoralis Major",
      "Anterior Deltoids"
    ],
    "secondaryMuscles": [
      "Triceps Brachii",
      "Core"
    ],
    "equipmentType": "Plate-Loaded",
    "qrCodeId": "GYM-CHEST-06",
    "matchKeywords": [
      "smith machine",
      "guided barbell",
      "smith bench",
      "smith press",
      "guided rack"
    ],
    "imageSvg": "smith-machine",
    "description": "A barbell fixed within twin vertical steel guide rails with built-in safety catches and rotating hook locks, allowing solo lifting without spotters.",
    "brand": "Hammer Strength Smith",
    "visualCharacteristics": [
      "Two vertical steel guide rails",
      "Fixed Olympic barbell on bearings",
      "Rotatable bar with lockout hooks",
      "Adjustable bottom safety stop pins"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Position an adjustable workout bench centered directly beneath the barbell path.",
      "Adjust bottom safety stop catches to 2 inches below your lowest comfortable chest press depth.",
      "Rotate the barbell with your wrists to unhook from safety pegs."
    ],
    "movementGuidance": [
      "Lower bar slowly until it lightly touches your mid-chest.",
      "Press upward forcefully along the vertical rail guide and rotate wrists to re-rack hooks when finished."
    ],
    "commonMistakes": [
      {
        "mistake": "Lifting without setting the bottom safety stop collars",
        "fix": "Always set both safety stops before loading plates so the bar stops above your chest in case of fatigue.",
        "correction": "Always set both safety stops before loading plates so the bar stops above your chest in case of fatigue."
      },
      {
        "mistake": "Failing to fully rotate wrists when re-racking",
        "fix": "Twist wrists fully forward and verify both hooks have engaged the frame pins before releasing grip.",
        "correction": "Twist wrists fully forward and verify both hooks have engaged the frame pins before releasing grip."
      },
      {
        "mistake": "Bouncing the barbell off the sternum",
        "fix": "Bring the bar down to a gentle touch without momentum and press smoothly with chest tension.",
        "correction": "Bring the bar down to a gentle touch without momentum and press smoothly with chest tension."
      }
    ],
    "safetyReminders": [
      "Never lift without setting the adjustable bottom safety stops first."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Safety Stop Pin Setup",
        "description": "Set both left and right safety stops above chest collapse height before adding weight plates."
      }
    ],
    "videoDurationSec": 45,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Align Bench Centered Under Bar",
        "description": "Position an adjustable bench centered directly beneath the fixed vertical guide rails with the barbell hovering over your mid-chest."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Set Safety Stop Pegs",
        "description": "Adjust both left and right safety stop collars 1–2 inches below your lowest chest press depth so you can never be trapped."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Grip & Unhook Barbell",
        "description": "Lie flat, plant feet wide, and grip bar shoulder-width. Rotate wrists back to unhook the barbell hooks from the safety ladder."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Vertical Guided Press & Safety Lockout",
        "description": "Lower bar to touch mid-sternum, press upward forcefully along the vertical guide rails, keep wrists stacked over elbows, and rotate wrists forward to re-rack hooks."
      }
    ],
    "movementCues": {
      "exhale": "On pressing the bar upward along the rail guide",
      "inhale": "On controlled 3-second descent to mid-chest",
      "tempo": "1s Explosive Press | 1s Lockout | 3s Controlled Negative"
    }
  },
  {
    "id": "lat-pulldown",
    "name": "Lat Pulldown Machine",
    "alternativeNames": [
      "Cable Lat Pulldown",
      "Wide Grip Pulldown",
      "Overhead Pulldown Station"
    ],
    "category": "Back",
    "tagline": "Premier vertical pulling station for developing back width and upper body posture",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Latissimus Dorsi (Outer Back Wings)"
    ],
    "secondaryMuscles": [
      "Biceps Brachii",
      "Rhomboids",
      "Middle & Lower Trapezius",
      "Posterior Deltoid"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-BACK-01",
    "matchKeywords": [
      "lat pulldown",
      "pulldown",
      "back machine",
      "lat bar",
      "cable pull down",
      "lats"
    ],
    "imageSvg": "lat-pulldown",
    "description": "The lat pulldown uses an overhead cable and wide bar to simulate a pull-up under customizable weight resistance, providing direct latissimus dorsi hypertrophy.",
    "brand": "Life Fitness Pro2 Series",
    "visualCharacteristics": [
      "High overhead pulley and wide angled bar",
      "Adjustable padded thigh hold-down rollers",
      "Vertical selectorized weight stack",
      "Horizontal bench seat"
    ],
    "frontReferenceImage": "/machines/lat-pulldown.jpg",
    "sideReferenceImage": "/machines/lat-pulldown.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Sit on the bench and adjust the thigh roller pad so your legs are snug with feet flat on the floor.",
      "Stand up, grip the wide angled bar just outside shoulder width with palms facing away (overhand).",
      "Sit down under the thigh pads while keeping arms fully extended overhead."
    ],
    "movementGuidance": [
      "Lean back slightly (10-15 degrees) and puff your chest toward the ceiling.",
      "Exhale and pull the bar down toward your upper collarbone by driving elbows downward and back.",
      "Pause 1 second as the bar approaches upper chest; squeeze shoulder blades together.",
      "Inhale and slowly resist the bar back upward over 3 seconds until lats feel a complete stretch."
    ],
    "commonMistakes": [
      {
        "mistake": "Pulling the bar behind your neck",
        "fix": "Pull down in front of your face directly to your upper chest to protect the cervical spine.",
        "correction": "Pull down in front of your face directly to your upper chest to protect the cervical spine."
      },
      {
        "mistake": "Swinging torso backward to heave the weight",
        "fix": "Lock your core rigid with a stationary 10° chest lean and let the latissimus dorsi do 100% of the pulling.",
        "correction": "Lock your core rigid with a stationary 10° chest lean and let the latissimus dorsi do 100% of the pulling."
      },
      {
        "mistake": "Releasing the bar too fast and letting weights slam",
        "fix": "Fight the upward resistance over a strict 3-second eccentric tempo until arms reach full extension.",
        "correction": "Fight the upward resistance over a strict 3-second eccentric tempo until arms reach full extension."
      }
    ],
    "safetyReminders": [
      "Never release the bar abruptly at the top.",
      "Ensure thigh lock pin is clicked firmly before loading weight."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Thigh Roller Lockout",
        "description": "Ensure the thigh pads hold your knees firmly against seat upward recoil."
      },
      {
        "stepNumber": 2,
        "title": "Elbow-Driven Pull",
        "description": "Think about driving your elbows into your back pockets rather than pulling with your wrists."
      }
    ],
    "videoDurationSec": 45,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Lock Thigh Roller Pads",
        "description": "Adjust the thigh roller pad so your thighs are clamped snugly with feet planted flat on the floor."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Weight & Grip",
        "description": "Insert the selector pin into a moderate weight stack. Stand up and grip the wide bar with an overhand grip slightly outside shoulder width."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Sit & Lean 10° Back",
        "description": "Pull yourself under the thigh pads, puff your chest toward the ceiling, and establish a slight 10–15° natural torso lean."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Drive Elbows Down to Ribs",
        "description": "Lean back ~10°, drive elbows down toward ribs to bring bar to upper chest, squeeze lats for 1s, and slowly resist the weight back up."
      }
    ],
    "movementCues": {
      "exhale": "On pulling the bar down to upper collarbone",
      "inhale": "On the 3-second controlled vertical return",
      "tempo": "1s Explosive Pull | 1s Lat Squeeze | 3s Control"
    }
  },
  {
    "id": "seated-cable-row",
    "name": "Seated Cable Row",
    "alternativeNames": [
      "Low Row Cable Station",
      "Horizontal Cable Row",
      "Seated Pulley Row"
    ],
    "category": "Back",
    "tagline": "Horizontal cable pulling for deep mid-back thickness, rhomboids, and rear delts",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Rhomboids",
      "Middle & Lower Trapezius",
      "Latissimus Dorsi"
    ],
    "secondaryMuscles": [
      "Biceps Brachii",
      "Brachialis",
      "Posterior Deltoids",
      "Erector Spinae"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-BACK-02",
    "matchKeywords": [
      "seated row",
      "cable row",
      "low row",
      "v-bar row",
      "rowing machine weights",
      "rhomboids"
    ],
    "imageSvg": "seated-row",
    "description": "Features a low pulley and textured footrests to allow horizontal rowing against stack resistance, building mid-back thickness and upright posture.",
    "brand": "Technogym Selection",
    "visualCharacteristics": [
      "Low horizontal cable line with V-grip attachment",
      "Dual angled textured foot plates",
      "Long flat bench slide/seat",
      "Front-facing weight stack"
    ],
    "frontReferenceImage": "/machines/seated-cable-row.jpg",
    "sideReferenceImage": "/machines/seated-cable-row.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Sit on the bench, place feet on footrests with knees slightly bent (never locked straight).",
      "Reach forward with neutral spine and grasp the close-grip V-handle.",
      "Push back with legs into starting position with torso vertical and chest proud."
    ],
    "movementGuidance": [
      "Exhale and pull the handle smoothly toward your lower abdomen/navel.",
      "Retract your shoulder blades and drive elbows past your sides.",
      "Hold peak squeeze for 1 second, then slowly extend arms back over 3 seconds."
    ],
    "commonMistakes": [
      {
        "mistake": "Excessive torso rocking / swinging back and forth",
        "fix": "Keep your torso stationary and perpendicular to the bench; initiate the row exclusively with your back muscles.",
        "correction": "Keep your torso stationary and perpendicular to the bench; initiate the row exclusively with your back muscles."
      },
      {
        "mistake": "Rounding lower back when reaching forward at reset",
        "fix": "Maintain a natural lumbar curve with braced abs and hinge only slightly at the hips.",
        "correction": "Maintain a natural lumbar curve with braced abs and hinge only slightly at the hips."
      },
      {
        "mistake": "Shrugging shoulders into ears at peak row",
        "fix": "Depress shoulder blades down toward your back pockets as you drive elbows backward.",
        "correction": "Depress shoulder blades down toward your back pockets as you drive elbows backward."
      }
    ],
    "safetyReminders": [
      "Never round your lumbar spine while holding loaded cable handles."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Proud Chest Setup",
        "description": "Lift sternum high and keep core braced before initiating the row."
      },
      {
        "stepNumber": 2,
        "title": "Scapular Pinch Finish",
        "description": "Pinch shoulder blades hard together as handle touches abdomen."
      }
    ],
    "videoDurationSec": 40,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Attach V-Grip & Bench Position",
        "description": "Clip a close-grip V-handle to the low pulley carabiner. Sit tall on the bench facing the weight stack."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Footrest Bracing & Soft Knees",
        "description": "Place both feet firmly on the angled foot plates. Maintain a permanent 15–20° soft knee bend to protect your hamstrings."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Hinge & Proud Chest Lock",
        "description": "Hinge at your hips to grasp the handle, push back into an upright 90° torso, retract shoulders down, and puff chest out."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Drive Elbows Back to Navel",
        "description": "Keep chest tall, pull handle toward navel while driving elbows straight back, squeeze shoulder blades together for 1s, and extend arms with control."
      }
    ],
    "movementCues": {
      "exhale": "On pulling the V-handle toward lower navel",
      "inhale": "On controlled 3-second arm extension forward",
      "tempo": "1s Explosive Row | 1s Scapular Pinch | 3s Controlled Reach"
    }
  },
  {
    "id": "chest-supported-row",
    "name": "Chest-Supported Row Machine",
    "alternativeNames": [
      "T-Bar Chest Supported Row",
      "Seal Row Machine",
      "Incline Prone Row"
    ],
    "category": "Back",
    "tagline": "Strict upper back rowing without lower back spinal compression",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Rhomboids",
      "Mid Trapezius",
      "Latissimus Dorsi"
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Deltoids"
    ],
    "equipmentType": "Plate-Loaded",
    "qrCodeId": "GYM-BACK-03",
    "matchKeywords": [
      "chest supported row",
      "t-bar supported",
      "prone row",
      "chest pad row"
    ],
    "imageSvg": "seated-row",
    "description": "An angled torso support pad eliminates momentum and lumbar fatigue, making it the safest horizontal row for isolating the mid-back and rhomboids.",
    "brand": "Hammer Strength Plate-Loaded",
    "visualCharacteristics": [
      "Angled front chest support pad",
      "Dual rotating pronated/neutral handles",
      "Under-frame weight plate horns"
    ],
    "frontReferenceImage": "/machines/chest-supported-row.jpg",
    "sideReferenceImage": "/machines/chest-supported-row.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust seat height so the top of the chest pad sits just below your collarbones.",
      "Rest your chest firmly on the pad and grasp the handles with your preferred grip."
    ],
    "movementGuidance": [
      "Pull elbows up and back while keeping your chest glued to the pad.",
      "Pause at the top for 1 full second and lower smoothly."
    ],
    "commonMistakes": [
      {
        "mistake": "Lifting chest off pad during heavy reps",
        "fix": "Keep sternum pinned to the pad to eliminate cheating momentum.",
        "correction": "Keep sternum pinned to the pad to eliminate cheating momentum."
      }
    ],
    "safetyReminders": [
      "Do not hyperextend neck upward."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Pad Contact Check",
        "description": "Ensure full sternum contact with the support pad throughout the entire set."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust seat height so the top of the chest pad sits just below your collarbones."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Rest your chest firmly on the pad and grasp the handles with your preferred grip."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Drive Elbows Past Ribcage",
        "description": "Brace sternum flush against incline pad, drive elbows straight back past your torso, pinch shoulder blades together for 1s, and lower weight under full control."
      }
    ],
    "movementCues": {
      "exhale": "On pulling resistance toward your body",
      "inhale": "On 3-second controlled extension back to starting stretch",
      "tempo": "1s Powerful Pull | 1s Peak Contraction | 3s Controlled Negative"
    }
  },
  {
    "id": "t-bar-row-machine",
    "name": "T-Bar Row Machine",
    "alternativeNames": [
      "T-Bar Row Station",
      "Leverage T-Bar Row",
      "Corner Barbell Row"
    ],
    "category": "Back",
    "tagline": "Heavy-duty pivot rowing station for dense back thickness",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "Latissimus Dorsi",
      "Rhomboids",
      "Erector Spinae"
    ],
    "secondaryMuscles": [
      "Biceps",
      "Forearms",
      "Glutes"
    ],
    "equipmentType": "Plate-Loaded",
    "qrCodeId": "GYM-BACK-04",
    "matchKeywords": [
      "t-bar row",
      "t-bar",
      "pivot row",
      "corner row"
    ],
    "imageSvg": "seated-row",
    "description": "A heavy pivot bar station with dual wide and narrow grip handles for loading Olympic plates to perform heavy compound back rows.",
    "brand": "Body-Solid Leverage",
    "visualCharacteristics": [
      "Floor pivot joint with long angled tube",
      "Angled diamond-plate foot platform",
      "Wide and narrow welded T-handles"
    ],
    "frontReferenceImage": "/machines/t-bar-row-machine.jpg",
    "sideReferenceImage": "/machines/t-bar-row-machine.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Step onto the foot platforms with knees bent at a 45-degree angle.",
      "Hinge hips back with a flat spine and grasp handles firmly with both hands."
    ],
    "movementGuidance": [
      "Row the bar up toward your lower ribcage by squeezing back muscles.",
      "Lower under strict eccentric control without letting the plates crash onto the floor stand."
    ],
    "commonMistakes": [
      {
        "mistake": "Standing up too high during the pull",
        "fix": "Maintain a consistent 45-degree forward torso hinge angle.",
        "correction": "Maintain a consistent 45-degree forward torso hinge angle."
      }
    ],
    "safetyReminders": [
      "Wear a weight belt if lifting maximum loads and keep lumbar spine locked flat."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Hip Hinge Alignment",
        "description": "Hinge hips backwards until your back forms a flat table-top angle."
      }
    ],
    "videoDurationSec": 40,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Step onto the foot platforms with knees bent at a 45-degree angle."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Hinge hips back with a flat spine and grasp handles firmly with both hands."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Explosive Pull to Lower Ribcage",
        "description": "Keep lower back flat at 45°, pull handles explosively to lower ribcage by retracting scapulae, and lower under continuous lat tension without rounding spine."
      }
    ],
    "movementCues": {
      "exhale": "On pulling resistance toward your body",
      "inhale": "On 3-second controlled extension back to starting stretch",
      "tempo": "1s Powerful Pull | 1s Peak Contraction | 3s Controlled Negative"
    }
  },
  {
    "id": "assisted-pull-up-machine",
    "name": "Assisted Pull-Up Machine",
    "alternativeNames": [
      "Assisted Chin-Up Station",
      "Counterbalance Pull-Up & Dip",
      "Gravitron"
    ],
    "category": "Back",
    "tagline": "Counterbalanced knee pad allows progressive mastery of full bodyweight pull-ups",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Latissimus Dorsi",
      "Upper Back"
    ],
    "secondaryMuscles": [
      "Biceps Brachii",
      "Core"
    ],
    "equipmentType": "Bodyweight Assisted",
    "qrCodeId": "GYM-BACK-05",
    "matchKeywords": [
      "assisted pull up",
      "gravitron",
      "assisted chin up",
      "counterbalance pull up"
    ],
    "imageSvg": "assisted-pullup",
    "description": "A counterbalance kneeling platform counterweights your body mass, allowing beginner to intermediate athletes to build pull-up strength safely.",
    "brand": "Life Fitness Signature Assisted Dip/Chin",
    "visualCharacteristics": [
      "Tall vertical ladder frame with multi-grip overhead handles",
      "Padded fold-away kneeling platform",
      "Weight stack (MORE weight = EASIER lift)"
    ],
    "frontReferenceImage": "/machines/assisted-pull-up-machine.jpg",
    "sideReferenceImage": "/machines/assisted-pull-up-machine.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Select counterweight pin (REMEMBER: more weight means MORE assistance / easier lift).",
      "Step onto side foot pegs, grasp overhead handles, and place one knee then the second onto the padded pad."
    ],
    "movementGuidance": [
      "Lower your body into a full arm extension hang.",
      "Pull yourself upward until your chin clears the bar level.",
      "Lower smoothly back to the bottom without slamming the weight stack."
    ],
    "commonMistakes": [
      {
        "mistake": "Stepping off the pad quickly with one foot",
        "fix": "Carefully step off one foot at a time onto the metal side pegs.",
        "correction": "Carefully step off one foot at a time onto the metal side pegs."
      }
    ],
    "safetyReminders": [
      "Always hold the upper handles securely before placing your knees on the platform."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Counterbalance Weight Logic",
        "description": "Choose a weight roughly 15-20kg below your bodyweight to start."
      }
    ],
    "videoDurationSec": 45,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Select counterweight pin (REMEMBER: more weight means MORE assistance / easier lift)."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Step onto side foot pegs, grasp overhead handles, and place one knee then the second onto the padded pad."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Vertical Pull & Chin Over Bar",
        "description": "Step onto counterbalance knee pad, drive elbows downward toward floor to pull chin above bar, hold 1s at the top, and lower slowly to a full dead hang stretch."
      }
    ],
    "movementCues": {
      "exhale": "On pulling resistance toward your body",
      "inhale": "On 3-second controlled extension back to starting stretch",
      "tempo": "1s Powerful Pull | 1s Peak Contraction | 3s Controlled Negative"
    }
  },
  {
    "id": "pullover-machine",
    "name": "Pullover Machine",
    "alternativeNames": [
      "Nautilus Pullover",
      "Rotary Lat Pullover",
      "Upper Body Squat Machine"
    ],
    "category": "Back",
    "tagline": "Full arc lat isolation without forearm or bicep grip fatigue",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "Latissimus Dorsi",
      "Teres Major"
    ],
    "secondaryMuscles": [
      "Serratus Anterior",
      "Triceps Long Head",
      "Pectoralis Minor"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-BACK-08",
    "matchKeywords": [
      "pullover machine",
      "nautilus pullover",
      "rotary pullover",
      "lat pullover"
    ],
    "imageSvg": "lat-pulldown",
    "description": "The legendary machine that provides 180 degrees of continuous rotary resistance to the lats directly through the elbow pads, bypassing grip fatigue.",
    "brand": "Nautilus Classic Pullover",
    "visualCharacteristics": [
      "Overhead padded elbow bar",
      "Foot assist pedal to bring bar forward",
      "Bucket seat with seatbelt strap"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust seat so your shoulder joints align precisely with the rotational axis cam.",
      "Fasten seatbelt strap snugly and press foot pedal to bring elbow pads into reach.",
      "Place elbows on the pads with hands lightly resting on the overhead guide bar."
    ],
    "movementGuidance": [
      "Drive your elbows in a smooth downward arc until the bar touches your abdomen.",
      "Pause for 1 second of intense lat contraction.",
      "Return overhead slowly to feel a complete stretch along the ribcage."
    ],
    "commonMistakes": [
      {
        "mistake": "Pushing with hands instead of elbows",
        "fix": "Drive solely with elbows into the pads to bypass bicep tension.",
        "correction": "Drive solely with elbows into the pads to bypass bicep tension."
      }
    ],
    "safetyReminders": [
      "Always use the foot assist pedal to enter and exit safely."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Axis of Rotation Alignment",
        "description": "Ensure machine pivot cam aligns directly with your shoulder joint."
      }
    ],
    "videoDurationSec": 45,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust seat so your shoulder joints align precisely with the rotational axis cam."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Fasten seatbelt strap snugly and press foot pedal to bring elbow pads into reach."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Place elbows on the pads with hands lightly resting on the overhead guide bar."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Sweeping Downward Arc to Ribs",
        "description": "Rest elbows on pads, pull overhead lever down in a sweeping forward arc until elbows touch ribs, squeeze lats hard, and resist back overhead over 3s."
      }
    ],
    "movementCues": {
      "exhale": "On pulling resistance toward your body",
      "inhale": "On 3-second controlled extension back to starting stretch",
      "tempo": "1s Powerful Pull | 1s Peak Contraction | 3s Controlled Negative"
    }
  },
  {
    "id": "seated-shoulder-press",
    "name": "Shoulder Press Machine",
    "alternativeNames": [
      "Overhead Machine Press",
      "Seated Military Press Machine",
      "Deltoid Press"
    ],
    "category": "Shoulders",
    "tagline": "Guided overhead pressing for strong, rounded deltoids and tricep extension",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Anterior Deltoid (Front Shoulders)",
      "Lateral Deltoid"
    ],
    "secondaryMuscles": [
      "Triceps Brachii",
      "Upper Trapezius",
      "Serratus Anterior"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-SHOULDER-01",
    "matchKeywords": [
      "shoulder press",
      "overhead press",
      "military press",
      "deltoid machine",
      "seated overhead",
      "delts"
    ],
    "imageSvg": "shoulder-press",
    "description": "Guides your arms upward along an ergonomic natural plane of movement, safely training overhead strength without the balance requirements of a standing barbell.",
    "brand": "Matrix Versa Series",
    "visualCharacteristics": [
      "Upright 85-degree backrest",
      "Dual overhead push handles (pronated & neutral options)",
      "Vertical side weight stack",
      "Foot pedal starter"
    ],
    "frontReferenceImage": "/machines/seated-shoulder-press.jpg",
    "sideReferenceImage": "/machines/seated-shoulder-press.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust seat height so the handles sit level with your earlobes / top of shoulders.",
      "Select a moderate starting weight with the selector pin.",
      "Sit upright with lower back flat against pad and feet planted shoulder-width."
    ],
    "movementGuidance": [
      "Exhale and press handles smoothly overhead until arms are nearly straight (do not lock elbows harshly).",
      "Pause 1 second at the top feeling the shoulder contraction.",
      "Inhale and lower handles slowly over 3 seconds back to ear level."
    ],
    "commonMistakes": [
      {
        "mistake": "Lowering handles too deep below collarbones",
        "fix": "Stop at earlobe level to prevent excessive rotator cuff impingement.",
        "correction": "Stop at earlobe level to prevent excessive rotator cuff impingement."
      },
      {
        "mistake": "Arching lower back and sliding hips forward",
        "fix": "Keep glutes firmly against the corner of the seat and engage core.",
        "correction": "Keep glutes firmly against the corner of the seat and engage core."
      }
    ],
    "safetyReminders": [
      "If you have prior rotator cuff injuries, use neutral (palms-facing) grip handles if available."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Ear-Level Handle Alignment",
        "description": "Position seat so handles start right beside your ears, preventing shoulder over-stretching."
      },
      {
        "stepNumber": 2,
        "title": "Neutral Grip Option",
        "description": "Use parallel handles for a shoulder-friendly pressing angle."
      }
    ],
    "videoDurationSec": 40,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust seat height so the handles sit level with your earlobes / top of shoulders."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Select a moderate starting weight with the selector pin."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit upright with lower back flat against pad and feet planted shoulder-width."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Overhead Press Arc to Ear Level",
        "description": "Press handles vertically overhead along guided arc without arching lower back, pause just shy of full elbow lockout, and lower smoothly until handles align with ears."
      }
    ],
    "movementCues": {
      "exhale": "On pressing the weight away from your body",
      "inhale": "On 3-second controlled descent back to starting position",
      "tempo": "1s Explosive Press | 1s Muscle Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "lateral-raise-machine",
    "name": "Lateral Raise Machine",
    "alternativeNames": [
      "Seated Side Delt Machine",
      "Deltoid Lateral Raise",
      "Side Lateral Machine"
    ],
    "category": "Shoulders",
    "tagline": "Direct side deltoid isolation for broader shoulders and V-taper aesthetics",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Lateral Deltoid (Side Shoulder Cap)"
    ],
    "secondaryMuscles": [
      "Anterior Deltoid",
      "Supraspinatus",
      "Upper Trapezius"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-SHOULDER-02",
    "matchKeywords": [
      "lateral raise",
      "side delts",
      "shoulder fly",
      "deltoid raise",
      "side raises",
      "boulder shoulders"
    ],
    "imageSvg": "lateral-raise",
    "description": "Isolates the middle deltoid cap through guided arm abduction without forearm strain or dumbbell swinging momentum.",
    "brand": "Technogym Element+",
    "visualCharacteristics": [
      "Upright seat with chest/back pad",
      "Dual side lever arms with padded elbow cushions",
      "Selectorized weight stack",
      "Dual pivot cams"
    ],
    "frontReferenceImage": "/machines/lateral-raise-machine.jpg",
    "sideReferenceImage": "/machines/lateral-raise-machine.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust seat height so your shoulder joints align directly with the rotating machine pivot cams.",
      "Sit tall with chest upright and place your outer arms/elbows against the padded cushions.",
      "Grasp the lower stabilizing hand grips lightly with relaxed wrists."
    ],
    "movementGuidance": [
      "Exhale and elevate your elbows outward and upward until arms are parallel with the floor.",
      "Pause for 1 second at shoulder height to maximize lateral deltoid tension.",
      "Inhale and lower smoothly over 3 seconds back to starting position without weights touching."
    ],
    "commonMistakes": [
      {
        "mistake": "Shrugging shoulders into the ears",
        "fix": "Keep traps depressed and think about pushing elbows outward toward the walls.",
        "correction": "Keep traps depressed and think about pushing elbows outward toward the walls."
      },
      {
        "mistake": "Gripping handles too tight and flexing forearms",
        "fix": "Initiate movement purely from the elbows pressing into pads.",
        "correction": "Initiate movement purely from the elbows pressing into pads."
      }
    ],
    "safetyReminders": [
      "Never jerk or throw the weight upward."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Pivot Cam Alignment",
        "description": "Check that the round red pivot axis matches your shoulder joint height."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust seat height so your shoulder joints align directly with the rotating machine pivot cams."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Sit tall with chest upright and place your outer arms/elbows against the padded cushions."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Grasp the lower stabilizing hand grips lightly with relaxed wrists."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Lead with Elbows to Horizontal",
        "description": "Lead strictly with your elbows to raise arm pads outward to sides until level with shoulders, pause for 1s at horizontal, and lower over 3s under control."
      }
    ],
    "movementCues": {
      "exhale": "On pressing the weight away from your body",
      "inhale": "On 3-second controlled descent back to starting position",
      "tempo": "1s Explosive Press | 1s Muscle Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "rear-delt-machine",
    "name": "Rear Delt Machine",
    "alternativeNames": [
      "Reverse Pec Deck",
      "Reverse Fly Machine",
      "Posterior Deltoid Machine"
    ],
    "category": "Shoulders",
    "tagline": "Target posterior deltoids and rhomboids for complete shoulder balance",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Posterior Deltoid (Rear Shoulders)"
    ],
    "secondaryMuscles": [
      "Rhomboids",
      "Middle Trapezius",
      "Infraspinatus"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-SHOULDER-03",
    "matchKeywords": [
      "rear delt",
      "reverse pec deck",
      "reverse fly",
      "posterior deltoid"
    ],
    "imageSvg": "pec-deck",
    "description": "Facing the pec deck backrest allows reverse horizontal abduction, building strong rear deltoids essential for postural alignment.",
    "brand": "Life Fitness Signature Reverse Fly",
    "visualCharacteristics": [
      "Forward-facing chest pad on vertical seat",
      "Horizontal dual swivel handles set to back position",
      "Pin-loaded central tower"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Set the overhead range pins to the rear-most slots.",
      "Sit facing the pad with chest resting flat against it and feet planted.",
      "Adjust seat height so handles are level with your shoulders."
    ],
    "movementGuidance": [
      "With a slight bend in your elbows, pull handles backward in a horizontal arc.",
      "Squeeze the back of your shoulders at full extension for 1 count.",
      "Slowly resist forward until handles are in front of chest."
    ],
    "commonMistakes": [
      {
        "mistake": "Bending elbows into a row",
        "fix": "Keep elbow angle fixed throughout the entire arc.",
        "correction": "Keep elbow angle fixed throughout the entire arc."
      }
    ],
    "safetyReminders": [
      "Do not shrug your neck during the reverse fly."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Chest-to-Pad Contact",
        "description": "Keep sternum against the pad to prevent swinging back."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Set the overhead range pins to the rear-most slots."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Sit facing the pad with chest resting flat against it and feet planted."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Adjust seat height so handles are level with your shoulders."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Horizontal Fly & Rear Delt Pinch",
        "description": "Grip vertical handles with elbows slightly raised, sweep arms back horizontally until hands align with shoulders, and squeeze posterior deltoids without shrugging."
      }
    ],
    "movementCues": {
      "exhale": "On pressing the weight away from your body",
      "inhale": "On 3-second controlled descent back to starting position",
      "tempo": "1s Explosive Press | 1s Muscle Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "cable-shoulder-machine",
    "name": "Face Pull Machine",
    "alternativeNames": [
      "Face Pull Station",
      "Cable Face Pull Station",
      "Cable Lateral Station",
      "Dual Cable Shoulder Complex"
    ],
    "category": "Shoulders",
    "tagline": "Constant tension cable resistance for face pulls, rear delts, and shoulder health",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "Posterior Deltoids (Rear Shoulders)",
      "Rotator Cuff (External Rotators)",
      "Middle & Upper Trapezius"
    ],
    "secondaryMuscles": [
      "Rhomboids",
      "Lateral Deltoids"
    ],
    "equipmentType": "Cable Pulley",
    "qrCodeId": "GYM-SHOULDER-04",
    "matchKeywords": [
      "face pull",
      "cable face pull",
      "face pull machine",
      "cable shoulder",
      "rear delt cable"
    ],
    "imageSvg": "cable-station",
    "description": "A high-pulley cable station using rope attachment to target rear delts, upper back traps, and external rotators for healthy shoulders.",
    "brand": "Freemotion Shoulder Tower",
    "visualCharacteristics": [
      "High cable pulley with tricep rope attachment",
      "Selectorized weight stack",
      "Smooth cable ratio"
    ],
    "frontReferenceImage": "/machines/face-pull-station.jpg",
    "sideReferenceImage": "/machines/face-pull-station.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Set pulley to lowest setting for side raises, or eye-level for face pulls.",
      "Attach nylon single grip or tricep rope."
    ],
    "movementGuidance": [
      "Lead with the elbow on lateral raises, maintaining a steady 2-second lift and 3-second descent."
    ],
    "commonMistakes": [
      {
        "mistake": "Using heavy weight and twisting spine",
        "fix": "Use lightweight pin and strict unilateral isolation.",
        "correction": "Use lightweight pin and strict unilateral isolation."
      }
    ],
    "safetyReminders": [
      "Never let cable slacken at the bottom of a repetition."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Continuous Tension Check",
        "description": "Start rep with cable already taut."
      }
    ],
    "videoDurationSec": 40,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Set pulley to lowest setting for side raises, or eye-level for face pulls."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Attach nylon single grip or tricep rope."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "High Face Pull & External Rotation",
        "description": "Pull rope attachment toward bridge of nose while flaring elbows high and rotating hands back, hold peak contraction for 1s, and extend arms slowly under tension."
      }
    ],
    "movementCues": {
      "exhale": "On pressing the weight away from your body",
      "inhale": "On 3-second controlled descent back to starting position",
      "tempo": "1s Explosive Press | 1s Muscle Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "calf-raise-machine",
    "name": "Calf Raise Machine",
    "alternativeNames": [
      "Seated Calf Raise",
      "Standing Calf Raise Machine",
      "Calf Extension Machine"
    ],
    "category": "Legs",
    "tagline": "Isolate gastrocnemius and soleus calf muscles through full ankle dorsiflexion",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Gastrocnemius",
      "Soleus"
    ],
    "secondaryMuscles": [
      "Tibialis Posterior",
      "Peroneals"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-LEG-01",
    "matchKeywords": [
      "calf raise",
      "seated calf",
      "standing calf",
      "calves",
      "soleus",
      "gastrocnemius",
      "lower leg"
    ],
    "imageSvg": "calf-raise",
    "description": "Elevated textured toe block and padded resistance bar allow full ankle range of motion to build dense lower leg strength.",
    "brand": "Matrix Versa Calf",
    "visualCharacteristics": [
      "Narrow textured foot ledge for balls of feet",
      "Padded shoulder blocks or thigh rest",
      "Weight stack tower with safety catch handle"
    ],
    "frontReferenceImage": "/machines/calf-raise-machine.jpg",
    "sideReferenceImage": "/machines/calf-raise-machine.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Place the balls of your feet on the edge of the textured step block with heels hanging off.",
      "Adjust shoulder or thigh pads securely.",
      "Disengage the safety catch lever by pressing upward."
    ],
    "movementGuidance": [
      "Slowly lower your heels as far as possible for a full 2-second calf stretch at the bottom.",
      "Drive upward onto the balls of your feet as high as possible.",
      "Hold peak calf contraction at the top for 1-2 seconds."
    ],
    "commonMistakes": [
      {
        "mistake": "Bouncing rapidly using Achilles tendon elasticity",
        "fix": "Pause for 1 full second at the bottom stretch before pushing up.",
        "correction": "Pause for 1 full second at the bottom stretch before pushing up."
      }
    ],
    "safetyReminders": [
      "Ensure balls of feet have solid traction on the step bar."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Full Ankle Excursion",
        "description": "Deep bottom stretch and maximal high tiptoe extension are crucial."
      }
    ],
    "videoDurationSec": 30,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Place the balls of your feet on the edge of the textured step block with heels hanging off."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Adjust shoulder or thigh pads securely."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Disengage the safety catch lever by pressing upward."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Deep Heel Drop & Explosive Plantarflexion",
        "description": "Lower heels below platform edge for deep calf stretch, explode onto balls of feet into full extension, squeeze calves for 2s at peak, and lower over 3s."
      }
    ],
    "movementCues": {
      "exhale": "On driving weight upward or curling into contraction",
      "inhale": "On 3-second controlled eccentric descent",
      "tempo": "2s Controlled Drive | 1s Pause | 3s Smooth Reset"
    }
  },
  {
    "id": "smith-machine-squats",
    "name": "Smith Machine for Squats",
    "alternativeNames": [
      "Smith Squat Station",
      "Guided Squat Machine",
      "Vertical Sled Squat"
    ],
    "category": "Legs",
    "tagline": "Guided linear barbell squats allowing customized foot placement and knee safety",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Quadriceps",
      "Gluteus Maximus"
    ],
    "secondaryMuscles": [
      "Hamstrings",
      "Calves",
      "Core"
    ],
    "equipmentType": "Plate-Loaded",
    "qrCodeId": "GYM-LEG-02",
    "matchKeywords": [
      "smith squat",
      "smith machine squat",
      "guided squat",
      "smith legs"
    ],
    "imageSvg": "smith-machine",
    "description": "Utilizes the Smith machine vertical guide rails to perform squats with feet placed forward, reducing shearing forces on the lower back.",
    "brand": "Hammer Strength Smith",
    "visualCharacteristics": [
      "Vertical steel rails",
      "Barbell with rotating safety hooks",
      "Adjustable bottom safety stop pins"
    ],
    "frontReferenceImage": "/machines/smith-machine-squats.jpg",
    "sideReferenceImage": "/machines/smith-machine-squats.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Position bar at upper chest / shoulder height across your upper trapezius pad.",
      "Set bottom safety stop catches at parallel squat depth.",
      "Place feet 6-10 inches forward of the bar centerline for quad-focused squatting."
    ],
    "movementGuidance": [
      "Rotate bar with wrists to unhook from safety pegs.",
      "Squat down by bending knees and sitting back into hips until thighs reach parallel.",
      "Drive through midfoot and heels to return to top and re-hook bar."
    ],
    "commonMistakes": [
      {
        "mistake": "Placing feet directly under the vertical bar centerline",
        "fix": "Position feet 6–10 inches forward of the bar to avoid excessive knee shear stress and simulate natural squat mechanics.",
        "correction": "Position feet 6–10 inches forward of the bar to avoid excessive knee shear stress and simulate natural squat mechanics."
      },
      {
        "mistake": "Letting knees collapse inward during upward drive",
        "fix": "Drive knees outward against resistance in line with your second toe throughout the movement.",
        "correction": "Drive knees outward against resistance in line with your second toe throughout the movement."
      }
    ],
    "safetyReminders": [
      "Lock wrist hooks into pegs securely at the end of set."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Forward Foot Stance",
        "description": "Step feet slightly forward to lean back into the guided bar."
      }
    ],
    "videoDurationSec": 45,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Position Bar at Upper Chest Height",
        "description": "Set the bar height on the rails so it rests comfortably across your upper trapezius when standing under it."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Set Bottom Safety Stop Catches",
        "description": "Adjust both safety stop collars to just below parallel squat depth so the bar cannot descend past safe joint limits."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Feet 6–10 Inches Forward",
        "description": "Step under bar and place feet 6–10 inches in front of the vertical rail plane. Rotate wrists to unhook the safety catches."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Sit Back to Parallel & Drive Up",
        "description": "Unrack bar with wrist twist, sit back into hips until thighs reach parallel (90°), drive through midfoot and heels back to top, and rotate wrists to re-rack hooks."
      }
    ],
    "movementCues": {
      "exhale": "On driving through midfoot/heels back to standing",
      "inhale": "On 3-second descent down to parallel depth",
      "tempo": "2s Upward Drive | 1s Pause at Top | 3s Deep Descent"
    }
  },
  {
    "id": "leg-press-45",
    "name": "Leg Press Machine",
    "alternativeNames": [
      "45-Degree Leg Press",
      "Incline Sled Leg Press",
      "Linear Leg Press"
    ],
    "category": "Legs",
    "tagline": "Heavy compound lower body pressing without spinal axial loading",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Quadriceps (Vastus Lateralis, Medialis, Rectus Femoris)",
      "Gluteus Maximus"
    ],
    "secondaryMuscles": [
      "Hamstrings",
      "Adductors",
      "Calves"
    ],
    "equipmentType": "Plate-Loaded",
    "qrCodeId": "GYM-LEG-03",
    "matchKeywords": [
      "leg press",
      "45 leg press",
      "incline press",
      "sled press",
      "foot plate",
      "quads",
      "glutes"
    ],
    "imageSvg": "leg-press",
    "description": "A 45-degree angled sled with a large footplate that allows heavy lower body development while keeping the lumbar spine supported against a backrest.",
    "brand": "Hammer Strength Plate-Loaded Linear Leg Press",
    "visualCharacteristics": [
      "45-degree angled track with roller bearings",
      "Large textured steel footplate",
      "Reclined seat with side safety lockout handles",
      "Side Olympic plate storage horns"
    ],
    "frontReferenceImage": "/machines/leg-press-45.jpg",
    "sideReferenceImage": "/machines/leg-press-45.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Sit firmly with your lower back and glutes pressed tight into the seat corner.",
      "Place feet shoulder-width apart in the center of the platform (toes pointing slightly out 10-15 degrees).",
      "Push the platform up to release the side safety lockout levers."
    ],
    "movementGuidance": [
      "Inhale and slowly lower the heavy sled over 3-4 seconds until knees are bent to approximately 90 degrees.",
      "Do not allow lower back or hips to curl up off the seat pad at the bottom.",
      "Exhale and drive through the heels and midfoot back to starting position (STOP just short of full knee lockout)."
    ],
    "commonMistakes": [
      {
        "mistake": "Violently hyperextending / locking knees out at the top",
        "fix": "Always maintain a soft 5° micro-bend in your knees at full extension to protect joint cartilage.",
        "correction": "Always maintain a soft 5° micro-bend in your knees at full extension to protect joint cartilage."
      },
      {
        "mistake": "Buttocks lifting off seat pad at bottom depth (butt wink)",
        "fix": "Stop knee descent at 90° before your pelvis rolls off the backrest to keep spinal discs safe.",
        "correction": "Stop knee descent at 90° before your pelvis rolls off the backrest to keep spinal discs safe."
      },
      {
        "mistake": "Knees collapsing inward during heavy upward drive",
        "fix": "Actively push knees outward tracking directly over your middle toes throughout the entire range.",
        "correction": "Actively push knees outward tracking directly over your middle toes throughout the entire range."
      }
    ],
    "safetyReminders": [
      "NEVER lock knees straight with heavy weight on the sled.",
      "Always re-engage the side safety lockout catches before releasing foot contact."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Foot Placement on Platform",
        "description": "Center feet shoulder-width for balanced quad and glute recruitment."
      },
      {
        "stepNumber": 2,
        "title": "Safety Handle Release",
        "description": "Press weight up slightly, rotate safety handles out, and maintain light grip."
      }
    ],
    "videoDurationSec": 50,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Seat Angle & Low-Back Anchor",
        "description": "Adjust the backrest angle to 45°. Sit down and wedge your hips and lower back firmly against the seat corner without any lumbar gap."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Foot Placement on Sled",
        "description": "Place both feet shoulder-width apart in the center of the heavy sled with toes flared outward 10–15° in line with your femurs."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Release Safety Handles",
        "description": "Grip the side safety handles firmly. Push the sled up 2 inches to rotate the safety lockout levers outward."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Midfoot Drive & Controlled Descent",
        "description": "Release safety handles, press footplate through midfoot/heels without locking knees at top, lower carriage smoothly to 90°, and drive back up."
      }
    ],
    "movementCues": {
      "exhale": "On upward drive through midfoot and heels",
      "inhale": "On 3-second descent until knees reach 90 degrees",
      "tempo": "2s Upward Drive | 1s Soft Pause | 3s Controlled Negative"
    }
  },
  {
    "id": "leg-extension",
    "name": "Leg Extension Machine",
    "alternativeNames": [
      "Seated Quad Extension",
      "Knee Extension Machine",
      "Pin-Loaded Leg Extension"
    ],
    "category": "Legs",
    "tagline": "Direct open-chain isolation for complete quadriceps development and knee tracking",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Quadriceps (Rectus Femoris, Vastus Medialis/Lateralis/Intermedius)"
    ],
    "secondaryMuscles": [
      "Tibialis Anterior"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-LEG-01",
    "matchKeywords": [
      "leg extension",
      "quad extension",
      "knee extension",
      "quad machine",
      "leg kick",
      "quads"
    ],
    "imageSvg": "leg-extension",
    "description": "Isolates the four quadriceps muscles through seated knee extension against a rotating padded lever arm.",
    "brand": "Precor Resolute Strength",
    "visualCharacteristics": [
      "Upright seat with horizontal backrest slider",
      "Lower cylindrical padded roller bar against shins",
      "Side hand hold bars with yellow adjustment pins",
      "Selectorized weight stack"
    ],
    "frontReferenceImage": "/machines/leg-extension.jpg",
    "sideReferenceImage": "/machines/leg-extension.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust backrest so the back of your knees rest comfortably against the front edge of the seat cushion.",
      "Position the lower shin pad so it rests snugly across the lower third of your shins (just above the ankles).",
      "Select starting weight and grip the side handles firmly to lock your pelvis down."
    ],
    "movementGuidance": [
      "Exhale and extend your legs upward in a smooth arc until knees are straight.",
      "Hold peak quadriceps contraction for 1 full second at the top.",
      "Inhale and slowly lower the shin pad back down over 3 seconds without letting weights slam."
    ],
    "commonMistakes": [
      {
        "mistake": "Kicking the weight up with violent explosive jerking",
        "fix": "Use a slow controlled 2-second lift to protect the patellar tendon.",
        "correction": "Use a slow controlled 2-second lift to protect the patellar tendon."
      },
      {
        "mistake": "Hips lifting off the seat during extension",
        "fix": "Grip side handles and pull your hips down firmly into the pad.",
        "correction": "Grip side handles and pull your hips down firmly into the pad."
      }
    ],
    "safetyReminders": [
      "If experiencing sharp patellar knee discomfort, lighten weight or limit extension range."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Rotational Pivot Alignment",
        "description": "Align your knee joint center directly with the machine pivot axis."
      },
      {
        "stepNumber": 2,
        "title": "Shin Pad Height",
        "description": "Rest pad 1-2 inches above shoe tongue."
      }
    ],
    "videoDurationSec": 35,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust backrest so the back of your knees rest comfortably against the front edge of the seat cushion."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Position the lower shin pad so it rests snugly across the lower third of your shins (just above the ankles)."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Select starting weight and grip the side handles firmly to lock your pelvis down."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Full Knee Extension & Quad Squeeze",
        "description": "Grip side handles tight, extend lower legs upward until knees are straight, squeeze quads hard at the top for 1-2s, and lower over 3s without weights slamming."
      }
    ],
    "movementCues": {
      "exhale": "On driving weight upward or curling into contraction",
      "inhale": "On 3-second controlled eccentric descent",
      "tempo": "2s Controlled Drive | 1s Pause | 3s Smooth Reset"
    }
  },
  {
    "id": "hip-adduction-machine",
    "name": "Hip Adduction Machine",
    "alternativeNames": [
      "Inner Thigh Machine",
      "Seated Adductor Machine",
      "Groin Machine"
    ],
    "category": "Legs",
    "tagline": "Strengthen inner thigh adductors for knee stability and groin strength",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Adductor Longus",
      "Adductor Magnus",
      "Gracilis"
    ],
    "secondaryMuscles": [
      "Pectineus",
      "Pelvic Floor"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-LEG-02",
    "matchKeywords": [
      "hip adduction",
      "inner thigh",
      "adductor machine",
      "groin machine"
    ],
    "imageSvg": "leg-press",
    "description": "A seated machine where pads rest inside your knees, requiring you to squeeze thighs together against resistance.",
    "brand": "Life Fitness Signature Series Adductor",
    "visualCharacteristics": [
      "Seated bucket chair with foot rests",
      "Dual inner knee pads",
      "Central release lever to open pads wide"
    ],
    "frontReferenceImage": "/machines/hip-adduction-machine.jpg",
    "sideReferenceImage": "/machines/hip-adduction-machine.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Pull the release lever and open legs into a comfortable stretch.",
      "Sit upright and place feet securely on the foot pegs."
    ],
    "movementGuidance": [
      "Squeeze knees together in a smooth, controlled motion until pads touch.",
      "Slowly open legs back to the stretch position over 3 seconds."
    ],
    "commonMistakes": [
      {
        "mistake": "Letting weights bounce at wide stretch",
        "fix": "Stop just before weight stack contacts.",
        "correction": "Stop just before weight stack contacts."
      }
    ],
    "safetyReminders": [
      "Start with light weight to protect groin tendons."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Gentle Stretch Start",
        "description": "Do not force extreme wide opening beyond normal hip mobility."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Pull the release lever and open legs into a comfortable stretch."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Sit upright and place feet securely on the foot pegs."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Squeeze Inner Thighs to Center",
        "description": "Squeeze thighs inward against pads until they touch in center, hold peak adductor contraction for 2s, and open legs slowly under control against the stack."
      }
    ],
    "movementCues": {
      "exhale": "On driving weight upward or curling into contraction",
      "inhale": "On 3-second controlled eccentric descent",
      "tempo": "2s Controlled Drive | 1s Pause | 3s Smooth Reset"
    }
  },
  {
    "id": "hack-squat-machine",
    "name": "Hack Squat Machine",
    "alternativeNames": [
      "Linear Hack Squat",
      "45-Degree Hack Squat Sled",
      "Plate-Loaded Hack Squat"
    ],
    "category": "Legs",
    "tagline": "Deep quad development with solid back and shoulder support sled",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "Quadriceps (Vastus Medialis & Lateralis)"
    ],
    "secondaryMuscles": [
      "Gluteus Maximus",
      "Calves",
      "Hamstrings"
    ],
    "equipmentType": "Plate-Loaded",
    "qrCodeId": "GYM-LEG-03",
    "matchKeywords": [
      "hack squat",
      "hack machine",
      "quad squat",
      "hack sled"
    ],
    "imageSvg": "leg-press",
    "description": "An inverted sled machine with padded shoulder yokes and an angled footplate that isolates the quadriceps with deep knee flexion.",
    "brand": "Cybex Plate-Loaded Hack Squat",
    "visualCharacteristics": [
      "Angled rails with padded shoulder pads and backrest",
      "Large low textured foot platform",
      "Rotating side safety handles"
    ],
    "frontReferenceImage": "/machines/hack-squat-machine.jpg",
    "sideReferenceImage": "/machines/hack-squat-machine.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Step onto the platform and rest back against pad with shoulder pads resting over traps.",
      "Disengage safety locks and maintain core tightness."
    ],
    "movementGuidance": [
      "Squat down until thighs are parallel to the footplate.",
      "Drive forcefully through midfoot to return to top position."
    ],
    "commonMistakes": [
      {
        "mistake": "Heels lifting off footplate",
        "fix": "Place feet slightly higher on platform to keep full heel contact.",
        "correction": "Place feet slightly higher on platform to keep full heel contact."
      }
    ],
    "safetyReminders": [
      "Set the mechanical bottom safety catch before loading heavy plates."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Shoulder Pad Placement",
        "description": "Fit shoulders snugly under pads before releasing lockout handle."
      }
    ],
    "videoDurationSec": 45,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Step onto the platform and rest back against pad with shoulder pads resting over traps."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Disengage safety locks and maintain core tightness."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Deep 90° Squat & Quad Drive",
        "description": "Disengage safety lockout handles, lower sled until thighs hit 90° with knees tracking over toes, and drive through heels without locking knees at the top."
      }
    ],
    "movementCues": {
      "exhale": "On driving weight upward or curling into contraction",
      "inhale": "On 3-second controlled eccentric descent",
      "tempo": "2s Controlled Drive | 1s Pause | 3s Smooth Reset"
    }
  },
  {
    "id": "lying-leg-curl",
    "name": "Lying Leg Curl Machine",
    "alternativeNames": [
      "Prone Hamstring Curl",
      "Prone Leg Curl Machine",
      "Horizontal Leg Curl"
    ],
    "category": "Legs",
    "tagline": "Prone position hamstring curl isolating knee flexion without spinal load",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Hamstrings"
    ],
    "secondaryMuscles": [
      "Gastrocnemius (Calf)"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-LEG-04",
    "matchKeywords": [
      "lying leg curl",
      "prone leg curl",
      "prone curl",
      "hamstring curl lying"
    ],
    "imageSvg": "leg-curl",
    "description": "An angled prone bench station where you lie face down and curl the padded roller upward against the glutes.",
    "brand": "Matrix Ultra Series",
    "visualCharacteristics": [
      "V-angled prone bench to prevent lower back arching",
      "Roller pad behind calves",
      "Front hand grips"
    ],
    "frontReferenceImage": "/machines/lying-leg-curl.jpg",
    "sideReferenceImage": "/machines/lying-leg-curl.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Lie face down with knees just over the edge of the bench pad.",
      "Position ankle pad just below calves/above ankles.",
      "Grasp front handles and keep hips pressed flat."
    ],
    "movementGuidance": [
      "Curl heels up toward glutes in a smooth arc.",
      "Hold contraction at the top for 1 count and lower under control."
    ],
    "commonMistakes": [
      {
        "mistake": "Hips lifting off the bench during curl",
        "fix": "Press pelvic bone down into pad throughout.",
        "correction": "Press pelvic bone down into pad throughout."
      }
    ],
    "safetyReminders": [
      "Control the downward descent to prevent hamstring strain."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Pelvis Glued to Pad",
        "description": "Maintain hip contact to prevent lower back hyperextension."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Lie face down with knees just over the edge of the bench pad."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Position ankle pad just below calves/above ankles."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Grasp front handles and keep hips pressed flat."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Curl Heels to Glutes & Hamstring Lock",
        "description": "Keep hips pressed flat into bench, curl heel roller pad smoothly toward glutes, squeeze hamstrings for 1s at top, and lower slowly under complete eccentric control."
      }
    ],
    "movementCues": {
      "exhale": "On pulling resistance toward your body",
      "inhale": "On 3-second controlled extension back to starting stretch",
      "tempo": "1s Powerful Pull | 1s Peak Contraction | 3s Controlled Negative"
    }
  },
  {
    "id": "seated-leg-curl",
    "name": "Seated Leg Curl Machine",
    "alternativeNames": [
      "Seated Hamstring Curl",
      "Knee Flexion Machine",
      "Pin-Loaded Leg Curl"
    ],
    "category": "Legs",
    "tagline": "Target the hamstrings in a lengthened hip position for peak muscle hypertrophy",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Hamstrings (Biceps Femoris, Semitendinosus, Semimembranosus)"
    ],
    "secondaryMuscles": [
      "Gastrocnemius (Calves)",
      "Gracilis"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-LEG-06",
    "matchKeywords": [
      "leg curl",
      "seated curl",
      "hamstring curl",
      "hamstrings",
      "seated leg curl",
      "back of legs"
    ],
    "imageSvg": "leg-curl",
    "description": "Flexes the knees against a padded lever arm while seated with hips bent at 90 degrees, maximizing hamstring tension.",
    "brand": "Life Fitness Signature Series",
    "visualCharacteristics": [
      "Seated station with upper thigh lockdown pad",
      "Lower padded ankle roller bar behind Achilles tendon",
      "Dual side stabilization grips",
      "Weight stack tower"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust backrest so the machine pivot aligns with your knee joint.",
      "Place lower legs on top of the lower padded lever so it rests right below your calves.",
      "Lower the upper thigh hold-down pad tightly over your quads to prevent hips from rising."
    ],
    "movementGuidance": [
      "Exhale and curl your heels downward and back underneath your seat as far as possible.",
      "Squeeze the hamstrings hard for 1 second at full knee flexion.",
      "Inhale and slowly resist the weight back up over 3 seconds to the top position."
    ],
    "commonMistakes": [
      {
        "mistake": "Leaving thigh clamp loose",
        "fix": "Tighten thigh clamp securely so your knees cannot lift off the seat cushion.",
        "correction": "Tighten thigh clamp securely so your knees cannot lift off the seat cushion."
      },
      {
        "mistake": "Hyperextending lower back",
        "fix": "Keep lumbar spine neutral and engage abdominals.",
        "correction": "Keep lumbar spine neutral and engage abdominals."
      }
    ],
    "safetyReminders": [
      "Never let the weight stack smash at full stretch."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Thigh Clamp Tightening",
        "description": "Pull the thigh clamp lever down until it is snug against your lower thighs."
      }
    ],
    "videoDurationSec": 40,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust backrest so the machine pivot aligns with your knee joint."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Place lower legs on top of the lower padded lever so it rests right below your calves."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Lower the upper thigh hold-down pad tightly over your quads to prevent hips from rising."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Downward Heel Curl Under Seat",
        "description": "Lock thigh clamp pad, curl heels downward and under seat toward calves, squeeze hamstrings hard at bottom for 1-2s, and return slowly over 3s."
      }
    ],
    "movementCues": {
      "exhale": "On pulling resistance toward your body",
      "inhale": "On 3-second controlled extension back to starting stretch",
      "tempo": "1s Powerful Pull | 1s Peak Contraction | 3s Controlled Negative"
    }
  },
  {
    "id": "hip-abduction-machine",
    "name": "Hip Abduction Machine",
    "alternativeNames": [
      "Outer Thigh Machine",
      "Seated Abductor Machine",
      "Glute Abductor"
    ],
    "category": "Legs",
    "tagline": "Isolate gluteus medius and outer hip stabilizers for pelvic stability",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Gluteus Medius",
      "Gluteus Minimus",
      "Tensor Fasciae Latae (TFL)"
    ],
    "secondaryMuscles": [
      "Gluteus Maximus (Upper Fibers)"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-LEG-08",
    "matchKeywords": [
      "hip abduction",
      "outer thigh",
      "abductor machine",
      "glute machine",
      "thigh machine"
    ],
    "imageSvg": "leg-press",
    "description": "A seated machine where the user pushes the padded knee levers outward against stack resistance, targeting the outer hips and glutes.",
    "brand": "Life Fitness Signature Series Abductor",
    "visualCharacteristics": [
      "Seated bucket chair with foot pegs",
      "Dual outer knee pads",
      "Central pin adjustment to start pads close together"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Sit back firmly and adjust the start lever so pads touch outside of knees.",
      "Place feet on footrests and grip side handles."
    ],
    "movementGuidance": [
      "Push knees outward as wide as possible against the pads.",
      "Hold peak outer glute squeeze for 2 seconds before returning."
    ],
    "commonMistakes": [
      {
        "mistake": "Using momentum and leaning torso back and forth",
        "fix": "Sit upright and isolate hip joint movement.",
        "correction": "Sit upright and isolate hip joint movement."
      }
    ],
    "safetyReminders": [
      "Do not set the starting pin too narrow if hip mobility is restricted."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "2-Second Peak Hold",
        "description": "Pause at the widest point to trigger gluteus medius fibers."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Sit back firmly and adjust the start lever so pads touch outside of knees."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Place feet on footrests and grip side handles."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Push Knees Outward & Glute Squeeze",
        "description": "Press knees outward against resistance pads as wide as comfortable, hold peak glute squeeze for 2s at maximum abduction, and resist inward slowly."
      }
    ],
    "movementCues": {
      "exhale": "On driving weight upward or curling into contraction",
      "inhale": "On 3-second controlled eccentric descent",
      "tempo": "2s Controlled Drive | 1s Pause | 3s Smooth Reset"
    }
  },
  {
    "id": "preacher-curl",
    "name": "Preacher Curl Machine",
    "alternativeNames": [
      "Seated Arm Curl Machine",
      "Bicep Preacher Station",
      "Incline Bicep Curl"
    ],
    "category": "Arms",
    "tagline": "Strict bicep isolation with upper arms locked into a 45-degree angled pad",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Biceps Brachii (Short & Long Head)"
    ],
    "secondaryMuscles": [
      "Brachialis",
      "Brachioradialis (Forearms)"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-ARM-01",
    "matchKeywords": [
      "preacher curl",
      "bicep machine",
      "arm curl",
      "preacher bench",
      "biceps",
      "curls"
    ],
    "imageSvg": "preacher-curl",
    "description": "Locks upper arms against an angled padded support to completely eliminate shoulder swing, isolating the biceps.",
    "brand": "Life Fitness Signature Series Arm Curl",
    "visualCharacteristics": [
      "45-degree angled arm rest cushion",
      "Swivel rotating curl handles",
      "Adjustable seat height",
      "Pin-loaded weight stack"
    ],
    "frontReferenceImage": "/machines/preacher-curl.jpg",
    "sideReferenceImage": "/machines/preacher-curl.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust seat height so your armpits rest comfortably over the top crest of the angled pad.",
      "Rest your triceps and elbows flush against the pad surface.",
      "Grasp rotating handles with an underhand (palms up) grip."
    ],
    "movementGuidance": [
      "Exhale and curl handles upward toward your shoulders.",
      "Squeeze biceps hard for 1-2 seconds at peak contraction.",
      "Inhale and slowly lower arms over 3 seconds (STOP just short of full hyperextended elbow lockout)."
    ],
    "commonMistakes": [
      {
        "mistake": "Letting elbows lift off the arm pad during the curl",
        "fix": "Keep upper arms glued flat against cushion.",
        "correction": "Keep upper arms glued flat against cushion."
      },
      {
        "mistake": "Hyperextending and slamming elbows straight at the bottom",
        "fix": "Maintain a soft 5-degree bend at bottom.",
        "correction": "Maintain a soft 5-degree bend at bottom."
      }
    ],
    "safetyReminders": [
      "Never hyperextend elbows under heavy load."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Armpit Cushion Lock",
        "description": "Fit armpits snugly over the top crest of the pad."
      }
    ],
    "videoDurationSec": 35,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust seat height so your armpits rest comfortably over the top crest of the angled pad."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Rest your triceps and elbows flush against the pad surface."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Grasp rotating handles with an underhand (palms up) grip."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Arm Anchor & Peak Bicep Curl",
        "description": "Anchor upper arms flat against angled preacher pad, curl barbell or dumbbell up toward chin, squeeze biceps at peak, and lower to 95% extension."
      }
    ],
    "movementCues": {
      "exhale": "On pulling resistance toward your body",
      "inhale": "On 3-second controlled extension back to starting stretch",
      "tempo": "1s Powerful Pull | 1s Peak Contraction | 3s Controlled Negative"
    }
  },
  {
    "id": "biceps-curl-machine",
    "name": "Biceps Curl Machine",
    "alternativeNames": [
      "Machine Bicep Curl",
      "Selectorized Arm Curl",
      "Rotary Bicep Machine"
    ],
    "category": "Arms",
    "tagline": "Smooth rotating cam resistance for continuous bicep tension",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Biceps Brachii",
      "Brachialis"
    ],
    "secondaryMuscles": [
      "Forearm Flexors"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-ARM-02",
    "matchKeywords": [
      "bicep curl machine",
      "biceps machine",
      "curls machine",
      "rotary curl"
    ],
    "imageSvg": "preacher-curl",
    "description": "A dedicated seated arm station with rotating cam pulley that matches the natural strength curve of the human elbow.",
    "brand": "Technogym Selection Arm Curl",
    "visualCharacteristics": [
      "Seated upright posture with chest rest pad",
      "Dual rotating handles",
      "Cam axis aligned with elbow joints"
    ],
    "frontReferenceImage": "/machines/biceps-curl-machine.jpg",
    "sideReferenceImage": "/machines/biceps-curl-machine.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Set seat so elbow joints align with the pivot axis cam.",
      "Grasp handles and sit tall with chest against pad."
    ],
    "movementGuidance": [
      "Curl handles smoothly toward chin.",
      "Hold peak squeeze for 1 second and lower under control."
    ],
    "commonMistakes": [
      {
        "mistake": "Leaning back to swing weight",
        "fix": "Keep torso still against chest pad.",
        "correction": "Keep torso still against chest pad."
      }
    ],
    "safetyReminders": [
      "Select manageable weights to protect the distal bicep tendon."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Cam Alignment",
        "description": "Verify elbow pivot point matches machine red dot."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Set seat so elbow joints align with the pivot axis cam."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Grasp handles and sit tall with chest against pad."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Curl to Shoulders & Peak Squeeze",
        "description": "Anchor elbows in pad groove, exhale and curl handles upward toward shoulders, squeeze peak bicep contraction for 1s, and lower over 3s under control."
      }
    ],
    "movementCues": {
      "exhale": "On pulling resistance toward your body",
      "inhale": "On 3-second controlled extension back to starting stretch",
      "tempo": "1s Powerful Pull | 1s Peak Contraction | 3s Controlled Negative"
    }
  },
  {
    "id": "triceps-extension-machine",
    "name": "Triceps Extension Machine",
    "alternativeNames": [
      "Seated Triceps Machine",
      "Machine Triceps Extension",
      "Overhead Tricep Machine"
    ],
    "category": "Arms",
    "tagline": "Direct triceps isolation with locked elbow pivot mechanics",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Triceps Brachii (Lateral, Medial & Long Head)"
    ],
    "secondaryMuscles": [
      "Anconeus"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-ARM-03",
    "matchKeywords": [
      "triceps extension",
      "tricep machine",
      "seated triceps",
      "tricep press"
    ],
    "imageSvg": "cable-station",
    "description": "A seated machine with elbow rest pads and downward pressing levers that completely isolate all three heads of the triceps.",
    "brand": "Matrix Versa Triceps",
    "visualCharacteristics": [
      "Angled arm support cushions",
      "Rotating downward press handles",
      "Padded backrest and weight stack"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust seat so elbows rest comfortably on pads aligned with machine pivot.",
      "Grasp handles with palms facing inward or downward."
    ],
    "movementGuidance": [
      "Push handles downward until arms are fully extended.",
      "Squeeze triceps hard for 1 second at lockout and return slowly."
    ],
    "commonMistakes": [
      {
        "mistake": "Flaring elbows off pads",
        "fix": "Keep elbows planted firmly on cushions.",
        "correction": "Keep elbows planted firmly on cushions."
      }
    ],
    "safetyReminders": [
      "Control the return so weights do not slam."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Elbow Pad Anchor",
        "description": "Anchor elbows on pad to prevent shoulder involvement."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust seat so elbows rest comfortably on pads aligned with machine pivot."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Grasp handles with palms facing inward or downward."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Full Tricep Lockout & Elbow Anchor",
        "description": "Lock upper arms against pad, extend forearms forward and down until triceps fully lock out, squeeze 1s at peak extension, and return slowly."
      }
    ],
    "movementCues": {
      "exhale": "On the concentric exertion phase (pushing or pulling)",
      "inhale": "On the 3-second controlled eccentric return phase",
      "tempo": "1s Explode | 1s Peak Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "triceps-pushdown-cable",
    "name": "Triceps Pushdown Cable Station",
    "alternativeNames": [
      "Cable Triceps Pushdown",
      "High Pulley Tricep Station",
      "Rope Pushdown Station"
    ],
    "category": "Arms",
    "tagline": "Overhead high pulley cable for rope, V-bar, and straight bar triceps pushdowns",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Triceps Brachii (Lateral & Medial Heads)"
    ],
    "secondaryMuscles": [
      "Anconeus",
      "Core Stabilizers"
    ],
    "equipmentType": "Cable Pulley",
    "qrCodeId": "GYM-ARM-04",
    "matchKeywords": [
      "tricep pushdown",
      "cable pushdown",
      "rope pushdown",
      "tricep cable",
      "cable pressdown",
      "triceps"
    ],
    "imageSvg": "cable-station",
    "description": "A high pulley cable station where an athlete presses a rope or bar downward with pinned elbows to isolate the triceps.",
    "brand": "Life Fitness Cable Column",
    "visualCharacteristics": [
      "Overhead high pulley wheel with steel cable",
      "Tricep braided rope attachment or steel V-bar",
      "Vertical weight stack tower"
    ],
    "frontReferenceImage": "/machines/triceps-pushdown-cable.jpg",
    "sideReferenceImage": "/machines/triceps-pushdown-cable.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Attach a braided tricep rope or angled steel V-bar to high cable carabiner.",
      "Grip the attachment and step back slightly with knees soft and torso inclined 10 degrees.",
      "Pin your upper arms and elbows tight against your ribcage."
    ],
    "movementGuidance": [
      "Exhale and push your hands downward until arms are locked out straight beside thighs.",
      "If using rope, spread the rope ends apart at the bottom for intense lateral tricep squeeze.",
      "Inhale and allow forearms to hinge upward to 90 degrees while keeping elbows pinned."
    ],
    "commonMistakes": [
      {
        "mistake": "Elbows drifting forward and backward like a row",
        "fix": "Glue elbows to your sides like hinges.",
        "correction": "Glue elbows to your sides like hinges."
      },
      {
        "mistake": "Hunching shoulders over the bar",
        "fix": "Keep chest proud and shoulders pulled down.",
        "correction": "Keep chest proud and shoulders pulled down."
      }
    ],
    "safetyReminders": [
      "Do not let the weight pull your elbows above chest level between reps."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Elbow Ribcage Anchor",
        "description": "Keep elbows glued to sides throughout every single rep."
      }
    ],
    "videoDurationSec": 40,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Attach a braided tricep rope or angled steel V-bar to high cable carabiner."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Grip the attachment and step back slightly with knees soft and torso inclined 10 degrees."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Pin your upper arms and elbows tight against your ribcage."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Pin Elbows & Flare at Lockout",
        "description": "Pin elbows tight to ribs, push cable attachment downward until arms are fully locked out, flare rope or bar apart at bottom, and return to 90° elbow bend."
      }
    ],
    "movementCues": {
      "exhale": "On pressing the weight away from your body",
      "inhale": "On 3-second controlled descent back to starting position",
      "tempo": "1s Explosive Press | 1s Muscle Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "assisted-dip-machine",
    "name": "Assisted Dip Machine",
    "alternativeNames": [
      "Counterbalanced Dip Station",
      "Assisted Tricep Dip Machine",
      "Gravitron Dip"
    ],
    "category": "Arms",
    "tagline": "Counterweighted kneeling platform for mastering full range tricep and chest dips",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Triceps Brachii",
      "Lower Pectoralis Major"
    ],
    "secondaryMuscles": [
      "Anterior Deltoids",
      "Rhomboids"
    ],
    "equipmentType": "Bodyweight Assisted",
    "qrCodeId": "GYM-ARM-05",
    "matchKeywords": [
      "assisted dip",
      "dip machine",
      "counterbalance dip",
      "tricep dips"
    ],
    "imageSvg": "assisted-pullup",
    "description": "Provides counterweight assistance through a kneeling pad to allow users of all strength levels to perform deep tricep dips.",
    "brand": "Life Fitness Signature Series Assisted Dip",
    "visualCharacteristics": [
      "Dual parallel dip handles (narrow & wide settings)",
      "Counterbalanced kneeling pad",
      "Weight stack tower"
    ],
    "frontReferenceImage": "/machines/assisted-dip-machine.jpg",
    "sideReferenceImage": "/machines/assisted-dip-machine.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Set assistance weight pin (more weight = easier).",
      "Step onto side footpegs, grip dip handles, and place knees on pad."
    ],
    "movementGuidance": [
      "Lower body until elbows bend to 90 degrees.",
      "Press upward through palms until arms are straight."
    ],
    "commonMistakes": [
      {
        "mistake": "Dipping too deep with shoulder pain",
        "fix": "Stop at 90-degree elbow bend.",
        "correction": "Stop at 90-degree elbow bend."
      }
    ],
    "safetyReminders": [
      "Step off carefully one foot at a time."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "90-Degree Depth Limit",
        "description": "Do not dip deeper than parallel elbow angle."
      }
    ],
    "videoDurationSec": 40,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Set assistance weight pin (more weight = easier)."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Step onto side footpegs, grip dip handles, and place knees on pad."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Lower to 90° & Palm Drive",
        "description": "Lower torso by bending elbows to 90° with chest slightly angled forward, press through palms to full arm extension, and avoid shrugging shoulders."
      }
    ],
    "movementCues": {
      "exhale": "On the concentric exertion phase (pushing or pulling)",
      "inhale": "On the 3-second controlled eccentric return phase",
      "tempo": "1s Explode | 1s Peak Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "treadmill-commercial",
    "name": "Treadmill",
    "alternativeNames": [
      "Commercial Running Treadmill",
      "Motorized Treadmill",
      "Running Machine"
    ],
    "category": "Cardio",
    "tagline": "Variable speed and incline deck for low-impact walking, jogging, and sprint intervals",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Quadriceps",
      "Hamstrings",
      "Calves",
      "Cardiovascular System"
    ],
    "secondaryMuscles": [
      "Gluteus Maximus",
      "Core Stabilizers"
    ],
    "equipmentType": "Cardio Ergometer",
    "qrCodeId": "GYM-CARDIO-01",
    "matchKeywords": [
      "treadmill",
      "running machine",
      "jogging",
      "cardio machine",
      "incline walker",
      "running"
    ],
    "imageSvg": "treadmill",
    "description": "Motorized continuous running deck with shock absorption, digital heart rate monitors, and motorized incline angles up to 15%.",
    "brand": "Life Fitness Elevation Series",
    "visualCharacteristics": [
      "Long motorized black textured running belt",
      "Dual safety handrails with contact heart-rate sensors",
      "Red magnetic emergency stop clip",
      "Digital touch LCD console"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Straddle the belt with feet on side rails before starting.",
      "Attach the red safety clip firmly to your shirt waistband.",
      "Press Quick Start, allow belt to move at 1.0 km/h, then step on smoothly."
    ],
    "movementGuidance": [
      "Walk or jog near the center of the belt with tall posture and eyes forward.",
      "Swing arms naturally without holding handrails once comfortable.",
      "Adjust speed and incline via console controls."
    ],
    "commonMistakes": [
      {
        "mistake": "Clinging tightly to front handrails during high-speed walking/incline",
        "fix": "Pump arms freely at your sides to recruit core muscles, improve spinal biomechanics, and burn 20% more calories.",
        "correction": "Pump arms freely at your sides to recruit core muscles, improve spinal biomechanics, and burn 20% more calories."
      },
      {
        "mistake": "Looking down at feet or mobile screen",
        "fix": "Keep your chin up and gaze fixed forward on the horizon to maintain vestibular balance and upright posture.",
        "correction": "Keep your chin up and gaze fixed forward on the horizon to maintain vestibular balance and upright posture."
      },
      {
        "mistake": "Heavy heel striking with loud stomping",
        "fix": "Land softly on your midfoot with knees slightly flexed to absorb ground reaction forces.",
        "correction": "Land softly on your midfoot with knees slightly flexed to absorb ground reaction forces."
      }
    ],
    "safetyReminders": [
      "ALWAYS attach the emergency red clip to your clothing.",
      "Never step off a moving belt at high speeds."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Emergency Stop Clip Attachment",
        "description": "Clamp red magnetic lanyard to shirt hem before pressing Quick Start."
      }
    ],
    "videoDurationSec": 40,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Straddle Rails & Clip Safety Key",
        "description": "Stand with feet straddling the belt on the side rails. Attach the red safety emergency stop clip securely to your shirt waistband."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Program & Start Belt",
        "description": "Press the green \"Quick Start\" button. Wait for the belt to begin moving at a slow 1.0 km/h (0.6 mph) baseline speed."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Step onto Belt & Upright Posture",
        "description": "Step smoothly onto the moving belt near the center deck. Keep eyes forward, shoulders relaxed, and swing arms naturally."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Step On & Cadence Ramp",
        "description": "Step onto belt at low speed (1-2 km/h), maintain upright posture with light arm swing, and adjust incline/speed gradually while keeping eyes forward."
      }
    ],
    "movementCues": {
      "exhale": "Rhythmic 2-count breath through mouth",
      "inhale": "Deep 2-count nasal diaphragmatic breath",
      "tempo": "160–180 SPM Cadence | Soft Midfoot Strike | Steady Heart Rate"
    }
  },
  {
    "id": "stair-climber",
    "name": "Stair Climber",
    "alternativeNames": [
      "StairMaster",
      "StepMill",
      "Rotating Stair Climber",
      "Step Machine"
    ],
    "category": "Cardio",
    "tagline": "Continuous revolving staircase for intense glute, quad, and cardiovascular conditioning",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "Gluteus Maximus",
      "Quadriceps",
      "Calves",
      "Cardiovascular System"
    ],
    "secondaryMuscles": [
      "Hamstrings",
      "Core"
    ],
    "equipmentType": "Cardio Ergometer",
    "qrCodeId": "GYM-CARDIO-02",
    "matchKeywords": [
      "stair climber",
      "stairmaster",
      "stepmill",
      "stair machine",
      "revolving stairs"
    ],
    "imageSvg": "treadmill",
    "description": "A continuous rotating flight of 8-inch stairs with electronic step speed control for intense lower body calorie burning.",
    "brand": "StairMaster Gauntlet 8-Series",
    "visualCharacteristics": [
      "Tall revolving staircase with 3-4 visible steps",
      "Surround handrails with stop buttons",
      "Console screen at eye level"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Step onto lowest step, select Level 3-5 on console, and press Start.",
      "Maintain upright posture with light fingertip contact on side rails."
    ],
    "movementGuidance": [
      "Step fully onto each revolving step with entire foot (not just toes).",
      "Maintain rhythm without skipping steps or leaning heavily on rails."
    ],
    "commonMistakes": [
      {
        "mistake": "Slouching forward and supporting bodyweight on handles",
        "fix": "Stand tall with core braced and support yourself with legs.",
        "correction": "Stand tall with core braced and support yourself with legs."
      }
    ],
    "safetyReminders": [
      "Never look down at phone while revolving steps are moving."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Upright Posture Rule",
        "description": "Keep spine vertical to maximize glute contraction."
      }
    ],
    "videoDurationSec": 40,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🏃",
        "title": "Machine Setup & Alignment",
        "description": "Step onto lowest step, select Level 3-5 on console, and press Start."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Maintain upright posture with light fingertip contact on side rails."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Upright Step & Whole-Foot Drive",
        "description": "Step into center of rotating stairs with upright posture, drive through whole foot rather than just toes, and avoid leaning heavily on handrails."
      }
    ],
    "movementCues": {
      "exhale": "Rhythmic breath cycles synchronized with stride cadence",
      "inhale": "Deep diaphragmatic nasal/oral inhalation",
      "tempo": "Consistent Target Cadence | Smooth Pacing | Heart Zone Focus"
    }
  },
  {
    "id": "stationary-bike-upright",
    "name": "Stationary Bike",
    "alternativeNames": [
      "Upright Exercise Bike",
      "Stationary Cycling Ergometer",
      "Fitness Cycle"
    ],
    "category": "Cardio",
    "tagline": "Low-impact cardiovascular conditioning and lower body endurance cycling",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Quadriceps",
      "Cardiovascular System"
    ],
    "secondaryMuscles": [
      "Hamstrings",
      "Calves",
      "Core Stabilizers"
    ],
    "equipmentType": "Cardio Ergometer",
    "qrCodeId": "GYM-CARDIO-03",
    "matchKeywords": [
      "stationary bike",
      "exercise bike",
      "cycle",
      "cardio bike",
      "cycling",
      "upright bike"
    ],
    "imageSvg": "stationary-bike",
    "description": "An ergonomic upright cycling machine featuring electromagnetic resistance, interval programs, and pulse heart rate monitors.",
    "brand": "Matrix Lifestyle Upright Cycle",
    "visualCharacteristics": [
      "Adjustable saddle with numbered seat post",
      "Pedals with rubber foot straps",
      "Triathlon-style multi-grip handlebars with digital screen"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust saddle height so the seat aligns with your hip bone when standing next to it.",
      "When seated with pedal at 6 o’clock position, your knee should have a slight 25-30 degree bend.",
      "Slide feet into pedal cages and strap snug."
    ],
    "movementGuidance": [
      "Begin pedaling in smooth full circular revolutions.",
      "Maintain steady cadence (70-90 RPM) with moderate resistance.",
      "Keep upper body relaxed with light grip on handlebars."
    ],
    "commonMistakes": [
      {
        "mistake": "Seat set too low causing knee joint stress",
        "fix": "Raise seat until leg is almost fully extended at bottom stroke.",
        "correction": "Raise seat until leg is almost fully extended at bottom stroke."
      }
    ],
    "safetyReminders": [
      "Ensure the seat adjustment pin clicks securely before sitting down."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Hip-Height Saddle Alignment",
        "description": "Position saddle level with hip bone for knee safety."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🏃",
        "title": "Machine Setup & Alignment",
        "description": "Adjust saddle height so the seat aligns with your hip bone when standing next to it."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "When seated with pedal at 6 o’clock position, your knee should have a slight 25-30 degree bend."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Slide feet into pedal cages and strap snug."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "360° Circular Pedal Strokes",
        "description": "Pedal in smooth 360° circular strokes with balls of feet, keep torso tall with relaxed shoulders, and maintain cadence at 70-90 RPM."
      }
    ],
    "movementCues": {
      "exhale": "Rhythmic breath cycles synchronized with stride cadence",
      "inhale": "Deep diaphragmatic nasal/oral inhalation",
      "tempo": "Consistent Target Cadence | Smooth Pacing | Heart Zone Focus"
    }
  },
  {
    "id": "rowing-machine",
    "name": "Rowing Machine",
    "alternativeNames": [
      "Indoor Rower",
      "Concept2 Ergometer",
      "Air Rower"
    ],
    "category": "Cardio",
    "tagline": "Full-body cardiovascular and muscular endurance ergometer engaging 86% of muscles",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "Legs",
      "Back (Lats & Rhomboids)",
      "Cardiovascular System"
    ],
    "secondaryMuscles": [
      "Arms",
      "Core",
      "Glutes"
    ],
    "equipmentType": "Cardio Ergometer",
    "qrCodeId": "GYM-CARDIO-04",
    "matchKeywords": [
      "rowing machine",
      "concept 2",
      "rower",
      "air rower",
      "ergometer",
      "rowing"
    ],
    "imageSvg": "seated-row",
    "description": "A sliding seat rail and air/water flywheel resistance system providing dynamic total-body endurance training.",
    "brand": "Concept2 RowErg",
    "visualCharacteristics": [
      "Long aluminum monorail with sliding seat",
      "Front flywheel housing with damper lever (1-10)",
      "Chain pull handle and PM5 monitor"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Strap feet securely into footplates with strap across the widest part of shoe.",
      "Set damper lever to 3-5 for realistic rowing resistance.",
      "Grasp handle with overhand grip and sit tall with knees bent."
    ],
    "movementGuidance": [
      "Sequence: Legs push first, then hips swing back, then arms pull handle to ribcage.",
      "Recovery: Arms extend first, hips hinge forward, then knees bend to slide forward."
    ],
    "commonMistakes": [
      {
        "mistake": "Pulling with arms before legs have extended",
        "fix": "Drive 60% of power through legs before pulling with arms.",
        "correction": "Drive 60% of power through legs before pulling with arms."
      }
    ],
    "safetyReminders": [
      "Keep flat neutral spine during the catch and drive."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Drive Sequence (Legs-Core-Arms)",
        "description": "Master the 1-2-3 sequence for maximum power and spine safety."
      }
    ],
    "videoDurationSec": 45,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🏃",
        "title": "Machine Setup & Alignment",
        "description": "Strap feet securely into footplates with strap across the widest part of shoe."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Set damper lever to 3-5 for realistic rowing resistance."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Grasp handle with overhand grip and sit tall with knees bent."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Leg Drive, Hip Swing & Arm Pull",
        "description": "Drive with legs first, swing torso back to 11 o'clock, pull handle to sternum, then reverse sequence smoothly (arms, core, legs) into the catch."
      }
    ],
    "movementCues": {
      "exhale": "On pulling resistance toward your body",
      "inhale": "On 3-second controlled extension back to starting stretch",
      "tempo": "1s Powerful Pull | 1s Peak Contraction | 3s Controlled Negative"
    }
  },
  {
    "id": "power-rack",
    "name": "Power Rack",
    "alternativeNames": [
      "Full Power Cage",
      "Squat Cage",
      "Safety Power Rack"
    ],
    "category": "Other",
    "tagline": "Enclosed four-pillar steel safety cage for heavy barbell squats, presses, and pulls",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "Full Body Compound (Quads, Glutes, Chest, Back)"
    ],
    "secondaryMuscles": [
      "Core Stabilizers"
    ],
    "equipmentType": "Free Motion / Other",
    "qrCodeId": "GYM-FUNC-01",
    "matchKeywords": [
      "power rack",
      "power cage",
      "squat cage",
      "safety rack",
      "barbell cage"
    ],
    "imageSvg": "smith-machine",
    "description": "A heavy-duty 4-post steel cage featuring adjustable J-cups, full-length safety spotter bars, and multi-grip pull-up bars.",
    "brand": "Rogue Monster Lite R-4",
    "visualCharacteristics": [
      "Four vertical steel box uprights with hole numbering",
      "Heavy horizontal safety pipe/pin bars",
      "Upper multi-grip chin-up crossbar"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Set J-cups to upper chest height for squats, or mid-chest for bench press.",
      "Insert horizontal safety spotter bars 2 inches below the bottom of your deepest rep."
    ],
    "movementGuidance": [
      "Step under barbell, un-rack with balanced posture, take 2 steps back, perform exercise, then step forward to re-rack."
    ],
    "commonMistakes": [
      {
        "mistake": "Lifting heavy without setting safety bars",
        "fix": "Always position safety bars to catch the bar in case of fatigue.",
        "correction": "Always position safety bars to catch the bar in case of fatigue."
      }
    ],
    "safetyReminders": [
      "Ensure barbell spring collars or lock jaws are clamped onto both sides."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Safety Pin Height Test",
        "description": "Perform an unweighted squat to ensure safety bars catch the barbell below bottom depth."
      }
    ],
    "videoDurationSec": 45,
    "featured": true,
    "steps": [
      {
        "stage": "Setup",
        "icon": "📐",
        "title": "Machine Setup & Alignment",
        "description": "Set J-cups to upper chest height for squats, or mid-chest for bench press."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Insert horizontal safety spotter bars 2 inches below the bottom of your deepest rep."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Execute Full Stroke Inside Cage",
        "description": "Step under bar with balanced grip, unrack, perform movement with full range of motion within safety bar boundary, and re-rack bar firmly onto J-hooks."
      }
    ],
    "movementCues": {
      "exhale": "On the concentric exertion phase (pushing or pulling)",
      "inhale": "On the 3-second controlled eccentric return phase",
      "tempo": "1s Explode | 1s Peak Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "squat-rack",
    "name": "Squat Rack",
    "alternativeNames": [
      "Squat Stand",
      "Half Rack",
      "Open Squat Station"
    ],
    "category": "Other",
    "tagline": "Open two-post steel rack for squats, overhead presses, and lunges",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "Quadriceps",
      "Glutes",
      "Core"
    ],
    "secondaryMuscles": [
      "Hamstrings",
      "Upper Back"
    ],
    "equipmentType": "Free Motion / Other",
    "qrCodeId": "GYM-FUNC-02",
    "matchKeywords": [
      "squat rack",
      "squat stands",
      "half rack",
      "barbell squat stand"
    ],
    "imageSvg": "smith-machine",
    "description": "An open two-column rack with adjustable bar holders and front safety arms, providing easy walk-in access for barbell lifting.",
    "brand": "Eleiko Classic Half Rack",
    "visualCharacteristics": [
      "Two vertical steel posts with J-hooks",
      "Shorter front safety spotter arms",
      "Integrated Olympic plate storage pegs"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust J-hooks so barbell sits at collarbone height.",
      "Lock safety spotter arms into place at hip/squat depth."
    ],
    "movementGuidance": [
      "Step under bar, un-rack, step back 2 paces, and execute lift with strict form."
    ],
    "commonMistakes": [
      {
        "mistake": "Setting J-hooks too high requiring tiptoeing to un-rack",
        "fix": "Set hooks lower so you can un-rack with bent knees.",
        "correction": "Set hooks lower so you can un-rack with bent knees."
      }
    ],
    "safetyReminders": [
      "Always use barbell collars on weight plates."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Barbell Collar Clamp",
        "description": "Clamp barbell collars on both plate sleeves before lifting."
      }
    ],
    "videoDurationSec": 40,
    "steps": [
      {
        "stage": "Setup",
        "icon": "📐",
        "title": "Machine Setup & Alignment",
        "description": "Adjust J-hooks so barbell sits at collarbone height."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Lock safety spotter arms into place at hip/squat depth."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Hip Crease Below Knee & Midfoot Drive",
        "description": "Brace core 360°, squat down until hip crease descends below top of knees, drive through midfoot/heels back to standing, and re-rack safely."
      }
    ],
    "movementCues": {
      "exhale": "On the concentric exertion phase (pushing or pulling)",
      "inhale": "On the 3-second controlled eccentric return phase",
      "tempo": "1s Explode | 1s Peak Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "cable-tower",
    "name": "Cable Tower",
    "alternativeNames": [
      "4-Stack Cable Jungle",
      "Multi-Station Cable Tower",
      "Cable Multi-Gym"
    ],
    "category": "Cable Equipment",
    "tagline": "Central multi-station cable jungle combining lat pulldowns, low rows, and hi-lo pulleys",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Full Body (Back, Chest, Arms, Delts)"
    ],
    "secondaryMuscles": [
      "Core"
    ],
    "equipmentType": "Cable Pulley",
    "qrCodeId": "GYM-FUNC-03",
    "matchKeywords": [
      "cable tower",
      "cable jungle",
      "multi stack cable",
      "cable machine station"
    ],
    "imageSvg": "cable-station",
    "description": "A 4-way or 8-way multi-station cable complex featuring lat pulldowns, low seated rows, tricep pushdowns, and adjustable pulley columns.",
    "brand": "Life Fitness MJ4 Multi-Jungle",
    "visualCharacteristics": [
      "Central 4-sided steel tower with 4 independent weight stacks",
      "Integrated overhead pull-up handles and cables on all sides"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Select the desired station on the tower and adjust pulley carriage to desired height.",
      "Insert magnetic weight pin and attach appropriate cable handle."
    ],
    "movementGuidance": [
      "Maintain smooth, uniform cable velocity along the pulley line."
    ],
    "commonMistakes": [
      {
        "mistake": "Letting weights drop heavily on the stack",
        "fix": "Control the eccentric phase until the weight stack is silent.",
        "correction": "Control the eccentric phase until the weight stack is silent."
      }
    ],
    "safetyReminders": [
      "Verify carabiners are fully clicked closed."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Carabiner Safety Check",
        "description": "Ensure safety screw/latch is closed on cable end."
      }
    ],
    "videoDurationSec": 40,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Select the desired station on the tower and adjust pulley carriage to desired height."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Insert magnetic weight pin and attach appropriate cable handle."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Multi-Planar Pull with Continuous Tension",
        "description": "Select attachment, step into balanced stance, execute movement with continuous cable tension through full range, and return under control."
      }
    ],
    "movementCues": {
      "exhale": "On the concentric exertion phase (pushing or pulling)",
      "inhale": "On the 3-second controlled eccentric return phase",
      "tempo": "1s Explode | 1s Peak Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "functional-trainer",
    "name": "Functional Trainer",
    "alternativeNames": [
      "Dual Adjustable Pulley",
      "Freemotion Functional Trainer",
      "DAP Cable Machine"
    ],
    "category": "Cable Equipment",
    "tagline": "Dual independently adjustable cable arms for athletic multi-planar functional movements",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Full Body (Multi-Planar Strength)"
    ],
    "secondaryMuscles": [
      "Core Stabilizers",
      "Rotator Cuff"
    ],
    "equipmentType": "Cable Pulley",
    "qrCodeId": "GYM-FUNC-04",
    "matchKeywords": [
      "functional trainer",
      "dual adjustable pulley",
      "dap",
      "freemotion trainer"
    ],
    "imageSvg": "cable-station",
    "description": "Twin independent swivel pulley arms that move vertically and horizontally, mimicking sports movements with smooth cable resistance.",
    "brand": "Keiser Functional Trainer / Life Fitness DAP",
    "visualCharacteristics": [
      "Two vertical columns with sliding carriages",
      "Wide center instructional mirror or placard",
      "Dual weight stacks with 2:1 or 4:1 cable ratio"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust both left and right pulley carriages to identical height settings using the numbered indicators.",
      "Select matching weight on both stacks and attach handles."
    ],
    "movementGuidance": [
      "Brace core and execute movement through the desired anatomical plane with steady control."
    ],
    "commonMistakes": [
      {
        "mistake": "Unequal height pin settings",
        "fix": "Check that both numbered height indicators match exactly.",
        "correction": "Check that both numbered height indicators match exactly."
      }
    ],
    "safetyReminders": [
      "Stand centered between the dual towers."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Numbered Notch Match",
        "description": "Verify left and right pulleys are locked into the same number notch."
      }
    ],
    "videoDurationSec": 45,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust both left and right pulley carriages to identical height settings using the numbered indicators."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Select matching weight on both stacks and attach handles."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Symmetrical Cable Arc Execution",
        "description": "Set dual pulleys to desired height, brace core, perform symmetrical movement arc with constant multi-planar cable tension, and return slowly."
      }
    ],
    "movementCues": {
      "exhale": "On the concentric exertion phase (pushing or pulling)",
      "inhale": "On the 3-second controlled eccentric return phase",
      "tempo": "1s Explode | 1s Peak Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "adjustable-bench",
    "name": "Adjustable Bench",
    "alternativeNames": [
      "FID Bench",
      "Incline Decline Flat Bench",
      "Multi-Angle Workout Bench"
    ],
    "category": "Other",
    "tagline": "Multi-position padded workout bench from -15 decline to 85 incline degrees",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Chest",
      "Shoulders",
      "Arms",
      "Back"
    ],
    "secondaryMuscles": [
      "Core"
    ],
    "equipmentType": "Free Motion / Other",
    "qrCodeId": "GYM-FUNC-05",
    "matchKeywords": [
      "adjustable bench",
      "incline bench",
      "workout bench",
      "fid bench",
      "gym bench"
    ],
    "imageSvg": "chest-press",
    "description": "Heavy-duty steel frame bench with independent ladder or pop-pin adjustments for the seat and backrest from flat to upright.",
    "brand": "Rogue AB-3 Multi-Angle Bench",
    "visualCharacteristics": [
      "Thick vinyl padded back pad and seat pad",
      "Ladder notch or spring-pin angle adjustment",
      "Rear transport wheels and front handle"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Lift backrest and place ladder strut into desired angle notch (0 flat, 30 incline, 85 upright).",
      "Adjust seat pad angle up to prevent sliding during incline presses."
    ],
    "movementGuidance": [
      "Keep feet firmly planted on floor and head, shoulders, and hips in contact with pad."
    ],
    "commonMistakes": [
      {
        "mistake": "Failing to engage the ladder adjustment pin securely",
        "fix": "Always double-check that the adjustment bar is fully seated in the frame slot before loading weight.",
        "correction": "Always double-check that the adjustment bar is fully seated in the frame slot before loading weight."
      },
      {
        "mistake": "Setting incline too steep for chest (above 45°)",
        "fix": "Keep incline at 30° to target upper clavicular chest fibers without turning it into a shoulder press.",
        "correction": "Keep incline at 30° to target upper clavicular chest fibers without turning it into a shoulder press."
      }
    ],
    "safetyReminders": [
      "Check ladder bar engagement before sitting down with heavy dumbbells."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Angle Pin Engagement",
        "description": "Give backrest a firm downward push to verify it is locked into place."
      }
    ],
    "videoDurationSec": 30,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Select Incline / Flat Angle",
        "description": "Lift the backrest ladder bar and click securely into desired angle notch: 0° (flat), 30° (upper chest), 45° (incline), or 85° (military press)."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Tilt Seat Pad Upward",
        "description": "Raise the seat cushion one or two notches so you do not slide forward during heavy presses."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Brace Torso & Plant Feet",
        "description": "Sit back flush against the padded incline. Drive feet wide and flat into the gym rubber floor, keeping glutes, spine, and head in contact."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Anchor 5 Points & Strict Pressing Arc",
        "description": "Anchor feet firmly, maintain 5 points of body contact on pad, press or curl with strict path, and control the 3s negative return."
      }
    ],
    "movementCues": {
      "exhale": "On pushing resistance away from torso",
      "inhale": "On 3-second controlled reset to chest level",
      "tempo": "1s Drive | 1s Peak Hold | 3s Controlled Negative"
    }
  },
  {
    "id": "flat-bench",
    "name": "Flat Bench",
    "alternativeNames": [
      "Olympic Flat Bench",
      "Utility Flat Bench",
      "Standard Weight Bench"
    ],
    "category": "Other",
    "tagline": "Solid, non-adjustable horizontal bench providing stable foundation for pressing and rows",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Pectoralis Major",
      "Triceps",
      "Deltoids"
    ],
    "secondaryMuscles": [
      "Core"
    ],
    "equipmentType": "Free Motion / Other",
    "qrCodeId": "GYM-FUNC-06",
    "matchKeywords": [
      "flat bench",
      "bench press flat",
      "utility bench",
      "flat weight bench"
    ],
    "imageSvg": "chest-press",
    "description": "A heavy rigid steel horizontal bench pad designed for flat dumbbell bench presses, dumbbell rows, and hip thrusts.",
    "brand": "Rogue Monster Flat Bench",
    "visualCharacteristics": [
      "Single horizontal steel base spine",
      "Heavy 12-inch wide thick foam vinyl pad",
      "Rubber non-slip feet"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Position bench on flat gym flooring away from walking traffic."
    ],
    "movementGuidance": [
      "Plant feet flat on the floor, arch thoracic spine slightly, and retract shoulder blades."
    ],
    "commonMistakes": [
      {
        "mistake": "Flaring elbows straight out at 90° to torso",
        "fix": "Tuck elbows inward to a 45–60° angle to avoid impinging your shoulder rotator cuffs.",
        "correction": "Tuck elbows inward to a 45–60° angle to avoid impinging your shoulder rotator cuffs."
      },
      {
        "mistake": "Lifting feet off the floor onto the bench",
        "fix": "Drive feet firmly into the floor for leg drive and rock-solid core stability.",
        "correction": "Drive feet firmly into the floor for leg drive and rock-solid core stability."
      },
      {
        "mistake": "Dropping dumbbells straight down to floor after set",
        "fix": "Bring knees up to meet dumbbells at the bottom, then rock back upright to seated safely.",
        "correction": "Bring knees up to meet dumbbells at the bottom, then rock back upright to seated safely."
      }
    ],
    "safetyReminders": [
      "Wipe down vinyl pad after use."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Tripod Foot Plant",
        "description": "Plant both feet firmly on the floor to generate leg drive."
      }
    ],
    "videoDurationSec": 30,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Clear Floor & Position Bench",
        "description": "Place the bench firmly on flat gym rubber flooring with at least 3 feet of clear clearance on all sides."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Dumbbells & Knee Rest",
        "description": "Pick appropriate dumbbells from the rack. Sit on the end of the bench and rest the dumbbell heads vertically on your lower thighs."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Kick Back & 5-Point Body Anchor",
        "description": "Kick knees up one at a time to lever dumbbells back as you lie flat. Plant feet wide into floor, arch lower back slightly, and squeeze shoulder blades."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Tuck Elbows at 45° & Converge Overhead",
        "description": "Maintain slight arch and planted feet, lower weight with elbows tucked at 45°, press upward in converging arc, and squeeze target muscles."
      }
    ],
    "movementCues": {
      "exhale": "On pressing dumbbells upward together",
      "inhale": "On 3-second controlled descent to chest level",
      "tempo": "1s Powerful Press | 1s Chest Squeeze | 3s Eccentric Lower"
    }
  },
  {
    "id": "incline-bench",
    "name": "Incline Bench",
    "alternativeNames": [
      "Fixed Incline Bench",
      "Olympic Incline Bench Press Station"
    ],
    "category": "Other",
    "tagline": "Dedicated 30-degree incline bench with integrated barbell racking uprights",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "Upper Chest (Clavicular)",
      "Front Shoulders"
    ],
    "secondaryMuscles": [
      "Triceps"
    ],
    "equipmentType": "Free Motion / Other",
    "qrCodeId": "GYM-FUNC-07",
    "matchKeywords": [
      "incline bench",
      "olympic incline bench",
      "upper chest bench"
    ],
    "imageSvg": "incline-press",
    "description": "Fixed 30-35 degree angle bench station equipped with dual-level barbell uprights and spotter platform.",
    "brand": "Hammer Strength Olympic Incline",
    "visualCharacteristics": [
      "Fixed 35-degree angled padded bench",
      "Integrated heavy upright barbell hooks",
      "Rear elevated spotter standing platform"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust seat height so un-racking barbell is in easy reach without shoulder strain.",
      "Grip barbell slightly wider than shoulder width."
    ],
    "movementGuidance": [
      "Lower barbell smoothly to touch upper collarbone area and press straight upward."
    ],
    "commonMistakes": [
      {
        "mistake": "Setting grip too narrow causing wrist strain",
        "fix": "Align forearms vertically at the bottom of the press.",
        "correction": "Align forearms vertically at the bottom of the press."
      }
    ],
    "safetyReminders": [
      "Always have a trained spotter for heavy barbell sets."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Upper Chest Bar Touch",
        "description": "Touch barbell gently to the clavicle area before pressing."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "📐",
        "title": "Machine Setup & Alignment",
        "description": "Adjust seat height so un-racking barbell is in easy reach without shoulder strain."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Grip barbell slightly wider than shoulder width."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Press Above Upper Chest & Squeeze Pecs",
        "description": "Lie on 30-45° incline, press resistance upward above upper chest, squeeze clavicular fibers, and lower until hands reach chest height."
      }
    ],
    "movementCues": {
      "exhale": "On the concentric exertion phase (pushing or pulling)",
      "inhale": "On the 3-second controlled eccentric return phase",
      "tempo": "1s Explode | 1s Peak Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "decline-bench",
    "name": "Decline Bench",
    "alternativeNames": [
      "Olympic Decline Bench",
      "Decline Sit-Up Bench",
      "Adjustable Decline Bench"
    ],
    "category": "Other",
    "tagline": "Downward-angled bench with padded ankle rollers for lower chest presses and core",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "Lower Chest (Sternal Head)",
      "Abdominals"
    ],
    "secondaryMuscles": [
      "Triceps"
    ],
    "equipmentType": "Free Motion / Other",
    "qrCodeId": "GYM-FUNC-08",
    "matchKeywords": [
      "decline bench",
      "decline sit up",
      "lower chest bench",
      "ab decline bench"
    ],
    "imageSvg": "chest-press",
    "description": "A 20-30 degree decline bench featuring padded leg and ankle lock rollers for secure lower chest pressing and steep abdominal crunches.",
    "brand": "Life Fitness Olympic Decline",
    "visualCharacteristics": [
      "Downward sloping bench pad (-20 degrees)",
      "Dual foam cylindrical leg/ankle lock rollers",
      "Barbell upright catches"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Hook legs over and under the foam ankle lock pads securely.",
      "Lie back with head resting at the lowest end."
    ],
    "movementGuidance": [
      "Execute lower chest presses or crunches with smooth cadence."
    ],
    "commonMistakes": [
      {
        "mistake": "Sitting up too fast after heavy decline set",
        "fix": "Sit up slowly to allow blood pressure to normalize.",
        "correction": "Sit up slowly to allow blood pressure to normalize."
      }
    ],
    "safetyReminders": [
      "Verify ankles are securely locked behind rollers before lying back."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Ankle Lock Verification",
        "description": "Ensure feet and shins are locked behind foam rollers."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "📐",
        "title": "Machine Setup & Alignment",
        "description": "Hook legs over and under the foam ankle lock pads securely."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Lie back with head resting at the lowest end."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Press Over Lower Chest & Avoid Shrugging",
        "description": "Hook legs under roller pads, press resistance upward over lower chest, squeeze lower pecs, and control the descent carefully."
      }
    ],
    "movementCues": {
      "exhale": "On the concentric exertion phase (pushing or pulling)",
      "inhale": "On the 3-second controlled eccentric return phase",
      "tempo": "1s Explode | 1s Peak Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "dumbbell-rack",
    "name": "Dumbbell Rack",
    "alternativeNames": [
      "Free Weight Dumbbell Saddle Rack",
      "3-Tier Dumbbell Station",
      "Pro-Style Dumbbell Rack"
    ],
    "category": "Other",
    "tagline": "Organized multi-tier steel storage rack housing paired dumbbells from 2.5kg to 50kg",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Full Body (Free Weight Training)"
    ],
    "secondaryMuscles": [
      "Grip & Forearms"
    ],
    "equipmentType": "Free Motion / Other",
    "qrCodeId": "GYM-FUNC-09",
    "matchKeywords": [
      "dumbbell rack",
      "dumbbells",
      "free weights",
      "hand weights",
      "weight rack"
    ],
    "imageSvg": "chest-press",
    "description": "Angled heavy steel shelving with molded plastic saddles designed to hold pairs of urethane/rubber dumbbells in ascending weight order.",
    "brand": "Eleiko / Rogue 3-Tier Dumbbell Rack",
    "visualCharacteristics": [
      "Long angled steel shelves with individual curved dumbbell saddles",
      "Numbered weight indicator badges (e.g. 5kg to 50kg)"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Select matching weight dumbbells with two hands, bending at knees (not back).",
      "Step back 2-3 paces from the rack to allow other gym members access."
    ],
    "movementGuidance": [
      "Perform free weight exercises with strict form.",
      "Always return dumbbells to their matching numbered saddle slots."
    ],
    "commonMistakes": [
      {
        "mistake": "Dropping dumbbells from height onto the floor",
        "fix": "Lower dumbbells to thighs and gently place on the floor or rack.",
        "correction": "Lower dumbbells to thighs and gently place on the floor or rack."
      }
    ],
    "safetyReminders": [
      "Never leave dumbbells rolling on the floor where members can trip."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Safe Dumbbell Pickup",
        "description": "Squat with legs and brace core when lifting dumbbells off the bottom shelf."
      }
    ],
    "videoDurationSec": 25,
    "steps": [
      {
        "stage": "Setup",
        "icon": "📐",
        "title": "Machine Setup & Alignment",
        "description": "Select matching weight dumbbells with two hands, bending at knees (not back)."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Step back 2-3 paces from the rack to allow other gym members access."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Lift with Neutral Wrists & Strict Cadence",
        "description": "Select matched pair with neutral wrists, carry to open workout area, perform exercise with synchronized cadence, and return dumbbells to rack."
      }
    ],
    "movementCues": {
      "exhale": "On the concentric exertion phase (pushing or pulling)",
      "inhale": "On the 3-second controlled eccentric return phase",
      "tempo": "1s Explode | 1s Peak Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "barbell-rack",
    "name": "Barbell Rack",
    "alternativeNames": [
      "Fixed Barbell Rack",
      "Olympic Bar Storage",
      "EZ-Curl Barbell Rack"
    ],
    "category": "Other",
    "tagline": "Vertical & A-frame storage rack for pre-weighted straight bars and EZ-curl bars",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Arms",
      "Shoulders",
      "Back"
    ],
    "secondaryMuscles": [
      "Full Body"
    ],
    "equipmentType": "Free Motion / Other",
    "qrCodeId": "GYM-FUNC-10",
    "matchKeywords": [
      "barbell rack",
      "fixed barbells",
      "ez curl rack",
      "barbell stand"
    ],
    "imageSvg": "preacher-curl",
    "description": "A heavy dual-sided A-frame or horizontal rack holding fixed-weight straight barbells and EZ-curl barbells ranging from 10kg to 45kg.",
    "brand": "Troy Barbell Dual-Sided Rack",
    "visualCharacteristics": [
      "Double-sided angled A-frame steel rack with polyurethane hooks",
      "Pairs of fixed rubber-coated straight and curl barbells"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Select fixed barbell weight suited for curls, overhead presses, or lunges.",
      "Lift with both hands and clear the rack area."
    ],
    "movementGuidance": [
      "Execute movement with balanced hand grip."
    ],
    "commonMistakes": [
      {
        "mistake": "Re-racking bar unevenly on hooks",
        "fix": "Ensure both left and right sides rest fully inside the hooks.",
        "correction": "Ensure both left and right sides rest fully inside the hooks."
      }
    ],
    "safetyReminders": [
      "Lift from knees when picking up heavy barbells from low rungs."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Both-Hook Placement",
        "description": "Confirm both bar ends are resting securely in the cradle hooks."
      }
    ],
    "videoDurationSec": 25,
    "steps": [
      {
        "stage": "Setup",
        "icon": "📐",
        "title": "Machine Setup & Alignment",
        "description": "Select fixed barbell weight suited for curls, overhead presses, or lunges."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Lift with both hands and clear the rack area."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Even Hand Spacing & Stacked Joints",
        "description": "Choose calibrated weight, grip with even hand spacing, execute lift with neutral spine and stacked joints, and replace bar on rack hooks."
      }
    ],
    "movementCues": {
      "exhale": "On the concentric exertion phase (pushing or pulling)",
      "inhale": "On the 3-second controlled eccentric return phase",
      "tempo": "1s Explode | 1s Peak Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "kettlebell-station",
    "name": "Kettlebell",
    "alternativeNames": [
      "Kettlebell Station",
      "Cast Iron Kettlebell Set",
      "Competition Kettlebells"
    ],
    "category": "Other",
    "tagline": "Cast iron ball with top handle for ballistic swings, Turkish get-ups, and functional strength",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "Posterior Chain (Glutes, Hamstrings, Erector Spinae)",
      "Core"
    ],
    "secondaryMuscles": [
      "Shoulders",
      "Grip & Forearms",
      "Cardiovascular System"
    ],
    "equipmentType": "Free Motion / Other",
    "qrCodeId": "GYM-FUNC-11",
    "matchKeywords": [
      "kettlebell",
      "kettlebells",
      "kettlebell swing",
      "cast iron weights"
    ],
    "imageSvg": "calf-raise",
    "description": "Versatile cast iron/steel weight spheres with top loop handles, used for swings, cleans, snatches, and functional athletic conditioning.",
    "brand": "Rogue Rubber Coated Kettlebells",
    "visualCharacteristics": [
      "Cast iron round cannonball body with flat base",
      "Single looped handle with color-coded weight rings (8kg to 32kg)"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Select kettlebell weight and place on open rubber mat area.",
      "Hinge hips backwards with flat spine and grasp handle firmly."
    ],
    "movementGuidance": [
      "Hinge at hips (do not squat) to swing kettlebell back between thighs.",
      "Explosively snap hips forward and squeeze glutes to project kettlebell to chest level."
    ],
    "commonMistakes": [
      {
        "mistake": "Squatting and lifting kettlebell with arms/shoulders",
        "fix": "Drive the bell purely from the explosive hip hinge snap.",
        "correction": "Drive the bell purely from the explosive hip hinge snap."
      }
    ],
    "safetyReminders": [
      "Ensure wide clearance around your swing path."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Hip Hinge Snap",
        "description": "Power comes 100% from your glutes and hamstrings, not arm lifting."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "📐",
        "title": "Machine Setup & Alignment",
        "description": "Select kettlebell weight and place on open rubber mat area."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Hinge hips backwards with flat spine and grasp handle firmly."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Explosive Hip Snap & Chest-Height Float",
        "description": "Hinge deeply at hips, snap hips forward explosively to drive kettlebell to chest height using glutes (not arms), and guide back between legs."
      }
    ],
    "movementCues": {
      "exhale": "On the concentric exertion phase (pushing or pulling)",
      "inhale": "On the 3-second controlled eccentric return phase",
      "tempo": "1s Explode | 1s Peak Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "smith-machine-functional",
    "name": "Smith Machine",
    "alternativeNames": [
      "Guided Multi-Purpose Smith Station",
      "Commercial Smith System"
    ],
    "category": "Other",
    "tagline": "Fixed vertical track barbell for multi-exercise inverted rows, calf raises, and shrugs",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Full Body Multi-Compound"
    ],
    "secondaryMuscles": [
      "Core"
    ],
    "equipmentType": "Plate-Loaded",
    "qrCodeId": "GYM-FUNC-12",
    "matchKeywords": [
      "smith machine",
      "guided barbell",
      "smith station",
      "functional smith"
    ],
    "imageSvg": "smith-machine",
    "description": "The versatile guided barbell system configured for standing shrugs, calf raises, inverted bodyweight rows, and hip thrusts.",
    "brand": "Hammer Strength Smith Machine",
    "visualCharacteristics": [
      "Dual vertical steel guide poles with linear ball bearings",
      "Barbell with rotating safety hooks and bottom stops"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Set barbell height to waist or chest level depending on the target exercise.",
      "Adjust bottom safety stops."
    ],
    "movementGuidance": [
      "Rotate wrists to unhook and perform exercise with guided linear path."
    ],
    "commonMistakes": [
      {
        "mistake": "Neglecting safety catches",
        "fix": "Always engage safety pins below exercise stroke.",
        "correction": "Always engage safety pins below exercise stroke."
      }
    ],
    "safetyReminders": [
      "Re-hook barbell securely before stepping away."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Wrist Hook Lock",
        "description": "Rotate barbell hooks into catches until fully engaged."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "📐",
        "title": "Machine Setup & Alignment",
        "description": "Set barbell height to waist or chest level depending on the target exercise."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Adjust bottom safety stops."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Guided Vertical Track & Wrist Re-hook",
        "description": "Unrack barbell by rotating wrists, execute vertical guided path with controlled 3s tempo, and twist wrists forward to lock safety catches."
      }
    ],
    "movementCues": {
      "exhale": "On the concentric exertion phase (pushing or pulling)",
      "inhale": "On the 3-second controlled eccentric return phase",
      "tempo": "1s Explode | 1s Peak Squeeze | 3s Controlled Return"
    }
  },
  {
    "id": "rotary-torso-machine",
    "name": "Rotary Torso Machine",
    "alternativeNames": [
      "Seated Torso Rotation",
      "Oblique Twist Machine",
      "Rotational Ab Machine"
    ],
    "category": "Core",
    "tagline": "Rotational resistance machine targeting internal and external obliques",
    "difficulty": "Intermediate",
    "primaryMuscles": [
      "External Obliques",
      "Internal Obliques"
    ],
    "secondaryMuscles": [
      "Transverse Abdominis",
      "Rotator Spine Stabilizers"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-CORE-01",
    "matchKeywords": [
      "rotary torso",
      "oblique machine",
      "torso rotation",
      "ab twist",
      "waist machine"
    ],
    "imageSvg": "ab-crunch",
    "description": "A specialized machine where upper torso or lower body rotates against weight stack resistance to build rotational core power and waist stability.",
    "brand": "Life Fitness Optima Series Rotary Torso",
    "visualCharacteristics": [
      "Seated pad with chest/thigh pads",
      "Swivel mechanism with angle selection pin",
      "Weight stack"
    ],
    "frontReferenceImage": "/machines/rotary-torso-machine.jpg",
    "sideReferenceImage": "/machines/rotary-torso-machine.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Set starting angle pin to left or right range.",
      "Sit back firmly and lock legs against thigh pads.",
      "Grasp upper handles."
    ],
    "movementGuidance": [
      "Rotate torso smoothly across the center line against resistance.",
      "Squeeze obliques at peak twist before returning slowly."
    ],
    "commonMistakes": [
      {
        "mistake": "Using arms to force rotation",
        "fix": "Initiate all rotational force from core and waist muscles.",
        "correction": "Initiate all rotational force from core and waist muscles."
      }
    ],
    "safetyReminders": [
      "Do not over-rotate past comfortable flexibility range."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Controlled Core Twist",
        "description": "Rotate smoothly without jerking the weight."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Set starting angle pin to left or right range."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Sit back firmly and lock legs against thigh pads."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Grasp upper handles."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Torso Rotation Through Obliques",
        "description": "Lock knees against thigh pads, rotate torso smoothly through abdominal obliques, pause for 1s at peak twist, and control the return."
      }
    ],
    "movementCues": {
      "exhale": "On flexing ribs toward pelvis into peak contraction",
      "inhale": "On controlled 3-second uncurling back to vertical",
      "tempo": "1s Crunch | 2s Isometric Hold | 3s Controlled Reset"
    }
  },
  {
    "id": "ab-crunch-machine",
    "name": "Abdominal Crunch Machine",
    "alternativeNames": [
      "Seated Ab Machine",
      "Selectorized Ab Crunch",
      "Rotary Torso Machine"
    ],
    "category": "Core",
    "tagline": "Ergonomic lumbar-supported spinal flexion against stack resistance",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Rectus Abdominis (Six-Pack Core)"
    ],
    "secondaryMuscles": [
      "Internal & External Obliques",
      "Transverse Abdominis"
    ],
    "equipmentType": "Pin-Loaded (Selectorized)",
    "qrCodeId": "GYM-CORE-02",
    "matchKeywords": [
      "ab crunch",
      "abdominal machine",
      "abs",
      "core machine",
      "ab cruncher",
      "six pack"
    ],
    "imageSvg": "ab-crunch",
    "description": "A seated machine with chest roller pad and overhead handles that isolates abdominal spinal flexion while stabilizing the lower back.",
    "brand": "Matrix Versa Abdominal",
    "visualCharacteristics": [
      "Curved ergonomic backrest",
      "Overhead dual padded elbow/shoulder levers",
      "Foot peg brace",
      "Pin-loaded weight stack"
    ],
    "frontReferenceImage": "/machines/ab-crunch-machine.jpg",
    "sideReferenceImage": "/machines/ab-crunch-machine.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust seat height so the machine rotational axis aligns with your naval / lumbar spine.",
      "Place feet behind lower foot pegs and rest upper chest/shoulders against top padded handles."
    ],
    "movementGuidance": [
      "Exhale and curl your ribs downward toward your pelvis using only abdominal contraction.",
      "Hold peak crunch for 2 seconds.",
      "Inhale and slowly return upright over 3 seconds."
    ],
    "commonMistakes": [
      {
        "mistake": "Pulling with arms and neck",
        "fix": "Focus purely on curling ribs toward hips.",
        "correction": "Focus purely on curling ribs toward hips."
      }
    ],
    "safetyReminders": [
      "Do not hyperextend spine past vertical."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Rib-to-Pelvis Flexion",
        "description": "Focus on shortening the distance between ribs and belt line."
      }
    ],
    "videoDurationSec": 30,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust seat height so the machine rotational axis aligns with your naval / lumbar spine."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Place feet behind lower foot pegs and rest upper chest/shoulders against top padded handles."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Rib-to-Pelvis Flexion & Peak Crunch",
        "description": "Grip top handles, curl ribcage downward toward pelvis using only abdominal contraction, hold peak crunch for 2s, and return upright over 3s."
      }
    ],
    "movementCues": {
      "exhale": "On flexing ribs toward pelvis into peak contraction",
      "inhale": "On controlled 3-second uncurling back to vertical",
      "tempo": "1s Crunch | 2s Isometric Hold | 3s Controlled Reset"
    }
  },
  {
    "id": "captains-chair-leg-raise",
    "name": "Captain's Chair Leg Raise",
    "alternativeNames": [
      "Vertical Knee Raise Station",
      "Power Tower Leg Raise",
      "Hanging Knee Raise Frame"
    ],
    "category": "Core",
    "tagline": "Forearm-supported station isolating lower rectus abdominis and hip flexors",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Lower Rectus Abdominis",
      "Iliopsoas (Hip Flexors)"
    ],
    "secondaryMuscles": [
      "Obliques",
      "Forearm Stabilizers"
    ],
    "equipmentType": "Bodyweight Assisted",
    "qrCodeId": "GYM-CORE-03",
    "matchKeywords": [
      "captains chair",
      "leg raise",
      "knee raise",
      "vertical knee raise",
      "power tower",
      "lower abs"
    ],
    "imageSvg": "ab-crunch",
    "description": "A bodyweight station with plush forearm cushions and a backrest pad that allows controlled vertical leg or knee raises without grip fatigue.",
    "brand": "Body-Solid Vertical Knee Raise Station",
    "visualCharacteristics": [
      "Padded backrest and dual forearm cushions with vertical hand grips",
      "Step-up foot pegs",
      "Open space underneath for free leg movement"
    ],
    "frontReferenceImage": "/machines/captains-chair-leg-raise.jpg",
    "sideReferenceImage": "/machines/captains-chair-leg-raise.jpg",
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Step onto the foot pegs and press forearms firmly onto the padded armrests.",
      "Grasp vertical handles tightly and press lower back into the backrest pad."
    ],
    "movementGuidance": [
      "Raise knees toward your chest by curling your pelvis upward.",
      "Lower legs with full control without swinging."
    ],
    "commonMistakes": [
      {
        "mistake": "Swinging legs using momentum",
        "fix": "Pause at the bottom of each rep to eliminate swing momentum.",
        "correction": "Pause at the bottom of each rep to eliminate swing momentum."
      }
    ],
    "safetyReminders": [
      "Keep shoulders depressed away from ears."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Pelvic Tilt Curl",
        "description": "Curl pelvis toward ribcage at top of knee raise to activate lower abs."
      }
    ],
    "videoDurationSec": 35,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Step onto the foot pegs and press forearms firmly onto the padded armrests."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Grasp vertical handles tightly and press lower back into the backrest pad."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Raise Knees to 90° Without Swinging",
        "description": "Press forearms firmly into elbow pads, raise knees or straight legs up to hip height (90°), pause 1s without swinging, and lower slowly."
      }
    ],
    "movementCues": {
      "exhale": "On flexing ribs toward pelvis into peak contraction",
      "inhale": "On controlled 3-second uncurling back to vertical",
      "tempo": "1s Crunch | 2s Isometric Hold | 3s Controlled Reset"
    }
  },
  {
    "id": "decline-ab-bench",
    "name": "Decline Ab Bench",
    "alternativeNames": [
      "Adjustable Crunch Bench",
      "Decline Sit-Up Board",
      "Abdominal Slant Board"
    ],
    "category": "Core",
    "tagline": "Angled slant board with leg rollers for weighted crunches and sit-ups",
    "difficulty": "Beginner",
    "primaryMuscles": [
      "Rectus Abdominis",
      "Hip Flexors"
    ],
    "secondaryMuscles": [
      "Obliques"
    ],
    "equipmentType": "Free Motion / Other",
    "qrCodeId": "GYM-CORE-04",
    "matchKeywords": [
      "ab bench",
      "decline sit up",
      "slant board",
      "crunch bench",
      "abdominal bench"
    ],
    "imageSvg": "ab-crunch",
    "description": "A multi-angle decline bench with foam ankle/knee rollers providing variable incline angles for intensifying crunches and sit-ups.",
    "brand": "Rogue Adjustable Ab Bench",
    "visualCharacteristics": [
      "Angled padded slant board",
      "Dual foam leg lock rollers",
      "Incline adjustment ladder"
    ],
    "verificationStatus": "Verified",
    "setupInstructions": [
      "Adjust slant angle notch (steeper = harder).",
      "Anchor feet securely behind foam ankle rollers."
    ],
    "movementGuidance": [
      "Curl upper back off board one vertebra at a time.",
      "Control descent smoothly back down."
    ],
    "commonMistakes": [
      {
        "mistake": "Pulling head forward with hands behind neck",
        "fix": "Cross hands over chest or hold fingertips lightly by ears.",
        "correction": "Cross hands over chest or hold fingertips lightly by ears."
      }
    ],
    "safetyReminders": [
      "Do not arch lower back excessively at bottom of sit-up."
    ],
    "tutorialSteps": [
      {
        "stepNumber": 1,
        "title": "Spinal Segmental Curl",
        "description": "Peel back off pad progressively to keep tension on abs."
      }
    ],
    "videoDurationSec": 30,
    "steps": [
      {
        "stage": "Setup",
        "icon": "🪑",
        "title": "Machine Setup & Alignment",
        "description": "Adjust slant angle notch (steeper = harder)."
      },
      {
        "stage": "Adjust",
        "icon": "🎯",
        "title": "Select Resistance & Pins",
        "description": "Anchor feet securely behind foam ankle rollers."
      },
      {
        "stage": "Position",
        "icon": "🧘",
        "title": "Body Position & Core Brace",
        "description": "Sit or stand with torso braced, feet planted flat on floor, and grip handles securely."
      },
      {
        "stage": "Execute",
        "icon": "💥",
        "title": "Vertebrae Roll & Peak Abdominal Squeeze",
        "description": "Cross arms over chest, curl spine upward off bench curling vertebrae one by one until 45°, squeeze abs hard, and unroll back down over 3s."
      }
    ],
    "movementCues": {
      "exhale": "On flexing ribs toward pelvis into peak contraction",
      "inhale": "On controlled 3-second uncurling back to vertical",
      "tempo": "1s Crunch | 2s Isometric Hold | 3s Controlled Reset"
    }
  }
];

export const machinesData = MACHINES_DATABASE;

export const MACHINE_CATEGORIES: Array<{ id: Machine['category']; name: string; count: number; icon: string }> = [
  { id: 'Chest', name: 'Chest', count: 7, icon: 'shield' },
  { id: 'Back', name: 'Back', count: 8, icon: 'feather' },
  { id: 'Shoulders', name: 'Shoulders', count: 4, icon: 'zap' },
  { id: 'Arms', name: 'Arms', count: 5, icon: 'biceps' },
  { id: 'Legs', name: 'Legs', count: 11, icon: 'activity' },
  { id: 'Cardio', name: 'Cardio', count: 6, icon: 'activity' },
  { id: 'Core', name: 'Core', count: 4, icon: 'zap' },
  { id: 'Cable Equipment', name: 'Cable Equipment', count: 2, icon: 'anchor' },
  { id: 'Other', name: 'Other', count: 9, icon: 'grid' },
];

export const INITIAL_ACHIEVEMENTS = [
  {
    id: 'first-discovery',
    title: 'First Discovery',
    description: 'Scan or identify your very first gym machine.',
    icon: 'compass',
    category: 'discovery' as const,
    targetCount: 1,
    currentCount: 0,
    unlocked: false,
    rewardXP: 25
  },
  {
    id: 'explorer-5',
    title: 'Gym Explorer',
    description: 'Discover and learn about 5 unique gym machines.',
    icon: 'map-pin',
    category: 'discovery' as const,
    targetCount: 5,
    currentCount: 0,
    unlocked: false,
    rewardXP: 50
  },
  {
    id: 'master-10',
    title: 'Machine Scholar',
    description: 'Discover 10 unique gym machines in the facility.',
    icon: 'award',
    category: 'discovery' as const,
    targetCount: 10,
    currentCount: 0,
    unlocked: false,
    rewardXP: 100
  },
  {
    id: 'tutorial-learner-1',
    title: 'Tutorial Learner',
    description: 'Complete your first step-by-step equipment tutorial checklist.',
    icon: 'book-open',
    category: 'learning' as const,
    targetCount: 1,
    currentCount: 0,
    unlocked: false,
    rewardXP: 30
  },
  {
    id: 'tutorial-scholar-5',
    title: 'Master of Form',
    description: 'Complete 5 equipment tutorial checklists and safety reviews.',
    icon: 'check-circle-2',
    category: 'learning' as const,
    targetCount: 5,
    currentCount: 0,
    unlocked: false,
    rewardXP: 75
  },
  {
    id: 'vault-keeper',
    title: 'Routine Architect',
    description: 'Save 3 or more machines to your favorites list.',
    icon: 'bookmark',
    category: 'mastery' as const,
    targetCount: 3,
    currentCount: 0,
    unlocked: false,
    rewardXP: 40
  },
  {
    id: 'all-rounder',
    title: 'Full Body Explorer',
    description: 'Scan machines across 4 different muscle categories.',
    icon: 'layers',
    category: 'consistency' as const,
    targetCount: 4,
    currentCount: 0,
    unlocked: false,
    rewardXP: 80
  }
];
