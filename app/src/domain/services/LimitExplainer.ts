import { Money, type ConstraintId, type GroupNeeds, type Paise, type Place } from "../models";
import { NeedsFilter, tripCost } from "./NeedsFilter";

/** "Name the limit": the binding constraint and levers. Never names the person behind it. */
export interface LimitExplanation {
  constraint: ConstraintId;
  headline: string;
  detail: string;
  levers: string[];
  /** Cheapest per-person cost that would fit if the budget were the only problem. */
  nearestCost: Paise | null;
}

const ROUND_TO = Money.fromRupees(500);

/**
 * A starting value for the trip starter's "raise the group cap" field: the cheapest fitting
 * price, rounded up to the next ₹500. Null when the cap isn't below it.
 * Deliberately ignores others' private budgets, so the suggestion can't reveal them.
 */
export function suggestCapRaise(nearestCost: Paise | null, currentCap: Paise): Paise | null {
  if (nearestCost === null || nearestCost <= currentCap) return null;
  return Math.ceil(nearestCost / ROUND_TO) * ROUND_TO;
}

export class LimitExplainer {
  constructor(private readonly filter: NeedsFilter = new NeedsFilter()) {}

  explain(binding: ConstraintId, places: readonly Place[], needs: GroupNeeds): LimitExplanation {
    const nights = Math.max(1, needs.nights);
    switch (binding) {
      case "dates":
        return {
          constraint: binding,
          headline: "There aren't two days in a row that work for everyone",
          detail: "A trip needs at least one night that the whole group can make.",
          levers: ["Free up one more day in a row", "Ask the trip starter to widen the window"],
          nearestCost: null,
        };
      case "budget": {
        const candidates = this.filter.passingAllBut(places, needs, "budget");
        const nearest = candidates.map((p) => tripCost(p, nights)).sort((a, b) => a - b)[0];
        const levers = nearest ? [`Stretch the budget to ${Money.format(nearest)} per person`] : [];
        const shorter = longestAffordableStay(candidates, needs);
        if (shorter !== null) levers.push(`Go for ${shorter} ${shorter === 1 ? "night" : "nights"} instead of ${needs.nights}`);
        return {
          constraint: binding,
          headline: "Every place costs more than the group's budget",
          detail: nearest
            ? `The cheapest place that meets everyone's needs is about ${Money.format(nearest)} per person.`
            : "No place in the list fits the budget.",
          levers,
          nearestCost: nearest ?? null,
        };
      }
      default:
        return {
          constraint: binding,
          headline: "No place on the list meets every need in the group",
          detail: "Needs like food, access and passports are never traded away, so the list has to change instead.",
          levers: ["Stretch the budget so Tribe can look further", "Try a longer window"],
          nearestCost: null,
        };
    }
  }
}

/** The most nights (fewer than planned) at which at least one place fits the budget, if any. */
function longestAffordableStay(places: readonly Place[], needs: GroupNeeds): number | null {
  for (let n = needs.nights - 1; n >= 1; n--) {
    if (places.some((p) => tripCost(p, n) <= needs.ceiling)) return n;
  }
  return null;
}
