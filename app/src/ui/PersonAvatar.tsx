import type { AvatarLook, ItemId } from "@/domain";
import { AvatarFace } from "./AvatarFace";
import styles from "./PersonAvatar.module.css";

interface PersonAvatarProps {
  name: string;
  size?: number;
  faded?: boolean;
  /** Draws the illustrated avatar when known; otherwise the initial. */
  look?: AvatarLook;
  /** Trip picks to show on the avatar (at larger sizes). */
  items?: readonly ItemId[];
  variant?: "bust" | "full";
}

export function PersonAvatar({ name, size = 40, faded = false, look, items, variant }: PersonAvatarProps) {
  if (look) return <AvatarFace look={look} seed={name} items={items} size={size} faded={faded} variant={variant} />;
  return (
    <span
      className={[styles.avatar, faded && styles.faded].filter(Boolean).join(" ")}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
