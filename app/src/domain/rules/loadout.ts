import type { Avatar, AvatarLook, ItemId } from "../models";

/** This-trip loadout size. Only these picks drive destination ranking. */
export const LOADOUT_SIZE = 5;

export const EMPTY_AVATAR: Avatar = { items: [], lockedItemId: null };

/** Neutral defaults for someone who didn't respond by the deadline: no picks, equal weight. */
export const NEUTRAL_AVATAR: Avatar = { items: [], lockedItemId: null };

export type ToggleResult = { kind: "ok"; avatar: Avatar } | { kind: "full" };

export function toggleItem(avatar: Avatar, id: ItemId): ToggleResult {
  if (avatar.items.includes(id)) {
    return {
      kind: "ok",
      avatar: {
        ...avatar,
        items: avatar.items.filter((item) => item !== id),
        lockedItemId: avatar.lockedItemId === id ? null : avatar.lockedItemId,
      },
    };
  }
  if (avatar.items.length >= LOADOUT_SIZE) return { kind: "full" };
  return { kind: "ok", avatar: { ...avatar, items: [...avatar.items, id] } };
}

export function setLock(avatar: Avatar, id: ItemId): Avatar {
  if (!avatar.items.includes(id)) return avatar;
  return { ...avatar, lockedItemId: avatar.lockedItemId === id ? null : id };
}

export type LoadoutGap = "items" | "lock" | null;

/** What's still missing before the avatar can be saved. */
export function loadoutGap(avatar: Avatar): LoadoutGap {
  if (avatar.items.length < LOADOUT_SIZE) return "items";
  if (avatar.lockedItemId === null) return "lock";
  return null;
}

/** Starting look on the build screen. Everything is changeable. */
export const DEFAULT_LOOK: AvatarLook = {
  gender: "woman",
  skin: "wheatish",
  hair: "braid",
  hairColour: "black",
  facialHair: "none",
  extras: [],
};
