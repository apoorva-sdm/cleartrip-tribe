import { motion } from "motion/react";
import { Money, SLOT_START, getItemInfo, type ItineraryItem, type MomentTemplate, type Proposal } from "@/domain";
import { ItemIcon } from "@/features/avatars";
import { AgentMark } from "@/ui";
import { spring } from "@/styles/motion";
import styles from "./MomentCard.module.css";

type MomentItem = Extract<ItineraryItem, { kind: "moment" }>;

interface MomentCardProps {
  item: MomentItem;
  template: MomentTemplate;
  addedByName: string | null;
  proposal?: Proposal;
  proposedTitle?: string;
  frozen: boolean;
  onSwap: () => void;
  onWithdraw: () => void;
}

/** One moment: time, what, price, who it serves, why (cited), who added it, and any swap in flight. */
export function MomentCard({ item, template, addedByName, proposal, proposedTitle, frozen, onSwap, onWithdraw }: MomentCardProps) {
  const pending = proposal?.status === "pending";
  const objected = proposal?.status === "objected";
  return (
    <motion.article layout transition={spring.soft} className={[styles.card, proposal && styles.proposed].filter(Boolean).join(" ")}>
      <div className={styles.time}>
        <b>{SLOT_START[item.slot]}</b>
        <span>{item.slot}</span>
      </div>
      <div className={styles.body}>
        <h4 className={styles.title}>{template.title}</h4>
        <p className={styles.meta}>
          <ItemIcon id={template.serves} size={20} />
          {getItemInfo(template.serves).meaning}
          <span className={styles.price}>{template.pricePerPerson ? `${Money.format(template.pricePerPerson)} each` : "Free"}</span>
          {template.minPeople > 1 && <span className={styles.min}>needs {template.minPeople}</span>}
        </p>
        <p className={styles.why}>
          “{template.why}”<span className={styles.source}>Been there · {template.source}</span>
        </p>
        <p className={styles.by}>{addedByName ? `${addedByName} added this` : <><AgentMark size={9} /> Added by Tribe</>}</p>

        {pending && <p className={styles.pending}>Proposed: {proposedTitle}. Your tribe is pondering…</p>}
        {objected && proposal && (
          <div className={styles.objected}>
            <p>
              {proposal.objections} {proposal.objections === 1 ? "objection" : "objections"} to {proposedTitle}: it costs{" "}
              {Money.format(proposal.costDeltaPerPerson)} more each.
            </p>
            <div className={styles.actions}>
              <button type="button" onClick={onSwap}>Re-propose</button>
              <button type="button" onClick={onWithdraw}>Withdraw</button>
            </div>
          </div>
        )}
        {!proposal && !frozen && (
          <button type="button" className={styles.swap} onClick={onSwap}>
            Swap
          </button>
        )}
      </div>
    </motion.article>
  );
}
