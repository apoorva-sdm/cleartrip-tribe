/** Which part of the photo stays in frame when it is cropped to the promo card. */
export type PromoFocus = "center" | "right" | "high" | "low";

export interface Promo {
  readonly id: string;
  readonly image: string;
  readonly alt: string;
  /** Headline, shown on two lines. */
  readonly headline: readonly [string, string];
  readonly note: string;
  readonly focus: PromoFocus;
}

export const PROMOS: readonly Promo[] = [
  {
    id: "flight",
    image: "/img/1-flight.png",
    alt: "Plane taking off at sunset",
    headline: ["Take Off for", "Less"],
    note: "Fares that let you say yes to every long weekend.",
    focus: "center",
  },
  {
    id: "sunrise-tribe",
    image: "/img/2-sunrise-tribe.webp",
    alt: "Four friends watching sunrise above the clouds",
    headline: ["Chase Sunrises", "Together"],
    note: "Plan it once, bring your whole tribe along.",
    focus: "right",
  },
  {
    id: "himalayas",
    image: "/img/3-himalayas.png",
    alt: "Snow-capped Himalayan peak at dusk",
    headline: ["Touch the", "Himalayas"],
    note: "Treks, base camps and stays above the clouds.",
    focus: "center",
  },
  {
    id: "beach",
    image: "/img/4-beach.webp",
    alt: "Quiet beach cove with clear water",
    headline: ["Find Your", "Quiet Shore"],
    note: "Hidden coves and slow mornings by the sea.",
    focus: "high",
  },
  {
    id: "city",
    image: "/img/5-city.webp",
    alt: "City skyline lit up at night",
    headline: ["Cities That", "Never Sleep"],
    note: "Skyline stays and late-night food trails.",
    focus: "center",
  },
  {
    id: "rafting",
    image: "/img/6-rafting.png",
    alt: "Group white-water rafting",
    headline: ["Ride the", "Rapids"],
    note: "Adventure weekends your whole group can book in one go.",
    focus: "right",
  },
  {
    id: "girls-trip",
    image: "/img/7-girls-trip.webp",
    alt: "Group of friends at a white heritage stay",
    headline: ["Girls' Trip,", "Sorted"],
    note: "Stays, plans and splits for the whole gang.",
    focus: "low",
  },
];
