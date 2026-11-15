import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { services } from "@/app/services";
import { formatDay } from "@/domain";
import { selectLocked } from "@/features/decide";
import { Button, PhoneShell, ScreenTitle, Skeleton } from "@/ui";
import { buildItinerary, fillGap, freeze, proposeSwap, withdrawProposal } from "../slice";
import { selectFreezeBlocker, selectGapSuggestions, selectPlan } from "../selectors";
import { GapSlot } from "./GapSlot";
import { MomentCard } from "./MomentCard";
import { SwapSheet } from "./SwapSheet";
import styles from "./PlanScreen.module.css";

/** Plan · Build itinerary → Group reviews (swaps are proposals) → Fairness check → Fill the gaps → Plan frozen. */
export function PlanScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const locked = useAppSelector(selectLocked);
  const plan = useAppSelector(selectPlan);
  const suggestions = useAppSelector(selectGapSuggestions);
  const blocker = useAppSelector(selectFreezeBlocker);
  const members = useAppSelector((s) => s.group.members.entities);
  const meId = useAppSelector((s) => s.group.meId);
  const [swapItemId, setSwapItemId] = useState<string | null>(null);

  const needsBuild = locked && (!plan.itinerary || plan.itinerary.placeId !== locked.place.id);
  useEffect(() => {
    if (needsBuild) void dispatch(buildItinerary());
  }, [dispatch, needsBuild]);

  if (!locked) return <Navigate to="/tribe/decision" replace />;
  const { itinerary, catalogue, proposals, frozen } = plan;
  const templateOf = (id: string) => catalogue.find((t) => t.id === id);
  const voters = Object.values(members).filter((m) => m?.status === "joined");
  const pickedBy = (itemId: string) => voters.filter((m) => m?.avatar.items.some((i) => i === itemId)).length;
  const me = meId ? members[meId] : undefined;

  const swapItem = itinerary?.items.find((i) => i.id === swapItemId);
  const swapCurrent = swapItem?.kind === "moment" ? templateOf(swapItem.templateId) ?? null : null;
  const swapOptions = itinerary && swapItem ? services.itineraries.alternatives(itinerary, swapItem.slot, catalogue) : [];

  // Hand each gap a different leftover suggestion, in fairness order.
  const gapIds = itinerary?.items.filter((i) => i.kind === "gap").map((i) => i.id) ?? [];

  const footer = frozen ? (
    <Button block onClick={() => navigate("/tribe/book/travel")}>Next: Book it (optional)</Button>
  ) : (
    <>
      {blocker && <p className={styles.hint}>{blocker}</p>}
      <Button block disabled={blocker !== null || !itinerary} onClick={() => dispatch(freeze())}>
        Lock the plan
      </Button>
    </>
  );

  return (
    <PhoneShell stage="Plan" backTo="/tribe/decision" footer={footer}>
      <ScreenTitle title={`Here's your ${locked.place.name} plan`}>Tribe drafted this for you. Swap anything you like, your tribe just has to agree.</ScreenTitle>

      {!itinerary ? (
        <div className={styles.loading} aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={96} />
          ))}
        </div>
      ) : (
        <>
          {itinerary.days.map((day, d) => (
            <section key={day} className={styles.day} aria-labelledby={`day-${d}`}>
              <h3 id={`day-${d}`} className={styles.dayHead}>
                Day {d + 1} · {formatDay(day)}
              </h3>
              <div className={styles.items}>
                {itinerary.items
                  .filter((i) => i.day === d)
                  .map((item) => {
                    if (item.kind === "gap") {
                      const suggestion = suggestions[gapIds.indexOf(item.id) % Math.max(1, suggestions.length)];
                      return (
                        <GapSlot
                          key={item.id}
                          item={item}
                          suggestion={suggestion}
                          pickedBy={suggestion ? pickedBy(suggestion.serves) : 0}
                          frozen={frozen}
                          onAdd={(templateId) => dispatch(fillGap({ itemId: item.id, templateId, by: meId ?? "me", byName: me?.name ?? "You" }))}
                        />
                      );
                    }
                    const template = templateOf(item.templateId);
                    if (!template) return null;
                    const proposal = proposals.find((p) => p.itemId === item.id);
                    return (
                      <MomentCard
                        key={item.id}
                        item={item}
                        template={template}
                        addedByName={item.addedBy === "agent" ? null : item.addedBy === meId ? "You" : members[item.addedBy]?.name ?? "Someone"}
                        proposal={proposal}
                        proposedTitle={proposal ? templateOf(proposal.toTemplateId)?.title : undefined}
                        frozen={frozen}
                        onSwap={() => setSwapItemId(item.id)}
                        onWithdraw={() => proposal && dispatch(withdrawProposal(proposal.id))}
                      />
                    );
                  })}
              </div>
            </section>
          ))}
        </>
      )}

      <SwapSheet
        open={swapItemId !== null}
        current={swapCurrent}
        slot={swapItem?.slot ?? null}
        options={swapOptions}
        onClose={() => setSwapItemId(null)}
        onPick={(templateId) => {
          if (swapItemId) void dispatch(proposeSwap({ itemId: swapItemId, toTemplateId: templateId }));
          setSwapItemId(null);
        }}
      />
    </PhoneShell>
  );
}
