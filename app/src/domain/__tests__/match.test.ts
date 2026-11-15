import { describe, expect, it } from "vitest";
import { PLACES } from "@/data/fixtures/places";
import { friendConstraints } from "@/data/fixtures/constraints";
import { EARLY_JOINERS, LATE_JOINERS } from "@/data/fixtures/group";
import { DestinationRanker, GroupNeedsBuilder, LimitExplainer, Money, NeedsFilter, suggestCapRaise, type Member, type PrivateConstraints } from "..";

const window = { start: "2026-12-18", end: "2026-12-21" };
const cap = Money.fromRupees(18000);
const me: Member = { id: "me", name: "Me", role: "initiator", status: "joined", avatar: { items: ["sunhat", "snorkel", "camera"], lockedItemId: "snorkel" } };
const members = [me, ...EARLY_JOINERS, ...LATE_JOINERS];
const mine = (patch: Partial<PrivateConstraints> = {}): PrivateConstraints => ({
  memberId: "me",
  maxBudget: Money.fromRupees(18000),
  availableDays: ["2026-12-18", "2026-12-19", "2026-12-20", "2026-12-21"],
  diet: "any",
  stepFree: false,
  hasPassport: true,
  ...patch,
});
const needsWith = (patch?: Partial<PrivateConstraints>) =>
  new GroupNeedsBuilder().build(window, cap, [...friendConstraints(window), mine(patch)]);

describe("GroupNeedsBuilder", () => {
  it("takes the lowest budget, the shared nights and every diet, without saying whose", () => {
    const needs = needsWith();
    expect(needs.ceiling).toBe(Money.fromRupees(14000));
    expect(needs.nights).toBe(2); // one friend can't make the last day
    expect(needs.diets).toEqual(["veg"]);
    expect(needs.everyoneHasPassport).toBe(false);
  });

  it("has no nights when nobody's days line up", () => {
    expect(needsWith({ availableDays: ["2026-12-21"] }).nights).toBe(0);
  });
});

describe("NeedsFilter and LimitExplainer", () => {
  const filter = new NeedsFilter();

  it("drops places over budget, without a needed diet, or needing passports", () => {
    const result = filter.apply(PLACES, needsWith());
    expect(result.kind).toBe("ok");
    if (result.kind === "ok") expect(result.places.map((p) => p.id)).toEqual([
        "goa", "pondicherry", "gokarna", "coorg", "hampi", "varkala", "munnar", "wayanad", "mysuru", "rishikesh",
      ]);
  });

  it("keeps only step-free places when someone needs step-free access", () => {
    const result = filter.apply(PLACES, needsWith({ stepFree: true }));
    expect(result.kind === "ok" && result.places.map((p) => p.id)).toEqual(["pondicherry", "mysuru"]);
  });

  it("names the budget as the limit and offers the nearest price as a lever", () => {
    const needs = needsWith({ maxBudget: Money.fromRupees(4000) });
    const result = filter.apply(PLACES, needs);
    expect(result).toEqual({ kind: "none-fit", binding: "budget" });
    const why = new LimitExplainer().explain("budget", PLACES, needs);
    expect(why.levers[0]).toContain("5,000");
    expect(JSON.stringify(why)).not.toMatch(/Zoya|Ananya|Kabir|Meera|Rohan|you/i);
  });

  it("only offers a shorter stay when that actually fits the budget", () => {
    const tight = needsWith({ maxBudget: Money.fromRupees(4000) }); // 2 nights: cheapest ₹5,000; 1 night: ₹3,100
    const why = new LimitExplainer().explain("budget", PLACES, tight);
    expect(why.levers).toContain("Go for 1 night instead of 2");
    const hopeless = needsWith({ maxBudget: Money.fromRupees(3000) });
    expect(new LimitExplainer().explain("budget", PLACES, hopeless).levers.some((l) => l.startsWith("Go for"))).toBe(false);
  });

  it("names dates when there's no night everyone can make", () => {
    expect(filter.apply(PLACES, needsWith({ availableDays: ["2026-12-21"] }))).toEqual({ kind: "none-fit", binding: "dates" });
  });
});

describe("DestinationRanker", () => {
  it("ranks for the least-happy member first, then total picks, then price", () => {
    const filtered = new NeedsFilter().apply(PLACES, needsWith());
    if (filtered.kind !== "ok") throw new Error("expected places");
    const top = new DestinationRanker().shortlist(filtered.places, members, 2);
    expect(top).toHaveLength(5);
    expect(top[0]?.place.id).toBe("goa");
    const happiness = top.map((r) => r.leastHappy);
    expect(happiness).toEqual([...happiness].sort((a, b) => b - a));
    expect(top.every((r) => r.leastHappy >= 1)).toBe(true);
  });

  it("tops a short list up to three with the nearest over-budget places, and says by how much", () => {
    const ranker = new DestinationRanker();
    const one = ranker.shortlist(PLACES.filter((p) => p.id === "mysuru"), members, 2);
    const over = PLACES.filter((p) => ["udaipur", "havelock", "rishikesh"].includes(p.id));
    const topped = ranker.topUp(one, over, members, 2, Money.fromRupees(12000));
    expect(topped.map((r) => r.place.id)).toEqual(["mysuru", "rishikesh", "udaipur"]);
    expect(topped[0]?.overBy).toBeUndefined();
    expect(topped[1]?.overBy).toBe(Money.fromRupees(1700));
  });

  it("ignores people on neutral defaults when finding the least-happy", () => {
    const defaulted: Member = { ...me, id: "d", status: "defaulted", avatar: { items: [], lockedItemId: null } };
    const [first] = new DestinationRanker().rank(PLACES.slice(0, 1), [me, defaulted], 2);
    expect(first?.leastHappy).toBe(3);
  });
});

describe("suggestCapRaise", () => {
  const r = Money.fromRupees;
  it("suggests the cheapest fitting price, rounded up to ₹500", () => {
    expect(suggestCapRaise(r(22_700), r(3_000))).toBe(r(23_000));
  });
  it("says nothing when the cap isn't below that price", () => {
    expect(suggestCapRaise(r(9_000), r(18_000))).toBeNull();
    expect(suggestCapRaise(null, r(3_000))).toBeNull();
  });
});
