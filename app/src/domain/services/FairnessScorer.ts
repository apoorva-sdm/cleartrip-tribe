import type { Itinerary, Member, MemberId, MomentTemplate } from "../models";

export interface FairnessRow {
  memberId: MemberId;
  name: string;
  hearts: number;
}

/** "Fairness check": each avatar should have at least one moment that serves them. */
export class FairnessScorer {
  score(itinerary: Itinerary, members: readonly Member[], catalogue: readonly MomentTemplate[]): FairnessRow[] {
    const served = itinerary.items.flatMap((i) => {
      if (i.kind !== "moment") return [];
      const t = catalogue.find((c) => c.id === i.templateId);
      return t ? [t.serves] : [];
    });
    return members
      .filter((m) => m.status === "joined")
      .map((m) => ({ memberId: m.id, name: m.name, hearts: served.filter((s) => m.avatar.items.includes(s)).length }));
  }

  /** Leftover moments for the gaps, starting with ones that serve people who have none. */
  gapSuggestions(itinerary: Itinerary, members: readonly Member[], catalogue: readonly MomentTemplate[]): MomentTemplate[] {
    const rows = this.score(itinerary, members, catalogue);
    const left = new Set(rows.filter((r) => r.hearts === 0).map((r) => r.memberId));
    const used = new Set(itinerary.items.flatMap((i) => (i.kind === "moment" ? [i.templateId] : [])));
    const helpsLeftOut = (t: MomentTemplate) => members.some((m) => left.has(m.id) && m.avatar.items.includes(t.serves));
    return catalogue
      .filter((t) => t.placeId === itinerary.placeId && !used.has(t.id))
      .sort((a, b) => Number(helpsLeftOut(b)) - Number(helpsLeftOut(a)));
  }
}
