import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Money } from "@/domain";
import { ItemIcon } from "@/features/avatars";
import { PhoneShell, ScreenTitle, Skeleton } from "@/ui";
import { useBookingSetup } from "../hooks/useBookingSetup";
import { setStep, toggleActivity } from "../slice";
import { BookStepper } from "./BookStepper";
import { StepFooter } from "./StepFooter";
import styles from "./BookSteps.module.css";

/** Book · step 3, Activities: the paid moments in the plan, each with its cost. Optional. */
export function ActivitiesStepScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const plan = useAppSelector((s) => s.plan);
  const picked = useAppSelector((s) => s.book.picks.activities);
  const loaded = useBookingSetup();

  if (!plan.frozen || !plan.itinerary) return <Navigate to="/tribe/plan" replace />;
  const paid = plan.itinerary.items.flatMap((i) => {
    const t = i.kind === "moment" ? plan.catalogue.find((c) => c.id === i.templateId) : undefined;
    return t && t.pricePerPerson > 0 ? [{ item: i, t }] : [];
  });
  const free = plan.itinerary.items.filter((i) => i.kind === "moment").length - paid.length;
  const total = paid.filter((p) => picked.includes(p.item.id)).reduce((sum, p) => sum + p.t.pricePerPerson, 0);

  const go = (choice: "book" | "skip") => {
    dispatch(setStep({ kind: "activity", choice }));
    navigate("/tribe/book/review");
  };

  return (
    <PhoneShell
      stage="Book"
      backTo="/tribe/book/stay"
      footer={<StepFooter addLabel={`Add activities · ${Money.format(total)} each`} disabled={total === 0} onAdd={() => go("book")} onSkip={() => go("skip")} />}
    >
      <BookStepper at="Activities" />
      <ScreenTitle title="Want to pre-book activities?">These ones need a ticket. {free} others in your plan are free.</ScreenTitle>
      {!loaded ? (
        <Skeleton height={200} />
      ) : (
        <>
          <ul className={styles.list} style={{ gap: 0 }}>
            {paid.map(({ item, t }) => {
              const on = picked.includes(item.id);
              return (
                <li key={item.id}>
                  <button type="button" className={styles.row} style={{ width: "100%", textAlign: "left" }} aria-pressed={on} onClick={() => dispatch(toggleActivity(item.id))}>
                    <span className={on ? styles.checkOn : styles.check} aria-hidden>{on ? "✓" : ""}</span>
                    <ItemIcon id={t.serves} size={26} />
                    <span className={styles.cardMain}>
                      <span className={styles.cardTitle} style={{ display: "block" }}>{t.title}</span>
                      <span className={styles.cardSub}>
                        Day {item.day + 1} · {item.slot}
                        {t.minPeople > 1 ? ` · needs ${t.minPeople}` : ""}
                      </span>
                    </span>
                    <span className={styles.price} style={{ fontSize: 14 }}>{Money.format(t.pricePerPerson)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className={styles.total}>
            Activities, each <b>{Money.format(total)}</b>
          </p>
        </>
      )}
    </PhoneShell>
  );
}
