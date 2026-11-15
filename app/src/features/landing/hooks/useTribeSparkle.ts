import { useLayoutEffect, useRef, useState, type MutableRefObject, type RefObject } from "react";

/** Number of tapered segments in the trail behind the star. */
export const TRAIL_SEGMENTS = 14;
/** Every outline path is normalised to this length (pathLength). */
export const OUTLINE_LENGTH = 1000;
/** The streak SVG sits on the border box, shifted by the 1.5px border. */
export const STREAK_OFFSET = 1.5;

const HALF_BORDER = 0.75;
const TRAIL = 190; // trail length, in 1/1000ths of the outline
const TRAVEL = 1700;
const DRAIN = 900;
const REST = 700;
const CYCLE = TRAVEL + DRAIN + REST;
const FADE_IN = 180;
const BEZIER_STEPS = 24;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface SparkleGeometry {
  /** Anticlockwise outline, starting at the top-right where the top edge meets the corner curve. */
  readonly d: string;
  readonly width: number;
  readonly height: number;
}

type PathSlots = Array<SVGPathElement | null>;

export interface TribeSparkleState {
  /** Null until the tab has been measured. */
  readonly geometry: SparkleGeometry | null;
  readonly sparkRef: RefObject<HTMLElement>;
  /** Glow and core path per trail segment, indexed head (0) to tail. */
  readonly glowRefs: MutableRefObject<PathSlots>;
  readonly coreRefs: MutableRefObject<PathSlots>;
}

const bez =
  (x1: number, y1: number, x2: number, y2: number) =>
  (t: number): number => {
    let lo = 0;
    let hi = 1;
    let u = t;
    for (let k = 0; k < BEZIER_STEPS; k++) {
      u = (lo + hi) / 2;
      const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u * u * x2 + u ** 3;
      if (x < t) lo = u;
      else hi = u;
    }
    return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u * u * y2 + u ** 3;
  };

const race = bez(0.45, 0.05, 0.4, 1);
const sine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;
const clamp = (x: number): number => Math.min(1, Math.max(0, x));

/**
 * Rounded-rectangle outline on the border centre line. `cornerRadius` is the element's
 * border radius; omit it for a pill (radius = half the height).
 */
function measure(tab: HTMLElement, cornerRadius?: number): SparkleGeometry {
  const b = HALF_BORDER;
  const w = tab.clientWidth;
  const h = tab.clientHeight;
  const L = -b;
  const T = -b;
  const R = w + b;
  const B = h + b;
  const r = Math.min(cornerRadius === undefined ? Infinity : cornerRadius - b, (B - T) / 2, (R - L) / 2);
  const d =
    `M ${R - r} ${T} L ${L + r} ${T} A ${r} ${r} 0 0 0 ${L} ${T + r} L ${L} ${B - r} ` +
    `A ${r} ${r} 0 0 0 ${L + r} ${B} L ${R - r} ${B} A ${r} ${r} 0 0 0 ${R} ${B - r} ` +
    `L ${R} ${T + r} A ${r} ${r} 0 0 0 ${R - r} ${T} Z`;
  return { d, width: tab.offsetWidth, height: tab.offsetHeight };
}

/** Draws the trail between head and tail (0..1000 along the outline). */
function draw(glows: PathSlots, cores: PathSlots, head: number, tail: number, alpha: number): void {
  const N = TRAIL_SEGMENTS;
  const len = Math.max(0, head - tail);
  const seg = len / N;
  for (let i = 0; i < N; i++) {
    const k = (1 - i / N) ** 1.5 * alpha; // brightness tapers towards the tail
    const w = 1 - 0.65 * (i / N); // and so does thickness
    const from = head - (i + 1) * seg;
    const dash = `${seg + 0.6} 3000`;
    const off = String(-from);
    const glow = glows[i];
    const core = cores[i];
    if (glow) {
      glow.setAttribute("stroke-dasharray", dash);
      glow.setAttribute("stroke-dashoffset", off);
      glow.setAttribute("stroke-width", (5.5 * w).toFixed(2));
      glow.setAttribute("stroke-opacity", (0.22 * k).toFixed(3));
    }
    if (core) {
      core.setAttribute("stroke-dasharray", dash);
      core.setAttribute("stroke-dashoffset", off);
      core.setAttribute("stroke-width", (1.8 * w).toFixed(2));
      core.setAttribute("stroke-opacity", k.toFixed(3));
    }
  }
}

/**
 * Tribe sparkle: a star races the outline (pill or rounded rectangle) anticlockwise with a tapered trail,
 * parks at the top-right while the trail drains into it, rests, repeats. The star never fades.
 * Call it in the component that renders the tab element, so tabRef is attached when it measures.
 */
export function useTribeSparkle(tabRef: RefObject<HTMLElement>, cornerRadius?: number): TribeSparkleState {
  const sparkRef = useRef<HTMLElement>(null);
  const glowRefs = useRef<PathSlots>([]);
  const coreRefs = useRef<PathSlots>([]);
  const [geometry, setGeometry] = useState<SparkleGeometry | null>(null);

  useLayoutEffect(() => {
    const tab = tabRef.current;
    if (!tab) return undefined;
    const update = () => {
      const next = measure(tab, cornerRadius);
      setGeometry((prev) =>
        prev && prev.d === next.d && prev.width === next.width && prev.height === next.height
          ? prev
          : next,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(tab);
    return () => observer.disconnect();
  }, [tabRef, cornerRadius]);

  useLayoutEffect(() => {
    const spark = sparkRef.current;
    if (!spark) return undefined;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      spark.style.offsetDistance = "0%";
      return undefined;
    }
    const t0 = performance.now();
    let frameId = 0;
    const frame = (now: number) => {
      const t = (now - t0) % CYCLE;
      let head: number;
      let tail: number;
      let trailA: number;
      if (t < TRAVEL) {
        head = OUTLINE_LENGTH * race(t / TRAVEL);
        tail = Math.max(0, head - TRAIL);
        trailA = clamp(t / FADE_IN);
      } else if (t < TRAVEL + DRAIN) {
        const p = sine((t - TRAVEL) / DRAIN);
        head = OUTLINE_LENGTH;
        tail = OUTLINE_LENGTH - TRAIL * (1 - p);
        trailA = 1 - 0.5 * p;
      } else {
        head = OUTLINE_LENGTH;
        tail = OUTLINE_LENGTH;
        trailA = 0;
      }
      const starA = 1;
      draw(glowRefs.current, coreRefs.current, head, tail, trailA);
      spark.style.offsetDistance = `${head / 10}%`;
      spark.style.opacity = starA.toFixed(3);
      frameId = requestAnimationFrame(frame);
    };
    frame(t0);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return { geometry, sparkRef, glowRefs, coreRefs };
}
