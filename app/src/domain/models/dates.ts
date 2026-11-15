import type { ISODate, ISODateTime } from "./types";

const day = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });
const time = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });

/** Parse `YYYY-MM-DD` as a local calendar date (not UTC). */
export function parseISODate(value: ISODate): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
}

/** "Fri, 18 Dec" */
export function formatDay(value: ISODate | ISODateTime): string {
  const date = value.length === 10 ? parseISODate(value) : new Date(value);
  return day.format(date);
}

/** "Fri, 18 Dec, 9:00 pm" */
export function formatDayTime(value: ISODateTime): string {
  const date = new Date(value);
  return `${day.format(date)}, ${time.format(date).toLowerCase()}`;
}

/** Whole nights between two calendar dates. */
export function nightsBetween(start: ISODate, end: ISODate): number {
  const ms = parseISODate(end).getTime() - parseISODate(start).getTime();
  return Math.round(ms / 86_400_000);
}
