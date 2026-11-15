import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button, Field, PersonAvatar, PhoneShell, ScreenTitle } from "@/ui";
import { useBookingSetup } from "../hooks/useBookingSetup";
import { askMissingTravellers, saveMyDetails } from "../slice";
import styles from "./TravellersScreen.module.css";

/** Book · Traveller details: each person adds their own. */
export function TravellersScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const travellers = useAppSelector((s) => s.book.travellers);
  const myDetails = useAppSelector((s) => s.book.myDetails);
  const members = useAppSelector((s) => s.group.members.entities);
  const meId = useAppSelector((s) => s.group.meId);
  const [fullName, setFullName] = useState(myDetails?.fullName ?? "");
  const [dob, setDob] = useState(myDetails?.dob ?? "");
  const [asking, setAsking] = useState(false);

  useBookingSetup();


  const missingOthers = travellers.filter((t) => t.status === "missing" && t.memberId !== meId);
  const meDone = travellers.some((t) => t.memberId === meId && t.status === "added");
  const formOk = fullName.trim().length >= 3 && dob.length === 10;
  const left = travellers.filter((t) => t.status === "missing").length;

  const ask = async () => {
    setAsking(true);
    await dispatch(askMissingTravellers());
    setAsking(false);
  };

  return (
    <PhoneShell
      stage="Book"
      backTo="/tribe/book/review"
      footer={
        <>
          <p className={styles.hint}>{left ? `${left} to go · you can finish this later` : "Everyone's in ✓"}</p>
          <Button block onClick={() => navigate("/tribe/book/review")}>
            Back to review
          </Button>
        </>
      }
    >
      <ScreenTitle title="Who's travelling?">You can do this later. Everyone adds their own details, as on their ID.</ScreenTitle>

      {!meDone && (
        <section className={styles.form} aria-label="Your details">
          <Field label="Full name, as on your ID" value={fullName} autoComplete="name" onChange={(e) => setFullName(e.target.value)} />
          <Field label="Date of birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          <Button
            variant="secondary"
            block
            disabled={!formOk}
            onClick={() => meId && dispatch(saveMyDetails({ memberId: meId, details: { fullName: fullName.trim(), dob } }))}
          >
            Save my details
          </Button>
        </section>
      )}

      <ul className={styles.list}>
        {travellers.map((t) => (
          <li key={t.memberId} className={styles.row}>
            <PersonAvatar name={t.name} size={32} look={members[t.memberId]?.avatar.look} faded={t.memberId.startsWith("default-") && t.status === "missing"} />
            <span className={styles.name}>{t.memberId === meId ? `${t.name} (you)` : t.name}</span>
            <span className={t.status === "added" ? styles.added : styles.missing}>{t.status === "added" ? "Added" : "Not yet"}</span>
          </li>
        ))}
      </ul>

      {missingOthers.length > 0 && (
        <Button variant="secondary" block loading={asking} className={styles.ask} onClick={ask}>
          Remind them in chat
        </Button>
      )}
    </PhoneShell>
  );
}
