import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Money } from "@/domain";
import { AgentMark, Button, PhoneShell, ScreenTitle, Sheet, Skeleton } from "@/ui";
import { useBookingSetup } from "../hooks/useBookingSetup";
import { pickStay, setStep } from "../slice";
import { BookStepper } from "./BookStepper";
import { StayPicture, type StayKind } from "./Pictures";
import { StepFooter } from "./StepFooter";

const kindOf = (id: string) => (Number(id.split("-").pop()) || 0) as StayKind;
import styles from "./BookSteps.module.css";

/** Book · step 2, Stay. One stay shown, with a button to swap it for another. Optional. */
export function StayStepScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const frozen = useAppSelector((s) => s.plan.frozen);
  const { stayOptions, picks, recommended } = useAppSelector((s) => s.book);
  const nights = useAppSelector((s) => s.decide.locked?.nights ?? 1);
  const loaded = useBookingSetup();
  const [swapping, setSwapping] = useState(false);
  const [viewing, setViewing] = useState(false);

  if (!frozen) return <Navigate to="/tribe/plan" replace />;
  const chosen = stayOptions.find((o) => o.id === picks.stay);

  const go = (choice: "book" | "skip") => {
    dispatch(setStep({ kind: "stay", choice }));
    navigate("/tribe/book/activities");
  };

  return (
    <PhoneShell
      stage="Book"
      backTo="/tribe/book/travel"
      footer={<StepFooter addLabel={chosen ? `Add stay · ${Money.format(chosen.pricePerPerson)} each` : "Add stay"} disabled={!chosen} onAdd={() => go("book")} onSkip={() => go("skip")} />}
    >
      <BookStepper at="Stay" />
      <ScreenTitle title="Where will you stay?">{nights} {nights === 1 ? "night" : "nights"} for all 6 of you.</ScreenTitle>

      {!loaded || !chosen ? (
        <Skeleton height={180} />
      ) : (
        <>
        <div className={styles.card}>
          <div className={styles.picture}>
            <StayPicture kind={kindOf(chosen.id)} />
          </div>
          <div className={styles.cardTop}>
            <div className={styles.cardMain}>
              <p className={styles.cardTitle}>{chosen.label}</p>
              <p className={styles.cardSub}>
                {chosen.area} · ★ {chosen.rating}
              </p>
            </div>
            <p className={styles.price}>
              {Money.format(chosen.pricePerPerson)}
              <span>each, {nights}N</span>
            </p>
          </div>
          <div className={styles.tags}>
            {chosen.id === recommended.stay && (
              <span className={styles.tagPick}>
                <AgentMark size={9} /> Tribe's pick
              </span>
            )}
            <span className={chosen.refundable ? styles.tagGood : styles.tag}>{chosen.refundable ? "Refundable" : "Non-refundable"}</span>
            {chosen.perks?.map((p) => (
              <span key={p} className={styles.tag}>{p}</span>
            ))}
          </div>
          {chosen.id === recommended.stay && recommended.why[chosen.id] && (
            <p className={styles.hint} style={{ marginTop: 6 }}>{recommended.why[chosen.id]}</p>
          )}
          <a
            className={styles.viewLink}
            href={`#stay-${chosen.id}`}
            onClick={(e) => {
              e.preventDefault();
              setViewing(true);
            }}
          >
            See photos and details ↗
          </a>
        </div>
        <Button variant="tertiary" block className={styles.swapBtn} onClick={() => setSwapping(true)}>
          ⇄ Swap for another stay ({stayOptions.length - 1} more)
        </Button>
        </>
      )}
      <p className={styles.hint} style={{ marginTop: 12 }}>Sample stays and prices.</p>

      <Sheet open={swapping} title="Swap stay" onClose={() => setSwapping(false)}>
        <ul className={styles.list}>
          {stayOptions.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                className={o.id === picks.stay ? styles.cardOn : styles.card}
                style={{ width: "100%", textAlign: "left" }}
                aria-pressed={o.id === picks.stay}
                onClick={() => {
                  dispatch(pickStay(o.id));
                  setSwapping(false);
                }}
              >
                <div className={styles.picture} style={{ height: 80 }}>
                  <StayPicture kind={kindOf(o.id)} />
                </div>
                <div className={styles.cardTop}>
                  <div className={styles.cardMain}>
                    <p className={styles.cardTitle}>{o.label}</p>
                    <p className={styles.cardSub}>
                      {o.area} · ★ {o.rating} · {o.refundable ? "refundable" : "non-refundable"}
                    </p>
                  </div>
                  <p className={styles.price}>
                    {Money.format(o.pricePerPerson)}
                    <span>each</span>
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet open={viewing} title={chosen?.label ?? "Stay"} onClose={() => setViewing(false)}>
        {chosen && (
          <div className={styles.details}>
            <div className={styles.detailPic}>
              <StayPicture kind={kindOf(chosen.id)} />
            </div>
            <p className={styles.cardSub}>
              {chosen.area} · ★ {chosen.rating} · {chosen.refundable ? "Free cancellation" : "Non-refundable"}
            </p>
            <ul className={styles.perks}>
              {(chosen.perks ?? []).concat(["Wi-Fi", "Check-in from 2 pm"]).map((p) => (
                <li key={p}>✓ {p}</li>
              ))}
            </ul>
            <p className={styles.hint}>This is a sample listing for the prototype. On Cleartrip this would open the hotel page.</p>
          </div>
        )}
      </Sheet>
    </PhoneShell>
  );
}
