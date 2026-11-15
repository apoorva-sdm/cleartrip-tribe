import type { ItemId } from "./types";

export interface AvatarItemInfo {
  id: ItemId;
  label: string;
  /** Declared meaning, shown on tap. The item is a choice, not decoration. */
  meaning: string;
}

export const AVATAR_ITEMS: readonly AvatarItemInfo[] = [
  { id: "sunhat", label: "Sunhat", meaning: "Beaches" },
  { id: "snorkel", label: "Snorkel", meaning: "Under the sea" },
  { id: "surfboard", label: "Surfboard", meaning: "Surf and water sports" },
  { id: "boots", label: "Hiking boots", meaning: "Treks and trails" },
  { id: "tent", label: "Tent", meaning: "Camping under stars" },
  { id: "cycle", label: "Cycle", meaning: "Rides and road trips" },
  { id: "camera", label: "Camera", meaning: "Photo spots" },
  { id: "diya", label: "Diya", meaning: "Temples and heritage" },
  { id: "binoculars", label: "Binoculars", meaning: "Wildlife" },
  { id: "apron", label: "Apron", meaning: "Food trails" },
  { id: "shopping", label: "Tote bag", meaning: "Markets and shopping" },
  { id: "headphones", label: "Headphones", meaning: "Music and nightlife" },
  { id: "yogamat", label: "Yoga mat", meaning: "Spa and wellness" },
  { id: "book", label: "Book", meaning: "Cafés and slow days" },
];

export function getItemInfo(id: ItemId): AvatarItemInfo {
  const info = AVATAR_ITEMS.find((item) => item.id === id);
  if (!info) throw new Error(`Unknown avatar item: ${id}`);
  return info;
}
