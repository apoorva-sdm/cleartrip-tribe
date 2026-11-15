import { motion } from "motion/react";
import { Money, type Paise } from "@/domain";
import { Field } from "@/ui";
import { duration, ease } from "@/styles/motion";
import styles from "./RaiseCapCard.module.css";

interface RaiseCapCardProps {
  currentCap: Paise;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

/** Trip starter only: raise the group cap from "Name the limit". */
export function RaiseCapCard({ currentCap, value, error, onChange }: RaiseCapCardProps) {
  return (
    <motion.section
      className={styles.card}
      aria-labelledby="raise-h"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.12, duration: duration.base, ease: ease.out } }}
    >
      <h2 id="raise-h" className={styles.h2}>
        You started this trip
      </h2>
      <p className={styles.sub}>
        Raise the group cap from {Money.format(currentCap)} and Tribe will look again. Your own budget goes up to match. Everyone sees
        the new cap.
      </p>
      <Field
        label="New group cap per person"
        prefix="₹"
        inputMode="numeric"
        value={value}
        error={error}
        onChange={(e) => onChange(e.target.value)}
      />
    </motion.section>
  );
}
