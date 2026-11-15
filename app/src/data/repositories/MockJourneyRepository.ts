import type { BookingOption, Expense, ISODate, Member, MemberId, MomentTemplate, Paise, Place } from "@/domain";
import { MOMENTS } from "../fixtures/moments";
import { CONTACTS, ON_THE_GO, SAFETY, STAY_PRICE_RISE, stayOptions, travelOptions, tripExpenses, type LocalContact, type OnTheGo } from "../fixtures/journey";
import type { JourneyRepository } from "./JourneyRepository";

const LATENCY_MS = 300;

export class MockJourneyRepository implements JourneyRepository {
  constructor(private readonly wait: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms))) {}

  async listMoments(placeId: string): Promise<MomentTemplate[]> {
    await this.wait(LATENCY_MS);
    return MOMENTS.filter((m) => m.placeId === placeId);
  }

  async travelOptions(place: Place, days: readonly ISODate[]): Promise<BookingOption[]> {
    await this.wait(LATENCY_MS);
    return travelOptions(place, days);
  }

  async stayOptions(place: Place, nights: number): Promise<BookingOption[]> {
    await this.wait(LATENCY_MS);
    return stayOptions(place, nights);
  }

  async livePrices(lines: ReadonlyArray<{ id: string; kind: string; price: Paise }>): Promise<Record<string, Paise>> {
    await this.wait(LATENCY_MS * 3);
    return Object.fromEntries(lines.map((l) => [l.id, l.kind === "stay" ? l.price + STAY_PRICE_RISE : l.price]));
  }

  async contact(placeId: string): Promise<LocalContact | null> {
    await this.wait(LATENCY_MS);
    return CONTACTS[placeId] ?? null;
  }

  async safetyNotes(placeId: string): Promise<string[]> {
    await this.wait(LATENCY_MS);
    return SAFETY[placeId] ?? [];
  }

  async onTheGo(_placeId: string): Promise<OnTheGo[]> {
    await this.wait(LATENCY_MS);
    return [...ON_THE_GO];
  }

  async seedExpenses(members: readonly Member[], meId: MemberId): Promise<Expense[]> {
    await this.wait(LATENCY_MS);
    return tripExpenses(members, meId);
  }
}
