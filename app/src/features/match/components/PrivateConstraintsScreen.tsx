import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { DIETS, Money, daysIn, formatDay, type Diet } from "@/domain";
import { selectTrip } from "@/features/setup";
import { Button, ChoiceChip, PhoneShell, ScreenTitle } from "@/ui";
import { runMatch, type MyConstraints } from "../slice";
import styles from "./PrivateConstraintsScreen.module.css";

const DIET_LABEL: Record<Diet, string> = { any: "Anything", veg: "Veg", jain: "Jain", halal: "Halal" };
const STEP = Money.fromRupees(500);

/** Match · Private constraints in four taps: budget, dates, food, must-haves. Only Tribe sees them. */
export function PrivateConstraintsScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const trip = useAppSelector(selectTrip);
  const saved = useAppSelector((s) => s.match.mine);
  const days = trip ? daysIn(trip.frame.window) : [];
  const cap = trip?.frame.capPerPerson ?? 0;
  const min = Money.fromRupees(5000);
  const max = Math.max(cap * 1.5, min + STEP * 10);

  const [budget, setBudget] = useState(saved?.maxBudget ?? cap);
  const [out, setOut] = useState<string[]>(saved ? days.filter((d) => !saved.availableDays.includes(d)) : []);
  const [missSome, setMissSome] = useState(out.length > 0);
  const [diet, setDiet] = useState<Diet>(saved?.diet ?? "any");
  const [stepFree, setStepFree] = useState(saved?.stepFree ?? false);
  const [noPassport, setNoPassport] = useState(saved ? !saved.hasPassport : false);

  if (!trip) return null;

  const available = missSome ? days.filter((d) => !out.includes(d)) : days;
  const reason = available.length === 0 ? "Leave at least one day free" : null;
  const toggleOut = (day: string) => setOut((list) => (list.includes(day) ? list.filter((d) => d !== day) : [...list, day]));

  const submit = () => {
    const mine: MyConstraints = { maxBudget: budget, availableDays: available, diet, stepFree, hasPassport: !noPassport };
    void dispatch(runMatch(mine));
    navigate("/tribe/match");
  };

  return (
    <PhoneShell
      stage="Match"
      backTo="/tribe/reveal"
      footer={
        <>
          {reason && <p className={styles.reason}>{reason}</p>}
          <Button block disabled={reason !== null} onClick={submit}>
            Find places for us
          </Button>
        </>
      }
    >
      <ScreenTitle title="Your personal preferences">Only Tribe AI sees these.</ScreenTitle>

      <section className={styles.group} aria-labelledby="b-h">
        <div className={styles.row}>
          <h2 id="b-h" className={styles.h2}>How much can you spend?</h2>
          <b className={styles.big}>{Money.format(budget)}</b>
        </div>
        <input
          className={styles.slider}
          type="range"
          min={min}
          max={max}
          step={STEP}
          value={budget}
          aria-labelledby="b-h"
          aria-valuetext={Money.format(budget)}
          style={{ ["--fill" as string]: `${((budget - min) / (max - min)) * 100}%` }}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
        <p className={styles.hint}>Per person, everything included. The group budget is {Money.format(cap)}.</p>
      </section>

      <section className={styles.group} aria-labelledby="d-h">
        <h2 id="d-h" className={styles.h2}>Can you make {formatDay(days[0] ?? "")} – {formatDay(days[days.length - 1] ?? "")}?</h2>
        <div className={styles.chips} role="radiogroup" aria-labelledby="d-h">
          <ChoiceChip mode="radio" selected={!missSome} onClick={() => setMissSome(false)}>Yes, all of it</ChoiceChip>
          <ChoiceChip mode="radio" selected={missSome} onClick={() => setMissSome(true)}>I'll miss a few days</ChoiceChip>
        </div>
        {missSome && (
          <>
            <p className={styles.hint}>Tap the days you can't make</p>
            <div className={styles.days}>
              {days.map((day) => {
                const isOut = out.includes(day);
                return (
                  <button key={day} type="button" aria-pressed={isOut} className={isOut ? styles.dayOut : styles.day} onClick={() => toggleOut(day)}>
                    {formatDay(day)}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section className={styles.group} aria-labelledby="f-h">
        <h2 id="f-h" className={styles.h2}>What do you eat?</h2>
        <div className={styles.chips} role="radiogroup" aria-labelledby="f-h">
          {DIETS.map((d) => (
            <ChoiceChip key={d} mode="radio" selected={diet === d} onClick={() => setDiet(d)}>
              {DIET_LABEL[d]}
            </ChoiceChip>
          ))}
        </div>
      </section>

      <section className={styles.group} aria-labelledby="n-h">
        <h2 id="n-h" className={styles.h2}>Anything we should know?</h2>
        <div className={styles.chips}>
          <ChoiceChip selected={stepFree} onClick={() => setStepFree((v) => !v)}>Step-free access</ChoiceChip>
          <ChoiceChip selected={noPassport} onClick={() => setNoPassport((v) => !v)}>No passport</ChoiceChip>
        </div>
      </section>
    </PhoneShell>
  );
}
