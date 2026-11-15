import { AnimatePresence, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { duration, ease } from "@/styles/motion";
import styles from "./Sheet.module.css";

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Bottom sheet inside the phone frame (mobile pattern instead of a modal). */
export function Sheet({ open, title, onClose, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className={styles.layer}>
          <motion.button
            type="button"
            aria-label="Close"
            className={styles.scrim}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={styles.panel}
            initial={{ y: "100%" }}
            animate={{ y: 0, transition: { duration: duration.base, ease: ease.out } }}
            exit={{ y: "100%", transition: { duration: duration.quick, ease: ease.in } }}
          >
            <span className={styles.grip} aria-hidden />
            <h2 className={styles.title}>{title}</h2>
            {children}
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}
