import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { services } from "@/app/services";
import { Money, type BookingKind } from "@/domain";
import { AgentMark, Button, PhoneShell, ScreenTitle, Skeleton } from "@/ui";
import { duration, ease } from "@/styles/motion";
import { useBookingSetup } from "../hooks/useBookingSetup";
import { checkPrices, confirmBooking, reconfirmPrices } from "../slice";
import { BookStepper } from "./BookStepper";
import styles from "./ConfirmScreen.module.css";

const STEP_ROUTE: Record<BookingKind, string> = { travel: "/tribe/book/travel", stay: "/tribe/book/stay", activity: "/tribe/book/activities" };
const STEP_NAME: Record<BookingKind, string> = { travel: "Travel", stay: "Stay", activity: "Activities" };

/** Book · Review: total price, a live price check, then book on Cleartrip, or skip booking. */
export function ConfirmScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const frozen = useAppSelector((s) => s.plan.frozen);
  const { lines, changes, steps, pricesChecked, reconfirmed, bookedLineIds, bookingRef, travellers } = useAppSelector((s) => s.book);
  const cap = useAppSelector((s) => s.trip.trip?.frame.capPerPerson ?? 0);
  const groupSize = travellers.length || 1;
  const loaded = useBookingSetup();
  const [booking, setBooking] = useState(false);
  const [agreeing, setAgreeing] = useState(false);

  useEffect(() => {
    if (loaded && !pricesChecked && !bookingRef) void dispatch(checkPrices());
  }, [dispatch, loaded, pricesChecked, bookingRef]);

  if (!frozen) return <Navigate to="/tribe/plan" replace />;

  const perPerson = services.booking.totalPerPerson(lines);
  const group = perPerson * groupSize;
  const under = cap - perPerson;
  const skipped = (Object.keys(STEP_ROUTE) as BookingKind[]).filter((k) => steps[k] !== "book");
  const meAdded = travellers.filter((t) => t.status === "added").length;
  const waitingOnPrice = changes.length > 0 && !reconfirmed;

  const book = async () => {
    setBooking(true);
    await dispatch(confirmBooking());
    setBooking(false);
  };
  const agree = async () => {
    setAgreeing(true);
    await dispatch(reconfirmPrices());
    setAgreeing(false);
  };

  const footer = bookingRef ? (
    <Button block onClick={() => navigate("/tribe/trip/ready")}>Next: Get ready for the trip</Button>
  ) : (
    <div className={styles.stack}>
      <Button variant="secondary" block className={styles.tall} onClick={() => navigate("/tribe/trip/ready")}>
        Skip booking for now
      </Button>
      {lines.length > 0 && (
        <Button block loading={booking} disabled={!pricesChecked || waitingOnPrice} onClick={book}>
          Book on Cleartrip · {Money.format(group)}
        </Button>
      )}
    </div>
  );

  return (
    <PhoneShell stage="Book" backTo="/tribe/book/activities" footer={footer}>
      {!bookingRef && <BookStepper at="Review" />}
      <ScreenTitle title={bookingRef ? "You're all booked" : "Here's what it all costs"}>
        {bookingRef ? `Ref ${bookingRef}. All locked in.` : lines.length ? "Book everything in one go, or skip it for now." : "You haven't added anything yet. Skip, or go back and add something."}
      </ScreenTitle>

      {!pricesChecked && !bookingRef ? (
        <div className={styles.list} aria-busy="true">
          <p className={styles.checking}>
            <AgentMark size={10} /> Calculating live prices…
          </p>
          {[0, 1].map((i) => (
            <Skeleton key={i} height={72} />
          ))}
        </div>
      ) : (
        <>
          {waitingOnPrice && (
            <motion.section
              className={styles.alert}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
            >
              {changes.map((c) => (
                <p key={c.lineId} className={styles.alertText}>
                  ⚠️ {c.title} went up <b>{Money.format(c.now - c.was)}</b> each since you planned.
                </p>
              ))}
              <Button block loading={agreeing} className={styles.agree} onClick={agree}>
                {agreeing ? "Asking your tribe…" : "Agree with your tribe"}
              </Button>
            </motion.section>
          )}
          {reconfirmed && changes.length > 0 && !bookingRef && <p className={styles.ok}>✓ Your tribe agreed to the new price</p>}

          <ul className={styles.list}>
            {lines.map((l) => {
              const changed = changes.find((c) => c.lineId === l.id);
              const done = bookedLineIds.includes(l.id);
              return (
                <li key={l.id} className={styles.line}>
                  <div className={styles.top}>
                    <p className={styles.title}>{l.title}</p>
                    <p className={styles.price}>
                      {changed && !reconfirmed && <s>{Money.format(changed.was)}</s>} {Money.format(l.livePrice ?? l.chosen.pricePerPerson)}
                    </p>
                  </div>
                  <p className={styles.detail}>
                    {l.chosen.label}
                    {l.chosen.legs && ` · ${l.chosen.legs.out.code}`}
                  </p>
                  {(booking || bookingRef) && (
                    <motion.p
                      key={done ? "done" : "busy"}
                      className={done ? styles.booked : styles.booking}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.out } }}
                    >
                      {done ? "Booked · locked 🔒" : "Booking…"}
                    </motion.p>
                  )}
                </li>
              );
            })}
            {skipped.map((k) => (
              <li key={k} className={styles.skipped}>
                <span>{STEP_NAME[k]} · not booking</span>
                {!bookingRef && (
                  <button type="button" onClick={() => navigate(STEP_ROUTE[k])}>
                    Add
                  </button>
                )}
              </li>
            ))}
          </ul>

          {!bookingRef && (
            <button type="button" className={styles.travellers} onClick={() => navigate("/tribe/book/travellers")}>
              <span>👤 Traveller details · {meAdded}/{groupSize}</span>
              <em>Optional ›</em>
            </button>
          )}

          {lines.length > 0 && (
            <dl className={styles.totals}>
              <div>
                <dt>Each</dt>
                <dd>{Money.format(perPerson)}</dd>
              </div>
              <div>
                <dt>vs group cap</dt>
                <dd className={under >= 0 ? styles.under : styles.over}>
                  {under >= 0 ? `${Money.format(under)} under` : `${Money.format(-under)} over`}
                </dd>
              </div>
              <div>
                <dt>All {groupSize} of you</dt>
                <dd>{Money.format(group)}</dd>
              </div>
            </dl>
          )}
          {!bookingRef && lines.length > 0 && <p className={styles.hint}>Prototype: nothing is really booked or charged.</p>}
        </>
      )}
    </PhoneShell>
  );
}
