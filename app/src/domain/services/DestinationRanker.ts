import { AVATAR_ITEM_IDS, type ItemId, type Member, type Paise, type Place } from "../models";
import { tripCost } from "./NeedsFilter";

export interface RankedPlace {
  place: Place;
  cost: Paise;
  /** Picks matched for the least-happy person (people on defaults don't count). */
  leastHappy: number;
  totalMatches: number;
  /** How many people each served pick covers. Counts only, never names. */
  coverage: Array<{ itemId: ItemId; count: number }>;
  /** Set when the place is over the group's budget and was added so there's enough to vote on. */
  overBy?: Paise;
}

/** The group always gets at least this many places to vote on. */
export const MIN_TO_VOTE = 3;
/** And at most this many, so voting stays quick. */
export const SHORTLIST_SIZE = 5;

/** "Shortlist three": best for the least-happy member first, then most picks overall, then cheaper. */
export class DestinationRanker {
  rank(places: readonly Place[], members: readonly Member[], nights: number): RankedPlace[] {
    const voters = members.filter((m) => m.status === "joined" && m.avatar.items.length > 0);
    return places
      .map((place) => {
        const scores = voters.map((m) => m.avatar.items.filter((i) => place.serves.includes(i)).length);
        const coverage = AVATAR_ITEM_IDS.filter((id) => place.serves.includes(id))
          .map((itemId) => ({ itemId, count: voters.filter((m) => m.avatar.items.includes(itemId)).length }))
          .filter((c) => c.count > 0)
          .sort((a, b) => b.count - a.count);
        return {
          place,
          cost: tripCost(place, Math.max(1, nights)),
          leastHappy: scores.length ? Math.min(...scores) : 0,
          totalMatches: scores.reduce((a, b) => a + b, 0),
          coverage,
        };
      })
      .sort((a, b) => b.leastHappy - a.leastHappy || b.totalMatches - a.totalMatches || a.cost - b.cost);
  }

  shortlist(places: readonly Place[], members: readonly Member[], nights: number, size = SHORTLIST_SIZE): RankedPlace[] {
    return this.rank(places, members, nights).slice(0, size);
  }

  /**
   * Tops up a short list to MIN_TO_VOTE with the closest over-budget places. Only budget is
   * stretched: places that miss a need (food, access, passport, dates) are never added.
   */
  topUp(fitting: readonly RankedPlace[], overBudget: readonly Place[], members: readonly Member[], nights: number, ceiling: Paise): RankedPlace[] {
    if (fitting.length >= MIN_TO_VOTE) return [...fitting];
    const extra = this.rank(overBudget, members, nights)
      .sort((a, b) => a.cost - b.cost)
      .slice(0, MIN_TO_VOTE - fitting.length)
      .map((r) => ({ ...r, overBy: r.cost - ceiling }));
    return [...fitting, ...extra];
  }
}
