import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Money } from "@/domain";
import { AgentMark, Button, PhoneShell, ScreenTitle, Skeleton } from "@/ui";
import { duration, ease } from "@/styles/motion";
import { checkPrices, reconfirmPrices } from "../slice";
import styles from "./PricesScreen.module.css";

/** Book · Revalidate prices → Price changed? → Reconfirm together. */
export function PricesScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const frozen = useAppSelector((s) => s.plan.frozen);
  const groupSize = useAppSelector((s) => s.trip.trip?.expectedSize ?? 1);
  const { lines, changes, pricesChecked, reconfirmed } = useAppSelector((s) => s.book);
  const [agreeing, setAgreeing] = useState(false);
  const [agreed, setAgreed] = useState(0);

  useEffect(() => {
    if (frozen && !pricesChecked) void dispatch(checkPrices());
  }, [dispatch, frozen, pricesChecked]);

  // Show agreement coming in while the group reconfirms.
  useEffect(() => {
    if (!agreeing) return;
    const id = window.setInterval(() => setAgreed((n) => Math.min(groupSize, n + 1)), 350);
    return () => window.clearInterval(id);
  }, [agreeing, groupSize]);

  if (!frozen) return <Navigate to="/tribe/plan" replace />;

  const agree = async () => {
    setAgreed(1);
    setAgreeing(true);
    await dispatch(reconfirmPrices());
    setAgreeing(false);
  };

  const footer = !pricesChecked ? null : reconfirmed ? (
    <Button block onClick={() => navigate("/tribe/book/travellers")}>Next: Traveller details</Button>
  ) : (
    <>
      <p className={styles.hint}>Booking is paused until the group agrees.</p>
      <Button block loading={agreeing} onClick={agree}>
        {agreeing ? `${agreed} of ${groupSize} agreed` : "Agree to the new price"}
      </Button>
    </>
  );

  return (
    <PhoneShell stage="Book" backTo="/tribe/plan" footer={footer}>
      <ScreenTitle title={pricesChecked ? (changes.length && !reconfirmed ? "A price changed" : "Prices checked") : "Checking live prices"}>
        Tribe checks every item again right before booking, so nobody pays a surprise.
      </ScreenTitle>

      {!pricesChecked ? (
        <div className={styles.list} aria-busy="true">
          <p className={styles.checking}>
            <AgentMark size={10} /> Checking travel, stay and activities…
          </p>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={64} />
          ))}
        </div>
      ) : (
        <>
          {changes.length > 0 && !reconfirmed && (
            <motion.section
              className={styles.alert}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
            >
              <h2 className={styles.alertH}>Reconfirm together</h2>
              {changes.map((c) => (
                <p key={c.lineId} className={styles.alertText}>
                  {c.title} went up by <b>{Money.format(c.now - c.was)} per person</b> since you planned ({Money.format(c.was)} →{" "}
                  {Money.format(c.now)}).
                </p>
              ))}
            </motion.section>
          )}
          {reconfirmed && changes.length > 0 && <p className={styles.ok}>Everyone agreed to the new price.</p>}
          {changes.length === 0 && <p className={styles.ok}>All prices held. Nothing changed since you planned.</p>}

          <ul className={styles.list}>
            {lines.map((l) => {
              const changed = changes.find((c) => c.lineId === l.id);
              return (
                <li key={l.id} className={styles.line}>
                  <div>
                    <p className={styles.title}>{l.title}</p>
                    <p className={styles.detail}>
                      {l.chosen.label}
                      {l.kind !== "activity" && ` · ${l.chosen.detail}`}
                    </p>
                  </div>
                  <div className={styles.price}>
                    {changed && !reconfirmed && <s>{Money.format(changed.was)}</s>}
                    <b>{Money.format(l.livePrice ?? l.chosen.pricePerPerson)}</b>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </PhoneShell>
  );
}
