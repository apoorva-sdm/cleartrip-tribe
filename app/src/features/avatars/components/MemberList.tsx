import { AnimatePresence, motion } from "motion/react";
import { LOADOUT_SIZE, type Member, type PendingMember } from "@/domain";
import { PersonAvatar, Skeleton } from "@/ui";
import { spring } from "@/styles/motion";
import { ItemIcon } from "./ItemIcon";
import styles from "./MemberList.module.css";

interface MemberListProps {
  members: readonly Member[];
  meId: string | null;
  /** Friends still building, by name, with how far they've got. */
  pending: readonly PendingMember[];
  nudgedIds: readonly string[];
  /** Nudging is off once picks are closed. */
  onNudge?: (p: PendingMember) => void;
  loading: boolean;
}

/** Who's in, and who's still building their avatar (with a one-tap nudge each). */
export function MemberList({ members, meId, pending, nudgedIds, onNudge, loading }: MemberListProps) {
  if (loading) {
    return (
      <ul className={styles.list} aria-busy="true" aria-label="Loading the group">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className={styles.row}>
            <Skeleton width={40} height={40} round />
            <Skeleton width={120} height={14} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={styles.list}>
      <AnimatePresence initial={false}>
        {members.map((m) => (
          <motion.li
            key={m.id}
            layout
            className={styles.row}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, transition: spring.soft }}
          >
            <PersonAvatar name={m.name} look={m.avatar.look} />
            <div className={styles.who}>
              <span className={styles.name}>
                {m.name}
                {m.id === meId && <span className={styles.you}>You</span>}
              </span>
              <span className={styles.ready}>Ready ✓</span>
            </div>
            <span className={styles.picks} aria-label={`${m.avatar.items.length} picks`}>
              {m.avatar.items.map((id) => (
                <ItemIcon key={id} id={id} size={18} />
              ))}
            </span>
          </motion.li>
        ))}
        {pending.map((p) => {
          const nudged = nudgedIds.includes(p.id);
          return (
            <motion.li key={p.id} layout className={styles.row} exit={{ opacity: 0 }}>
              <span className={styles.open} aria-hidden>{p.name.charAt(0)}</span>
              <div className={styles.who}>
                <span className={styles.name}>{p.name}</span>
                <span className={styles.building}>
                  <span className={styles.meter} aria-hidden>
                    {Array.from({ length: LOADOUT_SIZE }, (_, i) => (
                      <i key={i} className={i < p.picksDone ? styles.meterOn : undefined} />
                    ))}
                  </span>
                  {nudged ? "Nudged · finishing up…" : `Building · ${p.picksDone}/${LOADOUT_SIZE}`}
                </span>
              </div>
              {onNudge && (
                <button type="button" className={nudged ? styles.nudged : styles.nudge} disabled={nudged} onClick={() => onNudge(p)}>
                  {nudged ? "Nudged ✓" : "Nudge 👋"}
                </button>
              )}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
