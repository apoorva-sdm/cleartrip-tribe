import type { ItemId } from "@/domain";
import { ItemArt } from "@/ui";

interface ItemIconProps {
  id: ItemId;
  size?: number;
}

/** The trip item's 3D icon. Same art everywhere in the app. */
export function ItemIcon({ id, size = 24 }: ItemIconProps) {
  return <ItemArt id={id} size={size} />;
}
