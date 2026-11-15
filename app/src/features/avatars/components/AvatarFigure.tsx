import { AnimatePresence, motion } from "motion/react";
import type { Avatar } from "@/domain";
import { PersonAvatar } from "@/ui";
import { spring } from "@/styles/motion";
import { ItemIcon } from "./ItemIcon";
import { LockIcon } from "./LockIcon";
import styles from "./AvatarFigure.module.css";

interface AvatarFigureProps {
  name: string;
  avatar: Avatar;
  size?: number;
  faded?: boolean;
  /** Show the picks as small badges too (off where they're drawn big on the avatar). */
  badges?: boolean;
  variant?: "bust" | "full";
}

/** Placeholder avatar with its equipped items beneath. Locked item carries a padlock. */
export function AvatarFigure({ name, avatar, size = 96, faded = false, badges = true, variant }: AvatarFigureProps) {
  const small = size < 70;
  const badge = small ? 20 : Math.max(24, Math.round(size * 0.26));
  return (
    <div className={styles.figure}>
      <PersonAvatar name={name || "?"} size={size} faded={faded} look={avatar.look} items={avatar.items} variant={variant} />
      {badges && (
      <ul className={small ? styles.itemsTight : styles.items} style={{ minHeight: badge }} aria-label="Picks">
        <AnimatePresence initial={false}>
          {avatar.items.map((id) => (
            <motion.li
              key={id}
              layout
              className={avatar.lockedItemId === id ? `${styles.badge} ${styles.lockedBadge}` : styles.badge}
              style={{ width: badge, height: badge }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: spring.pop }}
              exit={{ scale: 0.85, opacity: 0, transition: { duration: 0.14 } }}
            >
              <ItemIcon id={id} size={Math.round(badge * 0.6)} />
              {avatar.lockedItemId === id && !small && (
                <span className={styles.lock}>
                  <LockIcon size={9} />
                </span>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      )}
    </div>
  );
}
