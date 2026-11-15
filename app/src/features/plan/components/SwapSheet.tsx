import { Money, SLOT_WINDOW, type MomentTemplate, type Slot } from "@/domain";
import { ItemIcon } from "@/features/avatars";
import { Sheet } from "@/ui";
import styles from "./SwapSheet.module.css";

interface SwapSheetProps {
  open: boolean;
  current: MomentTemplate | null;
  /** The slot being swapped (alternatives may be meant for another time of day). */
  slot: Slot | null;
  options: readonly MomentTemplate[];
  onPick: (templateId: string) => void;
  onClose: () => void;
}

/** Show the ripple before proposing: cost and time impact of each option. */
export function SwapSheet({ open, current, slot, options, onPick, onClose }: SwapSheetProps) {
  const overflow = (t: MomentTemplate) => Math.max(0, t.durationMins - SLOT_WINDOW[slot ?? t.slot]);
  return (
    <Sheet open={open} title={current ? `Swap ${current.title}` : "Swap"} onClose={onClose}>
      <p className={styles.sub}>It's a proposal. Your tribe agrees first.</p>
      {options.length === 0 && <p className={styles.empty}>Everything's already in the plan.</p>}
      <ul className={styles.list}>
        {current &&
          options.map((t) => {
            const cost = t.pricePerPerson - current.pricePerPerson;
            const shift = overflow(t) - overflow(current);
            return (
              <li key={t.id}>
                <button type="button" className={styles.option} onClick={() => onPick(t.id)}>
                  <ItemIcon id={t.serves} size={20} />
                  <span className={styles.text}>
                    <b>{t.title}</b>
                    <span className={styles.ripple}>
                      <span className={cost > 0 ? styles.up : cost < 0 ? styles.down : undefined}>
                        {cost === 0 ? "Same price" : `${cost > 0 ? "+" : "−"}${Money.format(Math.abs(cost))} each`}
                      </span>
                      {" · "}
                      {shift === 0 ? "same timings" : `moves the next slot ${shift > 0 ? "later" : "earlier"} by ${Math.abs(shift)} min`}
                    </span>
                  </span>
                  <span className={styles.cta}>Propose</span>
                </button>
              </li>
            );
          })}
      </ul>
    </Sheet>
  );
}
