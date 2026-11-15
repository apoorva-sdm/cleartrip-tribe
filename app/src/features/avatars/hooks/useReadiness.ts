import { useAppSelector } from "@/app/hooks";
import { services } from "@/app/services";
import type { Readiness } from "@/domain";
import { selectTrip } from "@/features/setup";
import { selectClosedEarly, selectMembers } from "../selectors";
import { useNow } from "./useNow";

/** The "All in or deadline?" check, re-evaluated as time passes. */
export function useReadiness(): Readiness | null {
  const trip = useAppSelector(selectTrip);
  const members = useAppSelector(selectMembers);
  const closedEarly = useAppSelector(selectClosedEarly);
  const now = useNow();
  if (!trip) return null;
  return services.readiness.evaluate(members.length, trip.expectedSize, trip.frame.deadline, now, closedEarly);
}
