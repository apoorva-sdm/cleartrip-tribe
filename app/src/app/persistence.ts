import { sessionStore, type KeyValueStore } from "@/data/sessionStore";
import type { RootState } from "./store";

const STATE_KEY = "tribe.state";

type Persisted = Partial<RootState>;

/**
 * Restores the flow after a reload (e.g. coming back from WhatsApp or a UPI app).
 * Each slice is merged over its initial state, so older saves still load. In-flight
 * statuses can't resume, so they come back as idle.
 */
export function loadState(initial: RootState, store: KeyValueStore = sessionStore): RootState | undefined {
  const saved = store.read<Persisted>(STATE_KEY);
  if (!saved) return undefined;
  const merged = Object.fromEntries(
    (Object.keys(initial) as Array<keyof RootState>).map((key) => [key, { ...initial[key], ...(saved[key] ?? {}) }]),
  ) as RootState;

  merged.trip = { ...merged.trip, create: { kind: "idle" } };
  merged.group = {
    ...merged.group,
    save: { kind: "idle" },
    nudge: merged.group.nudge.kind === "composing" ? { kind: "idle" } : merged.group.nudge,
    closedEarly: merged.group.closedEarly === true,
  };
  // A swap waiting on the group can't resume after a reload; treat it as withdrawn.
  merged.plan = { ...merged.plan, proposals: merged.plan.proposals.filter((p) => p.status !== "pending") };
  // A mid-trip recompute waiting on the group can't resume either.
  merged.live = { ...merged.live, change: null };
  if (merged.match.result.kind === "matching") merged.match = { ...merged.match, result: { kind: "idle" } };
  return merged;
}

export function saveState(state: RootState, store: KeyValueStore = sessionStore): void {
  store.write(STATE_KEY, state);
}
