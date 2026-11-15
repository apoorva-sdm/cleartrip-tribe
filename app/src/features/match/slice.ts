import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { MIN_TO_VOTE, suggestCapRaise, type LimitExplanation, type Paise, type PrivateConstraints, type RankedPlace } from "@/domain";
import { createAppThunk } from "@/app/hooks";
import { updateCap } from "@/features/setup";

/** What the user entered, without the id (that's added when saving). */
export type MyConstraints = Omit<PrivateConstraints, "memberId">;

export type MatchResult =
  | { kind: "idle" }
  | { kind: "matching" }
  | { kind: "shortlist"; places: RankedPlace[]; nights: number; days: string[] }
  /** `suggestedCap` is set when the budget is the limit and the trip starter could raise the group cap. */
  | { kind: "none-fit"; limit: LimitExplanation; suggestedCap: Paise | null }
  | { kind: "error"; message: string };

export interface MatchState {
  mine: MyConstraints | null;
  result: MatchResult;
}

export const initialMatchState: MatchState = { mine: null, result: { kind: "idle" } };
const initialState = initialMatchState;

/** So the agent's steps can be read; the real work is instant with sample data. */
const THINKING_MS = 3200;

/**
 * Match: private constraints → needs filter first → anything fits?
 * Yes: shortlist three (least-happy first). No: name the limit.
 */
export const runMatch = createAppThunk("match/run", async (mine: MyConstraints, { getState, extra, rejectWithValue }) => {
  const { trip } = getState().trip;
  const meId = getState().group.meId;
  if (!trip || !meId) return rejectWithValue("No trip yet");
  try {
    const [, places, constraints] = await Promise.all([
      extra.wait(THINKING_MS),
      extra.places.listPlaces(),
      extra.trips.saveConstraints(trip.id, { ...mine, memberId: meId }).then(() => extra.trips.listConstraints(trip.id)),
    ]);
    const members = await extra.trips.listMembers(trip.id);
    const needs = extra.needsBuilder.build(trip.frame.window, trip.frame.capPerPerson, constraints);
    const filtered = extra.needsFilter.apply(places, needs);
    // One or two fit: top up with the nearest over-budget places so there are always 3 to vote on.
    if (filtered.kind === "ok" && filtered.places.length < MIN_TO_VOTE) {
      const fitting = extra.ranker.shortlist(filtered.places, members, needs.nights);
      const over = extra.needsFilter.passingAllBut(places, needs, "budget").filter((p) => !filtered.places.includes(p));
      const topped = extra.ranker.topUp(fitting, over, members, needs.nights, needs.ceiling);
      return { kind: "shortlist" as const, places: topped, nights: needs.nights, days: needs.days };
    }
    if (filtered.kind === "none-fit") {
      const limit = extra.limits.explain(filtered.binding, places, needs);
      const suggestedCap = limit.constraint === "budget" ? suggestCapRaise(limit.nearestCost, trip.frame.capPerPerson) : null;
      return { kind: "none-fit" as const, limit, suggestedCap };
    }
    return { kind: "shortlist" as const, places: extra.ranker.shortlist(filtered.places, members, needs.nights), nights: needs.nights, days: needs.days };
  } catch {
    return rejectWithValue("Couldn't search right now. Your answers are saved. Try again.");
  }
});

/**
 * Trip starter only: raise the group cap and search again. Their own private max started
 * at the old cap, so it goes up too (the screen says so).
 */
export const raiseCapAndRetry = createAppThunk(
  "match/raiseCap",
  async (newCap: Paise, { getState, dispatch, rejectWithValue }) => {
    const mine = getState().match.mine;
    if (!mine) return rejectWithValue("Answer your private constraints first");
    const updated = await dispatch(updateCap(newCap));
    if (updateCap.rejected.match(updated)) return rejectWithValue(updated.payload ?? "Couldn't change the cap.");
    await dispatch(runMatch({ ...mine, maxBudget: Math.max(mine.maxBudget, newCap) }));
    return newCap;
  },
);

const matchSlice = createSlice({
  name: "match",
  initialState,
  reducers: {
    /** Back to private constraints ("Adjust and retry"). */
    resetMatch(state) {
      state.result = { kind: "idle" };
    },
    keepDraft(state, action: PayloadAction<MyConstraints>) {
      state.mine = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runMatch.pending, (state, action) => {
        state.mine = action.meta.arg;
        state.result = { kind: "matching" };
      })
      .addCase(runMatch.fulfilled, (state, action) => {
        state.result = action.payload;
      })
      .addCase(raiseCapAndRetry.rejected, (state, action) => {
        state.result = { kind: "error", message: action.payload ?? "Couldn't change the cap. Try again." };
      })
      .addCase(runMatch.rejected, (state, action) => {
        state.result = { kind: "error", message: action.payload ?? "Something went wrong. Try again." };
      });
  },
});

export const matchReducer = matchSlice.reducer;
export const { resetMatch, keepDraft } = matchSlice.actions;
