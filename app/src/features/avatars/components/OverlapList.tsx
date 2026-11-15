import { motion } from "motion/react";
import { getItemInfo, type Overlap } from "@/domain";
import { AgentMark } from "@/ui";
import { duration, ease, spring } from "@/styles/motion";
import { ItemIcon } from "./ItemIcon";
import styles from "./OverlapList.module.css";

interface OverlapListProps {
  overlaps: readonly Overlap[];
  /** Seconds to wait before appearing (after the flip). */
  delay: number;
}

const STAGGER = 0.05;

/** Shared picks as tiles with a vote count. Never who. */
export function OverlapList({ overlaps, delay }: OverlapListProps) {
  const top = overlaps[0]?.count ?? 0;
  return (
    <motion.section
      className={styles.wrap}
      aria-labelledby="overlap-h"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay, duration: duration.base, ease: ease.out } }}
    >
      <h2 id="overlap-h" className={styles.h2}>
        <AgentMark /> What you all love
      </h2>
      {overlaps.length === 0 ? (
        <p className={styles.empty}>No shared picks yet. That's fine: everyone gets a moment.</p>
      ) : (
        <ul className={styles.tiles}>
          {overlaps.map((o, i) => (
            <motion.li
              key={o.itemId}
              className={o.count === top ? styles.tileTop : styles.tile}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: delay + 0.15 + Math.min(i, 8) * STAGGER, ...spring.soft } }}
            >
              <span className={styles.votes} aria-label={`${o.count} votes`}>
                {o.count}
              </span>
              <ItemIcon id={o.itemId} size={40} />
              <span className={styles.label}>{getItemInfo(o.itemId).meaning}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
