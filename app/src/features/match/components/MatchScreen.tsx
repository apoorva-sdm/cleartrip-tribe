import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Money } from "@/domain";
import { selectTrip } from "@/features/setup";
import { Button, PhoneShell, ScreenTitle, Skeleton } from "@/ui";
import { raiseCapAndRetry, resetMatch, runMatch } from "../slice";
import { LimitCard } from "./LimitCard";
import { RaiseCapCard } from "./RaiseCapCard";
import { ShortlistCard } from "./ShortlistCard";
import { ThinkingSteps } from "./ThinkingSteps";
import styles from "./MatchScreen.module.css";


/** Match · Needs filter first → Anything fits? → Shortlist three, or Name the limit. */
export function MatchScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { mine, result } = useAppSelector((s) => s.match);
  const trip = useAppSelector(selectTrip);
  const isStarter = useAppSelector((s) => (s.group.meId ? s.group.members.entities[s.group.meId]?.role === "initiator" : false));
  const suggestedCap = result.kind === "none-fit" && isStarter ? result.suggestedCap : null;
  const [capInput, setCapInput] = useState("");
  const [capError, setCapError] = useState<string | undefined>();

  // Prefill the cap field with the suggestion each time a new limit comes in.
  useEffect(() => {
    setCapInput(suggestedCap ? Money.toRupees(suggestedCap).toLocaleString("en-IN") : "");
    setCapError(undefined);
  }, [suggestedCap]);

  // Back after a reload with answers saved but no result: run again.
  useEffect(() => {
    if (mine && result.kind === "idle") void dispatch(runMatch(mine));
  }, [dispatch, mine, result.kind]);

  if (!mine) return <Navigate to="/tribe/constraints" replace />;

  const adjust = () => {
    dispatch(resetMatch());
    navigate("/tribe/constraints");
  };

  const currentCap = trip?.frame.capPerPerson ?? 0;
  const raiseCap = () => {
    const rupees = Number(capInput.replace(/[^\d]/g, ""));
    const newCap = Money.fromRupees(rupees);
    if (!rupees || newCap <= currentCap) {
      setCapError(`Pick more than the current ${Money.format(currentCap)} cap`);
      return;
    }
    void dispatch(raiseCapAndRetry(newCap));
  };

  const footer =
    result.kind === "shortlist" ? (
      <>
        <Button block onClick={() => navigate("/tribe/vote")}>
          Next: Vote
        </Button>
      </>
    ) : result.kind === "none-fit" && suggestedCap ? (
      <div className={styles.stack}>
        <Button variant="secondary" block className={styles.tall} onClick={adjust}>
          Adjust my answers
        </Button>
        <Button block onClick={raiseCap}>
          Raise cap and retry
        </Button>
      </div>
    ) : result.kind === "none-fit" ? (
      <Button block onClick={adjust}>
        Adjust and retry
      </Button>
    ) : result.kind === "error" ? (
      <Button block onClick={() => void dispatch(runMatch(mine))}>
        Try again
      </Button>
    ) : null;

  return (
    <PhoneShell stage="Match" backTo="/tribe/constraints" footer={footer}>
      {(result.kind === "matching" || result.kind === "idle") && (
        <>
          <ScreenTitle title="Tribe is thinking…" />
          <ThinkingSteps />
          <div className={styles.skeletons} aria-hidden>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={140} />
            ))}
          </div>
        </>
      )}

      {result.kind === "shortlist" && (
        <>
          <ScreenTitle title={`We found ${result.places.length} places your tribe will love`}>
            They're ranked so nobody feels left out. ×3 means three of you picked it.
          </ScreenTitle>
          <div className={styles.list}>
            {result.places.map((ranked, i) => (
              <ShortlistCard key={ranked.place.id} ranked={ranked} rank={i + 1} nights={result.nights} />
            ))}
          </div>
          <p className={styles.sample}>Sample places, prices and reviews.</p>
        </>
      )}

      {result.kind === "none-fit" && (
        <>
          <ScreenTitle title="Nothing fits just yet">One thing is ruling out every place. Here's what would help.</ScreenTitle>
          <LimitCard limit={result.limit} />
          {suggestedCap && (
            <RaiseCapCard
              currentCap={currentCap}
              value={capInput}
              error={capError}
              onChange={(v) => {
                const digits = v.replace(/[^\d]/g, "").slice(0, 7);
                setCapInput(digits ? Number(digits).toLocaleString("en-IN") : "");
                setCapError(undefined);
              }}
            />
          )}
        </>
      )}

      {result.kind === "error" && (
        <ScreenTitle title="We couldn't search right now">{result.message}</ScreenTitle>
      )}
    </PhoneShell>
  );
}
