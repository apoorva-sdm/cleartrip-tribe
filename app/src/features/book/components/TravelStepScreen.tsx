import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Money, formatDay, type BookingOption, type TravelLeg } from "@/domain";
import { AgentMark, PhoneShell, ScreenTitle, Skeleton } from "@/ui";
import { useBookingSetup } from "../hooks/useBookingSetup";
import { pickTravel, setStep } from "../slice";
import { BookStepper } from "./BookStepper";
import { TravelPicture } from "./Pictures";
import { StepFooter } from "./StepFooter";
import styles from "./BookSteps.module.css";

function Leg({ leg }: { leg: TravelLeg }) {
  return (
    <>
      <div className={styles.leg}>
        <div className={styles.legEnd}>
          <b>{leg.depart}</b>
          <span>{leg.from}</span>
        </div>
        <div className={styles.legMid}>
          {leg.duration}
          <i />
          {formatDay(leg.date)}
        </div>
        <div className={styles.legEnd}>
          <b>{leg.arrive}</b>
          <span>{leg.to}</span>
        </div>
      </div>
      <p className={styles.facts}>
        <span>
          <b>{leg.code}</b> · {leg.carrier}
        </span>
        <span>{leg.gate}</span>
      </p>
    </>
  );
}

function TravelCard({ option, on, pick, why, onPick }: { option: BookingOption; on: boolean; pick: boolean; why?: string; onPick: () => void }) {
  const legs = option.legs;
  return (
    <li>
      <div className={on ? styles.cardOn : styles.card}>
        {option.mode && (
          <button type="button" className={styles.picture} aria-label={`Pick ${option.label}`} onClick={onPick}>
            <TravelPicture mode={option.mode} carrier={legs?.out.carrier} />
          </button>
        )}
        <button type="button" className={styles.cardTop} style={{ width: "100%", textAlign: "left" }} aria-pressed={on} onClick={onPick}>
          <div className={styles.cardMain}>
            <p className={styles.cardTitle}>{option.label}</p>
            <p className={styles.cardSub}>{legs ? `${legs.out.depart} · ${legs.out.duration}` : option.detail}</p>
          </div>
          <p className={styles.price}>
            {Money.format(option.pricePerPerson)}
            <span>each, return</span>
          </p>
        </button>
        <div className={styles.tags}>
          {on && <span className={styles.tagOn}>✓ Selected</span>}
          {pick && (
            <span className={styles.tagPick}>
              <AgentMark size={9} /> Tribe's pick
            </span>
          )}
          <span className={option.refundable ? styles.tagGood : styles.tag}>{option.refundable ? "Refundable" : "Non-refundable"}</span>
        </div>
        {pick && why && <p className={styles.hint} style={{ marginTop: 6 }}>{why}</p>}
        {legs && (
          <>
            <Leg leg={legs.out} />
            <details className={styles.accordion}>
              <summary>
                Return · {formatDay(legs.back.date)} <span aria-hidden>⌄</span>
              </summary>
              <Leg leg={legs.back} />
            </details>
          </>
        )}
      </div>
    </li>
  );
}

/** Book · step 1, Travel. Optional: add to the booking, or skip. */
export function TravelStepScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const frozen = useAppSelector((s) => s.plan.frozen);
  const { travelOptions, picks, recommended } = useAppSelector((s) => s.book);
  const place = useAppSelector((s) => s.decide.locked?.place.name ?? "");
  const loaded = useBookingSetup();

  if (!frozen) return <Navigate to="/tribe/plan" replace />;
  const chosen = travelOptions.find((o) => o.id === picks.travel);

  const go = (choice: "book" | "skip") => {
    dispatch(setStep({ kind: "travel", choice }));
    navigate("/tribe/book/stay");
  };

  return (
    <PhoneShell
      stage="Book"
      backTo="/tribe/plan"
      footer={<StepFooter addLabel={chosen ? `Add travel · ${Money.format(chosen.pricePerPerson)} each` : "Add travel"} disabled={!chosen} onAdd={() => go("book")} onSkip={() => go("skip")} />}
    >
      <BookStepper at="Travel" />
      <ScreenTitle title={`How do you want to get to ${place}?`}>Return trips from Bengaluru. Tap one to pick it.</ScreenTitle>
      {!loaded ? (
        <div className={styles.list} aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={150} />
          ))}
        </div>
      ) : (
        <ul className={styles.list}>
          {travelOptions.map((o) => (
            <TravelCard
              key={o.id}
              option={o}
              on={o.id === picks.travel}
              pick={o.id === recommended.travel}
              why={recommended.why[o.id]}
              onPick={() => dispatch(pickTravel(o.id))}
            />
          ))}
        </ul>
      )}
      <p className={styles.hint} style={{ marginTop: 12 }}>Sample fares and timings.</p>
    </PhoneShell>
  );
}
