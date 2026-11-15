import { useId } from "react";
import type { AvatarLook, HairColour, HairStyle, ItemId, SkinTone } from "@/domain";
import { ItemArt } from "./ItemArt";

/**
 * Avatar in a soft 3D "clay" style (after the reference set).
 * - "bust": head and shoulders on a tilted pastel blob (lists, reveal, the Look tab).
 * - "full": full length, standing, wearing and carrying the trip picks (the Trip picks tab).
 * Drawn as SVG so every combination of options works. The head is shared by both.
 */

const SKIN: Record<SkinTone, string> = {
  fair: "#f4d3b4",
  wheatish: "#e8b98f",
  honey: "#d49e6c",
  dusky: "#b77c50",
  brown: "#8f5b39",
  deep: "#5f3b25",
};

const HAIR: Record<HairColour, string> = {
  black: "#2a2626",
  darkbrown: "#45301f",
  brown: "#71472b",
  henna: "#8f3a22",
  grey: "#b4b2bd",
};

/** Clothes and blob colours, picked from the name so each friend looks distinct. */
const TOPS = ["#4a84e6", "#f2ad3d", "#45b282", "#e5639f", "#7f6cdc", "#f2703e"];
const PANTS = ["#3d5a8a", "#2f3442", "#b89a6e", "#5a6b7d", "#6b4f3a"];
const BLOBS = ["#86bdf8", "#f8dd70", "#c2b4f6", "#cbe9c8", "#f8c4b0", "#cfdbec"];
const GOLD = "#e8b23a";

export const SKIN_SWATCH = SKIN;
export const HAIR_SWATCH = HAIR;

/** Full length: a bigger, friendlier head, scaled around the neck. */
const HEAD_SCALE = "translate(50 62) scale(1.22) translate(-50 -62)";

/** Below this size, trip items are left off a bust; they'd be specks. */
const ITEMS_MIN_SIZE = 44;

function seeded(seed: string): number {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Mix a hex colour towards white (amt > 0) or black (amt < 0). */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const target = amt > 0 ? 255 : 0;
  const a = Math.abs(amt);
  const mix = (c: number) => Math.round(c + (target - c) * a);
  return `#${((1 << 24) | (mix((n >> 16) & 255) << 16) | (mix((n >> 8) & 255) << 8) | mix(n & 255)).toString(16).slice(1)}`;
}

const BLOB = "M58 20 C80 22 96 40 93 63 C90 86 71 99 48 97 C24 95 7 80 9 57 C11 34 35 18 58 20 Z";

const HAIR_BACK: Partial<Record<HairStyle, string>> = {
  long: "M27 38 C25 62 26 80 32 90 L68 90 C74 80 75 62 73 38 Z",
  bob: "M27 38 C26 52 27 62 32 65.5 L68 65.5 C73 62 74 52 73 38 Z",
  curly: "M25 40 C20 56 26 68 34 67 L66 67 C74 68 80 56 75 40 Z",
};

/** Hair on top of the head (head: centre 50,42 · 20 wide · 21 tall). */
const HAIR_FRONT: Record<Exclude<HairStyle, "turban" | "hijab" | "curly">, string> = {
  short: "M29 44 C26 17 38 10.5 50 10.5 C62 10.5 74 17 71 44 C70 35.5 67 30.5 62 28.5 C57 31.5 43 31.5 38 28.5 C33 30.5 30 35.5 29 44 Z",
  sidepart: "M29 45 C25 17 39 9.5 52 10.5 C65 11.5 75 19 71 43 C69 34 65 28.5 59 27 C51 31 40 29.5 34 34.5 C31.5 37.5 30 41 29 45 Z",
  bun: "M29 44 C26.5 19 38 13 50 13 C62 13 73.5 19 71 44 C69 34 62 29 50 29 C38 29 31 34 29 44 Z",
  braid: "M29 46 C26 17 39 11 50 11 C61 11 74 17 71 46 C69 34.5 60 29 51 29.5 L50 19 L49 29.5 C40 29 31 34.5 29 46 Z",
  bob: "M27.5 51 C23 15 39 9.5 50 9.5 C61 9.5 77 15 72.5 51 C71 37 63 29.5 50 29.5 C37 29.5 29 37 27.5 51 Z",
  long: "M27.5 48 C23 15 39 9.5 50 9.5 C61 9.5 77 15 72.5 48 C70.5 36 60 29.5 51 30 C42 29.5 30 36 27.5 48 Z",
  buzz: "M31 37 C31 19.5 40 16.5 50 16.5 C60 16.5 69 19.5 69 37 C66 28.5 59 25 50 25 C41 25 34 28.5 31 37 Z",
};

const CURLS: Array<[number, number, number]> = (() => {
  const out: Array<[number, number, number]> = [];
  for (let a = 200; a >= -20; a -= 22) {
    const r = (a * Math.PI) / 180;
    out.push([50 + Math.cos(r) * 21, 40 - Math.sin(r) * 22, 6.6]);
  }
  out.push([42, 22, 6.5], [50, 19.5, 6.8], [58, 22, 6.5]);
  return out;
})();

interface AvatarFaceProps {
  look: AvatarLook;
  /** Seeds the clothing and blob colours. */
  seed: string;
  /** Trip picks to wear or carry. */
  items?: readonly ItemId[];
  /** Width in px. A full-length avatar is twice as tall as it is wide. */
  size?: number;
  faded?: boolean;
  variant?: "bust" | "full";
}

export function AvatarFace({ look, seed, items = [], size = 40, faded = false, variant = "bust" }: AvatarFaceProps) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const full = variant === "full";
  const h = seeded(seed);
  const skin = SKIN[look.skin];
  const hair = HAIR[look.hairColour];
  const top = TOPS[h % TOPS.length] ?? TOPS[0]!;
  const pants = PANTS[(h >> 2) % PANTS.length] ?? PANTS[0]!;
  const blob = BLOBS[(Math.imul(h, 2654435761) >>> 0) % BLOBS.length] ?? BLOBS[0]!;
  const wrap = look.hair === "hijab" ? top : TOPS[(h + 2) % TOPS.length] ?? top;
  const hijab = look.hair === "hijab";
  const turban = look.hair === "turban";
  const extra = (x: AvatarLook["extras"][number]) => look.extras.includes(x);

  const show = full || size >= ITEMS_MIN_SIZE;
  const has = (i: ItemId) => show && items.includes(i);
  const hat = has("sunhat") && !turban && !hijab;
  const helmet = !full && has("cycle") && !hat && !turban && !hijab;

  const defs = (
    <defs>
      <radialGradient id={id("skin")} cx="0.42" cy="0.34" r="0.72">
        <stop offset="0" stopColor={shade(skin, 0.24)} />
        <stop offset="0.6" stopColor={skin} />
        <stop offset="1" stopColor={shade(skin, -0.16)} />
      </radialGradient>
      <radialGradient id={id("ear")} cx="0.45" cy="0.4" r="0.7">
        <stop offset="0" stopColor={shade(skin, 0.12)} />
        <stop offset="1" stopColor={shade(skin, -0.18)} />
      </radialGradient>
      <linearGradient id={id("limb")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={shade(skin, 0.1)} />
        <stop offset="1" stopColor={shade(skin, -0.18)} />
      </linearGradient>
      <linearGradient id={id("neck")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={shade(skin, -0.28)} />
        <stop offset="0.6" stopColor={shade(skin, -0.06)} />
      </linearGradient>
      <radialGradient id={id("hair")} cx="0.38" cy="0.18" r="0.95">
        <stop offset="0" stopColor={shade(hair, 0.32)} />
        <stop offset="0.45" stopColor={hair} />
        <stop offset="1" stopColor={shade(hair, -0.3)} />
      </radialGradient>
      <radialGradient id={id("top")} cx="0.38" cy="0.12" r="0.95">
        <stop offset="0" stopColor={shade(top, 0.32)} />
        <stop offset="0.6" stopColor={top} />
        <stop offset="1" stopColor={shade(top, -0.25)} />
      </radialGradient>
      <linearGradient id={id("pants")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={shade(pants, 0.18)} />
        <stop offset="1" stopColor={shade(pants, -0.22)} />
      </linearGradient>
      <radialGradient id={id("wrap")} cx="0.38" cy="0.2" r="0.9">
        <stop offset="0" stopColor={shade(wrap, 0.35)} />
        <stop offset="0.55" stopColor={wrap} />
        <stop offset="1" stopColor={shade(wrap, -0.28)} />
      </radialGradient>
      <radialGradient id={id("gold")} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#fff2b8" />
        <stop offset="1" stopColor={GOLD} />
      </radialGradient>
      <linearGradient id={id("straw")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe9a8" />
        <stop offset="1" stopColor="#e8b85a" />
      </linearGradient>
      <linearGradient id={id("dark")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a4a52" />
        <stop offset="1" stopColor="#1f1f24" />
      </linearGradient>
      <linearGradient id={id("surf")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#6fe0d4" />
        <stop offset="1" stopColor="#219a95" />
      </linearGradient>
      <linearGradient id={id("mat")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#c4b2ff" />
        <stop offset="1" stopColor="#6f55d8" />
      </linearGradient>
      <linearGradient id={id("boot")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c58a57" />
        <stop offset="1" stopColor="#7b4c28" />
      </linearGradient>
      <clipPath id={id("blob")}>
        <path d={BLOB} />
      </clipPath>
    </defs>
  );

  /* ---------- Shared pieces ---------- */

  const hairBack = (
    <>
      {hijab && <path d="M23 44 C19 9 81 9 77 44 C81 60 79 78 70 90 L30 90 C21 78 19 60 23 44 Z" fill={url("wrap")} />}
      {!hijab && HAIR_BACK[look.hair] && <path d={HAIR_BACK[look.hair]} fill={url("hair")} />}
    </>
  );

  const neck = !hijab && <rect x="44" y="57" width="12" height="16" rx="5.5" fill={url("neck")} />;

  const neckItems = (
    <>
      {has("headphones") && (
        <g>
          <path d="M36 66 C38 76 62 76 64 66" stroke="#2b2b30" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <ellipse cx="36.5" cy="68" rx="4" ry="5" fill="#e04b86" />
          <ellipse cx="63.5" cy="68" rx="4" ry="5" fill="#e04b86" />
          <ellipse cx="36" cy="66.5" rx="1.4" ry="2" fill="#ffffff" opacity="0.35" />
        </g>
      )}
      {(has("camera") || has("binoculars")) && <path d="M42 70 L47 84 M58 70 L53 84" stroke="#2b2b30" strokeWidth="1.3" fill="none" />}
      {has("camera") && (
        <g transform={`translate(${has("binoculars") ? 42 : 50} 87)`}>
          <rect x="-8" y="-5.5" width="16" height="11" rx="2.5" fill={url("dark")} />
          <rect x="-5" y="-7.5" width="5" height="2.5" rx="1" fill="#3a3a42" />
          <circle cx="1" cy="0.5" r="3.8" fill="#596070" stroke="#c8ccd6" strokeWidth="1" />
          <circle cx="0" cy="-0.5" r="1.1" fill="#ffffff" opacity="0.6" />
        </g>
      )}
      {has("binoculars") && (
        <g transform={`translate(${has("camera") ? 58.5 : 50} 87)`}>
          <rect x="-7.5" y="-5" width="6.5" height="11" rx="2.5" fill={url("dark")} />
          <rect x="1" y="-5" width="6.5" height="11" rx="2.5" fill={url("dark")} />
          <rect x="-1.5" y="-2" width="3" height="4" fill="#3a3a42" />
          <circle cx="-4.2" cy="4.5" r="1.8" fill="#7fb2ff" />
          <circle cx="4.2" cy="4.5" r="1.8" fill="#7fb2ff" />
        </g>
      )}
    </>
  );

  const head = (
    <>
      {!hijab && (
        <>
          <circle cx="29.5" cy="45" r="5.4" fill={url("ear")} />
          <circle cx="29.9" cy="45.3" r="2.4" fill={shade(skin, -0.14)} />
          <circle cx="70.5" cy="45" r="5.4" fill={url("ear")} />
          <circle cx="70.1" cy="45.3" r="2.4" fill={shade(skin, -0.14)} />
        </>
      )}
      <ellipse cx="50" cy="42" rx="20.5" ry="21" fill={url("skin")} />
      <ellipse cx="44" cy="31" rx="7" ry="4" fill="#ffffff" opacity="0.12" />

      <path d="M39 37.6 Q42.5 36 46 37.3" stroke={hijab || turban ? "#2a2222" : shade(hair, -0.15)} strokeWidth="2.3" fill="none" strokeLinecap="round" />
      <path d="M54 37.3 Q57.5 36 61 37.6" stroke={hijab || turban ? "#2a2222" : shade(hair, -0.15)} strokeWidth="2.3" fill="none" strokeLinecap="round" />
      <ellipse cx="42.5" cy="43.5" rx="2.3" ry="2.9" fill="#1d1b1f" />
      <ellipse cx="57.5" cy="43.5" rx="2.3" ry="2.9" fill="#1d1b1f" />
      <circle cx="43.3" cy="42.4" r="0.85" fill="#ffffff" />
      <circle cx="58.3" cy="42.4" r="0.85" fill="#ffffff" />
      <ellipse cx="38" cy="50" rx="3.2" ry="1.9" fill="#ff8a7a" opacity="0.16" />
      <ellipse cx="62" cy="50" rx="3.2" ry="1.9" fill="#ff8a7a" opacity="0.16" />
      <ellipse cx="50" cy="49" rx="2.6" ry="2.1" fill={shade(skin, -0.1)} />
      <ellipse cx="49.3" cy="48.3" rx="1" ry="0.65" fill={shade(skin, 0.3)} />

      {look.facialHair === "stubble" && (
        <path d="M32 47 C33 63 43 67.5 50 67.5 C57 67.5 67 63 68 47 C64.5 57 58 60.5 50 60.5 C42 60.5 35.5 57 32 47 Z" fill={hair} opacity="0.2" />
      )}
      {look.facialHair === "beard" && (
        <path d="M30 41 C29.5 63 40 69.5 50 69.5 C60 69.5 70.5 63 70 41 C68 52 63.5 57.5 58 56.3 C54.5 55.5 45.5 55.5 42 56.3 C36.5 57.5 32 52 30 41 Z" fill={url("hair")} />
      )}
      <path d="M45.4 54 Q50 60 54.6 54 Q50 55.8 45.4 54 Z" fill="#6b2a24" />
      <path d="M46.2 54.5 Q50 55.9 53.8 54.5 L53.3 55.5 Q50 56.6 46.7 55.5 Z" fill="#ffffff" />
      <path d="M47.6 57.6 Q50 59 52.4 57.6 Q50 57 47.6 57.6 Z" fill="#e3746a" />
      {(look.facialHair === "moustache" || look.facialHair === "beard") && (
        <path d="M41.5 53.2 C43.5 50.6 47.8 50.8 50 52.2 C52.2 50.8 56.5 50.6 58.5 53.2 C56 52.8 53 53.5 50 53.1 C47 53.5 44 52.8 41.5 53.2 Z" fill={url("hair")} />
      )}

      {look.hair === "turban" ? (
        <>
          <path d="M27 40 C22 12 36 2.5 50 2.5 C64 2.5 78 12 73 40 C67 32 58 29 50 29 C42 29 33 32 27 40 Z" fill={url("wrap")} />
          <path d="M29.5 30 C40 22 60 22 70.5 30" stroke={shade(wrap, -0.22)} strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <path d="M32 21.5 C42 15 58 15 68 21.5" stroke={shade(wrap, -0.22)} strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <path d="M50 4.5 C44 15 46 24 50 29" stroke={shade(wrap, -0.22)} strokeWidth="1.7" fill="none" strokeLinecap="round" />
        </>
      ) : look.hair === "hijab" ? (
        <path d="M27.5 46 C26 11 74 11 72.5 46 C70 29.5 61 25 50 25 C39 25 30 29.5 27.5 46 Z" fill={url("wrap")} />
      ) : look.hair === "curly" ? (
        <g fill={url("hair")}>
          {CURLS.map(([cx, cy, r]) => (
            <circle key={`${cx.toFixed(1)}-${cy.toFixed(1)}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      ) : (
        <>
          <path d={HAIR_FRONT[look.hair]} fill={url("hair")} opacity={look.hair === "buzz" ? 0.88 : 1} />
          {look.hair === "bun" && (
            <>
              <circle cx="50" cy="10" r="7.5" fill={url("hair")} />
              <rect x="44.5" y="15" width="11" height="2.8" rx="1.4" fill={shade(top, 0.1)} />
            </>
          )}
          {look.hair !== "buzz" && <path d="M37 18.5 C41 15 46 13.8 50.5 13.8" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2.2" fill="none" strokeLinecap="round" />}
        </>
      )}
      {look.hair === "braid" && (
        <g fill={url("hair")}>
          {[56, 63, 70, 77].map((y, i) => (
            <ellipse key={y} cx={71 - i * 0.6} cy={y} rx="4.3" ry="4.1" />
          ))}
          <path d="M66.5 81.5 L69.3 88 L72 81.5 Z" />
        </g>
      )}

      {has("snorkel") && (
        <g>
          <path d="M30 29 C40 24 60 24 70 29" stroke="#1f9fb8" strokeWidth="2.4" fill="none" />
          <rect x="38" y={hat ? 30 : 24.5} width="24" height="9" rx="4.5" fill="#27b4cf" />
          <rect x="40.5" y={hat ? 31.8 : 26.3} width="19" height="5.4" rx="2.7" fill="#bff2fb" opacity="0.85" />
          <path d={`M66 ${hat ? 32 : 26.5} C72 24 72 14 70 8`} stroke="#ffcc33" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </g>
      )}
      {hat && (
        <g>
          <ellipse cx="50" cy="24.5" rx="31" ry="6.5" fill={url("straw")} />
          <path d="M34 24 C34 9 66 9 66 24 C60 26 40 26 34 24 Z" fill={url("straw")} />
          <path d="M34.3 20.5 C40 22.6 60 22.6 65.7 20.5 L66 24 C60 26 40 26 34 24 Z" fill="#e5533d" />
          <ellipse cx="44" cy="13.5" rx="5" ry="2" fill="#ffffff" opacity="0.35" />
        </g>
      )}
      {helmet && (
        <g>
          <path d="M28.5 33 C28.5 12 71.5 12 71.5 33 C64 30 36 30 28.5 33 Z" fill="#f2703e" />
          <path d="M40 16 V27 M50 14 V27 M60 16 V27" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {extra("bindi") && <circle cx="50" cy="33.8" r="1.5" fill="#d32f2f" />}
      {extra("nosepin") && <circle cx="52.9" cy="49.7" r="0.95" fill={url("gold")} />}
      {extra("jhumkas") && !hijab && (
        <g fill={url("gold")}>
          <circle cx="29.5" cy="52" r="1.3" />
          <path d="M26.5 54 Q29.5 51.8 32.5 54 L29.5 58.5 Z" />
          <circle cx="70.5" cy="52" r="1.3" />
          <path d="M67.5 54 Q70.5 51.8 73.5 54 L70.5 58.5 Z" />
        </g>
      )}
      {extra("glasses") && (
        <g>
          <circle cx="42.5" cy="43.5" r="5.3" fill="#ffffff" fillOpacity="0.18" stroke="#26232a" strokeWidth="1.6" />
          <circle cx="57.5" cy="43.5" r="5.3" fill="#ffffff" fillOpacity="0.18" stroke="#26232a" strokeWidth="1.6" />
          <path d="M47.8 43 Q50 41.8 52.2 43" stroke="#26232a" strokeWidth="1.5" fill="none" />
          <path d="M40.2 41 L42.2 39.6 M55.2 41 L57.2 39.6" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1" strokeLinecap="round" />
        </g>
      )}
    </>
  );

  const svgStyle = { opacity: faded ? 0.45 : 1, flex: "none" as const, overflow: "visible" as const };

  /* ---------- Full length ---------- */

  if (full) {
    const wide = look.gender === "man";
    const torso = wide
      ? "M31 78 C31 71 38 67 44 67 L56 67 C62 67 69 71 69 78 L67 124 L33 124 Z"
      : look.gender === "woman"
        ? "M34 78 C34 71 40 68 44 68 L56 68 C60 68 66 71 66 78 L64 104 C67 112 68 118 68 124 L32 124 C32 118 33 112 36 104 Z"
        : "M32 78 C32 71 39 67 44 67 L56 67 C61 67 68 71 68 78 L67 124 L33 124 Z";
    const shoulderL = wide ? 33 : 35;
    const shoulderR = wide ? 67 : 65;
    return (
      <svg width={size} height={size * 2} viewBox="0 0 100 200" aria-hidden style={svgStyle}>
        {defs}
        <ellipse cx="50" cy="195" rx="30" ry="4.5" fill="#000" opacity="0.1" />

        {/* Behind the body */}
        {has("surfboard") && (
          <g transform="translate(78 130) rotate(8)">
            <ellipse cx="0" cy="0" rx="8" ry="40" fill={url("surf")} />
            <path d="M0 -38 V38" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.8" />
            <ellipse cx="-3" cy="-20" rx="2" ry="9" fill="#fff" opacity="0.35" />
          </g>
        )}
        {has("yogamat") && (
          <g transform="translate(50 92) rotate(-35)">
            <rect x="-6" y="-34" width="12" height="68" rx="6" fill={url("mat")} />
            <ellipse cx="0" cy="-34" rx="6" ry="2.8" fill="#ddd2ff" />
          </g>
        )}
        <g transform={HEAD_SCALE}>{hairBack}</g>

        {/* Legs and shoes */}
        <path d="M34 120 H49 L48 186 H38 Z" fill={url("pants")} />
        <path d="M51 120 H66 L62 186 H52 Z" fill={url("pants")} />
        <path d="M49.8 124 V178" stroke={shade(pants, -0.35)} strokeWidth="0.8" opacity="0.6" />
        {has("boots") ? (
          <>
            {[[36, 1], [51, -1]].map(([x, f]) => (
              <g key={x} transform={`translate(${x} 176)`}>
                <path d={f === 1 ? "M0 0 H12 V10 L15 12 C16 14 15.5 18 14 18 H-4 C-5 18 -5.5 17 -5 15.5 L0 11 Z" : "M0 0 H12 V11 L17 15.5 C17.5 17 17 18 16 18 H-2 C-3.5 18 -4 14 -3 12 L0 10 Z"} fill={url("boot")} />
                <rect x={f === 1 ? -5 : -3} y="16.5" width="20" height="3" rx="1.4" fill="#3a2a1e" />
                <path d="M2.5 3 H9.5 M2.5 6 H9.5" stroke="#f6d7a0" strokeWidth="1" strokeLinecap="round" />
              </g>
            ))}
          </>
        ) : (
          <>
            <path d="M37 184 H49 C49.5 189 49 193 47 194 H32 C30 194 30 190 33 188 Z" fill="#f4f5f8" />
            <path d="M51 184 H63 L67 188 C70 190 70 194 68 194 H53 C51 193 50.5 189 51 184 Z" fill="#f4f5f8" />
            <path d="M31 193 H48 M52 193 H69" stroke="#c9ccd4" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {/* Arms */}
        <path d={`M${shoulderL + 1} 72 C${shoulderL - 6} 78 ${shoulderL - 8} 100 ${shoulderL - 6} 118`} stroke={url("top")} strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d={`M${shoulderR - 1} 72 C${shoulderR + 6} 78 ${shoulderR + 8} 100 ${shoulderR + 6} 118`} stroke={url("top")} strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d={`M${shoulderL - 7} 100 L${shoulderL - 6} 118`} stroke={url("limb")} strokeWidth="8" strokeLinecap="round" />
        <path d={`M${shoulderR + 7} 100 L${shoulderR + 6} 118`} stroke={url("limb")} strokeWidth="8" strokeLinecap="round" />
        <circle cx={shoulderL - 6} cy="121" r="5" fill={url("limb")} />
        <circle cx={shoulderR + 6} cy="121" r="5" fill={url("limb")} />

        {/* Torso */}
        <path d={torso} fill={url("top")} />
        {look.gender === "man" && (
          <>
            <path d="M42 67.5 L50 77 L58 67.5 Z" fill={url("neck")} />
            <path d="M40 68 L45 66.5 L50 75 L45.5 81 Z" fill="#ffffff" />
            <path d="M60 68 L55 66.5 L50 75 L54.5 81 Z" fill="#ececf1" />
            <path d="M50 78 V122" stroke={shade(top, -0.3)} strokeWidth="0.8" />
          </>
        )}
        {look.gender === "woman" && !hijab && <path d="M43 68 C45 76 55 76 57 68 Z" fill={url("neck")} />}
        {look.gender === "nonbinary" && (
          <>
            <path d="M38 68.5 C41 77 59 77 62 68.5 C57 73 43 73 38 68.5 Z" fill={shade(top, -0.22)} />
            <path d="M46 75 L45 88 M54 75 L55 88" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M38 106 H62 L61 120 H39 Z" fill={shade(top, -0.12)} />
          </>
        )}
        <rect x={wide ? 33 : 33} y="119" width={wide ? 34 : 34} height="5" rx="2" fill={shade(pants, -0.3)} />
        {has("apron") && (
          <g>
            <path d="M39 78 H61 L63 126 H37 Z" fill="#fffaf2" />
            <rect x="44" y="96" width="12" height="8" rx="2" fill="#e5533d" opacity="0.85" />
            <path d="M39 78 L44 68 M61 78 L56 68" stroke="#fffaf2" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        )}
        {has("shopping") && (
          <g>
            <path d={`M${shoulderL + 3} 70 L${shoulderL - 9} 106`} stroke="#8a5a2b" strokeWidth="2" />
            <ItemArt id="shopping" x={shoulderL - 22} y={98} size={24} />
          </g>
        )}

        {neck}
        {neckItems}
        <g transform={HEAD_SCALE}>{head}</g>

        {/* In hand, and on the ground */}
        {has("diya") && <ItemArt id="diya" x={shoulderL - 18} y={108} size={22} />}
        {has("book") && <ItemArt id="book" x={shoulderR - 2} y={106} size={20} />}
        {has("tent") && <ItemArt id="tent" x={-22} y={150} size={46} />}
        {has("cycle") && <ItemArt id="cycle" x={has("surfboard") ? 86 : 72} y={164} size={34} />}
      </svg>
    );
  }

  /* ---------- Bust ---------- */

  const body =
    look.gender === "man"
      ? "M15 104 C15 85 26 72.5 41 70.5 L59 70.5 C74 72.5 85 85 85 104 Z"
      : look.gender === "woman"
        ? "M20 104 C20 86 30 74 42 72 L58 72 C70 74 80 86 80 104 Z"
        : "M17 104 C17 85 28 72.5 41 70.5 L59 70.5 C72 72.5 83 85 83 104 Z";
  const back = (["surfboard", "yogamat", "tent"] as const).filter(has) as ItemId[];
  if (has("cycle") && !helmet) back.push("cycle");
  const front = (["shopping", "boots", "diya", "book"] as const).filter(has) as ItemId[];
  const BACK_SLOTS: Array<[number, number]> = [[-6, 40], [74, 40], [-8, 62]];
  const FRONT_SLOTS: Array<[number, number]> = [[12, 80], [64, 80], [38, 86]];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden style={svgStyle}>
      {defs}
      <path d={BLOB} fill={blob} />
      {back.slice(0, BACK_SLOTS.length).map((item, i) => {
        const [x, y] = BACK_SLOTS[i]!;
        return <ItemArt key={item} id={item} x={x} y={y} size={32} />;
      })}
      {hairBack}
      <g clipPath={url("blob")}>
        <path d={body} fill={url("top")} />
        {look.gender === "man" && (
          <>
            <path d="M42 70.5 L50 80 L58 70.5 Z" fill={url("neck")} />
            <path d="M40 71 L45 69.5 L50 78 L45.5 84 Z" fill="#ffffff" />
            <path d="M60 71 L55 69.5 L50 78 L54.5 84 Z" fill="#ececf1" />
          </>
        )}
        {look.gender === "woman" && !hijab && <path d="M42.5 72 C44.5 80 55.5 80 57.5 72 Z" fill={url("neck")} />}
        {look.gender === "nonbinary" && (
          <>
            <path d="M37 71.5 C40 80 60 80 63 71.5 C58 76 42 76 37 71.5 Z" fill={shade(top, -0.22)} />
            <path d="M45.5 78 L44.5 91 M54.5 78 L55.5 91" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {has("apron") && (
          <g>
            <path d="M40 78 H60 L62 104 H38 Z" fill="#fffaf2" />
            <rect x="44" y="86" width="12" height="6" rx="1.5" fill="#e5533d" opacity="0.85" />
            <path d="M40 78 L44 70 M60 78 L56 70" stroke="#fffaf2" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </g>
      {neck}
      {neckItems}
      {head}
      {front.slice(0, FRONT_SLOTS.length).map((item, i) => {
        const [x, y] = FRONT_SLOTS[i]!;
        return <ItemArt key={item} id={item} x={x} y={y} size={24} />;
      })}
    </svg>
  );
}

