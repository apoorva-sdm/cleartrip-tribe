/** Core domain types. Plain, serialisable data only (safe to keep in Redux). */

/** Calendar date, `YYYY-MM-DD`. */
export type ISODate = string;
/** Date and time, ISO 8601. */
export type ISODateTime = string;
/** Money is always integer paise. Format only at the UI edge. */
export type Paise = number;

export type MemberId = string;
export type TripId = string;

export const TRIP_STAGES = ["setup", "avatars", "match", "decide", "plan", "book", "trip"] as const;
export type TripStage = (typeof TRIP_STAGES)[number];

export interface DateWindow {
  start: ISODate;
  end: ISODate;
}

/** The frame the initiator sets: window, deadline, cap. Never preferences. */
export interface TripFrame {
  window: DateWindow;
  deadline: ISODateTime;
  capPerPerson: Paise;
}

export interface Trip {
  id: TripId;
  shareCode: string;
  frame: TripFrame;
  stage: TripStage;
  /** How many people are in the group chat the link was shared to. */
  expectedSize: number;
}

export const AVATAR_ITEM_IDS = [
  "sunhat",
  "snorkel",
  "surfboard",
  "boots",
  "tent",
  "cycle",
  "camera",
  "diya",
  "binoculars",
  "apron",
  "shopping",
  "headphones",
  "yogamat",
  "book",
] as const;
export type ItemId = (typeof AVATAR_ITEM_IDS)[number];

/* ---------- How the avatar looks (never used for ranking) ---------- */

export const GENDERS = ["woman", "man", "nonbinary"] as const;
export type Gender = (typeof GENDERS)[number];

/** Six tones across the Indian range, fair to deep. */
export const SKIN_TONES = ["fair", "wheatish", "honey", "dusky", "brown", "deep"] as const;
export type SkinTone = (typeof SKIN_TONES)[number];

export const HAIR_STYLES = ["short", "sidepart", "curly", "bun", "braid", "bob", "long", "buzz", "turban", "hijab"] as const;
export type HairStyle = (typeof HAIR_STYLES)[number];

export const HAIR_COLOURS = ["black", "darkbrown", "brown", "henna", "grey"] as const;
export type HairColour = (typeof HAIR_COLOURS)[number];

export const FACIAL_HAIR = ["none", "stubble", "moustache", "beard"] as const;
export type FacialHair = (typeof FACIAL_HAIR)[number];

export const LOOK_EXTRAS = ["glasses", "bindi", "nosepin", "jhumkas"] as const;
export type LookExtra = (typeof LOOK_EXTRAS)[number];

export interface AvatarLook {
  gender: Gender;
  skin: SkinTone;
  hair: HairStyle;
  hairColour: HairColour;
  facialHair: FacialHair;
  extras: LookExtra[];
}

export interface Avatar {
  /** This-trip loadout. Only these drive ranking. */
  items: ItemId[];
  /** The one pick this person won't give up. Must be one of `items`. */
  lockedItemId: ItemId | null;
  /** How they look. Missing for people on neutral defaults. */
  look?: AvatarLook;
}

export type MemberRole = "initiator" | "follower";
/** `defaulted` = did not respond by the deadline; joined with neutral defaults. */
export type MemberStatus = "joined" | "defaulted";

export interface Member {
  id: MemberId;
  name: string;
  role: MemberRole;
  status: MemberStatus;
  avatar: Avatar;
}

/** Someone in the group chat who opened the link but hasn't finished their avatar. */
export interface PendingMember {
  id: MemberId;
  name: string;
  /** Trip picks chosen so far, out of the loadout size. */
  picksDone: number;
}
