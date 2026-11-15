import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { LOVES_PER_PERSON, type Decision, type ISODate, type Place } from "@/domain";
import { createAppThunk } from "@/app/hooks";
import { runMatch } from "@/features/match/slice";

export interface MyBallot {
  loves: Record<string, number>;
  vetoPlaceId: string | null;
}

export interface LockedPlace {
  place: Place;
  days: ISODate[];
  nights: number;
}

export interface DecideState {
  ballot: MyBallot;
  decision: Decision | null;
  locked: LockedPlace | null;
}

export const initialDecideState: DecideState = { ballot: { loves: {}, vetoPlaceId: null }, decision: null, locked: null };

/** Decide: Group votes → Tie? → Fairness tie-break → Place locked (dates settled too). */
export const submitVotes = createAppThunk("decide/submit", async (_: void, { getState, extra, rejectWithValue }) => {
  const { trip, group, match, decide } = getState();
  if (!trip.trip || !group.meId || match.result.kind !== "shortlist") return rejectWithValue("No shortlist yet");
  const { places, nights, days } = match.result;
  let ballots;
  try {
    ballots = await extra.trips.castBallot(trip.trip.id, { memberId: group.meId, ...decide.ballot }, places);
  } catch {
    return rejectWithValue("Couldn't send your votes. Try again.");
  }
  const decision = extra.votes.decide(places, ballots);
  const place = places.find((r) => r.place.id === decision.placeId)?.place;
  if (!place) return rejectWithValue("Couldn't lock the place");
  const lockedDays = days?.length ? days : [trip.trip.frame.window.start];
  return { decision, locked: { place, days: lockedDays, nights } };
});

const decideSlice = createSlice({
  name: "decide",
  initialState: initialDecideState,
  reducers: {
    changeLoves(state, action: PayloadAction<{ placeId: string; delta: 1 | -1 }>) {
      const { placeId, delta } = action.payload;
      const used = Object.values(state.ballot.loves).reduce((a, b) => a + b, 0);
      const current = state.ballot.loves[placeId] ?? 0;
      if (delta === 1 && used >= LOVES_PER_PERSON) return;
      if (delta === -1 && current === 0) return;
      state.ballot.loves[placeId] = current + delta;
      if (delta === 1 && state.ballot.vetoPlaceId === placeId) state.ballot.vetoPlaceId = null;
    },
    toggleVeto(state, action: PayloadAction<string>) {
      const placeId = action.payload;
      state.ballot.vetoPlaceId = state.ballot.vetoPlaceId === placeId ? null : placeId;
      if (state.ballot.vetoPlaceId === placeId) state.ballot.loves[placeId] = 0;
    },
    /** New shortlist → fresh ballot. */
    resetVotes() {
      return initialDecideState;
    },
  },
  extraReducers: (builder) => {
    // A new search means a new shortlist: start the vote again.
    builder.addCase(runMatch.pending, () => initialDecideState);
    builder.addCase(submitVotes.fulfilled, (state, action) => {
      state.decision = action.payload.decision;
      state.locked = action.payload.locked;
    });
  },
});

export const decideReducer = decideSlice.reducer;
export const { changeLoves, toggleVeto, resetVotes } = decideSlice.actions;
