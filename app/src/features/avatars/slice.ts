import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { Avatar, Member, MemberId, PendingMember } from "@/domain";
import { createAppThunk } from "@/app/hooks";

export const membersAdapter = createEntityAdapter<Member>();

type Status = { kind: "idle" } | { kind: "busy" } | { kind: "error"; message: string };
type Nudge =
  | { kind: "idle" }
  | { kind: "composing" }
  | { kind: "ready"; text: string }
  | { kind: "sent"; text: string }
  | { kind: "error"; message: string };

export interface GroupState {
  members: ReturnType<typeof membersAdapter.getInitialState>;
  meId: MemberId | null;
  /** True once the first member list has loaded. */
  synced: boolean;
  save: Status;
  nudge: Nudge;
  /** The initiator skipped waiting: picks close now and anyone missing joins with defaults. */
  closedEarly: boolean;
  /** Friends still building their avatar. */
  pending: PendingMember[];
  /** Friends nudged one-to-one. */
  nudgedIds: MemberId[];
}

const initialState: GroupState = {
  members: membersAdapter.getInitialState(),
  meId: null,
  synced: false,
  save: { kind: "idle" },
  nudge: { kind: "idle" },
  closedEarly: false,
  pending: [],
  nudgedIds: [],
};

function requireTripId(tripId: string | undefined): string {
  if (!tripId) throw new Error("No trip yet");
  return tripId;
}

/** Avatars · Build avatars. The initiator's avatar counts the same as everyone else's. */
export const saveMyAvatar = createAppThunk(
  "group/saveMyAvatar",
  async (input: { name: string; avatar: Avatar }, { getState, extra, rejectWithValue }) => {
    try {
      const tripId = requireTripId(getState().trip.trip?.id);
      return await extra.trips.addMember(tripId, { name: input.name.trim(), role: "initiator", avatar: input.avatar });
    } catch {
      return rejectWithValue("Couldn't save your avatar. Your picks are still here. Try again.");
    }
  },
);

export const syncMembers = createAppThunk("group/sync", async (_: void, { getState, extra, rejectWithValue }) => {
  try {
    const tripId = requireTripId(getState().trip.trip?.id);
    const [members, pending] = await Promise.all([extra.trips.listMembers(tripId), extra.trips.listPending(tripId)]);
    return { members, pending };
  } catch {
    return rejectWithValue("Couldn't refresh the group.");
  }
});

/** Avatars · Nudge in chat. The agent writes a friendly reminder with no names. */
export const composeNudge = createAppThunk(
  "group/composeNudge",
  async (input: { pending: number; link: string }, { getState, extra, rejectWithValue }) => {
    const trip = getState().trip.trip;
    if (!trip) return rejectWithValue("No trip yet");
    try {
      const message = await extra.agent.composeNudge({ ...input, deadline: trip.frame.deadline });
      return message.text;
    } catch {
      return rejectWithValue("Couldn't write the reminder. Try again.");
    }
  },
);

/** Nudge one friend directly. */
export const nudgeOne = createAppThunk("group/nudgeOne", async (memberId: MemberId, { getState, extra }) => {
  await extra.trips.recordNudge(requireTripId(getState().trip.trip?.id), memberId);
  return memberId;
});

export const markNudgeSent = createAppThunk("group/nudgeSent", async (_: void, { getState, extra }) => {
  await extra.trips.recordNudge(requireTripId(getState().trip.trip?.id));
});

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    closePicksEarly(state) {
      state.closedEarly = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveMyAvatar.pending, (state) => {
        state.save = { kind: "busy" };
      })
      .addCase(saveMyAvatar.fulfilled, (state, action) => {
        membersAdapter.upsertOne(state.members, action.payload);
        state.meId = action.payload.id;
        state.save = { kind: "idle" };
      })
      .addCase(saveMyAvatar.rejected, (state, action) => {
        state.save = { kind: "error", message: action.payload ?? "Something went wrong. Try again." };
      })
      .addCase(syncMembers.fulfilled, (state, action) => {
        membersAdapter.setAll(state.members, action.payload.members);
        state.pending = action.payload.pending;
        state.synced = true;
      })
      .addCase(composeNudge.pending, (state) => {
        state.nudge = { kind: "composing" };
      })
      .addCase(composeNudge.fulfilled, (state, action) => {
        state.nudge = { kind: "ready", text: action.payload };
      })
      .addCase(composeNudge.rejected, (state, action) => {
        state.nudge = { kind: "error", message: action.payload ?? "Couldn't write the reminder. Try again." };
      })
      .addCase(nudgeOne.pending, (state, action) => {
        if (!state.nudgedIds.includes(action.meta.arg)) state.nudgedIds.push(action.meta.arg);
      })
      .addCase(markNudgeSent.pending, (state) => {
        if (state.nudge.kind === "ready") state.nudge = { kind: "sent", text: state.nudge.text };
      });
  },
});

export const groupReducer = groupSlice.reducer;
export const { closePicksEarly } = groupSlice.actions;
