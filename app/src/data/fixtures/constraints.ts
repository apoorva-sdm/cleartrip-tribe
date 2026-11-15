import { Money, daysIn, type DateWindow, type PrivateConstraints } from "@/domain";

/**
 * SAMPLE DATA: what each friend told Tribe privately. The app never shows these to anyone.
 * Kabir can't make the last day of the window.
 */
export function friendConstraints(window: DateWindow): PrivateConstraints[] {
  const days = daysIn(window);
  const allBut = (n: number) => days.slice(0, Math.max(1, days.length - n));
  return [
    { memberId: "m-meera", maxBudget: Money.fromRupees(16000), availableDays: days, diet: "any", stepFree: false, hasPassport: true },
    { memberId: "m-kabir", maxBudget: Money.fromRupees(20000), availableDays: allBut(1), diet: "any", stepFree: false, hasPassport: true },
    { memberId: "m-ananya", maxBudget: Money.fromRupees(15000), availableDays: days, diet: "veg", stepFree: false, hasPassport: true },
    { memberId: "m-rohan", maxBudget: Money.fromRupees(18000), availableDays: days, diet: "any", stepFree: false, hasPassport: false },
    { memberId: "m-zoya", maxBudget: Money.fromRupees(14000), availableDays: days, diet: "any", stepFree: false, hasPassport: true },
  ];
}
