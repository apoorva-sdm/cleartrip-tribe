import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { services } from "@/app/services";
import { membersAdapter } from "./slice";

const memberSelectors = membersAdapter.getSelectors((state: RootState) => state.group.members);

export const selectMeId = (state: RootState) => state.group.meId;
export const selectSynced = (state: RootState) => state.group.synced;
export const selectSaveStatus = (state: RootState) => state.group.save;
export const selectNudge = (state: RootState) => state.group.nudge;
export const selectClosedEarly = (state: RootState) => state.group.closedEarly === true;

/** You first, then everyone else in join order. */
export const selectMembers = createSelector([memberSelectors.selectAll, selectMeId], (members, meId) => [
  ...members.filter((m) => m.id === meId),
  ...members.filter((m) => m.id !== meId),
]);

export const selectOverlaps = createSelector([memberSelectors.selectAll], (members) => services.overlaps.find(members));
export const selectPending = (state: RootState) => state.group.pending ?? [];
export const selectNudgedIds = (state: RootState) => state.group.nudgedIds ?? [];
