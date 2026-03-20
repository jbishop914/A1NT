"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { tourSteps, TOUR_TOTAL_STEPS } from "./tour-steps";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DemoTourState {
  isActive: boolean;
  currentStep: number;
  isPaused: boolean;
  isAutoAdvancing: boolean;
  totalSteps: number;
  /** Seconds remaining in the auto-advance countdown (0–10) */
  countdown: number;
}

interface DemoTourContextValue extends DemoTourState {
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  skipTour: () => void;
  goToStep: (step: number) => void;
}

// ─── Context ────────────────────────────────────────────────────────────────

const DemoTourContext = createContext<DemoTourContextValue | null>(null);

// ─── Auto-advance interval ──────────────────────────────────────────────────

const AUTO_ADVANCE_SECONDS = 10;

// ─── Provider ───────────────────────────────────────────────────────────────

export function DemoTourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0-indexed
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(true);
  const [countdown, setCountdown] = useState(AUTO_ADVANCE_SECONDS);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Clear timer helper ──────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // ── Reset countdown for a new step ─────────────────────────────────
  const resetCountdown = useCallback(() => {
    setCountdown(AUTO_ADVANCE_SECONDS);
  }, []);

  // ── Start the countdown ticker ──────────────────────────────────────
  const startCountdown = useCallback(() => {
    clearTimer();
    resetCountdown();

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Timer fires — advance step
          clearTimer();
          setCurrentStep((s) => {
            if (s >= TOUR_TOTAL_STEPS - 1) {
              // End of tour
              setIsActive(false);
              return 0;
            }
            return s + 1;
          });
          return AUTO_ADVANCE_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, resetCountdown]);

  // ── Watch for active + auto-advancing + not paused ─────────────────
  useEffect(() => {
    if (isActive && isAutoAdvancing && !isPaused) {
      startCountdown();
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [isActive, isAutoAdvancing, isPaused, currentStep, startCountdown, clearTimer]);

  // ── Cleanup on unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // ── Actions ─────────────────────────────────────────────────────────

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    setIsPaused(false);
    setIsAutoAdvancing(true);
    resetCountdown();
  }, [resetCountdown]);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => {
      if (s >= TOUR_TOTAL_STEPS - 1) {
        setIsActive(false);
        return 0;
      }
      return s + 1;
    });
    resetCountdown();
  }, [resetCountdown]);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
    resetCountdown();
  }, [resetCountdown]);

  const pauseTour = useCallback(() => {
    setIsPaused(true);
    clearTimer();
  }, [clearTimer]);

  const resumeTour = useCallback(() => {
    setIsPaused(false);
  }, []);

  const skipTour = useCallback(() => {
    clearTimer();
    setIsActive(false);
    setCurrentStep(0);
    setIsPaused(false);
  }, [clearTimer]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < TOUR_TOTAL_STEPS) {
        setCurrentStep(step);
        resetCountdown();
      }
    },
    [resetCountdown]
  );

  return (
    <DemoTourContext.Provider
      value={{
        isActive,
        currentStep,
        isPaused,
        isAutoAdvancing,
        totalSteps: TOUR_TOTAL_STEPS,
        countdown,
        startTour,
        nextStep,
        prevStep,
        pauseTour,
        resumeTour,
        skipTour,
        goToStep,
      }}
    >
      {children}
    </DemoTourContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useDemoTour(): DemoTourContextValue {
  const ctx = useContext(DemoTourContext);
  if (!ctx) {
    throw new Error("useDemoTour must be used within a DemoTourProvider");
  }
  return ctx;
}
