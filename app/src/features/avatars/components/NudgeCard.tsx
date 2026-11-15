import { AnimatePresence, motion } from "motion/react";
import { useAppSelector } from "@/app/hooks";
import { AgentMark, Skeleton } from "@/ui";
import { duration, ease } from "@/styles/motion";
import { selectNudge } from "../selectors";
import styles from "./NudgeCard.module.css";

const fade = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: duration.quick } },
};

/** Avatars · Nudge in chat. Shows the reminder the agent writes; the actions live in the bottom bar. */
export function NudgeCard() {
  const nudge = useAppSelector(selectNudge);

  return (
    <section className={styles.card} aria-labelledby="nudge-h" aria-live="polite">
      <h2 id="nudge-h" className={styles.h2}>
        <AgentMark /> Or nudge everyone at once
      </h2>
      <AnimatePresence mode="wait">
        {nudge.kind === "idle" && (
          <motion.p key="idle" {...fade} className={styles.sub}>
            Tribe writes one friendly message for the group. No names, no pressure.
          </motion.p>
        )}
        {nudge.kind === "composing" && (
          <motion.div key="composing" {...fade} className={styles.thinking}>
            <p className={styles.sub}>Thinking up a friendly nudge…</p>
            <Skeleton height={12} />
            <Skeleton height={12} width="80%" />
            <Skeleton height={12} width="55%" />
          </motion.div>
        )}
        {(nudge.kind === "ready" || nudge.kind === "sent") && (
          <motion.div key="ready" {...fade}>
            <p className={styles.message}>{nudge.text}</p>
            {nudge.kind === "sent" && <p className={styles.sent}>Sent! Your friends will show up here as they finish.</p>}
          </motion.div>
        )}
        {nudge.kind === "error" && (
          <motion.p key="error" {...fade} className={styles.error} role="alert">
            {nudge.message}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}
