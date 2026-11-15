import {
  FACIAL_HAIR,
  GENDERS,
  HAIR_COLOURS,
  hairStylesFor,
  LOOK_EXTRAS,
  type AvatarLook,
  type Gender,
  type HairStyle,
  type LookExtra,
} from "@/domain";
import { AvatarFace, ChoiceChip, HAIR_SWATCH } from "@/ui";
import styles from "./LookPicker.module.css";

const GENDER_LABEL: Record<Gender, string> = {
  woman: "Woman",
  man: "Man",
  nonbinary: "Non-binary",
};
const HAIR_LABEL: Record<HairStyle, string> = {
  short: "Short",
  sidepart: "Side part",
  curly: "Curly",
  bun: "Bun",
  braid: "Braid",
  bob: "Bob",
  long: "Long",
  buzz: "Buzz",
  fade: "Fade",
  turban: "Turban",
  hijab: "Hijab",
};
const FACIAL_LABEL: Record<AvatarLook["facialHair"], string> = {
  none: "None",
  stubble: "Stubble",
  moustache: "Moustache",
  beard: "Beard",
};
const EXTRA_LABEL: Record<LookExtra, string> = {
  glasses: "Glasses",
  bindi: "Bindi",
  nosepin: "Nose pin",
  jhumkas: "Jhumkas",
};

/** A sensible starting point when gender changes. Everything stays changeable. */
const GENDER_START: Record<Gender, Partial<AvatarLook>> = {
  woman: { hair: "braid", facialHair: "none" },
  man: { hair: "short", facialHair: "none" },
  nonbinary: { hair: "curly", facialHair: "none" },
};

interface LookPickerProps {
  look: AvatarLook;
  seed: string;
  onChange: (look: AvatarLook) => void;
}

/** Style tab of the avatar builder: who you are, at a glance. Never used for ranking. */
export function LookPicker({ look, seed, onChange }: LookPickerProps) {
  const set = (patch: Partial<AvatarLook>) => onChange({ ...look, ...patch });
  const toggleExtra = (x: LookExtra) =>
    set({
      extras: look.extras.includes(x)
        ? look.extras.filter((e) => e !== x)
        : [...look.extras, x],
    });
  const covered = look.hair === "turban" || look.hair === "hijab";

  return (
    <div className={styles.wrap}>
      <section aria-labelledby="g-h">
        <h2 id="g-h" className={styles.h2}>
          I'm a
        </h2>
        <div className={styles.chips} role="radiogroup" aria-labelledby="g-h">
          {GENDERS.map((g) => (
            <ChoiceChip
              key={g}
              mode="radio"
              selected={look.gender === g}
              onClick={() => set({ gender: g, ...GENDER_START[g] })}
            >
              {GENDER_LABEL[g]}
            </ChoiceChip>
          ))}
        </div>
      </section>

      <section aria-labelledby="h-h">
        <h2 id="h-h" className={styles.h2}>
          Hair
        </h2>
        <div
          className={styles.hairGrid}
          role="radiogroup"
          aria-labelledby="h-h"
        >
          {hairStylesFor(look.gender).map((h) => (
            <button
              key={h}
              type="button"
              role="radio"
              aria-checked={look.hair === h}
              aria-label={HAIR_LABEL[h]}
              className={look.hair === h ? styles.hairOn : styles.hair}
              onClick={() => set({ hair: h })}
            >
              <AvatarFace
                look={{ ...look, hair: h, extras: [], facialHair: "none" }}
                seed={seed}
                size={44}
              />
              <span>{HAIR_LABEL[h]}</span>
            </button>
          ))}
        </div>
      </section>

      {!covered && (
        <section aria-labelledby="c-h">
          <h2 id="c-h" className={styles.h2}>
            Hair colour
          </h2>
          <div
            className={styles.swatches}
            role="radiogroup"
            aria-labelledby="c-h"
          >
            {HAIR_COLOURS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={look.hairColour === c}
                aria-label={c === "darkbrown" ? "dark brown" : c}
                className={
                  look.hairColour === c ? styles.swatchOn : styles.swatch
                }
                style={{ background: HAIR_SWATCH[c] }}
                onClick={() => set({ hairColour: c })}
              />
            ))}
          </div>
        </section>
      )}

      {look.gender !== "woman" && (
        <section aria-labelledby="f-h">
          <h2 id="f-h" className={styles.h2}>
            Facial hair
          </h2>
          <div className={styles.chips} role="radiogroup" aria-labelledby="f-h">
            {FACIAL_HAIR.map((f) => (
              <ChoiceChip
                key={f}
                mode="radio"
                selected={look.facialHair === f}
                onClick={() => set({ facialHair: f })}
              >
                {FACIAL_LABEL[f]}
              </ChoiceChip>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="x-h">
        <h2 id="x-h" className={styles.h2}>
          Extras
        </h2>
        <div className={styles.chips}>
          {LOOK_EXTRAS.map((x) => (
            <ChoiceChip
              key={x}
              selected={look.extras.includes(x)}
              onClick={() => toggleExtra(x)}
            >
              {EXTRA_LABEL[x]}
            </ChoiceChip>
          ))}
        </div>
      </section>
    </div>
  );
}
