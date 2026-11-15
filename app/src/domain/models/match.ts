import type { ISODate, ItemId, MemberId, Paise } from "./types";

export const DIETS = ["any", "veg", "jain", "halal"] as const;
export type Diet = (typeof DIETS)[number];

/** What one person tells Tribe privately. Never shown to the group. */
export interface PrivateConstraints {
  memberId: MemberId;
  maxBudget: Paise;
  availableDays: ISODate[];
  diet: Diet;
  stepFree: boolean;
  hasPassport: boolean;
}

/** A verified traveller's structured note from the Been-there repository. */
export interface BeenThereNote {
  kind: "verdict" | "skip";
  text: string;
  /** e.g. "Group of 5 friends · Dec 2025" */
  context: string;
}

export interface Place {
  id: string;
  name: string;
  region: string;
  international: boolean;
  /** Return travel per person. */
  travelPerPerson: Paise;
  stayPerNight: Paise;
  /** Bucket-list items this place serves. */
  serves: ItemId[];
  /** Diets that are easy to cater for here ("any" is always fine). */
  diets: Diet[];
  stepFree: boolean;
  verifiedCount: number;
  notes: BeenThereNote[];
}

/** The group's combined hard filters. Built from private constraints; never shows who set what. */
export interface GroupNeeds {
  /** Lowest of the group cap and everyone's private max. */
  ceiling: Paise;
  /** Nights everyone can make in a row. */
  nights: number;
  /** The days of that run (nights + 1). */
  days: ISODate[];
  diets: Diet[];
  stepFree: boolean;
  everyoneHasPassport: boolean;
}

export type ConstraintId = "dates" | "budget" | "diet" | "access" | "passport";
