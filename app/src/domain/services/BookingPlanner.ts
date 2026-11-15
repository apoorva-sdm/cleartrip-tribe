import { Money, type BookingLine, type BookingOption, type Paise } from "../models";

/** Refundable wins when it costs at most this much more per person. */
export const REFUNDABLE_PREMIUM = Money.fromRupees(500);

/**
 * "Book cheapest options within group preferences": best value under the cap, not the
 * rock-bottom price. Refundable by default when the difference is small, and the trade-off
 * is always shown when the cheapest is passed over.
 */
export class BookingPlanner {
  choose(options: readonly BookingOption[]): { chosen: BookingOption; why: string } {
    const byPrice = [...options].sort((a, b) => a.pricePerPerson - b.pricePerPerson);
    const cheapest = byPrice[0];
    if (!cheapest) throw new Error("No options");
    const refundable = byPrice.find((o) => o.refundable);
    if (!cheapest.refundable && refundable && refundable.pricePerPerson - cheapest.pricePerPerson <= REFUNDABLE_PREMIUM) {
      const extra = Money.format(refundable.pricePerPerson - cheapest.pricePerPerson);
      return {
        chosen: refundable,
        why: `Just ${extra} more than the cheapest, and refundable`,
      };
    }
    if (cheapest.refundable || !refundable) return { chosen: cheapest, why: cheapest.refundable ? "Cheapest, and refundable" : "Cheapest option" };
    return { chosen: cheapest, why: `Cheapest · refundable is ${Money.format(refundable.pricePerPerson - cheapest.pricePerPerson)} more each` };
  }

  totalPerPerson(lines: readonly BookingLine[]): Paise {
    return lines.reduce((sum, l) => sum + (l.livePrice ?? l.chosen.pricePerPerson), 0);
  }
}
