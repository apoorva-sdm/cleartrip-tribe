import { useId, type ReactNode } from "react";
import type { ItemId } from "@/domain";

/**
 * The trip items in a soft 3D clay style. One set, used everywhere: pick tiles, shared picks,
 * shortlists, the plan, booking, feedback, and in the avatar's hands.
 */

/** Two-stop gradient from a light top-left to a darker bottom-right. */
const PALETTE: Record<string, [string, string]> = {
  straw: ["#ffe7a3", "#e2a94a"],
  red: ["#ff7a64", "#d8402c"],
  teal: ["#6fe0d4", "#219a95"],
  aqua: ["#9ef0ff", "#2bb4d0"],
  yellow: ["#ffe27a", "#f0b42a"],
  brown: ["#c58a57", "#7b4c28"],
  orange: ["#ffb46b", "#e8682a"],
  green: ["#8fe0a0", "#2f9a5a"],
  dark: ["#5b5b66", "#1f1f26"],
  steel: ["#e3e8f0", "#9aa6b8"],
  clay: ["#eba06a", "#a8502a"],
  cream: ["#fffaf0", "#e6d4b6"],
  tote: ["#f8e6c6", "#d6b07a"],
  blue: ["#7fb2ff", "#2f63c9"],
  purple: ["#c4b2ff", "#6f55d8"],
  pink: ["#ff9fc2", "#e04b86"],
};

type Paint = (name: keyof typeof PALETTE) => string;

const SHAPES: Record<ItemId, (p: Paint) => ReactNode> = {
  sunhat: (p) => (
    <>
      <ellipse cx="20" cy="27" rx="17" ry="6" fill={p("straw")} />
      <path d="M10.5 26 C10.5 13 29.5 13 29.5 26 C25 28 15 28 10.5 26 Z" fill={p("straw")} />
      <path d="M10.8 22.6 C15 24.6 25 24.6 29.2 22.6 L29.5 26 C25 28 15 28 10.5 26 Z" fill={p("red")} />
      <ellipse cx="16" cy="16.5" rx="3.5" ry="1.6" fill="#fff" opacity="0.45" />
    </>
  ),
  snorkel: (p) => (
    <>
      <rect x="5" y="15" width="24" height="13" rx="6.5" fill={p("aqua")} />
      <rect x="8" y="17.5" width="18" height="8" rx="4" fill="#d9f8ff" />
      <path d="M17 17.5 V25.5" stroke={"#2bb4d0"} strokeWidth="1.6" />
      <path d="M31 30 C35 28 35 14 33 5" stroke={p("yellow")} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M29 22 L31 30" stroke={p("yellow")} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="11" cy="19" rx="2" ry="1" fill="#fff" opacity="0.8" />
    </>
  ),
  surfboard: (p) => (
    <g transform="rotate(35 20 20)">
      <ellipse cx="20" cy="20" rx="7" ry="18" fill={p("teal")} />
      <path d="M20 3 V37" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.8" />
      <ellipse cx="17" cy="11" rx="1.8" ry="5" fill="#fff" opacity="0.4" />
    </g>
  ),
  boots: (p) => (
    <>
      <path d="M9 6 H21 V20 L31 24.5 C34 25.8 34 30 32.5 31.5 H8 C7.3 31.5 7 31 7 30 V8 C7 7 8 6 9 6 Z" fill={p("brown")} />
      <rect x="7" y="30" width="27" height="4.5" rx="2" fill="#3a2a1e" />
      <path d="M11.5 11 H18 M11.5 15 H18 M11.5 19 H18" stroke="#f6d7a0" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="11" cy="9" rx="1.6" ry="2.5" fill="#fff" opacity="0.3" />
    </>
  ),
  tent: (p) => (
    <>
      <ellipse cx="20" cy="33" rx="17" ry="2.5" fill="#000" opacity="0.1" />
      <path d="M20 6 L36 32 L4 32 Z" fill={p("orange")} />
      <path d="M20 6 L25 32 L15 32 Z" fill="#4a3324" />
      <path d="M20 6 L22.5 32" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
      <path d="M20 6 V2" stroke="#7a5a3a" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 18 L8 25" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  cycle: (p) => (
    <>
      <circle cx="10" cy="26" r="7" fill="none" stroke="#2b2b30" strokeWidth="2.6" />
      <circle cx="30" cy="26" r="7" fill="none" stroke="#2b2b30" strokeWidth="2.6" />
      <path d="M10 26 L16 15 L27 15 L30 26 M16 15 L20 26 L10 26 M27 15 L25 10 H29" stroke={p("orange")} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 12 H19" stroke="#2b2b30" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  camera: (p) => (
    <>
      <rect x="4" y="11" width="32" height="22" rx="5" fill={p("dark")} />
      <rect x="9" y="7.5" width="9" height="5" rx="1.8" fill="#3a3a44" />
      <circle cx="21" cy="22" r="7.5" fill={p("steel")} />
      <circle cx="21" cy="22" r="5" fill="#3d4a63" />
      <circle cx="19.3" cy="20.2" r="1.6" fill="#fff" opacity="0.8" />
      <circle cx="31" cy="15" r="1.5" fill="#ffcf4a" />
    </>
  ),
  diya: (p) => (
    <>
      <path d="M3 22 C4 32 36 32 37 22 C30 25 10 25 3 22 Z" fill={p("clay")} />
      <ellipse cx="20" cy="22" rx="17" ry="4" fill="#c86d3e" />
      <path d="M20 4 C25 10 24.5 16 20 18 C15.5 16 15 10 20 4 Z" fill={p("yellow")} />
      <path d="M20 10 C22.2 12.6 21.8 15.2 20 16 C18.2 15.2 17.8 12.6 20 10 Z" fill="#fff6c4" />
    </>
  ),
  binoculars: (p) => (
    <>
      <rect x="5" y="8" width="12" height="24" rx="5" fill={p("dark")} />
      <rect x="23" y="8" width="12" height="24" rx="5" fill={p("dark")} />
      <rect x="16" y="13" width="8" height="8" rx="2" fill="#3a3a44" />
      <circle cx="11" cy="27" r="4" fill={p("blue")} />
      <circle cx="29" cy="27" r="4" fill={p("blue")} />
      <ellipse cx="9" cy="12" rx="1.4" ry="2.6" fill="#fff" opacity="0.3" />
    </>
  ),
  apron: (p) => (
    <>
      <path d="M13 5 V9 A7 7 0 0 0 27 9 V5" stroke={p("red")} strokeWidth="2.4" fill="none" />
      <path d="M10 13 H30 L32 36 H8 Z" fill={p("cream")} />
      <path d="M10 13 L4 17 M30 13 L36 17" stroke={p("red")} strokeWidth="2.4" strokeLinecap="round" />
      <rect x="14" y="22" width="12" height="7" rx="2" fill={p("red")} />
    </>
  ),
  shopping: (p) => (
    <>
      <path d="M13 13 C13 4 27 4 27 13" stroke="#8a5a2b" strokeWidth="2.6" fill="none" />
      <path d="M6 13 H34 L31.5 36 H8.5 Z" fill={p("tote")} />
      <path d="M14 22 C17 26 23 26 26 22" stroke={p("pink")} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="11" cy="18" rx="1.6" ry="3" fill="#fff" opacity="0.4" />
    </>
  ),
  headphones: (p) => (
    <>
      <path d="M7 24 V19 A13 13 0 0 1 33 19 V24" stroke="#2b2b30" strokeWidth="3.4" fill="none" />
      <rect x="3" y="20" width="10" height="15" rx="5" fill={p("pink")} />
      <rect x="27" y="20" width="10" height="15" rx="5" fill={p("pink")} />
      <ellipse cx="6.5" cy="25" rx="1.4" ry="3" fill="#fff" opacity="0.45" />
    </>
  ),
  yogamat: (p) => (
    <g transform="rotate(-20 20 20)">
      <rect x="6" y="12" width="28" height="16" rx="8" fill={p("purple")} />
      <ellipse cx="34" cy="20" rx="3.4" ry="8" fill="#ddd2ff" />
      <path d="M34 20 m-1.6 0 a1.6 3.6 0 1 0 3.2 0 a1.6 3.6 0 1 0 -3.2 0" fill="none" stroke="#6f55d8" strokeWidth="1" />
      <rect x="15" y="12" width="3" height="16" fill="#4d3aa8" opacity="0.6" />
      <ellipse cx="12" cy="15" rx="4" ry="1.2" fill="#fff" opacity="0.35" />
    </g>
  ),
  book: (p) => (
    <g transform="rotate(-10 20 20)">
      <rect x="8" y="5" width="25" height="30" rx="3" fill={p("blue")} />
      <rect x="8" y="5" width="4.5" height="30" rx="2" fill="#1f4f9f" />
      <path d="M30 8 V32" stroke="#fffaf0" strokeWidth="2" />
      <path d="M16 14 H27 M16 18.5 H25" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  ),
};

interface ItemArtProps {
  id: ItemId;
  size?: number;
  /** Position inside a parent SVG (for the avatar). */
  x?: number;
  y?: number;
}

export function ItemArt({ id, size = 28, x, y }: ItemArtProps) {
  const uid = useId().replace(/:/g, "");
  const used = new Set<string>();
  const paint: Paint = (name) => {
    used.add(name);
    return `url(#${uid}-${name})`;
  };
  const shape = SHAPES[id](paint);
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 40 40" aria-hidden style={{ flex: "none", overflow: "visible" }}>
      <defs>
        {[...used].map((name) => {
          const [a, b] = PALETTE[name]!;
          return (
            <linearGradient key={name} id={`${uid}-${name}`} x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0" stopColor={a} />
              <stop offset="1" stopColor={b} />
            </linearGradient>
          );
        })}
      </defs>
      {shape}
    </svg>
  );
}
