import { motion } from "motion/react";
import type { AvatarItemInfo } from "@/domain";
import { duration } from "@/styles/motion";
import { ItemIcon } from "./ItemIcon";
import styles from "./ItemTile.module.css";

interface ItemTileProps {
  item: AvatarItemInfo;
  selected: boolean;
  onToggle: () => void;
}

/** A wardrobe item that says what it means. Selected = ink border and a check, not a colour fill. */
export function ItemTile({ item, selected, onToggle }: ItemTileProps) {
  return (
    <motion.button
      type="button"
      className={[styles.tile, selected && styles.on].filter(Boolean).join(" ")}
      aria-pressed={selected}
      onClick={onToggle}
      whileTap={{ scale: 0.96, transition: { duration: duration.tap } }}
    >
      {selected && (
        <span className={styles.check} aria-hidden>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="1.6">
            <path d="M2 5.2l2 2 4-4.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      <ItemIcon id={item.id} size={40} />
      <span className={styles.label}>{item.label}</span>
      <span className={styles.meaning}>{item.meaning}</span>
    </motion.button>
  );
}
