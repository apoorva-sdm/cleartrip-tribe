import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Money, type Expense, type ItemId, type MomentFeedback } from "@/domain";
import { createAppThunk } from "@/app/hooks";
import { replaceMoment } from "@/features/plan/slice";
import { bookOnTrip, checkPrices } from "@/features/book/slice";

/** A mid-trip shift, recomputed by the agent, waiting for the group to reconfirm. */
export interface TripChange {
  kind: "weather" | "dropout";
  title: string;
  lines: string[];
  swap?: { itemId: string; toTemplateId: string };
  /** Readjusted prices per person, for a dropout. */
  prices?: Array<{ label: string; was: number; now: number }>;
}

export interface LiveState {
  change: TripChange | null;
  log: string[];
  expenses: Expense[];
  seeded: boolean;
  settled: string[];
  feedback: Record<string, MomentFeedback>;
  learned: { notesAdded: number; somedayAdded: ItemId[] } | null;
}

export const initialLiveState: LiveState = { change: null, log: [], expenses: [], seeded: false, settled: [], feedback: {}, learned: null };

/** "Plan or crew changes": recompute today's plan for a shift, then reconfirm together. */
export const reportChange = createAppThunk(
  "live/reportChange",
  async ({ kind, day }: { kind: TripChange["kind"]; day: number }, { getState, extra }): Promise<TripChange> => {
    await extra.wait(1200);
    const { plan, book } = getState();
    const today = (plan.itinerary?.items ?? []).flatMap((i) => {
      const t = i.kind === "moment" && i.day === day ? plan.catalogue.find((c) => c.id === i.templateId) : undefined;
      return t && i.kind === "moment" ? [{ item: i, t }] : [];
    });
    if (kind === "weather") {
      const outdoor = today.find((x) => !x.t.indoor);
      const used = new Set((plan.itinerary?.items ?? []).flatMap((i) => (i.kind === "moment" ? [i.templateId] : [])));
      // Prefer an indoor option meant for the same time of day.
      const indoor = plan.catalogue
        .filter((c) => c.indoor && !used.has(c.id))
        .sort((a, b) => Number(b.slot === outdoor?.item.slot) - Number(a.slot === outdoor?.item.slot))[0];
      if (!outdoor || !indoor) {
        return { kind, title: "Rain today ☔", lines: ["Today's already indoors. Nothing to change."] };
      }
      return {
        kind,
        title: "Rain today ☔",
        lines: [
          `Swap ${outdoor.t.title} → ${indoor.title} (indoors).`,
          indoor.pricePerPerson === outdoor.t.pricePerPerson
            ? "Same price."
            : `Cost: ${indoor.pricePerPerson > outdoor.t.pricePerPerson ? "+" : "−"}${Money.format(Math.abs(indoor.pricePerPerson - outdoor.t.pricePerPerson))} each.`,
        ],
        swap: { itemId: outdoor.item.id, toTemplateId: indoor.id },
      };
    }
    const size = Math.max(2, book.travellers.length || getState().trip.trip?.expectedSize || 2);
    const atRisk = today.filter((x) => x.t.minPeople > size - 1);
    // Shared costs (the stay, and any group bookings) are re-split among those still going.
    const stay = book.lines.find((l) => l.kind === "stay") ?? null;
    const stayOption = stay?.chosen ?? book.stayOptions.find((o) => o.id === book.picks.stay) ?? null;
    const travel = book.lines.find((l) => l.kind === "travel")?.chosen ?? book.travelOptions.find((o) => o.id === book.picks.travel) ?? null;
    const prices: NonNullable<TripChange["prices"]> = [];
    if (stayOption) {
      const was = stay?.livePrice ?? stayOption.pricePerPerson;
      prices.push({ label: "Stay, each", was, now: Math.round((was * size) / (size - 1)) });
    }
    const todayPaid = today.reduce((sum, x) => sum + x.t.pricePerPerson, 0);
    if (todayPaid > 0) prices.push({ label: "Today's activities, each", was: todayPaid, now: todayPaid });
    return {
      kind,
      title: `${size - 1} of you now`,
      prices,
      lines: [
        "One person dropped out. Nobody is named in the chat.",
        atRisk.length > 0
          ? `${atRisk.map((x) => x.t.title).join(", ")} needs ${atRisk[0]?.t.minPeople}. Tribe will ask to move it.`
          : "Every activity still runs.",
        travel ? (travel.refundable ? "Their ticket is refundable, so they get money back." : "Their ticket is non-refundable.") : "",
      ].filter(Boolean),
    };
  },
);

export const reconfirmChange = createAppThunk("live/reconfirmChange", async (_: void, { getState, extra, dispatch }) => {
  const change = getState().live.change;
  await extra.wait(1500);
  if (change?.swap) dispatch(replaceMoment({ itemId: change.swap.itemId, templateId: change.swap.toTemplateId }));
  return change?.title ?? "Change";
});

/** "Split expenses": seed with the Cleartrip booking (if any, paid upfront by the trip starter) and what the group logged. */
export const seedExpenses = createAppThunk("live/seed", async (_: void, { getState, extra }) => {
  const { group, book } = getState();
  const meId = group.meId ?? "me";
  const ids = book.travellers.map((t) => t.memberId);
  const members = Object.values(group.members.entities).flatMap((m) => (m ? [m] : []));
  const logged = await extra.journey.seedExpenses(members, meId);
  const total = book.bookingRef ? extra.booking.totalPerPerson(book.lines) * ids.length : 0;
  const booking: Expense[] = total > 0 ? [{ id: "e-booking", title: "Cleartrip booking", amount: total, paidBy: meId, splitAmong: ids }] : [];
  return [...booking, ...logged.map((e) => ({ ...e, splitAmong: ids }))];
});

const liveSlice = createSlice({
  name: "live",
  initialState: initialLiveState,
  reducers: {
    dismissChange(state) {
      state.change = null;
    },
    addExpense(state, action: PayloadAction<Expense>) {
      state.expenses.push(action.payload);
    },
    markSettled(state, action: PayloadAction<string>) {
      if (!state.settled.includes(action.payload)) state.settled.push(action.payload);
    },
    giveFeedback(state, action: PayloadAction<{ itemId: string; value: MomentFeedback }>) {
      state.feedback[action.payload.itemId] = action.payload.value;
    },
    /** "Avatars learn" → "Repository grows". */
    learn(state, action: PayloadAction<ItemId[]>) {
      state.learned = { notesAdded: Object.keys(state.feedback).length, somedayAdded: action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkPrices.fulfilled, () => initialLiveState)
      .addCase(reportChange.fulfilled, (state, action) => {
        state.change = action.payload;
      })
      .addCase(reconfirmChange.fulfilled, (state, action) => {
        state.log.unshift(`✓ ${action.payload}: tribe reconfirmed`);
        state.change = null;
      })
      .addCase(seedExpenses.fulfilled, (state, action) => {
        // Keep anything booked on the trip.
        state.expenses = [...action.payload, ...state.expenses.filter((e) => e.id.startsWith("otb-"))];
        state.seeded = true;
      })
      .addCase(bookOnTrip.fulfilled, (state, action) => {
        const b = action.payload;
        if (b.amount > 0 && !state.expenses.some((e) => e.id === `otb-${b.key}`)) {
          state.expenses.push({ id: `otb-${b.key}`, title: `${b.title} (booked on the trip)`, amount: b.amount, paidBy: b.paidBy, splitAmong: b.splitAmong });
        }
      });
  },
});

export const liveReducer = liveSlice.reducer;
export const { dismissChange, addExpense, markSettled, giveFeedback, learn } = liveSlice.actions;
