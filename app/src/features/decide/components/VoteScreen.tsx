import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { LOVES_PER_PERSON, ballotProblem } from "@/domain";
import { Button, PhoneShell, ScreenTitle } from "@/ui";
import { changeLoves, submitVotes, toggleVeto } from "../slice";
import { selectBallot, selectShortlist } from "../selectors";
import { VoteCard } from "./VoteCard";
import styles from "./VoteScreen.module.css";

/** Decide · Group votes: one veto, three loves. */
export function VoteScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const shortlist = useAppSelector(selectShortlist);
  const ballot = useAppSelector(selectBallot);
  const nights = useAppSelector((s) => (s.match.result.kind === "shortlist" ? s.match.result.nights : 0));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (shortlist.length === 0) return <Navigate to="/tribe/match" replace />;

  const used = Object.values(ballot.loves).reduce((a, b) => a + b, 0);
  const problem = ballotProblem(ballot);

  const submit = async () => {
    setSending(true);
    setError(null);
    const action = await dispatch(submitVotes());
    setSending(false);
    if (submitVotes.fulfilled.match(action)) navigate("/tribe/decision");
    else setError(action.payload ?? action.error.message ?? "Couldn't send your votes. Try again.");
  };

  return (
    <PhoneShell
      stage="Decide"
      backTo="/tribe/match"
      footer={
        <>
          {error ? (
            <p className={styles.error} role="alert">{error}</p>
          ) : (
            <p className={styles.hint}>{sending ? "Counting everyone's votes…" : problem ?? "All set. Your votes stay anonymous."}</p>
          )}
          <Button block disabled={problem !== null} loading={sending} onClick={submit}>
            Submit my votes
          </Button>
        </>
      }
    >
      <ScreenTitle title="Time to vote">You have {LOVES_PER_PERSON} hearts to give, all on one place or spread out, and 1 veto. Nobody sees who voted for what.</ScreenTitle>
      <p className={styles.left} aria-live="polite">
        {"♥".repeat(LOVES_PER_PERSON - used)}{"♡".repeat(used)} left · veto {ballot.vetoPlaceId ? "used" : "ready"}
      </p>
      <div className={styles.list}>
        {shortlist.map((r) => (
          <VoteCard
            key={r.place.id}
            ranked={r}
            nights={nights}
            loves={ballot.loves[r.place.id] ?? 0}
            vetoed={ballot.vetoPlaceId === r.place.id}
            canAddLove={used < LOVES_PER_PERSON}
            onLove={(delta) => dispatch(changeLoves({ placeId: r.place.id, delta }))}
            onVeto={() => dispatch(toggleVeto(r.place.id))}
          />
        ))}
      </div>
    </PhoneShell>
  );
}
