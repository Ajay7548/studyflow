"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pads a number to two digits with a leading zero. */
const padTwo = ({ value }: { value: number }): string =>
  String(value).padStart(2, "0");

/** Converts total seconds into a MM:SS formatted string. */
const formatElapsedTime = ({ seconds }: { seconds: number }): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${padTwo({ value: mins })}:${padTwo({ value: secs })}`;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Timer hook that increments every second while running.
 * Returns elapsed seconds, a formatted MM:SS string, and controls.
 *
 * @example
 * ```tsx
 * const { formattedTime, startTimer, stopTimer } = useStudyTimer();
 * ```
 */
export const useStudyTimer = () => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearExistingInterval = useCallback(() => {
    if (!intervalRef.current) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    clearExistingInterval();
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, [clearExistingInterval]);

  const stopTimer = useCallback(() => {
    clearExistingInterval();
    setIsRunning(false);
  }, [clearExistingInterval]);

  const resetTimer = useCallback(() => {
    clearExistingInterval();
    setIsRunning(false);
    setElapsedSeconds(0);
  }, [clearExistingInterval]);

  useEffect(() => {
    return clearExistingInterval;
  }, [clearExistingInterval]);

  const formattedTime = formatElapsedTime({ seconds: elapsedSeconds });

  return { elapsedSeconds, formattedTime, isRunning, startTimer, stopTimer, resetTimer };
};
