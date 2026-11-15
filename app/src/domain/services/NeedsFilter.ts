import type { ConstraintId, GroupNeeds, Paise, Place } from "../models";

export function tripCost(place: Place, nights: number): Paise {
  return place.travelPerPerson + place.stayPerNight * nights;
}

/** One hard filter. Needs are never voted on; they shrink the option set quietly. */
export interface Constraint {
  readonly id: ConstraintId;
  allows(place: Place, needs: GroupNeeds): boolean;
}

export const DatesConstraint: Constraint = {
  id: "dates",
  allows: (_place, needs) => needs.nights >= 1,
};

export const BudgetConstraint: Constraint = {
  id: "budget",
  allows: (place, needs) => tripCost(place, Math.max(1, needs.nights)) <= needs.ceiling,
};

export const DietConstraint: Constraint = {
  id: "diet",
  allows: (place, needs) => needs.diets.every((d) => place.diets.includes(d)),
};

export const AccessConstraint: Constraint = {
  id: "access",
  allows: (place, needs) => !needs.stepFree || place.stepFree,
};

export const PassportConstraint: Constraint = {
  id: "passport",
  allows: (place, needs) => !place.international || needs.everyoneHasPassport,
};

export const DEFAULT_CONSTRAINTS: readonly Constraint[] = [
  DatesConstraint,
  BudgetConstraint,
  DietConstraint,
  AccessConstraint,
  PassportConstraint,
];

export type FilterResult =
  | { kind: "ok"; places: Place[] }
  | { kind: "none-fit"; binding: ConstraintId };

/** "Needs filter first" and "Anything fits?" in the Match stage. */
export class NeedsFilter {
  constructor(private readonly constraints: readonly Constraint[] = DEFAULT_CONSTRAINTS) {}

  apply(places: readonly Place[], needs: GroupNeeds): FilterResult {
    const passing = places.filter((p) => this.constraints.every((c) => c.allows(p, needs)));
    if (passing.length > 0) return { kind: "ok", places: passing };
    return { kind: "none-fit", binding: this.findBinding(places, needs) };
  }

  /** Places that pass every constraint except one. */
  passingAllBut(places: readonly Place[], needs: GroupNeeds, except: ConstraintId): Place[] {
    return places.filter((p) => this.constraints.every((c) => c.id === except || c.allows(p, needs)));
  }

  /** The constraint that, relaxed on its own, lets the most places through. Dates win ties: nothing works without them. */
  private findBinding(places: readonly Place[], needs: GroupNeeds): ConstraintId {
    if (needs.nights < 1) return "dates";
    let best: ConstraintId = "budget";
    let most = -1;
    for (const c of this.constraints) {
      const opened = this.passingAllBut(places, needs, c.id).length;
      if (opened > most) {
        most = opened;
        best = c.id;
      }
    }
    return best;
  }
}
