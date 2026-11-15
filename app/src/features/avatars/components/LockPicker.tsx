import { motion } from "motion/react";
import { getItemInfo, type ItemId } from "@/domain";
import { duration, ease } from "@/styles/motion";
import { ItemIcon } from "./ItemIcon";
import { LockIcon } from "./LockIcon";
import styles from "./LockPicker.module.css";

interface LockPickerProps {
  items: readonly ItemId[];
  lockedItemId: ItemId | null;
  onLock: (id: ItemId) => void;
}

/** Choose the one pick you won't give up. */
export function LockPicker({ items, lockedItemId, onLock }: LockPickerProps) {
  return (
    <motion.section
      className={styles.wrap}
      aria-labelledby="lock-h"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
      exit={{ opacity: 0, transition: { duration: duration.quick } }}
    >
      <h2 id="lock-h" className={styles.h2}>Which one can't you live without?</h2>
      <p className={styles.sub}>Tribe will try hardest to make this happen.</p>
      <div className={styles.row} role="radiogroup" aria-labelledby="lock-h">
        {items.map((id) => {
          const on = lockedItemId === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              className={[styles.chip, on && styles.on].filter(Boolean).join(" ")}
              onClick={() => onLock(id)}
            >
              <ItemIcon id={id} size={22} />
              <span>{getItemInfo(id).label}</span>
              <LockIcon size={12} open={!on} />
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
