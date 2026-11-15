import { AnimatePresence, motion } from "motion/react";
import { duration, ease } from "@/styles/motion";
import styles from "./Toast.module.css";

interface ToastProps {
  message: string | null;
}

/** Bottom toast inside the phone. Polite live region. */
export function Toast({ message }: ToastProps) {
  return (
    <div className={styles.region} aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            className={styles.toast}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
            exit={{ opacity: 0, y: 8, transition: { duration: duration.quick, ease: ease.in } }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
