import type { ISODateTime } from "../models";

export type Readiness =
  | { kind: "waiting"; joined: number; pending: number }
  | { kind: "all-in"; joined: number }
  | { kind: "deadline-passed"; joined: number; pending: number }
  /** The initiator chose to skip waiting. Same outcome as the deadline: pending people get neutral defaults. */
  | { kind: "closed-early"; joined: number; pending: number };

/** The "All in or deadline?" decision in the Avatars stage. */
export class ReadinessCheck {
  evaluate(joined: number, expectedSize: number, deadline: ISODateTime, now: Date, closedEarly = false): Readiness {
    const pending = Math.max(0, expectedSize - joined);
    if (pending === 0) return { kind: "all-in", joined };
    if (now >= new Date(deadline)) return { kind: "deadline-passed", joined, pending };
    if (closedEarly) return { kind: "closed-early", joined, pending };
    return { kind: "waiting", joined, pending };
  }
}

/** How many people join with neutral defaults at the reveal. */
export function defaultedCount(readiness: Readiness): number {
  return readiness.kind === "deadline-passed" || readiness.kind === "closed-early" ? readiness.pending : 0;
}
