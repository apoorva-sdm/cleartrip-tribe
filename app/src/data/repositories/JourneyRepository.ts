import type { BookingOption, Expense, ISODate, Member, MemberId, MomentTemplate, Paise, Place } from "@/domain";
import type { LocalContact, OnTheGo } from "../fixtures/journey";

/** Inventory and on-trip data for Plan, Book and Trip. */
export interface JourneyRepository {
  listMoments(placeId: string): Promise<MomentTemplate[]>;
  travelOptions(place: Place, days: readonly ISODate[]): Promise<BookingOption[]>;
  stayOptions(place: Place, nights: number): Promise<BookingOption[]>;
  /** Live prices at booking time, by booking line id. */
  livePrices(lines: ReadonlyArray<{ id: string; kind: string; price: Paise }>): Promise<Record<string, Paise>>;
  /** Shown only after the place is locked and booked. */
  contact(placeId: string): Promise<LocalContact | null>;
  safetyNotes(placeId: string): Promise<string[]>;
  /** Things to book on the spot during the trip. */
  onTheGo(placeId: string): Promise<OnTheGo[]>;
  seedExpenses(members: readonly Member[], meId: MemberId): Promise<Expense[]>;
}
