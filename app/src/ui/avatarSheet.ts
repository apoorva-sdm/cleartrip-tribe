import type { AvatarLook, HairStyle } from "@/domain";
import meta from "./avatar-sheet.json";

/**
 * The avatars are the front views cut from the two character sheets (women's and men's), one per hairstyle,
 * cleaned up and stored at 384 px. Each has a skin mask and (when hair shows) a hair mask, so skin tone
 * and hair colour can tint the picture. Measurements are in the sheet's own pixels (size = crop width):
 * face centre, chin and mouth rows (mouth checked by eye), face width with ears, average colours.
 */
const files = import.meta.glob<string>("../assets/avatars/*.png", { eager: true, import: "default", query: "?url" });
const file = (name: string) => files[`../assets/avatars/${name}.png`];

export interface SheetAvatar {
  base: string;
  skinMask: string;
  hairMask?: string;
  size: number;
  faceCx: number;
  chin: number;
  mouth: number;
  /** Pupil centres (x) and their shared row (y), and the point between them. */
  eyeL: number;
  eyeR: number;
  eyeY: number;
  eyeCx: number;
  faceW: number;
  skin: [number, number, number];
  hair: [number, number, number] | null;
}

type Measure = Omit<SheetAvatar, "base" | "skinMask" | "hairMask">;
type Set = "women" | "men";

const build = (set: Set): Partial<Record<HairStyle, SheetAvatar>> =>
  Object.fromEntries(
    Object.entries((meta as unknown as Record<Set, Record<string, Measure>>)[set]).map(([style, m]) => [
      style,
      { ...m, base: file(`${set}-${style}`)!, skinMask: file(`${set}-${style}-skin`)!, hairMask: file(`${set}-${style}-hair`) },
    ]),
  );

const SHEETS: Record<Set, Partial<Record<HairStyle, SheetAvatar>>> = { women: build("women"), men: build("men") };

/** Women use the women's sheet; men and non-binary the men's (hijab always comes from the women's sheet). */
export function sheetFor(look: Pick<AvatarLook, "gender" | "hair">): SheetAvatar {
  const first: Set = look.gender === "woman" ? "women" : "men";
  const other: Set = first === "women" ? "men" : "women";
  return SHEETS[first][look.hair] ?? SHEETS[other][look.hair] ?? SHEETS[first].short!;
}
