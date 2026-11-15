import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import type { Readiness } from "@/domain";
import { Button } from "@/ui";
import { useNudgeActions } from "../hooks/useNudgeActions";
import { closePicksEarly } from "../slice";
import styles from "./GroupStatusFooter.module.css";

interface GroupStatusFooterProps {
  readiness: Readiness;
}

/**
 * Bottom bar for "All in or deadline?".
 * Waiting: Share reminder (the nudge loop) or Skip (close picks now; anyone missing gets defaults).
 * Ready: Next, to Reveal together.
 */
export function GroupStatusFooter({ readiness }: GroupStatusFooterProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const pending = readiness.kind === "all-in" ? 0 : readiness.pending;
  const { nudge, write, send } = useNudgeActions(pending);

  if (readiness.kind !== "waiting") {
    return (
      <Button block onClick={() => navigate("/tribe/reveal")}>
        Next: Reveal your tribe
      </Button>
    );
  }

  const skip = () => {
    dispatch(closePicksEarly());
    navigate("/tribe/reveal");
  };


  const primary =
    nudge.kind === "ready"
      ? { label: "Send on WhatsApp", onClick: send, disabled: false }
      : nudge.kind === "sent"
        ? { label: `Waiting on ${pending}…`, onClick: undefined, disabled: true }
        : nudge.kind === "error"
          ? { label: "Try again", onClick: write, disabled: false }
          : { label: "Nudge the group chat", onClick: write, disabled: false };

  return (
    <>
      <p className={styles.hint}>Don't want to wait? Skip, and late friends get default picks.</p>
      <div className={styles.stack}>
        <Button variant="secondary" block className={styles.skip} onClick={skip}>
          Skip
        </Button>
        <Button block loading={nudge.kind === "composing"} disabled={primary.disabled} onClick={primary.onClick}>
          {nudge.kind === "composing" ? "Thinking…" : primary.label}
        </Button>
      </div>
    </>
  );
}
