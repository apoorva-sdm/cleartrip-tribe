import type { BookingLine, Paise } from "../models";

export interface PriceChange {
  lineId: string;
  title: string;
  was: Paise;
  now: Paise;
}

/** "Revalidate prices": a live check on every item. `livePrices` comes from the inventory. */
export class PriceRevalidator {
  check(lines: readonly BookingLine[], livePrices: Readonly<Record<string, Paise>>): { lines: BookingLine[]; changes: PriceChange[] } {
    const changes: PriceChange[] = [];
    const updated = lines.map((line) => {
      const live = livePrices[line.id] ?? line.chosen.pricePerPerson;
      if (live !== line.chosen.pricePerPerson) changes.push({ lineId: line.id, title: line.title, was: line.chosen.pricePerPerson, now: live });
      return { ...line, livePrice: live };
    });
    return { lines: updated, changes };
  }
}
