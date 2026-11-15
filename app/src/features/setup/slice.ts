import { createSlice } from "@reduxjs/toolkit";
import type { Paise, Trip, TripFrame } from "@/domain";
import { createAppThunk } from "@/app/hooks";

type CreateStatus = { kind: "idle" } | { kind: "saving" } | { kind: "error"; message: string };

export interface TripState {
  trip: Trip | null;
  create: CreateStatus;
}

const initialState: TripState = { trip: null, create: { kind: "idle" } };

/** "Start a trip" → "Make share link". */
export const createTrip = createAppThunk("trip/create", async (frame: TripFrame, { extra, rejectWithValue }) => {
  try {
    return await extra.trips.createTrip(frame);
  } catch {
    return rejectWithValue("Couldn't create the trip link. Your details are still here. Try again.");
  }
});

/** The trip starter raises the group cap (from "Name the limit"). */
export const updateCap = createAppThunk("trip/updateCap", async (cap: Paise, { getState, extra, rejectWithValue }) => {
  const trip = getState().trip.trip;
  if (!trip) return rejectWithValue("No trip yet");
  try {
    return await extra.trips.updateCap(trip.id, cap);
  } catch {
    return rejectWithValue("Couldn't change the cap. Try again.");
  }
});

const tripSlice = createSlice({
  name: "trip",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createTrip.pending, (state) => {
        state.create = { kind: "saving" };
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.trip = { ...action.payload, stage: "avatars" };
        state.create = { kind: "idle" };
      })
      .addCase(updateCap.fulfilled, (state, action) => {
        if (state.trip) state.trip.frame = action.payload.frame;
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.create = { kind: "error", message: action.payload ?? "Something went wrong. Try again." };
      });
  },
});

export const tripReducer = tripSlice.reducer;
