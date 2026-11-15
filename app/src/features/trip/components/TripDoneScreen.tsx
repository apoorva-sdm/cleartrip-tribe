import { motion } from "motion/react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { getItemInfo } from "@/domain";
import { ItemIcon } from "@/features/avatars";
import { AgentMark, Button, PhoneShell, ScreenTitle } from "@/ui";
import { spring } from "@/styles/motion";
import styles from "./TripDoneScreen.module.css";

/** Trip · Avatars learn → Repository grows. */
export function TripDoneScreen() {
  const navigate = useNavigate();
  const learned = useAppSelector((s) => s.live.learned);
  const place = useAppSelector((s) => s.decide.locked?.place);
  if (!learned || !place) return <Navigate to="/tribe/trip/learn" replace />;

  return (
    <PhoneShell stage="Trip" backTo="/tribe/trip/learn" footer={<Button block onClick={() => navigate("/")}>Back to Cleartrip home</Button>}>
      <ScreenTitle title="That's a wrap!" />
      <motion.section className={styles.card} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: spring.soft }}>
        <p className={styles.tag}>
          <AgentMark size={10} /> Been there grows
        </p>
        <p className={styles.big}>{learned.notesAdded} notes added</p>
        <p className={styles.sub}>
          Verified notes for {place.name}. Groups like yours will see them when they shortlist.
        </p>
      </motion.section>
      <motion.section className={styles.card} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { ...spring.soft, delay: 0.15 } }}>
        <p className={styles.tag}>Your avatar learned</p>
        {learned.somedayAdded.length > 0 ? (
          <>
            <ul className={styles.items}>
              {learned.somedayAdded.map((id) => (
                <li key={id}>
                  <ItemIcon id={id} size={20} />
                  {getItemInfo(id).meaning}
                </li>
              ))}
            </ul>
            <p className={styles.sub}>Things you loved go to your Someday wardrobe for future trips.</p>
          </>
        ) : (
          <p className={styles.sub}>Nothing marked as loved this time. Your Someday wardrobe stays as it was.</p>
        )}
      </motion.section>
    </PhoneShell>
  );
}
