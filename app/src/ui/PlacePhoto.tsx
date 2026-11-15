/** Photos of the places Tribe AI can suggest (reference images provided for the prototype). */
const PHOTOS = import.meta.glob<string>("../assets/places/*.jpg", { eager: true, import: "default", query: "?url" });

/** Where to centre each photo when it's cropped to a wide banner. */
const FOCUS: Record<string, string> = {
  goa: "center 60%",
  pondicherry: "center 32%",
  gokarna: "center 55%",
  hampi: "center 55%",
  udaipur: "center 40%",
  rishikesh: "center 45%",
  krabi: "center 45%",
};

/** Fetch every place photo in the background once the app is idle, so cards show them instantly. */
if (typeof window !== "undefined") {
  const warm = () => Object.values(PHOTOS).forEach((src) => { const img = new Image(); img.decoding = "async"; img.src = src; });
  if ("requestIdleCallback" in window) window.requestIdleCallback(warm, { timeout: 2500 });
  else setTimeout(warm, 1200);
}

export function placePhoto(placeId: string): string | undefined {
  return PHOTOS[`../assets/places/${placeId}.jpg`];
}

interface PlacePhotoProps {
  placeId: string;
  name: string;
  className?: string;
}

export function PlacePhoto({ placeId, name, className }: PlacePhotoProps) {
  const src = placePhoto(placeId);
  if (!src) return null;
  return <img
      className={className}
      src={src}
      alt={name}
      decoding="async"
      style={{ objectPosition: FOCUS[placeId] ?? "center", background: "var(--skeleton)" }}
    />;
}
