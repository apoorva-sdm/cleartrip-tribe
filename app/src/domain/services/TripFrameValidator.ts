import { Money, parseISODate, type ISODate, type TripFrame } from "../models";

export interface TripFrameDraft {
  start: ISODate;
  end: ISODate;
  deadlineDate: ISODate;
  deadlineTime: string; // HH:mm
  capRupees: string;
}

export type FrameField = "start" | "end" | "deadline" | "cap";

export type FrameValidation =
  | { kind: "valid"; frame: TripFrame }
  | { kind: "invalid"; errors: Partial<Record<FrameField, string>> };

/** Checks the frame the initiator sets in "Start a trip". */
export class TripFrameValidator {
  validate(draft: TripFrameDraft, today: Date): FrameValidation {
    const errors: Partial<Record<FrameField, string>> = {};
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (!draft.start) errors.start = "When does the trip start?";
    else if (parseISODate(draft.start) < startOfToday) errors.start = "Start date has passed";

    if (!draft.end) errors.end = "When does the trip end?";
    else if (draft.start && parseISODate(draft.end) < parseISODate(draft.start)) {
      errors.end = "The trip can't end before it starts";
    }

    let deadline: Date | null = null;
    if (!draft.deadlineDate || !draft.deadlineTime) {
      errors.deadline = "Pick a date for avatars to be ready";
    } else {
      deadline = new Date(`${draft.deadlineDate}T${draft.deadlineTime}`);
      if (deadline <= today) errors.deadline = "That time has already passed. Pick a later one.";
      else if (draft.start && deadline >= parseISODate(draft.start)) {
        errors.deadline = "Avatars need to be ready before the trip starts";
      }
    }

    const cap = Number(draft.capRupees.replace(/[^\d]/g, ""));
    if (!draft.capRupees || !Number.isFinite(cap) || cap <= 0) errors.cap = "How much can each person spend?";

    if (Object.keys(errors).length > 0 || !deadline) return { kind: "invalid", errors };

    return {
      kind: "valid",
      frame: {
        window: { start: draft.start, end: draft.end },
        deadline: deadline.toISOString(),
        capPerPerson: Money.fromRupees(cap),
      },
    };
  }
}
