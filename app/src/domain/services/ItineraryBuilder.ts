import { SLOTS, type ISODate, type Itinerary, type ItineraryItem, type Member, type MomentTemplate, type Slot } from "../models";

/** Every Nth slot is left open on purpose: rest time, and room for "Fill the gaps". */
const GAP_EVERY = 3;

/**
 * "Build itinerary": days → moments. Picks the most-shared picks first and leaves open gaps.
 * It doesn't force fairness; the separate fairness check catches anyone left out.
 */
export class ItineraryBuilder {
  build(placeId: string, days: readonly ISODate[], catalogue: readonly MomentTemplate[], members: readonly Member[]): Itinerary {
    const voters = members.filter((m) => m.status === "joined");
    const shared = (t: MomentTemplate) => voters.filter((m) => m.avatar.items.includes(t.serves)).length;
    const pool = catalogue.filter((t) => t.placeId === placeId).sort((a, b) => shared(b) - shared(a));
    const used = new Set<string>();
    const items: ItineraryItem[] = [];
    let n = 0;
    days.forEach((_, day) => {
      for (const slot of SLOTS) {
        n += 1;
        const pick = n % GAP_EVERY === 0 ? undefined : pool.find((t) => t.slot === slot && !used.has(t.id) && shared(t) > 0);
        if (pick) {
          used.add(pick.id);
          items.push({ kind: "moment", id: `i-${day}-${slot}`, day, slot, templateId: pick.id, addedBy: "agent", locked: false });
        } else {
          items.push({ kind: "gap", id: `i-${day}-${slot}`, day, slot });
        }
      }
    });
    return { placeId, days: [...days], items };
  }

  /**
   * Other moments that could go in this slot (the "three options": current + up to two more).
   * Unused moments only; ones meant for this time of day come first.
   */
  alternatives(itinerary: Itinerary, slot: Slot, catalogue: readonly MomentTemplate[], limit = 2): MomentTemplate[] {
    const used = new Set(itinerary.items.flatMap((i) => (i.kind === "moment" ? [i.templateId] : [])));
    return catalogue
      .filter((t) => t.placeId === itinerary.placeId && !used.has(t.id))
      .sort((a, b) => Number(b.slot === slot) - Number(a.slot === slot))
      .slice(0, limit);
  }
}

export const SLOT_START: Record<Slot, string> = { morning: "09:00", afternoon: "14:00", evening: "18:30" };
/** Minutes available in a slot before it runs into the next. */
export const SLOT_WINDOW: Record<Slot, number> = { morning: 300, afternoon: 270, evening: 210 };
