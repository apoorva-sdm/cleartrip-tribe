import { Money, type Itinerary, type ItineraryItem, type MomentTemplate, type Proposal } from "../models";
import { SLOT_WINDOW } from "./ItineraryBuilder";

/** Above this extra cost per person, someone objects (sample group behaviour). */
export const OBJECTION_THRESHOLD = Money.fromRupees(500);

/** Swaps are proposals: work out the ripple, simulate the group's answer, apply only when agreed. */
export class ProposalEngine {
  propose(item: Extract<ItineraryItem, { kind: "moment" }>, from: MomentTemplate, to: MomentTemplate): Proposal {
    // Timing ripple is measured in the slot the moment will actually sit in.
    const overflow = (t: MomentTemplate) => Math.max(0, t.durationMins - SLOT_WINDOW[item.slot]);
    return {
      id: `p-${item.id}-${to.id}`,
      itemId: item.id,
      fromTemplateId: from.id,
      toTemplateId: to.id,
      costDeltaPerPerson: to.pricePerPerson - from.pricePerPerson,
      timeShiftMins: overflow(to) - overflow(from),
      status: "pending",
      objections: 0,
    };
  }

  /** "Everyone ok?" Sample rule: a swap that costs noticeably more gets objections. */
  respond(proposal: Proposal, groupSize: number): Proposal {
    if (proposal.costDeltaPerPerson > OBJECTION_THRESHOLD) {
      return { ...proposal, status: "objected", objections: Math.max(1, Math.round(groupSize / 3)) };
    }
    return { ...proposal, status: "accepted", objections: 0 };
  }

  apply(itinerary: Itinerary, proposal: Proposal, by: string): Itinerary {
    return {
      ...itinerary,
      items: itinerary.items.map((i) =>
        i.id === proposal.itemId && i.kind === "moment" ? { ...i, templateId: proposal.toTemplateId, addedBy: by } : i,
      ),
    };
  }
}
