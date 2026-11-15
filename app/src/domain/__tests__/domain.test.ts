import { describe, expect, it } from "vitest";
import {
  EMPTY_AVATAR,
  OverlapFinder,
  ReadinessCheck,
  TripFrameValidator,
  defaultedCount,
  loadoutGap,
  setLock,
  toggleItem,
  type Avatar,
  type Member,
} from "..";

const today = new Date(2026, 10, 15, 10, 0);

describe("TripFrameValidator", () => {
  const validator = new TripFrameValidator();
  const draft = {
    start: "2026-12-18",
    end: "2026-12-21",
    deadlineDate: "2026-11-20",
    deadlineTime: "21:00",
    capRupees: "18,000",
  };

  it("accepts a valid frame and stores the cap in paise", () => {
    const result = validator.validate(draft, today);
    expect(result.kind).toBe("valid");
    if (result.kind === "valid") expect(result.frame.capPerPerson).toBe(1_800_000);
  });

  it("rejects an end date before the start", () => {
    const result = validator.validate({ ...draft, end: "2026-12-10" }, today);
    expect(result.kind === "invalid" && result.errors.end).toBeTruthy();
  });

  it("rejects a deadline after the trip starts", () => {
    const result = validator.validate({ ...draft, deadlineDate: "2026-12-19" }, today);
    expect(result.kind === "invalid" && result.errors.deadline).toBeTruthy();
  });

  it("rejects a missing cap", () => {
    const result = validator.validate({ ...draft, capRupees: "" }, today);
    expect(result.kind === "invalid" && result.errors.cap).toBeTruthy();
  });
});

describe("loadout rules", () => {
  it("allows five picks and refuses a sixth", () => {
    let avatar: Avatar = EMPTY_AVATAR;
    for (const id of ["sunhat", "boots", "camera", "tent", "diya"] as const) {
      const r = toggleItem(avatar, id);
      if (r.kind === "ok") avatar = r.avatar;
    }
    expect(avatar.items).toHaveLength(5);
    expect(toggleItem(avatar, "apron").kind).toBe("full");
  });

  it("needs a lock, and unpicking the locked item clears it", () => {
    const avatar: Avatar = { items: ["sunhat", "boots", "camera", "tent", "diya"], lockedItemId: null };
    expect(loadoutGap(avatar)).toBe("lock");
    const locked = setLock(avatar, "boots");
    expect(loadoutGap(locked)).toBeNull();
    const r = toggleItem(locked, "boots");
    expect(r.kind === "ok" && r.avatar.lockedItemId).toBeNull();
  });

  it("can't lock an item that isn't picked", () => {
    expect(setLock(EMPTY_AVATAR, "boots")).toEqual(EMPTY_AVATAR);
  });
});

describe("ReadinessCheck", () => {
  const check = new ReadinessCheck();
  const deadline = new Date(2026, 10, 20, 21, 0).toISOString();

  it("waits while people are missing before the deadline", () => {
    expect(check.evaluate(4, 6, deadline, today)).toEqual({ kind: "waiting", joined: 4, pending: 2 });
  });

  it("is all in when everyone has joined", () => {
    expect(check.evaluate(6, 6, deadline, today).kind).toBe("all-in");
  });

  it("closes early when the initiator skips, with pending people defaulted", () => {
    const r = check.evaluate(4, 6, deadline, today, true);
    expect(r).toEqual({ kind: "closed-early", joined: 4, pending: 2 });
    expect(defaultedCount(r)).toBe(2);
  });

  it("ignores skipping once everyone is in", () => {
    expect(check.evaluate(6, 6, deadline, today, true).kind).toBe("all-in");
  });

  it("moves on at the deadline even if people are missing", () => {
    const after = new Date(2026, 10, 21);
    expect(check.evaluate(5, 6, deadline, after)).toEqual({ kind: "deadline-passed", joined: 5, pending: 1 });
  });
});

describe("OverlapFinder", () => {
  const member = (id: string, items: Avatar["items"]): Member => ({
    id,
    name: id,
    role: "follower",
    status: "joined",
    avatar: { items, lockedItemId: null },
  });

  it("returns shared picks only, most shared first, with no names", () => {
    const overlaps = new OverlapFinder().find([
      member("a", ["snorkel", "sunhat", "apron"]),
      member("b", ["snorkel", "boots", "camera"]),
      member("c", ["snorkel", "sunhat", "yogamat"]),
    ]);
    expect(overlaps).toEqual([
      { itemId: "snorkel", count: 3 },
      { itemId: "sunhat", count: 2 },
    ]);
    expect(JSON.stringify(overlaps)).not.toMatch(/"a"|"b"|"c"/);
  });

  it("returns nothing when no one shares a pick", () => {
    expect(new OverlapFinder().find([member("a", ["boots"]), member("b", ["apron"])])).toEqual([]);
  });
});
