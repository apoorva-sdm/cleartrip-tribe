import { describe, expect, it } from "vitest";
import { loadState, saveState } from "@/app/persistence";
import { createStore } from "@/app/store";
import { MockTripRepository } from "../repositories/MockTripRepository";
import { memoryStore } from "../sessionStore";

const frame = { window: { start: "2026-12-18", end: "2026-12-21" }, deadline: "2026-11-20T15:30:00.000Z", capPerPerson: 1_800_000 };
const noWait = () => Promise.resolve();

describe("surviving a trip out to WhatsApp and back", () => {
  it("keeps the trip, members and nudge across a reload", async () => {
    const store = memoryStore();
    let now = 1_000;
    const before = new MockTripRepository(store, () => now, noWait);
    const trip = await before.createTrip(frame);
    await before.recordNudge(trip.id);

    now += 10_000; // back from WhatsApp, both late joiners have arrived
    const after = new MockTripRepository(store, () => now, noWait);
    expect(await after.listMembers(trip.id)).toHaveLength(5);
  });

  it("restores flow state but drops in-flight statuses", () => {
    const store = memoryStore();
    const initial = createStore(undefined, false).getState();
    saveState(
      {
        ...initial,
        trip: { trip: null, create: { kind: "saving" } },
        group: { ...initial.group, meId: "m-1", save: { kind: "busy" }, nudge: { kind: "composing" } },
      },
      store,
    );
    const restored = loadState(initial, store);
    expect(restored?.group.meId).toBe("m-1");
    expect(restored?.group.nudge.kind).toBe("idle");
    expect(restored?.trip.create.kind).toBe("idle");
    expect(restored?.decide).toEqual(initial.decide);
  });
});
