import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { services } from "@/app/services";
import { Money } from "@/domain";
import { Button, PhoneShell, ScreenTitle } from "@/ui";
import { useNames } from "../useNames";
import { markSettled } from "../slice";
import styles from "./SettleScreen.module.css";

/** Trip · Settle up: hand off to Google Pay or any UPI app. The app never holds money. */
export function SettleScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { expenses, settled, seeded } = useAppSelector((s) => s.live);
  const meId = useAppSelector((s) => s.group.meId);
  const name = useNames();
  if (!seeded) return <Navigate to="/tribe/trip/split" replace />;

  const transfers = services.splitter.settle(expenses);
  const keyOf = (t: { from: string; to: string }) => `${t.from}>${t.to}`;
  const left = transfers.filter((t) => !settled.includes(keyOf(t))).length;

  return (
    <PhoneShell
      stage="Trip"
      backTo="/tribe/trip/split"
      footer={
        <>
          {left > 0 && <p className={styles.hint}>{left} still to settle. You can finish later.</p>}
          <Button block onClick={() => navigate("/tribe/trip/learn")}>Next: Rate the trip</Button>
        </>
      }
    >
      <ScreenTitle title="Let's settle up">Pay on any UPI app. Tribe just keeps track, it never holds your money.</ScreenTitle>
      <ul className={styles.list}>
        {transfers.map((t) => {
          const done = settled.includes(keyOf(t));
          const mine = t.from === meId;
          const forMe = t.to === meId;
          return (
            <li key={keyOf(t)} className={styles.row}>
              <span className={styles.text}>
                <b>{name(t.from)}</b> {mine ? "pay" : "pays"} <b>{name(t.to)}</b>
                <em>{Money.format(t.amount)}</em>
              </span>
              {done ? (
                <span className={styles.done}>Settled</span>
              ) : (
                <button type="button" className={mine ? styles.pay : styles.mark} onClick={() => dispatch(markSettled(keyOf(t)))}>
                  {mine ? "Pay on UPI" : forMe ? "Mark received" : "Remind"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className={styles.note}>Prototype: "Pay on UPI" marks it paid instead of opening a payment app.</p>
    </PhoneShell>
  );
}
