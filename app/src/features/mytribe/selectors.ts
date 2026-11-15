import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { formatDay, type AvatarLook } from "@/domain";
import type { TripSummary } from "./slice";

export const JOURNEY = ["Setup", "Avatars", "Match", "Decide", "Plan", "Book", "Trip"] as const;

export interface CurrentTrip {
  summary: TripSummary;
  /** 0–6 in JOURNEY; 7 when finished. */
  step: number;
  /** Where "Continue" goes. */
  resumeTo: string;
  /** One line on what's next. */
  next: string;
  crew: Array<{ id: string; name: string; look?: AvatarLook }>;
}

/** The trip in progress, if any, and where to pick it up. */
export const selectCurrentTrip = createSelector(
  [(s: RootState) => s.trip.trip, (s: RootState) => s.group, (s: RootState) => s.match, (s: RootState) => s.decide, (s: RootState) => s.plan, (s: RootState) => s.book, (s: RootState) => s.live],
  (trip, group, match, decide, plan, book, live): CurrentTrip | null => {
    if (!trip) return null;
    const [step, resumeTo, next]: [number, string, string] = live.learned
      ? [7, "/tribe/trip/done", "Trip complete 🏁"]
      : book.bookedVia
        ? [6, "/tribe/trip", "On the trip · split costs when you're back"]
        : plan.frozen
          ? [5, "/tribe/book/travel", "Plan locked · book it, or skip"]
          : decide.locked
            ? [4, "/tribe/plan", "Place picked · plan the days"]
            : match.result.kind === "shortlist"
              ? [3, "/tribe/vote", "Places found · cast your votes"]
              : match.mine
                ? [2, "/tribe/match", "Finding places"]
                : group.meId
                  ? [1, "/tribe/crew", "Waiting for your tribe's avatars"]
                  : [0, "/tribe/avatar", "Build your avatar"];
    const members = Object.values(group.members.entities).flatMap((m) => (m ? [m] : []));
    const days = decide.locked?.days;
    const dates = days?.length
      ? `${formatDay(days[0] ?? "")} – ${formatDay(days[days.length - 1] ?? "")}`
      : `${formatDay(trip.frame.window.start)} – ${formatDay(trip.frame.window.end)}`;
    return {
      step,
      resumeTo,
      next,
      crew: members.map((m) => ({ id: m.id, name: m.name, look: m.avatar.look })),
      summary: {
        id: trip.id,
        title: decide.locked ? decide.locked.place.name : "Trip in the making",
        dates,
        reached: step >= 7 ? "Done" : JOURNEY[step] ?? "Setup",
        crew: Math.max(members.length, trip.expectedSize),
        done: step >= 7,
      },
    };
  },
);

export const selectEarlierTrips = (s: RootState) => s.myTribe.earlier;
