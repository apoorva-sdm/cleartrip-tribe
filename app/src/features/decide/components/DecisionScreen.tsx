import { motion } from "motion/react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { formatDay } from "@/domain";
import { AgentMark, Button, PhoneShell, ScreenTitle } from "@/ui";
import { duration, ease, spring } from "@/styles/motion";
import { selectDecision, selectLocked, selectShortlist } from "../selectors";
import styles from "./DecisionScreen.module.css";

/** Decide · Tie? → Fairness tie-break → Place locked. Counts only; never who voted how. */
export function DecisionScreen() {
  const navigate = useNavigate();
  const decision = useAppSelector(selectDecision);
  const locked = useAppSelector(selectLocked);
  const shortlist = useAppSelector(selectShortlist);
  if (!decision || !locked) return <Navigate to="/tribe/vote" replace />;

  const nameOf = (id: string) => shortlist.find((r) => r.place.id === id)?.place.name ?? id;
  const maxLoves = Math.max(1, ...decision.tallies.map((t) => t.loves));
  const first = locked.days[0];
  const last = locked.days[locked.days.length - 1];

  return (
    <PhoneShell stage="Decide" backTo="/tribe/vote" footer={<Button block onClick={() => navigate("/tribe/plan")}>Next: Plan the days</Button>}>
      <ScreenTitle title="Your tribe has picked a place" />

      <ul className={styles.tally} aria-label="Votes">
        {decision.tallies.map((t, i) => (
          <li key={t.placeId} className={styles.row}>
            <span className={styles.place}>{nameOf(t.placeId)}</span>
            <span className={styles.barTrack}>
              <motion.span
                className={t.placeId === decision.placeId ? styles.barWin : styles.bar}
                initial={{ width: 0 }}
                animate={{ width: `${(t.loves / maxLoves) * 100}%`, transition: { delay: 0.15 * i, duration: duration.reveal, ease: ease.out } }}
              />
            </span>
            <span className={styles.count}>
              {t.loves} ♥{t.vetoes > 0 && <em> · {t.vetoes} veto{t.vetoes > 1 ? "es" : ""}</em>}
            </span>
          </li>
        ))}
      </ul>

      {decision.kind === "tie-break" && (
        <motion.section
          className={styles.tie}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: duration.base } }}
        >
          <p className={styles.tieTag}>
            <AgentMark size={10} /> Fairness tie-break
          </p>
          <p className={styles.tieText}>
            Tie between {decision.tiedPlaceIds.map(nameOf).join(" and ")}. {nameOf(decision.placeId)} wins: it leaves nobody out.
          </p>
        </motion.section>
      )}

      <motion.section
        className={styles.locked}
        aria-labelledby="locked-h"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1, transition: { delay: 0.8, ...spring.soft } }}
      >
        <p className={styles.lockTag}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <rect x="2" y="5.5" width="8" height="5.5" rx="1.2" />
            <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" />
          </svg>
          Place locked
        </p>
        <h2 id="locked-h" className={styles.lockName}>
          {locked.place.name}
        </h2>
        <p className={styles.lockDates}>
          {first && formatDay(first)}
          {last && last !== first && ` – ${formatDay(last)}`} · {locked.nights} {locked.nights === 1 ? "night" : "nights"}
        </p>
        <p className={styles.lockNote}>These are the days everyone can make.</p>
      </motion.section>
    </PhoneShell>
  );
}
