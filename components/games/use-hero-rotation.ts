"use client";

import { useCallback, useEffect, useState } from "react";

export const HERO_INTERVAL_MS = 8000;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Active slide index for the home banner; auto-advances unless paused or reduced motion is on. */
export function useHeroRotation(count: number) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Bumped on every manual or automatic change so the progress bar restarts.
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (active >= count) setActive(0);
  }, [active, count]);

  const select = useCallback((index: number) => {
    setActive(index);
    setCycle((value) => value + 1);
  }, []);

  const isRunning = count > 1 && !isPaused && !reducedMotion;

  useEffect(() => {
    if (!isRunning) return;
    const timer = setTimeout(() => {
      setActive((index) => (index + 1) % count);
      setCycle((value) => value + 1);
    }, HERO_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [isRunning, count, cycle]);

  return { active: Math.min(active, Math.max(count - 1, 0)), cycle, isRunning, select, setIsPaused };
}
