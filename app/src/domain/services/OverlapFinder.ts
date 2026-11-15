import { AVATAR_ITEM_IDS, type ItemId, type Member } from "../models";

/** A shared pick. Counts only, never names. */
export interface Overlap {
  itemId: ItemId;
  count: number;
}

/** Finds the bucket-list picks two or more people share, for "Reveal together". */
export class OverlapFinder {
  find(members: readonly Member[]): Overlap[] {
    const counts = new Map<ItemId, number>();
    for (const member of members) {
      for (const item of new Set(member.avatar.items)) {
        counts.set(item, (counts.get(item) ?? 0) + 1);
      }
    }
    return AVATAR_ITEM_IDS.map((itemId) => ({ itemId, count: counts.get(itemId) ?? 0 }))
      .filter((overlap) => overlap.count >= 2)
      .sort((a, b) => b.count - a.count);
  }
}
