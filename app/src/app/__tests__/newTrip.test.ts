import { describe, expect, it } from "vitest";
import { createServices } from "../services";
import { createStore } from "../store";
import { createTrip } from "@/features/setup/slice";
import { selectCurrentTrip, selectEarlierTrips } from "@/features/mytribe/selectors";
import { startNewTrip } from "@/features/mytribe/slice";

describe("My Tribe", () => {
  it("shows the trip in progress, and starting a new one files it under earlier trips and resets the flow", async () => {
    const store = createStore({ ...createServices(), wait: async () => {} }, false);
    expect(selectCurrentTrip(store.getState())).toBeNull();

    await store.dispatch(
      createTrip({ window: { start: "2026-12-18", end: "2026-12-21" }, deadline: "2026-12-01T21:00:00", capPerPerson: 1_800_000 }),
    );
    const current = selectCurrentTrip(store.getState());
    expect(current?.resumeTo).toBe("/tribe/avatar");
    expect(current?.summary.reached).toBe("Setup");

    store.dispatch(startNewTrip(current?.summary ?? null));
    expect(selectCurrentTrip(store.getState())).toBeNull();
    expect(selectEarlierTrips(store.getState())).toEqual([expect.objectContaining({ title: "Trip in the making", reached: "Setup" })]);
  });
});
