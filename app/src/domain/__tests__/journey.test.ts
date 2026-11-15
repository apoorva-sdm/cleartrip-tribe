import { describe, expect, it } from "vitest";
import { PLACES } from "@/data/fixtures/places";
import { MOMENTS } from "@/data/fixtures/moments";
import { EARLY_JOINERS } from "@/data/fixtures/group";
import { friendBallots, stayOptions, travelOptions } from "@/data/fixtures/journey";
import {
  BookingPlanner,
  DestinationRanker,
  ExpenseSplitter,
  FairnessScorer,
  ItineraryBuilder,
  Money,
  PriceRevalidator,
  ProposalEngine,
  VoteTally,
  ballotProblem,
  type Ballot,
  type Member,
} from "..";

const me: Member = { id: "me", name: "Me", role: "initiator", status: "joined", avatar: { items: ["sunhat", "snorkel", "camera"], lockedItemId: "snorkel" } };
const members = [me, ...EARLY_JOINERS];
const byId = (id: string) => PLACES.find((p) => p.id === id)!;
const shortlist = new DestinationRanker().rank(["pondicherry", "goa", "gokarna"].map(byId), members, 2);

describe("VoteTally", () => {
  const tally = new VoteTally();
  const ballot = (memberId: string, loves: Record<string, number>, vetoPlaceId: string | null = null): Ballot => ({ memberId, loves, vetoPlaceId });

  it("most loves wins", () => {
    const d = tally.decide(shortlist, [ballot("a", { goa: 3 }), ballot("b", { goa: 2, gokarna: 1 })]);
    expect(d).toMatchObject({ kind: "winner", placeId: "goa" });
  });

  it("a veto knocks a place out", () => {
    const d = tally.decide(shortlist, [ballot("a", { goa: 3 }), ballot("b", { gokarna: 2, pondicherry: 1 }, "goa")]);
    expect(d.placeId).toBe("gokarna");
  });

  it("breaks a tie toward the least-happy person's best fit", () => {
    const d = tally.decide(shortlist, [ballot("a", { goa: 3 }), ballot("b", { pondicherry: 3 })]);
    expect(d.kind).toBe("tie-break");
    const fairest = [...shortlist].filter((r) => ["goa", "pondicherry"].includes(r.place.id)).sort((x, y) => y.leastHappy - x.leastHappy || y.totalMatches - x.totalMatches || x.cost - y.cost)[0];
    expect(d.placeId).toBe(fairest?.place.id);
  });

  it("checks ballots", () => {
    expect(ballotProblem({ loves: { goa: 2 }, vetoPlaceId: null })).toBe("Place 1 more love");
    expect(ballotProblem({ loves: { goa: 3 }, vetoPlaceId: "goa" })).toMatch(/can't love and veto/);
    expect(ballotProblem({ loves: { goa: 3 }, vetoPlaceId: "gokarna" })).toBeNull();
  });

  it("sample friends vote and never veto a place they love", () => {
    for (const b of friendBallots(shortlist, EARLY_JOINERS)) {
      expect(Object.values(b.loves).reduce((a, c) => a + c, 0)).toBe(3);
      if (b.vetoPlaceId) expect(b.loves[b.vetoPlaceId] ?? 0).toBe(0);
    }
  });
});

describe("Plan", () => {
  const days = ["2026-12-18", "2026-12-19", "2026-12-20"];
  const builder = new ItineraryBuilder();
  const itinerary = builder.build("goa", days, MOMENTS, members);

  it("builds days of moments with gaps left open", () => {
    expect(itinerary.items).toHaveLength(9);
    expect(itinerary.items.filter((i) => i.kind === "gap").length).toBeGreaterThanOrEqual(3);
  });

  it("scores fairness and suggests gap fillers for anyone left out first", () => {
    const scorer = new FairnessScorer();
    const rows = scorer.score(itinerary, members, MOMENTS);
    expect(rows).toHaveLength(members.length);
    const left = rows.filter((r) => r.hearts === 0).map((r) => members.find((m) => m.id === r.memberId)!);
    const [first] = scorer.gapSuggestions(itinerary, members, MOMENTS);
    if (left.length > 0) expect(left.some((m) => m.avatar.items.includes(first!.serves))).toBe(true);
  });

  it("a pricier swap gets objections; a cheaper one is accepted", () => {
    const engine = new ProposalEngine();
    const item = itinerary.items.find((i) => i.kind === "moment")!;
    if (item.kind !== "moment") throw new Error();
    const from = MOMENTS.find((t) => t.id === item.templateId)!;
    const pricier = { ...from, id: "x", pricePerPerson: from.pricePerPerson + Money.fromRupees(1200) };
    const cheaper = { ...from, id: "y", pricePerPerson: 0 };
    expect(engine.respond(engine.propose(item, from, pricier), 6).status).toBe("objected");
    const ok = engine.respond(engine.propose(item, from, cheaper), 6);
    expect(ok.status).toBe("accepted");
    const applied = engine.apply(itinerary, ok, "me");
    expect(applied.items.find((i) => i.id === item.id)).toMatchObject({ templateId: "y", addedBy: "me" });
  });
});

describe("Book", () => {
  const planner = new BookingPlanner();
  it("picks refundable when it's only a little more, and says why", () => {
    const { chosen, why } = planner.choose(travelOptions(byId("goa"), ["2026-12-18", "2026-12-20"]));
    expect(chosen.refundable).toBe(true);
    expect(why).toMatch(/₹400 more/);
  });
  it("picks the cheapest when refundable costs too much more", () => {
    expect(planner.choose(stayOptions(byId("goa"), 3)).chosen.refundable).toBe(false);
  });
  it("gives each travel option a ticket's details, with the return leg on the last day", () => {
    const [first] = travelOptions(byId("gokarna"), ["2026-12-18", "2026-12-19", "2026-12-20"]);
    expect(first?.mode).toBe("train");
    expect(first?.legs?.out.gate).toMatch(/^Platform \d$/);
    expect(first?.legs?.back.date).toBe("2026-12-20");
  });
  it("flags changed prices", () => {
    const line = { id: "stay", kind: "stay" as const, title: "Stay", chosen: stayOptions(byId("goa"), 1)[1]!, why: "" };
    const { changes } = new PriceRevalidator().check([line], { stay: line.chosen.pricePerPerson + 35_000 });
    expect(changes).toHaveLength(1);
  });
});

describe("ExpenseSplitter", () => {
  it("settles in few transfers and balances to zero", () => {
    const splitter = new ExpenseSplitter();
    const all = ["a", "b", "c"];
    const transfers = splitter.settle([
      { id: "1", title: "Stay", amount: 9000, paidBy: "a", splitAmong: all },
      { id: "2", title: "Dinner", amount: 3000, paidBy: "b", splitAmong: all },
    ]);
    const net = new Map<string, number>();
    for (const t of transfers) {
      net.set(t.from, (net.get(t.from) ?? 0) - t.amount);
      net.set(t.to, (net.get(t.to) ?? 0) + t.amount);
    }
    expect(net.get("a")).toBe(5000);
    expect(transfers.length).toBeLessThanOrEqual(2);
  });
});
