import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { ItemId, MomentFeedback } from "@/domain";
import { ItemIcon } from "@/features/avatars";
import { Button, PhoneShell, ScreenTitle } from "@/ui";
import { giveFeedback, learn } from "../slice";
import styles from "./LearnScreen.module.css";

const OPTIONS: Array<{ value: MomentFeedback; emoji: string; label: string }> = [
  { value: "loved", emoji: "😍", label: "Loved it" },
  { value: "liked", emoji: "😊", label: "Liked it" },
  { value: "meh", emoji: "😐", label: "It was okay" },
  { value: "not-again", emoji: "😞", label: "Not again" },
  { value: "skipped", emoji: "😴", label: "Skipped it" },
];

/** Trip · Avatars learn: three taps per moment. One action feeds your avatar and the Been-there repository. */
export function LearnScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const plan = useAppSelector((s) => s.plan);
  const feedback = useAppSelector((s) => s.live.feedback);
  if (!plan.itinerary) return <Navigate to="/tribe/trip" replace />;

  const moments = plan.itinerary.items.flatMap((i) => {
    const t = i.kind === "moment" ? plan.catalogue.find((c) => c.id === i.templateId) : undefined;
    return t ? [{ id: i.id, t }] : [];
  });
  const answered = moments.filter((m) => feedback[m.id]).length;

  const finish = () => {
    const loved = [...new Set(moments.filter((m) => feedback[m.id] === "loved").map((m) => m.t.serves))] as ItemId[];
    dispatch(learn(loved));
    navigate("/tribe/trip/done");
  };

  return (
    <PhoneShell
      stage="Trip"
      backTo="/tribe/trip/settle"
      footer={
        <>
          <p className={styles.hint}>{answered} of {moments.length} rated. You can leave any blank.</p>
          <Button block disabled={answered === 0} onClick={finish}>Done</Button>
        </>
      }
    >
      <ScreenTitle title="How was your trip?">Tap a face for each activity. It helps Tribe learn what you love.</ScreenTitle>
      <ul className={styles.list}>
        {moments.map(({ id, t }) => (
          <li key={id} className={styles.row}>
            <p className={styles.title}>
              <ItemIcon id={t.serves} size={22} /> {t.title}
            </p>
            <div className={styles.options} role="radiogroup" aria-label={t.title}>
              {OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={feedback[id] === o.value}
                  aria-label={o.label}
                  title={o.label}
                  className={feedback[id] === o.value ? styles.on : styles.option}
                  onClick={() => dispatch(giveFeedback({ itemId: id, value: o.value }))}
                >
                  <span className={styles.face} aria-hidden>{o.emoji}</span>
                  <span className={styles.faceLabel}>{o.label}</span>
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </PhoneShell>
  );
}
