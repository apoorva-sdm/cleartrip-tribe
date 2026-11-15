import type { Ballot, Decision, PlaceTally } from "../models";
import type { RankedPlace } from "./DestinationRanker";

export const LOVES_PER_PERSON = 3;

/**
 * "Group votes" → "Tie?" → "Fairness tie-break" → "Place locked".
 * A veto knocks a place out (unless every place is vetoed). Most loves wins.
 * A tie goes to the place that suits the least-happy person best.
 */
export class VoteTally {
  decide(shortlist: readonly RankedPlace[], ballots: readonly Ballot[]): Decision {
    const tallies: PlaceTally[] = shortlist.map(({ place }) => ({
      placeId: place.id,
      loves: ballots.reduce((sum, b) => sum + (b.loves[place.id] ?? 0), 0),
      vetoes: ballots.filter((b) => b.vetoPlaceId === place.id).length,
    }));
    const unvetoed = tallies.filter((t) => t.vetoes === 0);
    const pool = unvetoed.length > 0 ? unvetoed : tallies;
    const top = Math.max(...pool.map((t) => t.loves));
    const tied = pool.filter((t) => t.loves === top).map((t) => t.placeId);
    if (tied.length === 1) return { kind: "winner", placeId: tied[0] as string, tallies };

    const fairest = shortlist
      .filter((r) => tied.includes(r.place.id))
      .sort((a, b) => b.leastHappy - a.leastHappy || b.totalMatches - a.totalMatches || a.cost - b.cost)[0];
    return { kind: "tie-break", placeId: fairest?.place.id ?? (tied[0] as string), tiedPlaceIds: tied, tallies };
  }
}

/** A ballot is valid with exactly three loves and at most one veto, not on a loved place. */
export function ballotProblem(ballot: Pick<Ballot, "loves" | "vetoPlaceId">): string | null {
  const used = Object.values(ballot.loves).reduce((a, b) => a + b, 0);
  if (used < LOVES_PER_PERSON) return `Place ${LOVES_PER_PERSON - used} more ${LOVES_PER_PERSON - used === 1 ? "love" : "loves"}`;
  if (ballot.vetoPlaceId && (ballot.loves[ballot.vetoPlaceId] ?? 0) > 0) return "You can't love and veto the same place";
  return null;
}
