import styles from "./BookSteps.module.css";

const STEPS = ["Travel", "Stay", "Activities", "Review"] as const;

/** Four bars that turn green as you move through the (optional) booking steps. */
export function BookStepper({ at }: { at: (typeof STEPS)[number] }) {
  const index = STEPS.indexOf(at);
  return (
    <ol className={styles.bars} aria-label={`Booking step ${index + 1} of ${STEPS.length}: ${at}`}>
      {STEPS.map((s, i) => (
        <li key={s} className={i <= index ? styles.barOn : styles.bar} aria-current={i === index ? "step" : undefined} title={s} />
      ))}
    </ol>
  );
}
