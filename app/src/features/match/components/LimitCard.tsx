import { motion } from "motion/react";
import type { LimitExplanation } from "@/domain";
import { AgentMark } from "@/ui";
import { duration, ease } from "@/styles/motion";
import styles from "./LimitCard.module.css";

/** "Name the limit": the binding constraint and levers. Nobody named. */
export function LimitCard({ limit }: { limit: LimitExplanation }) {
  return (
    <motion.section
      className={styles.card}
      aria-labelledby="limit-h"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
    >
      <p className={styles.tag}>
        <AgentMark size={10} /> The limit
      </p>
      <h2 id="limit-h" className={styles.h2}>
        {limit.headline}
      </h2>
      <p className={styles.detail}>{limit.detail}</p>
      {limit.levers.length > 0 && (
        <>
          <h3 className={styles.h3}>What would open things up</h3>
          <ul className={styles.levers}>
            {limit.levers.map((lever) => (
              <li key={lever}>{lever}</li>
            ))}
          </ul>
        </>
      )}
    </motion.section>
  );
}
