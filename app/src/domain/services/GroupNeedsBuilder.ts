import { parseISODate, type DateWindow, type Diet, type GroupNeeds, type ISODate, type Paise, type PrivateConstraints } from "../models";

const DAY_MS = 86_400_000;

/** Combines private constraints into the group's hard filters. People with no constraints (defaults) don't restrict. */
export class GroupNeedsBuilder {
  build(window: DateWindow, cap: Paise, constraints: readonly PrivateConstraints[]): GroupNeeds {
    const allDays = daysIn(window);
    const common = allDays.filter((day) => constraints.every((c) => c.availableDays.includes(day)));
    const diets = [...new Set(constraints.map((c) => c.diet).filter((d): d is Diet => d !== "any"))];
    return {
      ceiling: Math.min(cap, ...constraints.map((c) => c.maxBudget)),
      nights: Math.max(0, longestRun(common).length - 1),
      days: longestRun(common),
      diets,
      stepFree: constraints.some((c) => c.stepFree),
      everyoneHasPassport: constraints.every((c) => c.hasPassport),
    };
  }
}

export function daysIn(window: DateWindow): ISODate[] {
  const days: ISODate[] = [];
  const end = parseISODate(window.end).getTime();
  for (let t = parseISODate(window.start).getTime(); t <= end; t += DAY_MS) {
    const d = new Date(t);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return days;
}

/** Longest run of consecutive days in a sorted list. */
function longestRun(days: readonly ISODate[]): ISODate[] {
  let best: ISODate[] = [];
  let run: ISODate[] = [];
  let prev: number | null = null;
  for (const day of days) {
    const t = parseISODate(day).getTime();
    run = prev !== null && Math.round((t - prev) / DAY_MS) === 1 ? [...run, day] : [day];
    if (run.length > best.length) best = run;
    prev = t;
  }
  return best;
}
