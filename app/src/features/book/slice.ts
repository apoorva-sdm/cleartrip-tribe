import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BookingKind, BookingLine, BookingOption, PriceChange, Traveller } from "@/domain";
import { createAppThunk } from "@/app/hooks";
import { buildItinerary, lockAll } from "@/features/plan/slice";

export interface MyDetails {
  fullName: string;
  dob: string;
}

/** Each booking step can be added to the Cleartrip booking or skipped (book it yourself, or later). */
export type StepChoice = "book" | "skip";
/** Answered right before the trip starts. */
export type BookedVia = "cleartrip" | "separate" | "mixed";

export interface BookState {
  travelOptions: BookingOption[];
  stayOptions: BookingOption[];
  /** Tribe's best-value pick per step, with the reason. */
  recommended: { travel: string | null; stay: string | null; why: Record<string, string> };
  picks: { travel: string | null; stay: string | null; activities: string[] };
  steps: Partial<Record<BookingKind, StepChoice>>;
  lines: BookingLine[];
  changes: PriceChange[];
  pricesChecked: boolean;
  reconfirmed: boolean;
  travellers: Traveller[];
  myDetails: MyDetails | null;
  bookedLineIds: string[];
  bookingRef: string | null;
  bookedVia: BookedVia | null;
  /** Itinerary items booked on the spot during the trip. */
  bookedOnTrip: string[];
}

export const initialBookState: BookState = {
  travelOptions: [],
  stayOptions: [],
  recommended: { travel: null, stay: null, why: {} },
  picks: { travel: null, stay: null, activities: [] },
  steps: {},
  lines: [],
  changes: [],
  pricesChecked: false,
  reconfirmed: false,
  travellers: [],
  myDetails: null,
  bookedLineIds: [],
  bookingRef: null,
  bookedVia: null,
  bookedOnTrip: [],
};

/** Travel and stay options for the locked place, with Tribe's best-value pick preselected. */
export const loadOptions = createAppThunk("book/loadOptions", async (_: void, { getState, extra, rejectWithValue }) => {
  const { decide, plan } = getState();
  if (!decide.locked || !plan.itinerary) return rejectWithValue("Plan isn't ready");
  const { place, nights, days } = decide.locked;
  const [travel, stay] = await Promise.all([extra.journey.travelOptions(place, days), extra.journey.stayOptions(place, nights)]);
  const t = extra.booking.choose(travel);
  const st = extra.booking.choose(stay);
  const activities = plan.itinerary.items.flatMap((i) => {
    const tpl = i.kind === "moment" ? plan.catalogue.find((c) => c.id === i.templateId) : undefined;
    return tpl && tpl.pricePerPerson > 0 ? [i.id] : [];
  });
  return {
    travel,
    stay,
    recommended: { travel: t.chosen.id, stay: st.chosen.id, why: { [t.chosen.id]: t.why, [st.chosen.id]: st.why } },
    activities,
  };
});

/** Review: build lines from what's being booked, then a live price check on each. */
export const checkPrices = createAppThunk("book/checkPrices", async (_: void, { getState, extra }) => {
  const { book, plan, decide } = getState();
  const nights = decide.locked?.nights ?? 1;
  const lines: BookingLine[] = [];
  const travel = book.travelOptions.find((o) => o.id === book.picks.travel);
  const stay = book.stayOptions.find((o) => o.id === book.picks.stay);
  if (book.steps.travel === "book" && travel) {
    lines.push({ id: "travel", kind: "travel", title: "Return travel", chosen: travel, why: book.recommended.why[travel.id] ?? "Your pick" });
  }
  if (book.steps.stay === "book" && stay) {
    lines.push({
      id: "stay",
      kind: "stay",
      title: `Stay · ${nights} ${nights === 1 ? "night" : "nights"}`,
      chosen: stay,
      why: book.recommended.why[stay.id] ?? "Your pick",
    });
  }
  const acts = (plan.itinerary?.items ?? []).flatMap((i) => {
    const tpl = i.kind === "moment" && book.picks.activities.includes(i.id) ? plan.catalogue.find((c) => c.id === i.templateId) : undefined;
    return tpl ? [tpl] : [];
  });
  if (book.steps.activity === "book" && acts.length > 0) {
    lines.push({
      id: "activities",
      kind: "activity",
      title: `Activities · ${acts.length}`,
      chosen: {
        id: "activities",
        label: acts.map((a) => a.title).join(", "),
        detail: "from the locked plan",
        pricePerPerson: acts.reduce((sum, a) => sum + a.pricePerPerson, 0),
        refundable: false,
      },
      why: "Only what your tribe agreed on",
    });
  }
  const live = await extra.journey.livePrices(lines.map((l) => ({ id: l.id, kind: l.kind, price: l.chosen.pricePerPerson })));
  return extra.revalidator.check(lines, live);
});

/** "Price changed?" → "Reconfirm together": booking waits until the group agrees to the difference. */
export const reconfirmPrices = createAppThunk("book/reconfirm", async (_: void, { extra }) => {
  await extra.wait(2200);
});

/** Traveller details: each person adds their own. A nudge brings in anyone missing. */
export const askMissingTravellers = createAppThunk("book/askTravellers", async (_: void, { extra }) => {
  await extra.wait(2000);
});

/** Book everything picked, item by item, then lock the plan. Prototype: nothing real is booked or paid. */
export const confirmBooking = createAppThunk("book/confirm", async (_: void, { getState, extra, dispatch }) => {
  for (const line of getState().book.lines) {
    await extra.wait(700);
    dispatch(bookSlice.actions.lineBooked(line.id));
  }
  dispatch(lockAll());
  return `CT-TRIBE-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
});

/** On the trip: book something on the spot. It's paid by you and lands in the split. */
export interface OnTripBooking {
  /** `${itemId}:${templateId}` for a moment, or an on-the-go id. */
  key: string;
  title: string;
  /** Total for the group. */
  amount: number;
  paidBy: string;
  splitAmong: string[];
}
export const bookOnTrip = createAppThunk("book/onTrip", async (input: OnTripBooking, { extra }) => {
  await extra.wait(1100);
  return input;
});

const bookSlice = createSlice({
  name: "book",
  initialState: initialBookState,
  reducers: {
    pickTravel(state, action: PayloadAction<string>) {
      state.picks.travel = action.payload;
      state.pricesChecked = false;
    },
    pickStay(state, action: PayloadAction<string>) {
      state.picks.stay = action.payload;
      state.pricesChecked = false;
    },
    toggleActivity(state, action: PayloadAction<string>) {
      const list = state.picks.activities;
      state.picks.activities = list.includes(action.payload) ? list.filter((id) => id !== action.payload) : [...list, action.payload];
      state.pricesChecked = false;
    },
    setStep(state, action: PayloadAction<{ kind: BookingKind; choice: StepChoice }>) {
      state.steps[action.payload.kind] = action.payload.choice;
      state.pricesChecked = false;
    },
    setTravellers(state, action: PayloadAction<Traveller[]>) {
      state.travellers = action.payload;
    },
    saveMyDetails(state, action: PayloadAction<{ memberId: string; details: MyDetails }>) {
      state.myDetails = action.payload.details;
      state.travellers = state.travellers.map((t) =>
        t.memberId === action.payload.memberId ? { ...t, name: action.payload.details.fullName, status: "added" } : t,
      );
    },
    lineBooked(state, action: PayloadAction<string>) {
      if (!state.bookedLineIds.includes(action.payload)) state.bookedLineIds.push(action.payload);
    },
    setBookedVia(state, action: PayloadAction<BookedVia>) {
      state.bookedVia = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(buildItinerary.fulfilled, () => initialBookState)
      .addCase(loadOptions.fulfilled, (state, action) => {
        state.travelOptions = action.payload.travel;
        state.stayOptions = action.payload.stay;
        state.recommended = action.payload.recommended;
        state.picks.travel ??= action.payload.recommended.travel;
        state.picks.stay ??= action.payload.recommended.stay;
        if (state.picks.activities.length === 0) state.picks.activities = action.payload.activities;
      })
      .addCase(checkPrices.pending, (state) => {
        state.pricesChecked = false;
      })
      .addCase(checkPrices.fulfilled, (state, action) => {
        state.lines = action.payload.lines;
        state.changes = action.payload.changes;
        state.pricesChecked = true;
        state.reconfirmed = action.payload.changes.length === 0;
        state.bookedLineIds = [];
        state.bookingRef = null;
      })
      .addCase(reconfirmPrices.fulfilled, (state) => {
        state.lines = state.lines.map((l) => ({ ...l, chosen: { ...l.chosen, pricePerPerson: l.livePrice ?? l.chosen.pricePerPerson } }));
        state.reconfirmed = true;
      })
      .addCase(askMissingTravellers.fulfilled, (state) => {
        // Friends on defaults add their details after the nudge; your own still come from you.
        state.travellers = state.travellers.map((t) => (t.status === "missing" && t.memberId.startsWith("default-") ? { ...t, status: "added" } : t));
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.bookingRef = action.payload;
      })
      .addCase(bookOnTrip.fulfilled, (state, action) => {
        if (!state.bookedOnTrip.includes(action.payload.key)) state.bookedOnTrip.push(action.payload.key);
      });
  },
});

export const bookReducer = bookSlice.reducer;
export const { setTravellers, saveMyDetails, pickTravel, pickStay, toggleActivity, setStep, setBookedVia } = bookSlice.actions;
