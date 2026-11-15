import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { AgentMark } from "@/ui";
import { duration, ease } from "@/styles/motion";
import styles from "./ThinkingSteps.module.css";

const STEPS = [
  "Thinking about your dates…",
  "Calculating budgets, privately…",
  "Pondering food and access needs…",
  "Visualising the best fits…",
] as const;
const STEP_MS = 800;

/** The agent shows its work instead of a spinner. Never mentions names or numbers. */
export function ThinkingSteps() {
  const [shown, setShown] = useState(1);
  useEffect(() => {
    const id = window.setInterval(() => setShown((n) => Math.min(STEPS.length, n + 1)), STEP_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <ol className={styles.list} aria-live="polite">
      {STEPS.slice(0, shown).map((step, i) => (
        <motion.li
          key={step}
          className={styles.step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
        >
          <span className={i < shown - 1 ? styles.done : styles.now} aria-hidden>
            {i < shown - 1 ? "✓" : <AgentMark size={10} label="" />}
          </span>
          {step}
        </motion.li>
      ))}
    </ol>
  );
}
