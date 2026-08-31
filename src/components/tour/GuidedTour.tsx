import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { TOUR_STEPS } from '../../data/helpData';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Sparkles,
  LayoutGrid,
  Search,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export const GuidedTour: React.FC = () => {
  const { isTourActive, tourStep, setTourStep, endTour, setActiveTab } = useTaskContext();
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[tourStep] || TOUR_STEPS[0];
  const isFirstStep = tourStep === 0;
  const isLastStep = tourStep === TOUR_STEPS.length - 1;

  // Make sure we are on 'board' tab during the tour so all targets exist
  useEffect(() => {
    if (isTourActive) {
      setActiveTab('board');
    }
  }, [isTourActive, setActiveTab]);

  // Update target element dimensions
  const updateTargetRect = useCallback(() => {
    if (!isTourActive) return;

    const el = document.getElementById(currentStep.targetId);
    if (el) {
      // Scroll into view if needed
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

      const rect = el.getBoundingClientRect();
      const padding = 8;
      setTargetRect({
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        bottom: rect.bottom + padding,
        right: rect.right + padding,
      });
    } else {
      // Fallback if element not found in DOM
      setTargetRect(null);
    }
  }, [isTourActive, currentStep.targetId]);

  useEffect(() => {
    if (!isTourActive) return;

    updateTargetRect();

    const handleResize = () => updateTargetRect();
    const handleScroll = () => updateTargetRect();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    const timer = setTimeout(updateTargetRect, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      clearTimeout(timer);
    };
  }, [isTourActive, tourStep, updateTargetRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        endTour(true);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isLastStep) {
          endTour(true);
        } else {
          setTourStep(tourStep + 1);
        }
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        setTourStep(tourStep - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, tourStep, isFirstStep, isLastStep, setTourStep, endTour]);

  if (!isTourActive) return null;

  const handleNext = () => {
    if (isLastStep) {
      endTour(true);
    } else {
      setTourStep(tourStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setTourStep(tourStep - 1);
    }
  };

  const handleSkip = () => {
    endTour(true);
  };

  // Compute Popover Position (bottom, top, or centered fallback)
  const getPopoverStyle = () => {
    if (!targetRect || typeof window === 'undefined') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const popoverWidth = Math.min(420, windowWidth - 32);

    let left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
    left = Math.max(16, Math.min(left, windowWidth - popoverWidth - 16));

    // Place below if there is room, otherwise above
    const spaceBelow = windowHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;

    let top: number;
    if (spaceBelow >= 260 || spaceBelow > spaceAbove) {
      top = targetRect.bottom + 14;
    } else {
      top = Math.max(16, targetRect.top - 280);
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
    };
  };

  const getStepIcon = () => {
    switch (currentStep.id) {
      case 'step-nav':
        return <LayoutGrid className="w-5 h-5 text-indigo-500" />;
      case 'step-kanban':
        return <Compass className="w-5 h-5 text-blue-500" />;
      case 'step-ai':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'step-filters':
        return <Search className="w-5 h-5 text-amber-500" />;
      case 'step-help-user':
        return <HelpCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <Compass className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto transition-opacity duration-300">
      {/* SVG Mask Spotlight Overlay */}
      {targetRect && (
        <div
          className="absolute inset-0 pointer-events-auto"
          onClick={handleNext}
          title="Clique para avançar"
        >
          <svg className="w-full h-full">
            <defs>
              <mask id="tour-spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={targetRect.left}
                  y={targetRect.top}
                  width={targetRect.width}
                  height={targetRect.height}
                  rx="16"
                  ry="16"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(10, 15, 30, 0.75)"
              mask="url(#tour-spotlight-mask)"
            />
          </svg>

          {/* Glowing Focus Ring around target */}
          <div
            className="absolute rounded-2xl border-2 border-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.3),0_0_25px_rgba(99,102,241,0.5)] transition-all duration-300 pointer-events-none animate-pulse"
            style={{
              top: `${targetRect.top}px`,
              left: `${targetRect.left}px`,
              width: `${targetRect.width}px`,
              height: `${targetRect.height}px`,
            }}
          />
        </div>
      )}

      {/* Popover Tooltip Card */}
      <div
        ref={popoverRef}
        style={getPopoverStyle()}
        className="fixed z-[101] bg-white dark:bg-[#0E1424] border border-slate-200/90 dark:border-indigo-500/30 rounded-3xl p-5 shadow-2xl transition-all duration-300 animate-fade-in flex flex-col gap-4 text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Step Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
              {currentStep.badge}
            </span>
            {/* Step Progress Dots */}
            <div className="flex items-center gap-1">
              {TOUR_STEPS.map((step, idx) => (
                <div
                  key={step.id}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === tourStep
                      ? 'w-4 bg-indigo-600 dark:bg-indigo-400'
                      : idx < tourStep
                      ? 'w-1.5 bg-indigo-300 dark:bg-indigo-700'
                      : 'w-1.5 bg-slate-200 dark:bg-white/[0.1]'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            aria-label="Pular tutorial"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
            title="Pular tutorial (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0">
              {getStepIcon()}
            </div>
            <h3 className="text-base font-extrabold tracking-tight">
              {currentStep.title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-0.5">
            {currentStep.description}
          </p>
        </div>

        {/* Tip Box */}
        {currentStep.tip && (
          <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-start gap-2 text-[11px] sm:text-xs text-amber-900 dark:text-amber-200">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="font-bold">Dica:</strong> {currentStep.tip}
            </span>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            Pular tutorial
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
            >
              <span>{isLastStep ? 'Concluir Tour' : 'Próximo'}</span>
              {isLastStep ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
