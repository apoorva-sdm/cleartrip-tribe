import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Itinerary, MomentTemplate, Proposal } from "@/domain";
import { createAppThunk } from "@/app/hooks";
import { submitVotes } from "@/features/decide/slice";

export interface PlanState {
  catalogue: MomentTemplate[];
  itinerary: Itinerary | null;
  proposals: Proposal[];
  /** Activity as a story, newest first. */
  story: string[];
  frozen: boolean;
}

export const initialPlanState: PlanState = { catalogue: [], itinerary: null, proposals: [], story: [], frozen: false };

/** How long "the group" takes to answer a proposal in the prototype. */
const GROUP_RESPONSE_MS = 1600;

const titleOf = (catalogue: readonly MomentTemplate[], id: string) => catalogue.find((t) => t.id === id)?.title ?? "a moment";

/** Plan · Build itinerary: days → moments, with open gaps on purpose. */
export const buildItinerary = createAppThunk("plan/build", async (_: void, { getState, extra, rejectWithValue }) => {
  const { decide, group } = getState();
  if (!decide.locked) return rejectWithValue("No place locked yet");
  const catalogue = await extra.journey.listMoments(decide.locked.place.id);
  const members = Object.values(group.members.entities);
  const itinerary = extra.itineraries.build(decide.locked.place.id, decide.locked.days, catalogue, members);
  return { catalogue, itinerary };
});

/** Group reviews: a swap is a proposal. The group answers; only then does the plan change. */
export const proposeSwap = createAppThunk(
  "plan/propose",
  async ({ itemId, toTemplateId }: { itemId: string; toTemplateId: string }, { getState, extra, dispatch, rejectWithValue }) => {
    const { plan, group } = getState();
    const item = plan.itinerary?.items.find((i) => i.id === itemId);
    const from = item?.kind === "moment" ? plan.catalogue.find((t) => t.id === item.templateId) : undefined;
    const to = plan.catalogue.find((t) => t.id === toTemplateId);
    if (!item || item.kind !== "moment" || !from || !to) return rejectWithValue("Can't swap that");
    const proposal = extra.proposals.propose(item, from, to);
    dispatch(planSlice.actions.proposalAdded(proposal));
    await extra.wait(GROUP_RESPONSE_MS);
    return { proposal: extra.proposals.respond(proposal, group.members.ids.length), by: group.meId ?? "me" };
  },
);

const planSlice = createSlice({
  name: "plan",
  initialState: initialPlanState,
  reducers: {
    proposalAdded(state, action: PayloadAction<Proposal>) {
      state.proposals = [...state.proposals.filter((p) => p.itemId !== action.payload.itemId), action.payload];
    },
    withdrawProposal(state, action: PayloadAction<string>) {
      state.proposals = state.proposals.filter((p) => p.id !== action.payload);
    },
    /** Fill the gaps: anyone can drop a leftover pick into an open slot. */
    fillGap(state, action: PayloadAction<{ itemId: string; templateId: string; by: string; byName: string }>) {
      const { itemId, templateId, by, byName } = action.payload;
      if (!state.itinerary) return;
      state.itinerary.items = state.itinerary.items.map((i) =>
        i.id === itemId && i.kind === "gap" ? { kind: "moment", id: i.id, day: i.day, slot: i.slot, templateId, addedBy: by, locked: false } : i,
      );
      state.story.unshift(`${byName} added ${titleOf(state.catalogue, templateId)}`);
    },
    /** Plan frozen: ready for booking. */
    freeze(state) {
      state.frozen = true;
      state.story.unshift("Plan locked 🔒");
    },
    /** After booking: every planned moment is locked so nobody edits it by accident. */
    lockAll(state) {
      if (!state.itinerary) return;
      state.itinerary.items = state.itinerary.items.map((i) => (i.kind === "moment" ? { ...i, locked: true } : i));
    },
    /** Mid-trip change (Trip stage): swap a moment after the group reconfirms. */
    replaceMoment(state, action: PayloadAction<{ itemId: string; templateId: string }>) {
      if (!state.itinerary) return;
      state.itinerary.items = state.itinerary.items.map((i) =>
        // The swapped-in moment isn't booked yet, so it's no longer locked.
        i.id === action.payload.itemId && i.kind === "moment" ? { ...i, templateId: action.payload.templateId, locked: false } : i,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitVotes.fulfilled, () => initialPlanState)
      .addCase(buildItinerary.fulfilled, (state, action) => {
        state.catalogue = action.payload.catalogue;
        state.itinerary = action.payload.itinerary;
        state.proposals = [];
        state.frozen = false;
        const gaps = action.payload.itinerary.items.filter((i) => i.kind === "gap").length;
        state.story = [`Tribe drafted ${action.payload.itinerary.days.length} days and left ${gaps} gaps open`];
      })
      .addCase(proposeSwap.fulfilled, (state, action) => {
        const { proposal: p, by } = action.payload;
        const from = titleOf(state.catalogue, p.fromTemplateId);
        const to = titleOf(state.catalogue, p.toTemplateId);
        if (p.status === "accepted" && state.itinerary) {
          state.itinerary.items = state.itinerary.items.map((i) =>
            i.id === p.itemId && i.kind === "moment" ? { ...i, templateId: p.toTemplateId, addedBy: by } : i,
          );
          state.proposals = state.proposals.filter((x) => x.id !== p.id);
          state.story.unshift(`Swap agreed: ${to} instead of ${from}`);
        } else {
          state.proposals = state.proposals.map((x) => (x.id === p.id ? p : x));
          state.story.unshift(`${p.objections} ${p.objections === 1 ? "objection" : "objections"} to swapping ${from} for ${to}`);
        }
      });
  },
});

export const planReducer = planSlice.reducer;
export const { withdrawProposal, fillGap, freeze, replaceMoment, lockAll } = planSlice.actions;
