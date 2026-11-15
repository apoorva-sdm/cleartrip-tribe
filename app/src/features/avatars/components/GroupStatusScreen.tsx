import { useAppSelector } from "@/app/hooks";
import { formatDayTime } from "@/domain";
import { selectTrip } from "@/features/setup";
import { PhoneShell, ScreenTitle } from "@/ui";
import { useMemberSync } from "../hooks/useMemberSync";
import { useNudgeActions } from "../hooks/useNudgeActions";
import { useReadiness } from "../hooks/useReadiness";
import { selectMeId, selectMembers, selectNudgedIds, selectPending, selectSynced } from "../selectors";
import { GroupStatusFooter } from "./GroupStatusFooter";
import { MemberList } from "./MemberList";
import { NudgeCard } from "./NudgeCard";
import styles from "./GroupStatusScreen.module.css";

/** Avatars · All in or deadline? Waits for the group, with nudges. */
export function GroupStatusScreen() {
  const trip = useAppSelector(selectTrip);
  const members = useAppSelector(selectMembers);
  const pending = useAppSelector(selectPending);
  const nudgedIds = useAppSelector(selectNudgedIds);
  const meId = useAppSelector(selectMeId);
  const synced = useAppSelector(selectSynced);
  const readiness = useReadiness();
  const waiting = readiness?.kind === "waiting";
  const { sendTo } = useNudgeActions(readiness && readiness.kind !== "all-in" ? readiness.pending : 0);
  useMemberSync(waiting);

  if (!trip || !readiness) return null;

  const title =
    readiness.kind === "all-in"
      ? "Everyone's ready"
      : readiness.kind === "waiting"
        ? `${readiness.pending} ${readiness.pending === 1 ? "friend is" : "friends are"} still building`
        : "Avatars are locked in";
  const sub =
    readiness.kind === "all-in"
      ? "Your whole tribe is in. Let's see everyone's avatar."
      : readiness.kind === "waiting"
        ? `Your tribe's avatars must be ready by ${formatDayTime(trip.frame.deadline)}.`
        : `${readiness.pending} ${readiness.pending === 1 ? "friend" : "friends"} will join with default picks. They can change them anytime.`;

  return (
    <PhoneShell stage="Avatars" backTo="/tribe/avatar" footer={<GroupStatusFooter readiness={readiness} />}>
      <ScreenTitle title={title}>{sub}</ScreenTitle>

      <div className={styles.progress} aria-label={`${readiness.joined} of ${trip.expectedSize} ready`}>
        <span className={styles.count}>
          {readiness.joined}/{trip.expectedSize} ready
        </span>
        <span className={styles.bar} aria-hidden>
          {Array.from({ length: trip.expectedSize }, (_, i) => (
            <i key={i} className={i < readiness.joined ? styles.filled : undefined} />
          ))}
        </span>
      </div>

      <MemberList
        members={members}
        meId={meId}
        pending={waiting ? pending : []}
        nudgedIds={nudgedIds}
        onNudge={waiting ? sendTo : undefined}
        loading={!synced}
      />

      {waiting && synced && <NudgeCard />}
    </PhoneShell>
  );
}
