import { createAction, createSlice } from "@reduxjs/toolkit";

/** What's kept of a trip after you start a new one. Just enough to list it. */
export interface TripSummary {
  id: string;
  title: string;
  dates: string;
  /** Where it got to, e.g. "Plan" or "Done". */
  reached: string;
  crew: number;
  done: boolean;
}

export interface MyTribeState {
  earlier: TripSummary[];
}

export const initialMyTribeState: MyTribeState = { earlier: [] };

/**
 * Start a fresh trip. The current one (if any) moves to "Earlier trips" and every
 * flow slice resets (see the root reducer in app/store).
 */
export const startNewTrip = createAction<TripSummary | null>("myTribe/startNewTrip");

const myTribeSlice = createSlice({
  name: "myTribe",
  initialState: initialMyTribeState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(startNewTrip, (state, action) => {
      if (action.payload && !state.earlier.some((t) => t.id === action.payload?.id)) state.earlier.unshift(action.payload);
    });
  },
});

export const myTribeReducer = myTribeSlice.reducer;
