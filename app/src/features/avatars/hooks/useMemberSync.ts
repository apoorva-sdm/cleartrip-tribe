import { useEffect } from "react";
import { useAppDispatch } from "@/app/hooks";
import { syncMembers } from "../slice";

const POLL_MS = 1500;

/** Keeps the member list fresh while we're waiting on the group. */
export function useMemberSync(active: boolean) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    void dispatch(syncMembers());
    if (!active) return;
    const id = window.setInterval(() => void dispatch(syncMembers()), POLL_MS);
    return () => window.clearInterval(id);
  }, [active, dispatch]);
}
