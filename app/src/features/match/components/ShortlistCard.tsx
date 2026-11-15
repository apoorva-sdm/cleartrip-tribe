import { motion } from "motion/react";
import { Money, getItemInfo, type RankedPlace } from "@/domain";
import { ItemIcon } from "@/features/avatars";
import { AgentMark, PlacePhoto } from "@/ui";
import { duration, ease } from "@/styles/motion";
import { BeenThereLink } from "./BeenThereLink";
import styles from "./ShortlistCard.module.css";

interface ShortlistCardProps {
  ranked: RankedPlace;
  rank: number;
  nights: number;
}

/** One of the three: who it fits and why (counts, never names), price, and Been-there notes. */
export function ShortlistCard({ ranked, rank, nights }: ShortlistCardProps) {
  const { place, cost, coverage, leastHappy, overBy } = ranked;
  const verdict = place.notes.find((n) => n.kind === "verdict");

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.08 * rank, duration: duration.base, ease: ease.out } }}
    >
      <PlacePhoto placeId={place.id} name={place.name} className={styles.photo} />
      <header className={styles.head}>
        <span className={styles.rank}>{rank}</span>
        <div className={styles.name}>
          <h3>{place.name}</h3>
          <p>{place.region}</p>
        </div>
        <div className={styles.price}>
          <b>{Money.format(cost)}</b>
          <span>
            each · {nights}N
          </span>
        </div>
      </header>
      {overBy !== undefined && <p className={styles.over}>{Money.format(overBy)} over budget · added so you have 3 to pick from</p>}

      <ul className={styles.fits} aria-label="Who it fits">
        {coverage.slice(0, 4).map((c) => (
          <li key={c.itemId} title={getItemInfo(c.itemId).meaning}>
            <ItemIcon id={c.itemId} size={22} />
            <b>×{c.count}</b>
          </li>
        ))}
      </ul>

      <p className={styles.why}>
        <AgentMark size={10} />
        {leastHappy >= 1 ? `Everyone gets ${leastHappy}+ of their picks` : "Not everyone's picks are here"}
      </p>

      {verdict && (
        <p className={styles.note}>
          “{verdict.text}”
        </p>
      )}
      <BeenThereLink place={place} />
    </motion.article>
  );
}
