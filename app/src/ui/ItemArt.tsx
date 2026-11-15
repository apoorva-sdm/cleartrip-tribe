import { useId, type ReactNode } from "react";
import type { ItemId } from "@/domain";

/**
 * The trip items in a soft 3D clay style, matched to the avatars (and to the reference set):
 * rounded forms, a light top-left, a darker bottom-right, a soft highlight and a faint ground shadow.
 * One set, used everywhere: pick tiles, shared picks, shortlists, the plan, booking, feedback,
 * and on the avatar.
 */

/** Light (top-left) to dark (bottom-right) for each material. */
const PALETTE: Record<string, [string, string]> = {
  yellow: ["#ffd96a", "#efa51c"],
  red: ["#ff7b62", "#d8402c"],
  orange: ["#ff9a5c", "#e8481a"],
  maskOrange: ["#ffb347", "#f07f12"],
  navy: ["#4f6ea8", "#26385f"],
  sky: ["#bfe6ff", "#5cb2ef"],
  deepSky: ["#7cc6ff", "#2f86d8"],
  lens: ["#8fd2ff", "#3d97e6"],
  brown: ["#d29a66", "#97602f"],
  leather: ["#7a4a26", "#4a2a14"],
  cream: ["#fffdf6", "#e7dcc4"],
  green: ["#9be38f", "#4aa85a"],
  greenDark: ["#6fc06a", "#2f7d3d"],
  wood: ["#c08654", "#7a4a26"],
  blue: ["#7fb2ff", "#2f63c9"],
  silver: ["#f2f3f6", "#a9afba"],
  dark: ["#55555e", "#1f1f26"],
  clay: ["#d4703f", "#8f2f12"],
  flame: ["#fff2a8", "#ffa21f"],
  tan: ["#e0a46a", "#a8642e"],
  maroon: ["#8a3b2b", "#4e1c13"],
  white: ["#ffffff", "#d9dee6"],
  ivory: ["#fbfaf4", "#d6d1bf"],
  bookBlue: ["#5f9bff", "#2c5fd0"],
  bookGreen: ["#8fe08a", "#3f9c4b"],
  bookPurple: ["#b9a6ff", "#6a52d6"],
  bookRed: ["#ff8b80", "#d9413a"],
};

type Paint = (name: keyof typeof PALETTE) => string;
type Ref = (name: string) => string;

/** A faint contact shadow under an object. */
const ground = (cx: number, cy: number, rx: number) => <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.13} fill="#000" opacity="0.1" />;

const SHAPES: Record<ItemId, (p: Paint, ref: Ref) => ReactNode> = {
  sunhat: (p) => (
    <>
      {ground(20, 34, 15)}
      <g transform="rotate(-10 20 24)">
        <ellipse cx="20" cy="26" rx="18.5" ry="6.6" fill={p("yellow")} />
        <ellipse cx="20" cy="25" rx="11" ry="3.4" fill="#c98512" opacity="0.25" />
        <path d="M10.5 25.5 C10.5 9.5 29.5 9.5 29.5 25.5 C25 27.3 15 27.3 10.5 25.5 Z" fill={p("yellow")} />
        <path d="M10.6 21.2 C15 23.3 25 23.3 29.4 21.2 L29.5 25.5 C25 27.3 15 27.3 10.5 25.5 Z" fill={p("red")} />
        <ellipse cx="15.5" cy="15" rx="3.4" ry="1.6" fill="#fff" opacity="0.5" transform="rotate(-35 15.5 15)" />
      </g>
    </>
  ),
  snorkel: (p) => (
    <>
      {ground(20, 37.5, 13)}
      <path d="M31 10 V26" stroke={p("navy")} strokeWidth="4.6" strokeLinecap="round" />
      <path d="M31 25 C31 33 27.5 35 21.5 34.5" stroke={p("deepSky")} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M27.6 30.8 L32 29.3 M25.4 33 L29.4 31.8" stroke="#fff" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
      <rect x="18.3" y="31.6" width="4.2" height="5.6" rx="1.8" fill={p("navy")} />
      <path d="M28.6 10.5 L29 4.3 C30.6 3.1 32.9 3.1 33.6 4.3 L33.4 10.5 Z" fill={p("maskOrange")} />
      <rect x="2.4" y="17.6" width="3.4" height="5.6" rx="1.2" fill={p("navy")} />
      <rect x="26" y="17.6" width="3.4" height="5.6" rx="1.2" fill={p("navy")} />
      <rect x="4" y="12.5" width="23.5" height="15.8" rx="7.2" fill={p("maskOrange")} />
      <rect x="7" y="15.4" width="17.5" height="10" rx="4.8" fill={p("lens")} />
      <ellipse cx="11.2" cy="17.6" rx="2.8" ry="1" fill="#fff" opacity="0.65" />
      <ellipse cx="8" cy="14" rx="2.4" ry="0.9" fill="#fff" opacity="0.45" />
    </>
  ),
  surfboard: (p, ref) => (
    <g transform="rotate(22 20 20)">
      <defs>
        <clipPath id={ref("board")}>
          <ellipse cx="20" cy="20" rx="7.6" ry="18.6" />
        </clipPath>
      </defs>
      <ellipse cx="20" cy="20" rx="7.6" ry="18.6" fill={p("sky")} />
      <g clipPath={`url(#${ref("board")})`}>
        <path d="M10 26 Q13.5 24 17 26 T24 26 T31 26 V40 H10 Z" fill={p("deepSky")} />
        <path d="M10 26 Q13.5 24 17 26 T24 26 T31 26" stroke="#fff" strokeWidth="1.2" fill="none" />
        <path d="M10 30 Q13.5 28 17 30 T24 30 T31 30" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.1" fill="none" />
        <path d="M10 34 Q13.5 32 17 34 T24 34 T31 34" stroke="#fff" strokeOpacity="0.7" strokeWidth="1" fill="none" />
      </g>
      <path d="M20 1.8 V38.2" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" />
      <ellipse cx="17.2" cy="10" rx="1.8" ry="5" fill="#fff" opacity="0.5" />
    </g>
  ),
  boots: (p) => {
    const boot = (dx: number, dy: number, s: number, key: string) => (
      <g key={key} transform={`translate(${dx} ${dy}) scale(${s})`}>
        <path d="M6 10 C6 8 7.5 7 9.5 7 H16 C17.6 7 18.6 8 18.6 9.6 V19 C22.5 19.6 26.6 21.6 27.6 25 C28.1 27 27.6 29 26 29 H6 Z" fill={p("brown")} />
        <rect x="5.4" y="7.4" width="13.6" height="3.6" rx="1.8" fill={p("leather")} />
        <path d="M5.4 28.4 H27 C27.7 28.4 28.1 29.2 27.9 30 L27.6 31.6 C27.4 32.4 26.7 32.9 25.9 32.9 H6.5 C5.8 32.9 5.3 32.4 5.3 31.7 Z" fill={p("cream")} />
        <ellipse cx="8.8" cy="17" rx="1.2" ry="4.2" fill="#fff" opacity="0.28" />
      </g>
    );
    return (
      <>
        {ground(20, 36.5, 16)}
        {boot(10, -2, 0.88, "back")}
        {boot(0, 3, 1, "front")}
      </>
    );
  },
  tent: (p) => (
    <>
      {ground(20, 34.2, 17.5)}
      <path d="M18.5 7 L37 30.5 L22.5 33 Z" fill={p("greenDark")} />
      <path d="M18.5 7 L22.5 33 L3 30.8 Z" fill={p("green")} />
      <path d="M18.5 7 L11.6 32.1 L20.4 32.8 Z" fill="#2c6b3a" />
      <path d="M18.5 7 L19.4 32.8" stroke={p("wood")} strokeWidth="1.5" />
      <path d="M18.5 7 C16 16 13 25 10.5 32 L12.8 32.2 C15 25 17.2 16 18.5 7 Z" fill={p("green")} />
      <path d="M18.5 7 C19.6 16 21 25 22.2 32.9 L20.6 32.8 C19.8 25 19 16 18.5 7 Z" fill={p("greenDark")} />
      <path d="M18.5 7 L2.5 22 M18.5 7 L37.5 19" stroke="#4f9a5a" strokeWidth="0.8" />
      <rect x="1.4" y="21" width="2" height="4.2" rx="0.8" fill={p("wood")} />
      <rect x="36.6" y="18" width="2" height="4.2" rx="0.8" fill={p("wood")} />
      <path d="M16.8 11.5 L7.5 27.5" stroke="#fff" strokeOpacity="0.32" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  cycle: (p) => (
    <>
      {ground(20, 35, 17)}
      {[9, 31].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="27" r="6.8" fill="none" stroke="#26262b" strokeWidth="2.8" />
          <circle cx={cx} cy="27" r="5" fill="none" stroke="#d9dde4" strokeWidth="1.1" />
          <circle cx={cx} cy="27" r="1.3" fill="#c9ccd4" />
        </g>
      ))}
      <path d="M2.4 24.6 A7 7 0 0 1 15.4 24.2 M24.6 24.2 A7 7 0 0 1 37.6 24.6" stroke={p("blue")} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M9 27 L19.5 27 L16 15.5 M16.4 17 L9 27 M16.4 17 L28.2 15.8 L19.5 27 M28.2 15.8 L31 27" stroke={p("blue")} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19.5" cy="27" r="2.3" fill="#c9ccd4" />
      <path d="M28.2 15.8 L27.4 10.6" stroke="#c9ccd4" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24.6 10.2 H29.4" stroke={p("wood")} strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="15.6" cy="14" rx="3.4" ry="1.5" fill={p("wood")} />
      <rect x="29" y="11.6" width="8.4" height="6.4" rx="1.6" fill={p("silver")} />
      <circle cx="33.2" cy="14.8" r="1.2" fill="#a9afba" />
    </>
  ),
  camera: (p) => (
    <>
      {ground(20, 36, 15)}
      <g transform="rotate(-12 20 21)">
        <rect x="21" y="7.4" width="10.5" height="5.4" rx="2" fill={p("silver")} />
        <rect x="6.5" y="8.4" width="6.4" height="3.8" rx="1.6" fill={p("silver")} />
        <rect x="4" y="11" width="32" height="21" rx="5" fill={p("silver")} />
        <rect x="4" y="15.6" width="32" height="12.4" fill={p("dark")} />
        <circle cx="21" cy="22" r="8.6" fill={p("silver")} />
        <circle cx="21" cy="22" r="6.5" fill={p("dark")} />
        <circle cx="21" cy="22" r="3.9" fill="#13213d" />
        <circle cx="19.4" cy="20.4" r="1.4" fill="#fff" opacity="0.75" />
        <rect x="30" y="12.6" width="3.6" height="2.4" rx="0.6" fill="#2a4fb0" />
        <ellipse cx="9" cy="12.6" rx="3" ry="0.8" fill="#fff" opacity="0.7" />
      </g>
    </>
  ),
  diya: (p) => (
    <>
      {ground(20, 36, 13)}
      <path d="M13.5 31.5 H26.5 L25.2 35 H14.8 Z" fill={p("clay")} />
      <path d="M3.5 22 C4.5 33 35.5 33 36.5 22 Z" fill={p("clay")} />
      <ellipse cx="20" cy="22" rx="16.5" ry="3.7" fill="#6e2610" />
      <ellipse cx="20" cy="22" rx="16.5" ry="3.7" fill="none" stroke="#f0a35e" strokeWidth="0.9" />
      <path d="M14 27.5 Q20 24.6 26 27.5" stroke="#f0a35e" strokeOpacity="0.5" strokeWidth="0.9" fill="none" />
      <path d="M20 4.5 C24.8 10.8 24.3 17.6 20 20.3 C15.7 17.6 15.2 10.8 20 4.5 Z" fill={p("flame")} />
      <path d="M20 10.8 C22 13.4 21.7 16.6 20 18.2 C18.3 16.6 18 13.4 20 10.8 Z" fill="#fffbe6" />
    </>
  ),
  binoculars: (p) => (
    <>
      {ground(20, 37, 15)}
      <rect x="4.5" y="8" width="13" height="22" rx="4.6" fill={p("tan")} />
      <rect x="22.5" y="8" width="13" height="22" rx="4.6" fill={p("tan")} />
      <rect x="4.5" y="14" width="13" height="2.2" fill="#f3e2c4" opacity="0.85" />
      <rect x="22.5" y="14" width="13" height="2.2" fill="#f3e2c4" opacity="0.85" />
      <rect x="14.5" y="10" width="11" height="7.5" rx="3.2" fill={p("maroon")} />
      <circle cx="20" cy="13.8" r="1.3" fill="#f3e2c4" />
      {[11, 29].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="30" rx="7.4" ry="5" fill={p("tan")} />
          <ellipse cx={cx} cy="30" rx="5.4" ry="3.5" fill={p("cream")} />
        </g>
      ))}
      <ellipse cx="7.6" cy="12" rx="1.2" ry="3" fill="#fff" opacity="0.35" />
    </>
  ),
  apron: (p) => (
    <>
      {ground(20, 38, 12)}
      <path d="M14 7 C14 0.5 26 0.5 26 7" stroke="#dfe4eb" strokeWidth="2" fill="none" />
      <path d="M9.6 16.5 C5.5 16.3 3.8 19.6 5.4 22.4 C6.4 24.2 5.2 26.2 3.6 25.8" stroke="#e1e6ed" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M30.4 16.5 C34.5 16.3 36.2 19.6 34.6 22.4 C33.6 24.2 34.8 26.2 36.4 25.8" stroke="#e1e6ed" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M13.4 6 H26.6 L27 13.6 C30 14.6 31 17 31 20 L30.2 34.2 C30.1 35.6 29.1 36.4 27.6 36.4 H12.4 C10.9 36.4 9.9 35.6 9.8 34.2 L9 20 C9 17 10 14.6 13 13.6 Z" fill={p("white")} />
      <rect x="15" y="22.4" width="10" height="7" rx="1.4" fill="none" stroke="#c3c9d3" strokeDasharray="1 0.9" strokeWidth="0.7" />
      <ellipse cx="13" cy="20" rx="1.2" ry="4" fill="#fff" opacity="0.9" />
    </>
  ),
  shopping: (p) => (
    <>
      {ground(20, 37.5, 14)}
      <path d="M14.4 15 C14.4 5.5 25.6 5.5 25.6 15" stroke="#c4380e" strokeWidth="2.4" fill="none" />
      <path d="M32 14 L35 16.6 L35.4 33 L33 35.4 Z" fill="#c43d12" />
      <path d="M7.6 14 H32 L33 35.4 H6.6 Z" fill={p("orange")} />
      <path d="M7.6 14 H32 L31.6 16 H8 Z" fill="#b8360f" opacity="0.55" />
      <path d="M15.4 17 C15.4 8.4 24.6 8.4 24.6 17" stroke={p("orange")} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="15.4" cy="17.4" r="1.8" fill={p("orange")} />
      <circle cx="24.6" cy="17.4" r="1.8" fill={p("orange")} />
      <ellipse cx="11" cy="24" rx="1.4" ry="5" fill="#fff" opacity="0.3" />
    </>
  ),
  headphones: (p) => (
    <>
      {ground(20, 37, 13)}
      <path d="M8 24 V18.5 A12 12 0 0 1 32 18.5 V24" stroke={p("ivory")} strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <rect x="3" y="19.5" width="10" height="15" rx="5" fill={p("ivory")} />
      <rect x="27" y="19.5" width="10" height="15" rx="5" fill={p("ivory")} />
      <ellipse cx="11.6" cy="27" rx="1.9" ry="5.4" fill="#b9b39b" />
      <ellipse cx="28.4" cy="27" rx="1.9" ry="5.4" fill="#b9b39b" />
      <ellipse cx="6" cy="24" rx="1.3" ry="3" fill="#fff" opacity="0.9" />
      <path d="M12 9.6 C15 7.6 19 6.8 22 7" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </>
  ),
  yogamat: (p) => (
    <>
      {ground(19, 35, 15)}
      {/* The flat part, lying on the floor, with a thin darker edge for thickness */}
      <path d="M5 27 L19.6 34.4 L19.6 35.8 L5 28.4 Z" fill="#2a58b8" />
      <path d="M19.6 34.4 L30.4 24.6 L30.4 26 L19.6 35.8 Z" fill="#244c9f" />
      <path d="M14.2 17.2 L30.4 24.6 L19.6 34.4 L5 27 Z" fill={p("blue")} />
      <path d="M8.6 26.6 L15.4 20" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.2" strokeLinecap="round" />
      {/* The rolled end, sitting on the far edge, its spiral facing out */}
      <g transform="translate(23.4 16.6) rotate(26.6)">
        <rect x="-9" y="-5" width="17.6" height="10" rx="3" fill={p("blue")} />
        <rect x="-7" y="-3.6" width="13" height="2" rx="1" fill="#fff" opacity="0.35" />
        <ellipse cx="8.6" cy="0" rx="2.6" ry="5" fill="#8fbcff" />
        <ellipse cx="8.6" cy="0" rx="1.7" ry="3.3" fill="none" stroke="#3d6fd6" strokeWidth="0.8" />
        <ellipse cx="8.6" cy="0" rx="0.8" ry="1.6" fill="#1d4fb8" />
      </g>
    </>
  ),
  book: (p) => {
    const books: Array<[number, number, keyof typeof PALETTE]> = [
      [6, 28, "bookRed"],
      [7.5, 21.6, "bookPurple"],
      [6.5, 15.2, "bookGreen"],
      [8, 8.8, "bookBlue"],
    ];
    return (
      <>
        {ground(20, 35.4, 16)}
        {books.map(([x, y, c]) => (
          <g key={c}>
            <rect x={x} y={y} width="26" height="6.4" rx="1.8" fill={p(c)} />
            <rect x={x + 4} y={y + 1.4} width="20.6" height="3.6" rx="0.8" fill="#f6f3ec" />
          </g>
        ))}
        <path d="M27 9 L28.6 12 L30.2 9 Z" fill="#ff7b62" />
        <path d="M24 28 L25.6 31.4 L27.2 28 Z" fill="#ffcf4a" />
      </>
    );
  },
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
  const ref: Ref = (name) => `${uid}-x-${name}`;
  const shape = SHAPES[id](paint, ref);
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 40 40" aria-hidden style={{ flex: "none", overflow: "visible" }}>
      <defs>
        {[...used].map((name) => {
          const [a, b] = PALETTE[name]!;
          return (
            <radialGradient key={name} id={`${uid}-${name}`} cx="0.32" cy="0.25" r="0.95">
              <stop offset="0" stopColor={a} />
              <stop offset="1" stopColor={b} />
            </radialGradient>
          );
        })}
      </defs>
      {shape}
    </svg>
  );
}
