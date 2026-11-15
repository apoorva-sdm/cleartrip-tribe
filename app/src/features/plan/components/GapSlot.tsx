import { motion } from "motion/react";
import { SLOT_START, type ItineraryItem, type MomentTemplate } from "@/domain";
import { ItemIcon } from "@/features/avatars";
import styles from "./GapSlot.module.css";

interface GapSlotProps {
  item: Extract<ItineraryItem, { kind: "gap" }>;
  suggestion?: MomentTemplate;
  pickedBy: number;
  frozen: boolean;
  onAdd: (templateId: string) => void;
}

/** An open slot: free time by default, with a leftover pick ready to add. */
export function GapSlot({ item, suggestion, pickedBy, frozen, onAdd }: GapSlotProps) {
  return (
    <motion.div layout className={styles.gap}>
      <div className={styles.time}>
        <b>{SLOT_START[item.slot]}</b>
        <span>{item.slot}</span>
      </div>
      <div className={styles.body}>
        <p className={styles.free}>Free time</p>
        {suggestion && !frozen ? (
          <div className={styles.suggest}>
            <ItemIcon id={suggestion.serves} size={22} />
            <span className={styles.text}>
              {suggestion.title}
              <em>
                {pickedBy} of you picked this{suggestion.minPeople > 1 ? ` · needs ${suggestion.minPeople}` : ""}
              </em>
            </span>
            <button type="button" className={styles.add} onClick={() => onAdd(suggestion.id)}>
              Add
            </button>
          </div>
        ) : (
          <p className={styles.rest}>Rest, wander, or add a pick.</p>
        )}
      </div>
    </motion.div>
  );
}
