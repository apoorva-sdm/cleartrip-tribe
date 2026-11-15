import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { services } from "@/app/services";

export const selectPlan = (state: RootState) => state.plan;
const selectMembersList = (state: RootState) => Object.values(state.group.members.entities);

export const selectFairness = createSelector([selectPlan, selectMembersList], (plan, members) =>
  plan.itinerary ? services.fairness.score(plan.itinerary, members, plan.catalogue) : [],
);

export const selectGapSuggestions = createSelector([selectPlan, selectMembersList], (plan, members) =>
  plan.itinerary ? services.fairness.gapSuggestions(plan.itinerary, members, plan.catalogue) : [],
);

/** Why the plan can't be frozen yet, or null. */
export const selectFreezeBlocker = createSelector([selectPlan, selectFairness], (plan, fairness) => {
  if (plan.proposals.some((p) => p.status === "pending")) return "Your tribe is pondering a swap…";
  if (plan.proposals.some((p) => p.status === "objected")) return "Someone objected to a swap. Try again, or withdraw it.";
  const left = fairness.filter((r) => r.hearts === 0).map((r) => r.name);
  if (left.length) return `${left.join(" and ")} ${left.length === 1 ? "has" : "have"} nothing they picked yet. Add something for them in a free slot.`;
  return null;
});
