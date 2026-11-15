import type { FairnessRow } from "@/domain";
import { useAppSelector } from "@/app/hooks";
import { PersonAvatar } from "@/ui";
import styles from "./FairnessStrip.module.css";

/** Each avatar with a heart count for the moments that serve them. Zero gets a gentle nudge. */
export function FairnessStrip({ rows, latest }: { rows: readonly FairnessRow[]; latest?: string }) {
  const left = rows.filter((r) => r.hearts === 0);
  const members = useAppSelector((s) => s.group.members.entities);
  return (
    <section className={styles.wrap} aria-label="Fairness">
      <ul className={styles.row}>
        {rows.map((r) => (
          <li key={r.memberId} className={styles.person}>
            <span className={r.hearts === 0 ? styles.ringZero : styles.ring}>
              <PersonAvatar name={r.name} size={32} look={members[r.memberId]?.avatar.look} />
            </span>
            <span className={styles.name}>{r.name}</span>
            <span className={styles.hearts}>♥ {r.hearts}</span>
          </li>
        ))}
      </ul>
      {left.length > 0 && (
        <p className={styles.nudge}>
          {left.map((r) => r.name).join(" and ")} {left.length === 1 ? "has" : "have"} no ♥ yet. Fill a gap below ↓
        </p>
      )}
      {latest && <p className={styles.latest}>Latest: {latest}</p>}
    </section>
  );
}
