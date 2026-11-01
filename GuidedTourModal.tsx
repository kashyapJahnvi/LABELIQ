import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Camera,
  Apple,
  ShieldCheck,
  History,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { saveTutorialProgress } from '../services/historyService';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchScanner: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: 'Welcome to LABELIQ 🌿🔍',
    subtitle: 'Know What’s Inside. Choose What’s Right.',
    description:
      'LABELIQ is an AI-powered product transparency platform built for GRAVITON 2026 at CGC University, Mohali. It empowers consumers to decode deceptive labels and fine-print ingredients in seconds.',
    icon: Sparkles,
  },
  {
    step: 2,
    title: 'Dual Category Intelligence Engines',
    subtitle: 'Packaged Food vs Cosmetics & Skincare',
    description:
      'Food requires macronutrient calculations, glycemic sugar audits, and INS additives screening. Cosmetics require comedogenic acne ratings, fragrance detection, and barrier active audits. LABELIQ automatically routes into specialized analysis pipelines.',
    icon: Apple,
  },
  {
    step: 3,
    title: 'Multi-Modal Scanning Pipeline',
    subtitle: 'Camera, Barcode, Image Upload & Raw OCR',
    description:
      'Scan physical products via real-time camera viewfinder, query global barcode databases, drag-and-drop packaging photos, or inspect raw OCR text for zero-latency review.',
    icon: Camera,
  },
  {
    step: 4,
    title: 'Server-Side Google Gemini 3.8 Flash',
    subtitle: 'State-of-the-art Multimodal Reasoning',
    description:
      'Packaging images and text are analyzed server-side with Gemini 3.8 Flash. Our backend securely hides cloud API keys and extracts ingredients with extreme accuracy.',
    icon: Zap,
  },
  {
    step: 5,
    title: 'Ingredient Safety Color Codes',
    subtitle: 'Clear, Actionable Visual Indicators',
    description:
      'Every compound is labeled: 🟢 Generally Safe for intended use, 🟡 Caution / Moderate intake, 🔴 Potential Concern, or ⚪ Insufficient info. No medical jargon.',
    icon: CheckCircle2,
  },
  {
    step: 6,
    title: 'FSSAI & BIS Statutory Verification',
    subtitle: 'Cutting Through Front-of-Package Marketing',
    description:
      'Deceptive marketing claims ("100% Natural", "Zero Added Sugar") are cross-referenced directly against government FSSAI food licenses and BIS marks on the FOSCOS portal.',
    icon: ShieldCheck,
  },
  {
    step: 7,
    title: 'Personalized Health Profile & Allergen Warning',
    subtitle: 'Your Health Context Front and Center',
    description:
      'Configure allergies (Gluten, Peanuts, Dairy, Soy, Fragrance) and conditions (Diabetes, Hypertension, Celiac, Gout). LABELIQ displays prominent warnings whenever ingredients clash.',
    icon: ShieldCheck,
  },
  {
    step: 8,
    title: 'Permanent Scan History & Instant Replay',
    subtitle: 'Zero Extra AI Cost & Multi-User Isolation',
    description:
      'All scans are permanently stored on disk database. Re-open complete 8-section analyses anytime with zero AI token cost. User sessions isolate data per user ID.',
    icon: History,
  },
  {
    step: 9,
    title: 'Feedback & Support Portal',
    subtitle: 'Human-in-the-Loop Verification Desk',
    description:
      'Rate your experience, report OCR misidentifications, suggest new product categories, or access the administrative investigation panel with demo passcode cgc2026.',
    icon: MessageSquare,
  },
  {
    step: 10,
    title: 'You Are Ready to Scan! 🚀',
    subtitle: 'Take Control of What You Put on & in Your Body',
    description:
      'Click the button below to test with a live package or explore our 6 pre-loaded benchmarks (Nature Valley, Cetaphil, Maggi, Amul, Mamaearth, RXBAR).',
    icon: Sparkles,
  },
];

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onLaunchScanner,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      saveTutorialProgress(next === TOUR_STEPS.length - 1, next, false);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleClose = () => {
    saveTutorialProgress(false, currentStepIndex, true);
    onClose();
  };

  const handleComplete = () => {
    saveTutorialProgress(true, TOUR_STEPS.length, false);
    onClose();
    onLaunchScanner();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-[#FCFDF9] rounded-3xl max-w-xl w-full shadow-2xl border border-[#244D2C]/20 overflow-hidden my-6 p-6 sm:p-8 space-y-6">
        {/* Progress Bar & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF2D5] text-[#244D2C]">
              Step {currentStep.step} of {TOUR_STEPS.length}
            </span>
            <span className="text-[11px] text-[#244D2C]/60 font-medium">
              (Use ← / → keys)
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Line */}
        <div className="w-full h-1.5 bg-[#EAF2D5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#244D2C] transition-all duration-300"
            style={{ width: `${(currentStep.step / TOUR_STEPS.length) * 100}%` }}
          ></div>
        </div>

        {/* Step Content */}
        <div className="space-y-4 text-center py-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#244D2C] text-[#EAF2D5] flex items-center justify-center shadow-lg shadow-[#244D2C]/20">
            <StepIcon className="w-8 h-8 text-[#F07853]" />
          </div>

          <div className="space-y-1">
            <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#244D2C]">
              {currentStep.title}
            </h3>
            <p className="text-xs font-semibold text-[#F07853]">
              {currentStep.subtitle}
            </p>
          </div>

          <p className="text-sm text-[#244D2C]/80 leading-relaxed max-w-md mx-auto font-['Plus_Jakarta_Sans']">
            {currentStep.description}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#244D2C]/10">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#244D2C] hover:bg-gray-100 disabled:opacity-30 flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-1">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStepIndex ? 'w-5 bg-[#244D2C]' : 'bg-[#244D2C]/20'
                }`}
              ></span>
            ))}
          </div>

          {currentStepIndex === TOUR_STEPS.length - 1 ? (
            <button
              onClick={handleComplete}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#244D2C] text-[#EAF2D5] hover:bg-[#1A3620] shadow-md flex items-center space-x-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-[#F07853]" />
              <span>Start Scanning</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#244D2C] text-[#EAF2D5] hover:bg-[#1A3620] flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
