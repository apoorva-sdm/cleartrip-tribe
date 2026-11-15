import { useAppSelector } from "@/app/hooks";

/** Display names for members and travellers on defaults ("You" for the current user). */
export function useNames(): (id: string) => string {
  const members = useAppSelector((s) => s.group.members.entities);
  const travellers = useAppSelector((s) => s.book.travellers);
  const meId = useAppSelector((s) => s.group.meId);
  return (id) => {
    if (id === meId) return "You";
    return members[id]?.name ?? travellers.find((t) => t.memberId === id)?.name ?? "A friend";
  };
}
