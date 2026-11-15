import { useState } from "react";
import type { Place } from "@/domain";
import { Sheet } from "@/ui";
import styles from "./BeenThereLink.module.css";

/** "Been there" reviews as a link that opens the place's review repository. */
export function BeenThereLink({ place }: { place: Place }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a
        className={styles.link}
        href={`#reviews-${place.id}`}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        Read {place.verifiedCount} Been-there reviews ↗
      </a>
      <Sheet open={open} title={`Been there · ${place.name}`} onClose={() => setOpen(false)}>
        <p className={styles.sub}>{place.verifiedCount} reviews from verified Cleartrip trips. Praise and warnings are shown side by side, never averaged.</p>
        <ul className={styles.list}>
          {place.notes.map((n) => (
            <li key={n.text} className={styles.note}>
              <b className={n.kind === "verdict" ? styles.good : styles.warn}>{n.kind === "verdict" ? "Loved" : "Skip"}</b>
              <p>{n.text}</p>
              <span>{n.context}</span>
            </li>
          ))}
        </ul>
        <p className={styles.sample}>Sample reviews for the prototype. On Cleartrip this would open the full review page.</p>
      </Sheet>
    </>
  );
}
