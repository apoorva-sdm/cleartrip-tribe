import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Traveller } from "@/domain";
import { loadOptions, setTravellers } from "../slice";

/** Loads travel and stay options once, and sets up the traveller list (everyone who joined, plus anyone on defaults). */
export function useBookingSetup() {
  const dispatch = useAppDispatch();
  const loaded = useAppSelector((s) => s.book.travelOptions.length > 0);
  const travellers = useAppSelector((s) => s.book.travellers);
  const members = useAppSelector((s) => s.group.members.entities);
  const meId = useAppSelector((s) => s.group.meId);
  const expected = useAppSelector((s) => s.trip.trip?.expectedSize ?? 0);

  useEffect(() => {
    if (!loaded) void dispatch(loadOptions());
  }, [dispatch, loaded]);

  useEffect(() => {
    if (travellers.length > 0) return;
    const joined = Object.values(members).flatMap((m): Traveller[] =>
      m ? [{ memberId: m.id, name: m.name, status: m.id === meId ? "missing" : "added" }] : [],
    );
    const onDefaults = Array.from({ length: Math.max(0, expected - joined.length) }, (_, i): Traveller => ({
      memberId: `default-${i + 1}`,
      name: "Friend on defaults",
      status: "missing",
    }));
    dispatch(setTravellers([...joined, ...onDefaults]));
  }, [dispatch, travellers.length, members, meId, expected]);

  return loaded;
}
