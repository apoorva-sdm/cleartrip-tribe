import { Money, type RankedPlace } from "@/domain";
import { BeenThereLink } from "@/features/match";
import styles from "./VoteCard.module.css";

interface VoteCardProps {
  ranked: RankedPlace;
  nights: number;
  loves: number;
  vetoed: boolean;
  canAddLove: boolean;
  onLove: (delta: 1 | -1) => void;
  onVeto: () => void;
}

/** A place to vote on, with Been-there notes side by side (praise and warning, not averaged). */
export function VoteCard({ ranked, nights, loves, vetoed, canAddLove, onLove, onVeto }: VoteCardProps) {
  const { place, cost, overBy } = ranked;
  const verdict = place.notes.find((n) => n.kind === "verdict");
  const skip = place.notes.find((n) => n.kind === "skip");
  return (
    <article className={[styles.card, vetoed && styles.vetoed].filter(Boolean).join(" ")}>
      <header className={styles.head}>
        <div>
          <h3 className={styles.name}>{place.name}</h3>
          <p className={styles.region}>{place.region}</p>
        </div>
        <div className={styles.price}>
          <b>{Money.format(cost)}</b>
          <span>each · {nights}N</span>
        </div>
      </header>
      {overBy !== undefined && <p className={styles.over}>{Money.format(overBy)} over budget</p>}

      <div className={styles.notes} aria-label={`Been there · ${place.verifiedCount} verified`}>
        {verdict && (
          <p className={styles.note}>
            <b className={styles.good}>Loved</b>
            {verdict.text}
          </p>
        )}
        {skip && (
          <p className={styles.note}>
            <b className={styles.warn}>Skip</b>
            {skip.text.replace(/^Skip /, "")}
          </p>
        )}
      </div>
      <BeenThereLink place={place} />

      <footer className={styles.controls}>
        <div className={styles.loves} role="group" aria-label={`Loves for ${place.name}`}>
          <button type="button" className={styles.step} aria-label="Remove a love" disabled={loves === 0} onClick={() => onLove(-1)}>
            −
          </button>
          <span className={styles.hearts} aria-live="polite">
            {[0, 1, 2].map((i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 24 24" aria-hidden className={i < loves ? styles.on : styles.off}>
                <path d="M12 20s-7-4.4-9.2-8.6C1.4 8.6 3.2 5 6.6 5c2 0 3.4 1.1 4.4 2.6C12 6.1 13.4 5 15.4 5c3.4 0 5.2 3.6 3.8 6.4C19 15.6 12 20 12 20z" />
              </svg>
            ))}
            <span className="sr-only">{loves} loves</span>
          </span>
          <button type="button" className={styles.step} aria-label="Add a love" disabled={!canAddLove || vetoed} onClick={() => onLove(1)}>
            +
          </button>
        </div>
        <button type="button" className={vetoed ? styles.vetoOn : styles.veto} aria-pressed={vetoed} onClick={onVeto}>
          {vetoed ? "Vetoed" : "Veto"}
        </button>
      </footer>
    </article>
  );
}
