import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { formatDay } from "@/domain";
import { setBookedVia, type BookedVia } from "@/features/book/slice";
import { Button, PhoneShell, ScreenTitle } from "@/ui";
import styles from "./TripReadyScreen.module.css";

/** Before the trip starts: how did you book? Cleartrip, separately, or a mix. */
export function TripReadyScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const locked = useAppSelector((s) => s.decide.locked);
  const { bookingRef, bookedVia, steps } = useAppSelector((s) => s.book);
  const frozen = useAppSelector((s) => s.plan.frozen);
  if (!locked || !frozen) return <Navigate to="/tribe/plan" replace />;

  const allOnCleartrip = Boolean(bookingRef) && steps.travel === "book" && steps.stay === "book";
  const choice: BookedVia | null = bookedVia ?? (allOnCleartrip ? "cleartrip" : bookingRef ? "mixed" : null);

  const options: Array<{ id: BookedVia; emoji: string; title: string; sub: string }> = [
    {
      id: "cleartrip",
      emoji: "🧳",
      title: bookingRef ? "All on Cleartrip" : "Book on Cleartrip",
      sub: bookingRef ? `Ref ${bookingRef} · tickets in the app` : "Takes a minute. Prices are held for 15 min.",
    },
    { id: "separate", emoji: "🧾", title: "Booked it myself", sub: "Tribe still runs the plan, contacts and split." },
    { id: "mixed", emoji: "🔀", title: "A mix of both", sub: "Some on Cleartrip, some elsewhere." },
  ];

  const pick = (id: BookedVia) => {
    if (id === "cleartrip" && !bookingRef) {
      navigate("/tribe/book/travel");
      return;
    }
    dispatch(setBookedVia(id));
  };

  return (
    <PhoneShell
      stage="Trip"
      backTo="/tribe/book/review"
      footer={
        <Button block disabled={!choice} onClick={() => {
          if (choice) dispatch(setBookedVia(choice));
          navigate("/tribe/trip");
        }}>
          Let's go!
        </Button>
      }
    >
      <ScreenTitle title={`${locked.place.name}, here you come`}>Your trip starts {formatDay(locked.days[0] ?? "")}. How did you book everything?</ScreenTitle>
      <div className={styles.list} role="radiogroup">
        {options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={choice === o.id} className={choice === o.id ? styles.on : styles.option} onClick={() => pick(o.id)}>
            <span className={styles.emoji} aria-hidden>{o.emoji}</span>
            <span className={styles.text}>
              <b>{o.title}</b>
              <span>{o.sub}</span>
            </span>
            {o.id === "cleartrip" && !bookingRef && <span className={styles.go}>Book ›</span>}
          </button>
        ))}
      </div>
    </PhoneShell>
  );
}
