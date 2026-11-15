import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { NEUTRAL_AVATAR, defaultedCount, getItemInfo } from "@/domain";
import { AgentMark, Button, PhoneShell, ScreenTitle } from "@/ui";
import { duration, ease } from "@/styles/motion";
import { useReadiness } from "../hooks/useReadiness";
import { selectMembers, selectOverlaps } from "../selectors";
import { AvatarFigure } from "./AvatarFigure";
import { ItemIcon } from "./ItemIcon";
import { OverlapList } from "./OverlapList";
import styles from "./RevealScreen.module.css";

const FLIP_DELAY_MS = 500;

/** Avatars · Reveal together: everyone at once, overlaps with no names. */
export function RevealScreen() {
  const members = useAppSelector(selectMembers);
  const overlaps = useAppSelector(selectOverlaps);
  const readiness = useReadiness();
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState(Boolean(reduceMotion));

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(() => setFlipped(true), FLIP_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  const defaulted = readiness ? defaultedCount(readiness) : 0;
  const cards = [
    // Only each person's must-have is shown, so the reveal stays clean.
    ...members.map((m) => ({
      key: m.id,
      name: m.name,
      avatar: { ...m.avatar, items: m.avatar.lockedItemId ? [m.avatar.lockedItemId] : [] },
      faded: false,
    })),
    ...Array.from({ length: defaulted }, (_, i) => ({ key: `default-${i}`, name: "?", avatar: NEUTRAL_AVATAR, faded: true })),
  ];

  return (
    <PhoneShell
      stage="Avatars"
      backTo="/tribe/crew"
      footer={
        <Button block onClick={() => navigate("/tribe/constraints")}>
          Next: Find places
        </Button>
      }
    >
      <ScreenTitle title="Meet your tribe">Here's everyone, revealed all at once, with the one thing they can't do without.</ScreenTitle>

      <ul className={styles.grid}>
        {cards.map((card) => (
          <li key={card.key} className={styles.slot}>
            <motion.div
              className={styles.card}
              initial={false}
              animate={{ rotateY: flipped ? 0 : 180 }}
              transition={{ duration: duration.reveal, ease: ease.inOut }}
            >
              <div className={styles.front}>
                <div className={styles.portrait}>
                  <AvatarFigure name={card.name} avatar={{ ...card.avatar, items: [] }} size={64} faded={card.faded} badges={false} />
                  {card.avatar.lockedItemId && (
                    <span className={styles.locked}>
                      <ItemIcon id={card.avatar.lockedItemId} size={30} />
                    </span>
                  )}
                </div>
                <span className={styles.name}>{card.faded ? "Default picks" : card.name}</span>
                {card.avatar.lockedItemId && <span className={styles.must}>Must-have: {getItemInfo(card.avatar.lockedItemId).label}</span>}
              </div>
              <div className={styles.back} aria-hidden>
                <AgentMark size={30} label="" color="#ffffff" />
              </div>
            </motion.div>
          </li>
        ))}
      </ul>

      {flipped && <OverlapList overlaps={overlaps} delay={reduceMotion ? 0 : duration.reveal} />}
    </PhoneShell>
  );
}
