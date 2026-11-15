import type { Member } from "@/domain";

/**
 * Prototype fixture: the WhatsApp group the link is shared to.
 * Six people including the initiator. Clearly sample data, not real users.
 */
export const GROUP_CHAT_SIZE = 6;

/** Friends who have already built their avatar when the initiator first checks in. */
export const EARLY_JOINERS: readonly Member[] = [
  {
    id: "m-meera",
    name: "Meera",
    role: "follower",
    status: "joined",
    avatar: {
      items: ["sunhat", "snorkel", "apron", "camera", "book"],
      lockedItemId: "snorkel",
      look: { gender: "woman", skin: "wheatish", hair: "braid", hairColour: "black", facialHair: "none", extras: ["bindi", "jhumkas"] },
    },
  },
  {
    id: "m-kabir",
    name: "Kabir",
    role: "follower",
    status: "joined",
    avatar: {
      items: ["boots", "camera", "headphones", "tent", "cycle"],
      lockedItemId: "boots",
      look: { gender: "man", skin: "dusky", hair: "turban", hairColour: "black", facialHair: "beard", extras: [] },
    },
  },
  {
    id: "m-ananya",
    name: "Ananya",
    role: "follower",
    status: "joined",
    avatar: {
      items: ["sunhat", "yogamat", "apron", "diya", "shopping"],
      lockedItemId: "yogamat",
      look: { gender: "woman", skin: "fair", hair: "bun", hairColour: "darkbrown", facialHair: "none", extras: ["nosepin", "glasses"] },
    },
  },
];

/** Friends still building their avatar. They finish after a nudge. */
export const LATE_JOINERS: readonly Member[] = [
  {
    id: "m-rohan",
    name: "Rohan",
    role: "follower",
    status: "joined",
    avatar: {
      items: ["snorkel", "headphones", "sunhat", "surfboard", "apron"],
      lockedItemId: "headphones",
      look: { gender: "man", skin: "brown", hair: "curly", hairColour: "black", facialHair: "stubble", extras: [] },
    },
  },
  {
    id: "m-zoya",
    name: "Zoya",
    role: "follower",
    status: "joined",
    avatar: {
      items: ["camera", "apron", "snorkel", "shopping", "book"],
      lockedItemId: "apron",
      look: { gender: "woman", skin: "honey", hair: "hijab", hairColour: "black", facialHair: "none", extras: ["glasses"] },
    },
  },
];

/** How far each late joiner had got before the nudge (picks out of 5). */
export const PICKS_SO_FAR: Record<string, number> = { "m-rohan": 3, "m-zoya": 1 };
