"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDemoTour } from "./demo-tour-provider";
import { tourSteps } from "./tour-steps";
import {
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  X,
  GraduationCap,
} from "lucide-react";

// ─── Spotlight position ─────────────────────────────────────────────────────

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const DEFAULT_SPOTLIGHT: SpotlightRect = { top: 0, left: 0, width: 0, height: 0 };
const SPOTLIGHT_PADDING = 8;
const AUTO_ADVANCE_SECONDS = 10;

// ─── Countdown Ring ──────────────────────────────────────────────────────────

function CountdownRing({
  countdown,
  total = AUTO_ADVANCE_SECONDS,
  paused,
}: {
  countdown: number;
  total?: number;
  paused: boolean;
}) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = paused ? 1 : countdown / total;
  const dashOffset = circumference * (1 - progress);

  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      className="absolute inset-0 -rotate-90"
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="2"
      />
      {/* Progress arc */}
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: paused ? "none" : "stroke-dashoffset 1s linear" }}
      />
    </svg>
  );
}

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({
  total,
  current,
  onDotClick,
}: {
  total: number;
  current: number;
  onDotClick: (i: number) => void;
}) {
  // For 16 steps, render a compact linear bar instead of individual dots
  return (
    <div className="flex items-center gap-1" role="tablist" aria-label="Tour progress">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === current}
          aria-label={`Step ${i + 1}`}
          onClick={() => onDotClick(i)}
          className={`
            rounded-full transition-all duration-300 cursor-pointer
            ${
              i === current
                ? "w-4 h-1.5 bg-white"
                : i < current
                ? "w-1.5 h-1.5 bg-white/40"
                : "w-1.5 h-1.5 bg-white/15"
            }
          `}
        />
      ))}
    </div>
  );
}

// ─── DemoTourOverlay ─────────────────────────────────────────────────────────

export function DemoTourOverlay() {
  const {
    isActive,
    currentStep,
    isPaused,
    isAutoAdvancing,
    totalSteps,
    countdown,
    nextStep,
    prevStep,
    pauseTour,
    resumeTour,
    skipTour,
    goToStep,
  } = useDemoTour();

  const [spotlight, setSpotlight] = useState<SpotlightRect>(DEFAULT_SPOTLIGHT);
  const [bubblePosition, setBubblePosition] = useState<"below" | "above" | "right" | "left">("below");
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = tourSteps[currentStep];

  // ── Mount animation ─────────────────────────────────────────────────
  useEffect(() => {
    if (isActive) {
      // small delay so CSS transition plays
      requestAnimationFrame(() => setMounted(true));
    } else {
      setMounted(false);
    }
  }, [isActive]);

  // ── Find and track the target element ──────────────────────────────
  const updateSpotlight = useCallback(() => {
    if (!step?.targetSelector) {
      // Fallback: center spotlight
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setSpotlight({ top: vh / 2 - 60, left: vw / 2 - 120, width: 240, height: 120 });
      setBubblePosition("below");
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      // Target not found — use a centered fallback
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setSpotlight({ top: vh / 2 - 60, left: vw / 2 - 120, width: 240, height: 120 });
      setBubblePosition("below");
      return;
    }

    const rect = el.getBoundingClientRect();
    const padded = {
      top: rect.top - SPOTLIGHT_PADDING,
      left: rect.left - SPOTLIGHT_PADDING,
      width: rect.width + SPOTLIGHT_PADDING * 2,
      height: rect.height + SPOTLIGHT_PADDING * 2,
    };
    setSpotlight(padded);

    // Decide where the bubble should appear
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    if (rect.bottom + 300 < vh) {
      setBubblePosition("below");
    } else if (rect.top - 300 > 0) {
      setBubblePosition("above");
    } else if (rect.right + 320 < vw) {
      setBubblePosition("right");
    } else {
      setBubblePosition("left");
    }
  }, [step]);

  useEffect(() => {
    if (!isActive) return;
    updateSpotlight();
    // Re-check after a small delay to allow page transitions / animations
    const t = setTimeout(updateSpotlight, 400);
    window.addEventListener("resize", updateSpotlight);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updateSpotlight);
    };
  }, [isActive, currentStep, updateSpotlight]);

  if (!isActive) return null;

  // ── Compute box-shadow spotlight cutout ────────────────────────────
  // We use a huge inset box-shadow to create the dark overlay, with the
  // spotlight rect "cut out" by matching the element's position.
  const { top, left, width, height } = spotlight;

  // Bubble offset from spotlight
  const BUBBLE_OFFSET = 20;
  const bubbleStyle: React.CSSProperties = (() => {
    switch (bubblePosition) {
      case "below":
        return { top: top + height + BUBBLE_OFFSET, left: Math.max(16, left) };
      case "above":
        return { bottom: window.innerHeight - top + BUBBLE_OFFSET, left: Math.max(16, left) };
      case "right":
        return { top: Math.max(16, top), left: left + width + BUBBLE_OFFSET };
      case "left":
        return { top: Math.max(16, top), right: window.innerWidth - left + BUBBLE_OFFSET };
      default:
        return { top: top + height + BUBBLE_OFFSET, left: Math.max(16, left) };
    }
  })();

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Demo tour: Step ${currentStep + 1} of ${totalSteps}`}
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      {/* ── Dark backdrop with spotlight hole ────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{
          background: "rgba(5, 5, 10, 0.78)",
          // Punch a "hole" using a radial gradient mask centered on the spotlight
          // We use clip approach: mask off the spotlight area
          WebkitMaskImage: `
            radial-gradient(ellipse ${width / 2 + SPOTLIGHT_PADDING}px ${height / 2 + SPOTLIGHT_PADDING}px at ${left + width / 2}px ${top + height / 2}px, transparent 80%, black 100%)
          `,
          maskImage: `
            radial-gradient(ellipse ${width / 2 + SPOTLIGHT_PADDING}px ${height / 2 + SPOTLIGHT_PADDING}px at ${left + width / 2}px ${top + height / 2}px, transparent 80%, black 100%)
          `,
        }}
        onClick={skipTour}
      />

      {/* ── Spotlight glow ring ───────────────────────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: top - 4,
          left: left - 4,
          width: width + 8,
          height: height + 8,
          borderRadius: "10px",
          boxShadow: "0 0 0 2px rgba(255,255,255,0.18), 0 0 24px 4px rgba(255,255,255,0.06)",
          animation: "tourPulse 2.5s ease-in-out infinite",
        }}
      />

      {/* ── Spotlight border ─────────────────────────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top,
          left,
          width,
          height,
          borderRadius: "8px",
          border: "1.5px solid rgba(255,255,255,0.22)",
        }}
      />

      {/* ── Progress bar (top of screen) ──────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 pointer-events-none"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full bg-white/40 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* ── Header bar ───────────────────────────────────────────────── */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto
          flex items-center gap-3
          bg-black/70 backdrop-blur-xl border border-white/[0.10]
          rounded-full px-4 py-2 shadow-2xl"
      >
        <GraduationCap className="w-3.5 h-3.5 text-white/50 shrink-0" />
        <span className="text-[11px] font-medium text-white/60 tracking-wide uppercase">
          Guided Tour
        </span>
        <div className="w-px h-3 bg-white/[0.12]" />
        <ProgressDots
          total={totalSteps}
          current={currentStep}
          onDotClick={goToStep}
        />
        <div className="w-px h-3 bg-white/[0.12]" />
        <span className="text-[11px] tabular-nums text-white/40">
          {currentStep + 1} / {totalSteps}
        </span>
        <button
          onClick={skipTour}
          className="ml-1 p-1 rounded-full hover:bg-white/10 transition-colors text-white/30 hover:text-white/60"
          aria-label="Skip tour"
          data-testid="tour-skip-header"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* ── Message bubble ────────────────────────────────────────────── */}
      <div
        className="absolute pointer-events-auto w-[340px] max-w-[calc(100vw-32px)]"
        style={bubbleStyle}
      >
        <div
          className="
            relative
            bg-black/75 backdrop-blur-2xl
            border border-white/[0.12]
            rounded-xl shadow-2xl shadow-black/60
            overflow-hidden
          "
          style={{
            animation: "tourBubbleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          {/* Subtle gradient shimmer across top edge */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.14) 40%, transparent)",
            }}
          />

          {/* Content */}
          <div className="p-4">
            {/* Step label + module */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                Step {currentStep + 1}
              </span>
              <span className="text-[10px] text-white/25 truncate ml-2 max-w-[160px]">
                {step?.highlightArea}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-white/90 leading-tight mb-2">
              {step?.title}
            </h3>

            {/* Message */}
            <p className="text-[13px] text-white/60 leading-relaxed">
              {step?.message}
            </p>

            {/* Aside note */}
            {step?.aside && (
              <p className="mt-2.5 text-[11px] text-white/35 leading-snug border-l-2 border-white/[0.12] pl-2.5 italic">
                {step.aside}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-white/[0.06]">
            {/* Prev */}
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="
                flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70
                disabled:opacity-25 disabled:cursor-not-allowed
                transition-colors py-1 px-2 rounded hover:bg-white/[0.05]
              "
              data-testid="tour-prev"
              aria-label="Previous step"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {/* Center: Pause + Skip */}
            <div className="flex items-center gap-1">
              <button
                onClick={isPaused ? resumeTour : pauseTour}
                className="
                  text-[11px] text-white/40 hover:text-white/70 transition-colors
                  py-1 px-2 rounded hover:bg-white/[0.05]
                  flex items-center gap-1
                "
                data-testid="tour-pause"
                aria-label={isPaused ? "Resume auto-advance" : "Pause auto-advance"}
              >
                {isPaused ? (
                  <Play className="w-3 h-3" />
                ) : (
                  <Pause className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={skipTour}
                className="
                  text-[11px] text-white/25 hover:text-white/50 transition-colors
                  py-1 px-2 rounded hover:bg-white/[0.05]
                "
                data-testid="tour-skip"
              >
                End Tour
              </button>
            </div>

            {/* Next — with countdown ring */}
            <button
              onClick={nextStep}
              className="
                relative flex items-center gap-1.5
                text-[12px] font-medium text-white/80 hover:text-white
                transition-colors py-1 px-3 rounded-lg
                bg-white/[0.06] hover:bg-white/[0.12]
                border border-white/[0.10]
              "
              data-testid="tour-next"
              aria-label={currentStep === totalSteps - 1 ? "Finish tour" : "Next step"}
            >
              {currentStep === totalSteps - 1 ? (
                "Finish"
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  {/* Countdown ring wrapper */}
                  {isAutoAdvancing && !isPaused && (
                    <span className="relative inline-flex w-[36px] h-[36px] -my-1 -mr-1.5 items-center justify-center">
                      <CountdownRing
                        countdown={countdown}
                        total={AUTO_ADVANCE_SECONDS}
                        paused={isPaused}
                      />
                      <span className="absolute text-[9px] tabular-nums text-white/40">
                        {countdown}
                      </span>
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Keyframes ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes tourPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.01); }
        }
        @keyframes tourBubbleIn {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
