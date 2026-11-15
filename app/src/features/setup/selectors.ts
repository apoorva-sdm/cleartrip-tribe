import type { RootState } from "@/app/store";

export const selectTrip = (state: RootState) => state.trip.trip;
export const selectCreateStatus = (state: RootState) => state.trip.create;

export const SHARE_HOST = "cleartrip.com/tribe/";
export const selectShareLink = (state: RootState) =>
  state.trip.trip ? `${SHARE_HOST}${state.trip.trip.shareCode}` : null;
