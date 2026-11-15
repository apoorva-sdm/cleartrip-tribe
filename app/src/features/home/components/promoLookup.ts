import { PROMOS, type Promo } from "@/features/landing";

/** Picks promos by id, in the order given. */
export function promosById(ids: readonly string[]): Promo[] {
  return ids.map((id) => {
    const promo = PROMOS.find((p) => p.id === id);
    if (!promo) throw new Error(`Unknown promo: ${id}`);
    return promo;
  });
}
