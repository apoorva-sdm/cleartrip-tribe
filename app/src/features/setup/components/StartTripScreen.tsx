import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { services } from "@/app/services";
import type { FrameField, TripFrameDraft } from "@/domain";
import { Button, Field, PhoneShell, ScreenTitle } from "@/ui";
import { createTrip } from "../slice";
import { selectCreateStatus } from "../selectors";
import styles from "./StartTripScreen.module.css";

const EMPTY_DRAFT: TripFrameDraft = { start: "", end: "", deadlineDate: "", deadlineTime: "21:00", capRupees: "" };
const FORM_ID = "start-trip";
const FIELD_OF: Record<keyof TripFrameDraft, FrameField> = {
  start: "start",
  end: "end",
  deadlineDate: "deadline",
  deadlineTime: "deadline",
  capRupees: "cap",
};

/** Groups digits the Indian way as you type: 125000 → 1,25,000. */
function groupRupees(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "").slice(0, 7);
  return digits ? Number(digits).toLocaleString("en-IN") : "";
}

/** Setup · Start a trip. The initiator sets the frame: window, deadline, cap. */
export function StartTripScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector(selectCreateStatus);
  const [draft, setDraft] = useState<TripFrameDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Partial<Record<FrameField, string>>>({});

  const update = (patch: Partial<TripFrameDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    // Clear the error on whatever was just fixed.
    const touched = Object.keys(patch).map((key) => FIELD_OF[key as keyof TripFrameDraft]);
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([field]) => !touched.includes(field as FrameField))));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = services.frameValidator.validate(draft, new Date());
    if (result.kind === "invalid") {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    const action = await dispatch(createTrip(result.frame));
    if (createTrip.fulfilled.match(action)) navigate("/tribe/share");
  };

  return (
    <PhoneShell
      stage="Setup"
      backTo="/"
      footer={
        <>
          {status.kind === "error" && (
            <p className={styles.formError} role="alert">
              {status.message}
            </p>
          )}
          <Button type="submit" form={FORM_ID} block loading={status.kind === "saving"}>
            Create your tribe link
          </Button>
        </>
      }
    >
      <ScreenTitle title="Plan a trip with your tribe">You pick the dates and the budget. Everyone helps decide the rest.</ScreenTitle>

      <form id={FORM_ID} className={styles.form} onSubmit={submit} noValidate>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>When are you going?</legend>
          <div className={styles.pair}>
            <Field label="From" type="date" value={draft.start} error={errors.start} onChange={(e) => update({ start: e.target.value })} />
            <Field label="To" type="date" value={draft.end} min={draft.start || undefined} error={errors.end} onChange={(e) => update({ end: e.target.value })} />
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Your tribe's avatars must be ready by</legend>
          <div className={styles.pair}>
            <Field label="Date" type="date" value={draft.deadlineDate} error={errors.deadline} onChange={(e) => update({ deadlineDate: e.target.value })} />
            <Field label="Time" type="time" value={draft.deadlineTime} onChange={(e) => update({ deadlineTime: e.target.value })} />
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>What's the budget per person?</legend>
          <Field
            label="Budget per person"
            prefix="₹"
            inputMode="numeric"
            placeholder="18,000"
            value={draft.capRupees}
            error={errors.cap}
            hint="Everyone in your tribe will see this."
            onChange={(e) => update({ capRupees: groupRupees(e.target.value) })}
          />
        </fieldset>
      </form>
    </PhoneShell>
  );
}
