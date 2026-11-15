import { useCallback, useEffect, useRef, useState } from "react";

const AUTO_ADVANCE_MS = 5000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface Carousel {
  readonly index: number;
  goTo(n: number): void;
  prev(): void;
  next(): void;
  /** Stops auto-advance (mouse enters the carousel). */
  pause(): void;
  /** Restarts the 5s auto-advance timer (mouse leaves the carousel). */
  resume(): void;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Auto-advances every 5s, pauses while hovered; any manual jump restarts the timer.
 * With reduced motion preferred, slides only change when the user asks.
 */
export function useCarousel(count: number): Carousel {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const [reducedMotion] = useState(prefersReducedMotion);

  const pause = useCallback(() => {
    window.clearInterval(timer.current);
  }, []);

  const resume = useCallback(() => {
    window.clearInterval(timer.current);
    if (reducedMotion || count < 2) return;
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTO_ADVANCE_MS);
  }, [count, reducedMotion]);

  useEffect(() => {
    resume();
    return pause;
  }, [resume, pause]);

  const wrap = useCallback((n: number) => ((n % count) + count) % count, [count]);

  const goTo = useCallback(
    (n: number) => {
      setIndex(wrap(n));
      resume();
    },
    [wrap, resume],
  );

  const step = useCallback(
    (delta: number) => {
      setIndex((i) => wrap(i + delta));
      resume();
    },
    [wrap, resume],
  );

  const prev = useCallback(() => step(-1), [step]);
  const next = useCallback(() => step(1), [step]);

  return { index, goTo, prev, next, pause, resume };
}
