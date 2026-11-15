import type { RootState } from "@/app/store";

export const selectShortlist = (state: RootState) => (state.match.result.kind === "shortlist" ? state.match.result.places : []);
export const selectBallot = (state: RootState) => state.decide.ballot;
export const selectDecision = (state: RootState) => state.decide.decision;
export const selectLocked = (state: RootState) => state.decide.locked;

export const selectLockedPlace = (state: RootState) => state.decide.locked?.place ?? null;
