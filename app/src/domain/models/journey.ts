import type { ISODate, ItemId, MemberId, Paise } from "./types";

/* ---------- Decide ---------- */

/** One person's ballot: up to three loves (can stack on one place) and at most one veto. */
export interface Ballot {
  memberId: MemberId;
  loves: Record<string, number>;
  vetoPlaceId: string | null;
}

export interface PlaceTally {
  placeId: string;
  loves: number;
  vetoes: number;
}

export type Decision =
  | { kind: "winner"; placeId: string; tallies: PlaceTally[] }
  | { kind: "tie-break"; placeId: string; tiedPlaceIds: string[]; tallies: PlaceTally[] };

/* ---------- Plan ---------- */

export const SLOTS = ["morning", "afternoon", "evening"] as const;
export type Slot = (typeof SLOTS)[number];

/** A thing to do at a place, from the sample catalogue. */
export interface MomentTemplate {
  id: string;
  placeId: string;
  title: string;
  serves: ItemId;
  slot: Slot;
  durationMins: number;
  pricePerPerson: Paise;
  /** Fewer than this many people and it doesn't run. */
  minPeople: number;
  indoor: boolean;
  /** "Why this": a cited Been-there note. */
  why: string;
  source: string;
}

export type ItineraryItem =
  | { kind: "moment"; id: string; day: number; slot: Slot; templateId: string; addedBy: MemberId | "agent"; locked: boolean }
  | { kind: "gap"; id: string; day: number; slot: Slot };

export interface Itinerary {
  placeId: string;
  days: ISODate[];
  items: ItineraryItem[];
}

/** An edit is a proposal, never a change, until the group agrees. */
export interface Proposal {
  id: string;
  itemId: string;
  fromTemplateId: string;
  toTemplateId: string;
  costDeltaPerPerson: Paise;
  /** Minutes the next slot that day moves (0 = same timings). */
  timeShiftMins: number;
  status: "pending" | "accepted" | "objected";
  objections: number;
}

/* ---------- Book ---------- */

export type BookingKind = "travel" | "stay" | "activity";

export type TravelMode = "flight" | "train" | "bus";

/** One way of a journey, as shown on a ticket. */
export interface TravelLeg {
  /** Flight or train number, or the bus operator's service code. */
  code: string;
  carrier: string;
  from: string;
  to: string;
  date: ISODate;
  depart: string;
  arrive: string;
  duration: string;
  /** Terminal, platform or bus bay. */
  gate: string;
}

export interface BookingOption {
  id: string;
  label: string;
  detail: string;
  pricePerPerson: Paise;
  refundable: boolean;
  /** Travel only. */
  mode?: TravelMode;
  legs?: { out: TravelLeg; back: TravelLeg };
  /** Stay only. */
  area?: string;
  rating?: number;
  perks?: string[];
}

export interface BookingLine {
  id: string;
  kind: BookingKind;
  title: string;
  chosen: BookingOption;
  /** One-line reason shown on the card: why this option. */
  why: string;
  /** Set after "Revalidate prices" if the live price differs. */
  livePrice?: Paise;
}

export interface Traveller {
  memberId: MemberId;
  name: string;
  status: "added" | "missing";
}

/* ---------- Trip ---------- */

export interface Expense {
  id: string;
  title: string;
  amount: Paise;
  paidBy: MemberId;
  splitAmong: MemberId[];
}

export interface Transfer {
  from: MemberId;
  to: MemberId;
  amount: Paise;
}

export type MomentFeedback = "loved" | "liked" | "meh" | "not-again" | "skipped";
