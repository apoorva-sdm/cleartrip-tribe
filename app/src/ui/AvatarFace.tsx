import { useId } from "react";
import type { AvatarLook, HairColour, HairStyle, ItemId, SkinTone } from "@/domain";
import { ItemArt } from "./ItemArt";
import { sheetFor } from "./avatarSheet";

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
const HEAD_SCALE = "translate(50 62) scale(1.3) translate(-50 -62)";

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
  long: "M24 40 C21 66 22 84 26 96 L74 96 C78 84 79 66 76 40 Z",
  sidepart: "M25 40 C23 54 24 62 28 66 L72 66 C76 62 77 54 75 40 Z",
  bob: "M25 40 C23.5 52 24.5 60 28 63.5 L72 63.5 C75.5 60 76.5 52 75 40 Z",
  curly: "M22 42 C16 60 22 72 32 72 L68 72 C78 72 84 60 78 42 Z",
};

/** Hair on top of the head, after the character sheet (face: centre 50,42 · 41 wide · 44 tall). */
const HAIR_FRONT: Record<Exclude<HairStyle, "turban" | "hijab" | "curly">, string> = {
  // Full, side-swept crop that puffs out above the ears.
  short: "M27.6 49 C21.5 29 31 12.5 49 12 C66 11.5 79 23 74.6 43 C74 46 73 48 71.8 49.5 C71.4 40 68.6 33 63.4 29.6 C56 33 45.5 32.2 39.4 27.6 C34.6 32 31 39 30.4 47 Z",
  // Shoulder-skimming, deep side part, hair framing the cheeks.
  sidepart: "M24.4 63 C19.4 30 32 11.5 50.5 11.5 C69 11.5 81 30 75.6 63 C74 64.4 72 64.4 70.6 62.4 C71.2 47 69.4 35.6 62.6 29.2 C55 32.2 43.6 31 36.6 25.6 C31.6 32 29.4 42 29.4 52 C29.4 56 29.8 60 29.4 62.4 C28 64.4 26 64.4 24.4 63 Z",
  // Hair pulled back smooth to a top bun.
  bun: "M28.8 47 C26 19 37.6 13 50 13 C62.4 13 74 19 71.2 47 C69.6 35 63 28.6 50 28.6 C37 28.6 30.4 35 28.8 47 Z",
  // Centre part, pulled back into a side braid.
  braid: "M28.4 48 C25.6 18 38.6 12 50 12 C61.4 12 74.4 18 71.6 48 C70 35.6 61.6 29.6 51.4 29.8 L50 20 L48.6 29.8 C38.4 29.6 30 35.6 28.4 48 Z",
  // Straight, chin-length bob with a soft side fringe.
  bob: "M24.6 61 C20 29 32.6 11.6 50 11.6 C67.4 11.6 80 29 75.4 61 L70.8 61 C71.4 46 69.6 36 63 30 C56 33.4 44.6 32 37.4 27 C32 33 29.4 43 29.2 61 Z",
  // Long and straight, centre part, falling past the shoulders.
  long: "M24.6 70 C20.4 30 31 11.6 50 11.6 C69 11.6 79.6 30 75.4 70 L70.6 70 C71 53 70 39 64.4 31 C58.6 27.6 53.2 24 50 19.6 C46.8 24 41.4 27.6 35.6 31 C30 39 29 53 29.4 70 Z",
  // Close crop that follows the head.
  fade: "M30.6 36 C30.6 16 40 13 50 13 C60 13 69.4 16 69.4 36 C66.6 26.4 59.4 23 50 23 C40.6 23 33.4 26.4 30.6 36 Z",
  buzz: "M30.6 38 C30.6 20 40 16.6 50 16.6 C60 16.6 69.4 20 69.4 38 C66.6 29.4 59.4 26 50 26 C40.6 26 33.4 29.4 30.6 38 Z",
};

const CURLS: Array<[number, number, number]> = (() => {
  const out: Array<[number, number, number]> = [];
  // A full ring of curls framing the face, down to the jaw.
  for (let a = 232; a >= -52; a -= 16) {
    const r = (a * Math.PI) / 180;
    out.push([50 + Math.cos(r) * 25, 40 - Math.sin(r) * 25, 7.4]);
  }
  out.push([38, 20, 7], [46, 16, 7.4], [54, 16, 7.4], [62, 20, 7], [42, 25, 6], [50, 23, 6.2], [58, 25, 6]);
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
  const wrap = TOPS[(h + 2) % TOPS.length] ?? top;
  const hijab = look.hair === "hijab";
  const turban = look.hair === "turban";
  const extra = (x: AvatarLook["extras"][number]) => look.extras.includes(x);
  // Facial hair is offered to men and non-binary people only.
  const facialHair = look.gender === "woman" ? "none" : look.facialHair;

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
        <stop offset="0" stopColor="#ffd96a" />
        <stop offset="1" stopColor="#efa51c" />
      </linearGradient>
      <linearGradient id={id("dark")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a4a52" />
        <stop offset="1" stopColor="#1f1f24" />
      </linearGradient>
      <linearGradient id={id("surf")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#d2eeff" />
        <stop offset="1" stopColor="#5cb2ef" />
      </linearGradient>
      <linearGradient id={id("surfDeep")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8fd0ff" />
        <stop offset="1" stopColor="#2f86d8" />
      </linearGradient>
      <linearGradient id={id("mat")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8fbcff" />
        <stop offset="1" stopColor="#2f63c9" />
      </linearGradient>
      <linearGradient id={id("boot")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#d29a66" />
        <stop offset="1" stopColor="#97602f" />
      </linearGradient>
      <radialGradient id={id("shoe")} cx="0.35" cy="0.2" r="0.9">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#d9dde4" />
      </radialGradient>
      <radialGradient id={id("apron")} cx="0.3" cy="0.2" r="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#dde2ea" />
      </radialGradient>
      <radialGradient id={id("ivory")} cx="0.35" cy="0.25" r="0.9">
        <stop offset="0" stopColor="#fbfaf4" />
        <stop offset="1" stopColor="#cfc9b4" />
      </radialGradient>
      <clipPath id={id("blob")}>
        <path d={BLOB} />
      </clipPath>
    </defs>
  );

  /* ---------- Shared pieces ---------- */

  const hairBack = (
    <>
      {hijab && <path d="M24 46 C20 6 80 6 76 46 C79 60 80 72 80 82 L20 82 C20 72 21 60 24 46 Z" fill={url("wrap")} />}
      {!hijab && HAIR_BACK[look.hair] && <path d={HAIR_BACK[look.hair]} fill={url("hair")} />}
      {look.hair === "curly" && (
        <g fill={url("hair")}>
          {CURLS.map(([cx, cy, r]) => (
            <circle key={`${cx.toFixed(1)}-${cy.toFixed(1)}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      )}
    </>
  );

  const neck = !hijab && <rect x="44" y="57" width="12" height="16" rx="5.5" fill={url("neck")} />;

  const neckItems = (
    <>
      {has("headphones") && (
        <g>
          <path d="M36 66 C38 76 62 76 64 66" stroke={url("ivory")} strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="36.5" cy="68" rx="4.4" ry="5.4" fill={url("ivory")} />
          <ellipse cx="63.5" cy="68" rx="4.4" ry="5.4" fill={url("ivory")} />
          <ellipse cx="38.4" cy="68.6" rx="1.2" ry="3.2" fill="#b9b39b" />
          <ellipse cx="61.6" cy="68.6" rx="1.2" ry="3.2" fill="#b9b39b" />
        </g>
      )}
      {!full &&
        (["camera", "binoculars"] as const).filter(has).map((item, i, all) => (
          <g key={item}>
            <path d={`M${all.length === 2 ? 42 + i * 16 : 44} 71 L${all.length === 2 ? 42 + i * 16 : 50} 83`} stroke="#3a3a42" strokeWidth="1.1" />
            <ItemArt id={item} x={all.length === 2 ? 32 + i * 18 : 41} y={80} size={all.length === 2 ? 17 : 19} />
          </g>
        ))}
    </>
  );

  /** Hats and extras in head coordinates (mouth at 50,57.6), shared by drawn and sheet avatars. */
  const headwear = (
    <>
      {has("snorkel") && (
        <g>
          <path d="M29.5 30 C40 25 60 25 70.5 30" stroke="#26385f" strokeWidth="2.4" fill="none" />
          <path d={`M66 ${hat ? 33 : 27.5} C71.5 25 71.5 15 69.6 9`} stroke="#26385f" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M68.2 9.6 L68.6 5.4 C69.8 4.6 71.4 4.6 71.8 5.4 L71.6 9.6 Z" fill="#f59a2a" />
          <rect x="37.5" y={hat ? 30 : 24} width="25" height="10.5" rx="5.2" fill="#f59a2a" />
          <rect x="40" y={hat ? 31.9 : 25.9} width="20" height="6.7" rx="3.3" fill="#6fbcf2" />
          <ellipse cx="44" cy={hat ? 33.4 : 27.4} rx="2.6" ry="0.9" fill="#fff" opacity="0.7" />
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
          <path d="M28.5 33 C28.5 12 71.5 12 71.5 33 C64 30 36 30 28.5 33 Z" fill="#3f7be0" />
          <path d="M40 16 V27 M50 14 V27 M60 16 V27" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

    </>
  );
  const extrasArt = (
    <>
      <g transform="translate(0 2)">
      {extra("bindi") && <circle cx="50" cy="33.8" r="1.5" fill="#d32f2f" />}
      {extra("nosepin") && <circle cx="52.9" cy="49.7" r="0.95" fill={url("gold")} />}
      {extra("jhumkas") && !hijab && (
        <g fill={url("gold")}>
          <circle cx="31" cy="49.6" r="0.9" />
          <path d="M29 51.2 Q31 49.8 33 51.2 L31 54.4 Z" />
          <circle cx="69" cy="49.6" r="0.9" />
          <path d="M67 51.2 Q69 49.8 71 51.2 L69 54.4 Z" />
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
      </g>
    </>
  );

  const head = (
    <>
      {!hijab && (
        <>
          <ellipse cx="29.6" cy="47" rx="5" ry="5.8" fill={url("ear")} />
          <ellipse cx="30" cy="47.3" rx="2.2" ry="2.8" fill={shade(skin, -0.14)} />
          <ellipse cx="70.4" cy="47" rx="5" ry="5.8" fill={url("ear")} />
          <ellipse cx="70" cy="47.3" rx="2.2" ry="2.8" fill={shade(skin, -0.14)} />
        </>
      )}
      <path d="M50 20 C62.4 20 70.6 29 70.6 41.6 C70.6 55 61.4 64.4 50 64.4 C38.6 64.4 29.4 55 29.4 41.6 C29.4 29 37.6 20 50 20 Z" fill={url("skin")} />
      <ellipse cx="44" cy="31" rx="7" ry="4" fill="#ffffff" opacity="0.12" />

      <g transform="translate(0 2)">
      <path d="M39 37.6 Q42.5 36 46 37.3" stroke={hijab || turban ? "#2a2222" : shade(hair, -0.15)} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M54 37.3 Q57.5 36 61 37.6" stroke={hijab || turban ? "#2a2222" : shade(hair, -0.15)} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <ellipse cx="42.4" cy="43.5" rx="3" ry="3.6" fill="#1d1b1f" />
      <ellipse cx="57.6" cy="43.5" rx="3" ry="3.6" fill="#1d1b1f" />
      <circle cx="43.4" cy="42.2" r="1" fill="#ffffff" />
      <circle cx="58.6" cy="42.2" r="1" fill="#ffffff" />
      <ellipse cx="38" cy="50" rx="3.2" ry="1.9" fill="#ff8a7a" opacity="0.22" />
      <ellipse cx="62" cy="50" rx="3.2" ry="1.9" fill="#ff8a7a" opacity="0.22" />
      <ellipse cx="50" cy="49" rx="2.6" ry="2.1" fill={shade(skin, -0.1)} />
      <ellipse cx="49.3" cy="48.3" rx="1" ry="0.65" fill={shade(skin, 0.3)} />

      {facialHair === "stubble" && (
        <path d="M32 47 C33 63 43 67.5 50 67.5 C57 67.5 67 63 68 47 C64.5 57 58 60.5 50 60.5 C42 60.5 35.5 57 32 47 Z" fill={hair} opacity="0.2" />
      )}
      {facialHair === "beard" && (
        <path d="M30 41 C29.5 63 40 69.5 50 69.5 C60 69.5 70.5 63 70 41 C68 52 63.5 57.5 58 56.3 C54.5 55.5 45.5 55.5 42 56.3 C36.5 57.5 32 52 30 41 Z" fill={url("hair")} />
      )}
      <path d="M44.8 53.6 Q50 61 55.2 53.6 Q50 55.6 44.8 53.6 Z" fill="#6b2a24" />
      <path d="M45.8 54.2 Q50 55.8 54.2 54.2 L53.6 55.4 Q50 56.6 46.4 55.4 Z" fill="#ffffff" />
      <path d="M47.6 57.6 Q50 59 52.4 57.6 Q50 57 47.6 57.6 Z" fill="#e3746a" />
      {(facialHair === "moustache" || facialHair === "beard") && (
        <path d="M41.5 53.2 C43.5 50.6 47.8 50.8 50 52.2 C52.2 50.8 56.5 50.6 58.5 53.2 C56 52.8 53 53.5 50 53.1 C47 53.5 44 52.8 41.5 53.2 Z" fill={url("hair")} />
      )}
      </g>

      {look.hair === "turban" ? (
        <>
          {/* Rounded, high wrap with diagonal folds; ears stay visible (after the sheet). */}
          <path d="M27.6 38 C22.6 13 35.6 3.6 50 3.6 C64.4 3.6 77.4 13 72.4 38 C66.4 33 58.4 31 50 31 C41.6 31 33.6 33 27.6 38 Z" fill={url("wrap")} />
          <path d="M29.4 31.6 C38 20 54 12 69.4 15" stroke={shade(wrap, -0.2)} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M31.6 22 C40 13 52 8.4 63 8.6" stroke={shade(wrap, -0.2)} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M44 31.2 C52 24 62 21.4 71.6 24.4" stroke={shade(wrap, -0.2)} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <ellipse cx="40" cy="12" rx="6" ry="2.4" fill="#ffffff" opacity="0.28" transform="rotate(-20 40 12)" />
        </>
      ) : look.hair === "hijab" ? (
        <>
          {/* Wraps the head and frames the face closely, down past the cheeks. */}
          <path d="M26.6 58 C22 14 78 14 73.4 58 C72 60 70.4 60 69.6 58.6 C71 38 63 26.4 50 26.4 C37 26.4 29 38 30.4 58.6 C29.6 60 28 60 26.6 58 Z" fill={url("wrap")} />
          <path d="M33 22 C40 17 48 15.6 56 16.6" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : look.hair === "curly" ? (
        <g fill={url("hair")}>
          {CURLS.filter(([, cy]) => cy < 31).map(([cx, cy, r]) => (
            <circle key={`${cx.toFixed(1)}-${cy.toFixed(1)}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      ) : (
        <>
          <path d={HAIR_FRONT[look.hair]} fill={url("hair")} opacity={look.hair === "buzz" ? 0.88 : 1} />
          {look.hair === "bun" && (
            <>
              <circle cx="50" cy="8.6" r="8.4" fill={url("hair")} />
              <path d="M44 9 C46 5 54 5 56 9" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            </>
          )}
          {look.hair !== "buzz" && <path d="M37 18.5 C41 15 46 13.8 50.5 13.8" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2.2" fill="none" strokeLinecap="round" />}
        </>
      )}
      {look.hair === "braid" && (
        <g fill={url("hair")}>
          {[56, 63, 70, 77, 84].map((y, i) => (
            <ellipse key={y} cx={29 + i * 0.5} cy={y} rx="4.2" ry="4" />
          ))}
          <path d="M28 88 L31 94 L33.6 88 Z" />
        </g>
      )}

      {headwear}
      {extrasArt}
    </>
  );

  const svgStyle = { opacity: faded ? 0.45 : 1, flex: "none" as const, overflow: "visible" as const };

  /* ---------- Full length ---------- */

  if (full) {
    // Stance after the reference: big round head, short-sleeve tee, arms straight down,
    // straight trousers and chunky sneakers. Big gear (tent, cycle, surfboard) stands behind as a backdrop.
    const torso =
      look.gender === "woman"
        ? "M38.5 66 C33 66 28.6 69 27.2 75 L23.6 91.5 C26.6 94 30.6 94.6 33.6 93.6 L34.6 88 L35.6 104 L34.6 117 C41 119 59 119 65.4 117 L64.4 104 L65.4 88 L66.4 93.6 C69.4 94.6 73.4 94 76.4 91.5 L72.8 75 C71.4 69 67 66 61.5 66 C57.5 69.6 42.5 69.6 38.5 66 Z"
        : "M38 66 C32.5 66 28 69 26.6 75 L23 91.5 C26 94 30 94.6 33 93.6 L33.6 88 L33.2 117 C40 119 60 119 66.8 117 L66.4 88 L67 93.6 C70 94.6 74 94 77 91.5 L73.4 75 C72 69 67.5 66 62 66 C58 69.6 42 69.6 38 66 Z";
    const handL: [number, number] = [26.4, 128.5];
    const handR: [number, number] = [73.6, 128.5];
    const tote = has("shopping");
    const carried = (["diya", "book"] as const).filter(has);
    const handSlots: Array<[number, number]> = tote ? [handR] : [handR, handL];
    const inHand = carried.slice(0, handSlots.length);
    const onGround = carried.slice(handSlots.length);
    const chest = (["camera", "binoculars"] as const).filter(has);
    return (
      <svg width={size} height={size * 2} viewBox="0 0 100 200" aria-hidden style={svgStyle}>
        {defs}

        {/* Backdrop: the big gear, stacked behind the figure */}
        {has("tent") && <ItemArt id="tent" x={has("surfboard") ? -42 : -30} y={106} size={100} />}
        {has("surfboard") && (
          <g transform="translate(80 108) rotate(9)">
            <clipPath id={id("board")}>
              <ellipse cx="0" cy="0" rx="12" ry="70" />
            </clipPath>
            <ellipse cx="0" cy="0" rx="12" ry="70" fill={url("surf")} />
            <g clipPath={url("board")}>
              <path d="M-14 22 Q-8 18 -2 22 T10 22 T22 22 V80 H-14 Z" fill={url("surfDeep")} />
              {[22, 32, 42].map((y, i) => (
                <path key={y} d={`M-14 ${y} Q-8 ${y - 4} -2 ${y} T10 ${y} T22 ${y}`} stroke="#fff" strokeOpacity={0.95 - i * 0.15} strokeWidth="2" fill="none" />
              ))}
            </g>
            <path d="M0 -68 V68" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" />
            <ellipse cx="-4.5" cy="-38" rx="2.6" ry="17" fill="#fff" opacity="0.45" />
          </g>
        )}
        {has("cycle") && <ItemArt id="cycle" x={-5} y={96} size={110} />}

        <ellipse cx="50" cy="193" rx="27" ry="4" fill="#000" opacity="0.1" />
        {has("yogamat") && (
          <g transform="translate(50 96) rotate(-38)">
            <rect x="-7" y="-44" width="14" height="88" rx="7" fill={url("mat")} />
            <rect x="-4.6" y="-40" width="2.6" height="80" rx="1.3" fill="#fff" opacity="0.3" />
            <ellipse cx="0" cy="-44" rx="7" ry="3.2" fill="#9cc4ff" />
            <ellipse cx="0" cy="-44" rx="2.6" ry="1.2" fill="#1d4fb8" />
          </g>
        )}
        <g transform={HEAD_SCALE}>{hairBack}</g>

        {/* Legs: straight trousers, a bit of ankle, chunky sneakers (or boots) */}
        <rect x="37.5" y="170" width="9" height="12" rx="3" fill={url("limb")} />
        <rect x="53.5" y="170" width="9" height="12" rx="3" fill={url("limb")} />
        <path d="M33.4 114 H66.6 L66 176 C66 177.2 65.2 178 64 178 H52.6 C51.5 178 50.7 177.2 50.6 176 L50.4 130 H49.6 L49.4 176 C49.3 177.2 48.5 178 47.4 178 H36 C34.8 178 34 177.2 34 176 Z" fill={url("pants")} />
        <path d="M41.6 132 V174 M58.4 132 V174" stroke="#fff" strokeOpacity="0.14" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M50 118 V129" stroke={shade(pants, -0.35)} strokeWidth="0.8" opacity="0.6" />
        {has("boots") ? (
          [[34.2, 1], [50.8, -1]].map(([x, f]) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <path d={f === 1 ? "M1 166 H14.6 V182 C15.6 183 16 184.6 15.8 186.6 H-1.6 C-1.8 184 -0.6 182 1 181 Z" : "M0.4 166 H14 V181 C15.6 182 16.8 184 16.6 186.6 H-0.8 C-1 184.6 -0.6 183 0.4 182 Z"} fill={url("boot")} />
              <rect x="0.4" y="165" width="14.6" height="4" rx="2" fill="#5a3418" />
              <rect x={f === 1 ? -2.2 : -1.2} y="185.4" width="19" height="4.2" rx="2" fill="#efe3c8" />
            </g>
          ))
        ) : (
          <>
            <path d="M35.6 180.4 C35.6 177.6 37.6 176.4 40.6 176.4 H45 C47.8 176.4 49.4 178 49.4 180.6 L49.8 188 H32.6 C32.2 184.8 33.4 182 35.6 180.4 Z" fill={url("shoe")} />
            <path d="M50.6 180.6 C50.6 178 52.2 176.4 55 176.4 H59.4 C62.4 176.4 64.4 177.6 64.4 180.4 C66.6 182 67.8 184.8 67.4 188 H50.2 Z" fill={url("shoe")} />
            <rect x="32" y="186.6" width="18.2" height="4.4" rx="2.2" fill="#c99a68" />
            <rect x="49.8" y="186.6" width="18.2" height="4.4" rx="2.2" fill="#c99a68" />
            <path d="M39 180.2 H44.6 M55.4 180.2 H61" stroke="#c9ccd4" strokeWidth="1.1" strokeLinecap="round" />
          </>
        )}

        {/* Arms hang straight; the sleeves cover their tops */}
        <path d="M28.2 90 L26.6 126" stroke={url("limb")} strokeWidth="9" strokeLinecap="round" />
        <path d="M71.8 90 L73.4 126" stroke={url("limb")} strokeWidth="9" strokeLinecap="round" />
        <ellipse cx={handL[0]} cy={handL[1]} rx="5" ry="5.6" fill={url("limb")} />
        <ellipse cx={handR[0]} cy={handR[1]} rx="5" ry="5.6" fill={url("limb")} />

        {/* Tee */}
        <path d={torso} fill={url("top")} />
        <path d="M30 78 C29 83 28.4 87 28 90" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M24 90.6 C27 92.6 30.4 93 33.2 92.2 M76 90.6 C73 92.6 69.6 93 66.8 92.2" stroke={shade(top, -0.22)} strokeWidth="0.9" fill="none" />
        {look.gender === "nonbinary" && (
          <>
            <path d="M46 70 L45 84 M54 70 L55 84" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M38.4 102 H61.6 L61 114 H39 Z" fill={shade(top, -0.1)} />
          </>
        )}

        {has("apron") && (
          <g>
            <path d="M38.6 77 L44 66.4 M61.4 77 L56 66.4" stroke="#eef1f5" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M34.6 97 C30.4 97 28.6 100 30 102.6 M65.4 97 C69.6 97 71.4 100 70 102.6" stroke="#e1e6ed" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M38.6 76 H61.4 L62 92 C64.6 93.4 65.6 95.6 65.6 98 L64.8 128 C64.7 129.6 63.6 130.6 62 130.6 H38 C36.4 130.6 35.3 129.6 35.2 128 L34.4 98 C34.4 95.6 35.4 93.4 38 92 Z" fill={url("apron")} />
            <rect x="44" y="104" width="12" height="9" rx="1.6" fill="none" stroke="#c3c9d3" strokeDasharray="1.2 1" strokeWidth="0.8" />
            <ellipse cx="39.6" cy="100" rx="1.3" ry="6" fill="#fff" opacity="0.9" />
          </g>
        )}

        {neck}
        {neckItems}
        {chest.length > 0 && (
          <>
            <path d={chest.length === 2 ? "M42 68 L40 90 M58 68 L60 90" : "M43 68 L48 90 M57 68 L52 90"} stroke="#3a3a42" strokeWidth="1.1" fill="none" />
            {chest.map((item, i) => (
              <ItemArt key={item} id={item} x={chest.length === 2 ? 30 + i * 22 : 39} y={84} size={chest.length === 2 ? 18 : 22} />
            ))}
          </>
        )}
        <g transform={HEAD_SCALE}>{head}</g>

        {tote && (
          <g>
            <path d="M35 69 L21 112 M38 69 L30.6 112" stroke="#d24a16" strokeWidth="1.8" strokeLinecap="round" />
            <ItemArt id="shopping" x={9} y={104} size={34} />
          </g>
        )}
        {inHand.map((item, i) => {
          const [hx, hy] = handSlots[i]!;
          return <ItemArt key={item} id={item} x={hx - 11} y={hy - 15} size={22} />;
        })}
        {onGround.map((item) => (
          <ItemArt key={item} id={item} x={70} y={168} size={22} />
        ))}
      </svg>
    );
  }

  /* ---------- Bust ---------- */

  const back = (["surfboard", "yogamat", "tent"] as const).filter(has) as ItemId[];
  if (has("cycle") && !helmet) back.push("cycle");
  const front = (["shopping", "boots", "diya", "book"] as const).filter(has) as ItemId[];
  const BACK_SLOTS: Array<[number, number]> = [[-6, 40], [74, 40], [-8, 62]];
  const FRONT_SLOTS: Array<[number, number]> = [[12, 80], [64, 80], [38, 86]];

  const sheet = sheetFor(look);
  const S = 112 / sheet.size; // sheet px → avatar units (the picture is 112 units wide)
  const iw = sheet.size * S;
  const ix = 50 - sheet.faceCx * S;
  const iy = 2;
  const mouthY = iy + sheet.mouth * S;
  // Glasses, bindi, nose pin, earrings and hats are anchored to the eyes measured on each sheet picture:
  // the drawn head has its pupils at (42.4, 45.5) and (57.6, 45.5), 15.2 units apart.
  const eyeX = ix + sheet.eyeCx * S;
  const eyeY = iy + sheet.eyeY * S;
  const ke = ((sheet.eyeR - sheet.eyeL) * S) / 15.2;
  const onFace = `translate(${eyeX.toFixed(2)} ${eyeY.toFixed(2)}) scale(${ke.toFixed(3)}) translate(-50 -45.5)`;
  /** Facial hair drawn around the sheet's own mouth (origin = mouth centre). */
  const atMouth = `translate(${eyeX.toFixed(2)} ${mouthY.toFixed(2)}) scale(${(ke * 0.86).toFixed(3)})`;
  const moustache = <path d="M-7 -2.4 C-5 -5.2 -1.6 -5 0 -3.8 C1.6 -5 5 -5.2 7 -2.4 C4.6 -3.1 2.4 -2.5 0 -2.9 C-2.4 -2.5 -4.6 -3.1 -7 -2.4 Z" fill={url("hair")} />;
  const sheetFacialHair =
    facialHair === "none" ? null : (
      <g transform={atMouth}>
        {facialHair === "stubble" && <path d="M-17 -7 C-16 6 -8 12.5 0 12.5 C8 12.5 16 6 17 -7 C14 2 8 5.6 0 5.6 C-8 5.6 -14 2 -17 -7 Z" fill={url("hair")} opacity="0.28" />}
        {facialHair === "beard" && <path d="M-18.4 -10 C-18.4 8 -8.4 14.6 0 14.6 C8.4 14.6 18.4 8 18.4 -10 C16.4 -2 11.4 3.4 6.4 3 C3 2.6 -3 2.6 -6.4 3 C-11.4 3.4 -16.4 -2 -18.4 -10 Z" fill={url("hair")} />}
        {(facialHair === "moustache" || facialHair === "beard") && moustache}
      </g>
    );
  const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const slope = (target: string, base: readonly number[]) => rgb(target).map((c, i) => (c / Math.max(1, base[i]!)).toFixed(3));
  const hairSlope = sheet.hair ? slope(hair, sheet.hair) : null;
  const picture = (extra?: { mask: string; filter: string }) => (
    <image href={sheet.base} x={ix} y={iy} width={iw} height={iw} mask={extra?.mask} filter={extra?.filter} />
  );

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden style={svgStyle}>
      {defs}
      <defs>
        <clipPath id={id("frame")}>
          <path d={BLOB} />
          <rect x="-40" y="-40" width="180" height="96" />
        </clipPath>
        {sheet.hairMask && hairSlope && (
          <>
            <mask id={id("hairMask")} maskUnits="userSpaceOnUse" x={ix} y={iy} width={iw} height={iw}>
              <image href={sheet.hairMask} x={ix} y={iy} width={iw} height={iw} />
            </mask>
            <filter id={id("hairTone")} colorInterpolationFilters="sRGB">
              <feComponentTransfer>
                <feFuncR type="linear" slope={hairSlope[0]} />
                <feFuncG type="linear" slope={hairSlope[1]} />
                <feFuncB type="linear" slope={hairSlope[2]} />
              </feComponentTransfer>
            </filter>
          </>
        )}
      </defs>
      <path d={BLOB} fill={blob} />
      {back.slice(0, BACK_SLOTS.length).map((item, i) => {
        const [x, y] = BACK_SLOTS[i]!;
        return <ItemArt key={item} id={item} x={x} y={y} size={32} />;
      })}
      <g clipPath={url("frame")}>
        {picture()}
        {sheet.hairMask && hairSlope && picture({ mask: url("hairMask"), filter: url("hairTone") })}
        {has("apron") && (
          <g transform={onFace}>
            <path d="M40 78 H60 L62 104 H38 Z" fill={url("apron")} />
            <rect x="44" y="86" width="12" height="7" rx="1.5" fill="none" stroke="#c3c9d3" strokeDasharray="1.2 1" strokeWidth="0.8" />
            <path d="M40 78 L44 70 M60 78 L56 70" stroke="#eef1f5" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </g>
      {sheetFacialHair}
      <g transform={onFace}>
        {neckItems}
        {headwear}
        {extrasArt}
      </g>
      {front.slice(0, FRONT_SLOTS.length).map((item, i) => {
        const [x, y] = FRONT_SLOTS[i]!;
        return <ItemArt key={item} id={item} x={x} y={y} size={24} />;
      })}
    </svg>
  );
}

