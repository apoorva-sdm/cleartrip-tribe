import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { BottomNav } from "@/features/home";
import { Button, PersonAvatar, PhoneFrame, Sheet } from "@/ui";
import { JOURNEY, selectCurrentTrip, selectEarlierTrips } from "../selectors";
import { startNewTrip } from "../slice";
import styles from "./MyTribeScreen.module.css";

/** My Tribe (bottom bar): your trip in progress, earlier trips, and a way to start a new one. */
export function MyTribeScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const current = useAppSelector(selectCurrentTrip);
  const earlier = useAppSelector(selectEarlierTrips);
  const [confirming, setConfirming] = useState(false);

  const startFresh = () => {
    dispatch(startNewTrip(current?.summary ?? null));
    navigate("/tribe/start");
  };
  const onStart = () => (current && !current.summary.done ? setConfirming(true) : startFresh());

  return (
    <PhoneFrame>
      <div className={styles.scroll}>
        <main className={styles.sheet}>
          <header className={styles.head}>
            <h1 className={styles.h1}>My Tribe</h1>
            <span className={styles.brand}>Tribe</span>
          </header>

          {current ? (
            <section aria-labelledby="now-h">
              <h2 id="now-h" className={styles.h2}>{current.summary.done ? "Latest trip" : "Planning now"}</h2>
              <article className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <p className={styles.title}>{current.summary.title}</p>
                    <p className={styles.sub}>
                      {current.summary.dates} · {current.summary.crew} of you
                    </p>
                  </div>
                  <span className={current.summary.done ? styles.badgeDone : styles.badge}>{current.summary.reached}</span>
                </div>

                <ol className={styles.progress} aria-label={`Stage ${Math.min(current.step + 1, JOURNEY.length)} of ${JOURNEY.length}`}>
                  {JOURNEY.map((s, i) => (
                    <li key={s} className={i < current.step ? styles.done : i === current.step ? styles.now : undefined} title={s} />
                  ))}
                </ol>
                <p className={styles.next}>{current.next}</p>

                {current.crew.length > 0 && (
                  <ul className={styles.crew} aria-label="Tribe">
                    {current.crew.slice(0, 6).map((m) => (
                      <li key={m.id}>
                        <PersonAvatar name={m.name} look={m.look} size={28} />
                      </li>
                    ))}
                  </ul>
                )}

                <Button block className={styles.cta} onClick={() => navigate(current.resumeTo)}>
                  {current.summary.done ? "See the trip" : "Continue"}
                </Button>
              </article>
            </section>
          ) : (
            <section className={styles.empty}>
              <p className={styles.emoji} aria-hidden>🧭</p>
              <p className={styles.title}>No trips yet</p>
              <p className={styles.sub}>Plan one with your tribe. Everyone picks, nobody gets left out.</p>
            </section>
          )}

          <Button variant={current && !current.summary.done ? "secondary" : "primary"} block className={styles.start} onClick={onStart}>
            + Start a new trip
          </Button>

          {earlier.length > 0 && (
            <section aria-labelledby="earlier-h">
              <h2 id="earlier-h" className={styles.h2}>Earlier trips</h2>
              <ul className={styles.list}>
                {earlier.map((t) => (
                  <li key={t.id} className={styles.row}>
                    <div>
                      <p className={styles.rowTitle}>{t.title}</p>
                      <p className={styles.sub}>
                        {t.dates} · {t.crew} of you
                      </p>
                    </div>
                    <span className={t.done ? styles.badgeDone : styles.badgeMuted}>{t.done ? "Done" : `Stopped at ${t.reached}`}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
      <BottomNav />

      <Sheet open={confirming} title="Start a new trip?" onClose={() => setConfirming(false)}>
        <p className={styles.sheetText}>
          {current?.summary.title} moves to Earlier trips. In this prototype you can only plan one trip at a time.
        </p>
        <div className={styles.sheetActions}>
          <Button variant="secondary" block onClick={() => setConfirming(false)}>Keep planning</Button>
          <Button block onClick={startFresh}>Start new</Button>
        </div>
      </Sheet>
    </PhoneFrame>
  );
}
