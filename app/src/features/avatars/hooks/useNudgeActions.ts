import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectShareLink } from "@/features/setup";
import { LOADOUT_SIZE, type PendingMember } from "@/domain";
import { composeNudge, markNudgeSent, nudgeOne } from "../slice";
import { selectNudge } from "../selectors";

/** Write the reminder, then hand it to WhatsApp. The trip is saved, so leaving the page is safe. */
export function useNudgeActions(pending: number) {
  const dispatch = useAppDispatch();
  const nudge = useAppSelector(selectNudge);
  const link = useAppSelector(selectShareLink) ?? "";

  const write = useCallback(() => {
    void dispatch(composeNudge({ pending, link: `https://${link}` }));
  }, [dispatch, pending, link]);

  const send = useCallback(() => {
    if (nudge.kind !== "ready") return;
    const url = `https://wa.me/?text=${encodeURIComponent(nudge.text)}`;
    // Open synchronously so popup blockers allow it. (A "noopener" feature would make
    // window.open return null even on success, so the opener link is cut by hand.)
    const opened = window.open(url, "_blank");
    if (opened) opened.opener = null;
    const recorded = dispatch(markNudgeSent());
    // No new tab (blocked, or an in-app browser): leave only once the nudge is saved,
    // so coming back from WhatsApp picks up where we left off.
    if (!opened) void recorded.finally(() => window.location.assign(url));
  }, [dispatch, nudge]);

  /** One-to-one nudge for a friend who's still building. */
  const sendTo = useCallback(
    (p: PendingMember) => {
      const left = LOADOUT_SIZE - p.picksDone;
      const text = `Hey ${p.name}! You're ${left} ${left === 1 ? "pick" : "picks"} away from joining the tribe 🎒 https://${link}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      const opened = window.open(url, "_blank");
      if (opened) opened.opener = null;
      const recorded = dispatch(nudgeOne(p.id));
      if (!opened) void recorded.finally(() => window.location.assign(url));
    },
    [dispatch, link],
  );

  return { nudge, write, send, sendTo };
}
