import { useEffect, useState } from "react";
import { services } from "@/app/services";
import type { LocalContact, OnTheGo } from "@/data/fixtures/journey";

/** Read-only reference data for the locked place: local contact and safety notes. */
export function usePlaceInfo(placeId: string | undefined) {
  const [contact, setContact] = useState<LocalContact | null>(null);
  const [safety, setSafety] = useState<string[]>([]);
  const [onTheGo, setOnTheGo] = useState<OnTheGo[]>([]);
  useEffect(() => {
    if (!placeId) return;
    let live = true;
    void services.journey.contact(placeId).then((c) => live && setContact(c));
    void services.journey.safetyNotes(placeId).then((s) => live && setSafety(s));
    void services.journey.onTheGo(placeId).then((o) => live && setOnTheGo(o));
    return () => {
      live = false;
    };
  }, [placeId]);
  return { contact, safety, onTheGo };
}
