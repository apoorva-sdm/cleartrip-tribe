/**
 * Content for the mobile homescreen. Layout and offer copy follow the live Cleartrip
 * mobile site (measured 15 Nov 2026); photos and photo captions are the user's own.
 */

export type ProductId = "hotels" | "flights" | "trains" | "buses" | "holidays";

export interface ProductTileData {
  readonly id: ProductId;
  readonly title: string;
  readonly sub: string;
  readonly badge?: string;
  /** Orange strip along the bottom of the tile. */
  readonly ticker?: string;
}

export const BIG_TILES: readonly ProductTileData[] = [
  { id: "hotels", title: "Hotels", sub: "30-80% off", badge: "Book at 0", ticker: "1st stay: Flat 25% off" },
  { id: "flights", title: "Flights", sub: "Up to 25% off" },
];

export const SMALL_TILES: readonly ProductTileData[] = [
  { id: "trains", title: "Trains", sub: "Flat 10% off" },
  { id: "buses", title: "Buses", sub: "Flat 15% off" },
  { id: "holidays", title: "Holidays", sub: "Up to 25% off", badge: "NEW" },
];

/** Hero carousel and promo strip use different photos so nothing repeats. */
export const HERO_PROMO_IDS = ["flight", "sunrise-tribe", "city", "girls-trip"] as const;
export const STRIP_PROMO_IDS = ["himalayas", "beach", "rafting"] as const;

export type OfferCategory = "flights" | "hotels" | "buses";

export interface OfferData {
  readonly id: string;
  readonly category: OfferCategory;
  readonly title: string;
  readonly sub: string;
  readonly code: string;
}

export const OFFERS: readonly OfferData[] = [
  { id: "hotel-first", category: "hotels", title: "Flat 25% off", sub: "on Hotels booking for first time", code: "CTFIRST" },
  { id: "bus-first", category: "buses", title: "Flat 12% off", sub: "on bus booking for first time", code: "CTFIRST" },
];

export type OfferFilter = "for-you" | OfferCategory;

export const OFFER_FILTERS: ReadonlyArray<{ id: OfferFilter; label: string }> = [
  { id: "for-you", label: "For you" },
  { id: "flights", label: "Flights" },
  { id: "hotels", label: "Hotels" },
  { id: "buses", label: "Buses" },
];
