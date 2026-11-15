import { Money, type Ballot, type BookingOption, type Expense, type ISODate, type Member, type MemberId, type Paise, type Place, type RankedPlace, type TravelLeg, type TravelMode } from "@/domain";

/* SAMPLE DATA for the rest of the journey. Nothing here is real inventory, people or prices. */

/** How the other friends vote: two loves on their best match, one on the next; veto a place with none of their picks. */
export function friendBallots(shortlist: readonly RankedPlace[], friends: readonly Member[]): Ballot[] {
  return friends
    .filter((f) => f.status === "joined" && f.avatar.items.length > 0)
    .map((f) => {
      const scored = shortlist
        .map((r) => ({ id: r.place.id, score: f.avatar.items.filter((i) => r.place.serves.includes(i)).length }))
        .sort((a, b) => b.score - a.score);
      const loves: Record<string, number> = {};
      const [first, second] = scored;
      if (first) loves[first.id] = second ? 2 : 3;
      if (second) loves[second.id] = (loves[second.id] ?? 0) + 1;
      const zero = scored.find((s) => s.score === 0 && !loves[s.id]);
      return { memberId: f.id, loves, vetoPlaceId: zero?.id ?? null };
    });
}

interface Route {
  mode: TravelMode;
  to: string;
  /** Minutes door to door for one way. */
  mins: number;
  /** Train name, when by train. */
  train?: string;
}

const ROUTES: Record<string, Route> = {
  goa: { mode: "flight", to: "Goa (GOX)", mins: 75 },
  pondicherry: { mode: "bus", to: "Pondicherry", mins: 450 },
  gokarna: { mode: "train", to: "Gokarna Road", mins: 660, train: "16595 Panchaganga Exp" },
  coorg: { mode: "bus", to: "Madikeri", mins: 360 },
  hampi: { mode: "train", to: "Hosapete Jn", mins: 510, train: "16591 Hampi Exp" },
  varkala: { mode: "train", to: "Varkala Sivagiri", mins: 780, train: "16315 Kochuveli Exp" },
  munnar: { mode: "bus", to: "Munnar", mins: 600 },
  wayanad: { mode: "bus", to: "Kalpetta", mins: 420 },
  mysuru: { mode: "train", to: "Mysuru Jn", mins: 120, train: "12614 Tippu Exp" },
  udaipur: { mode: "flight", to: "Udaipur (UDR)", mins: 140 },
  rishikesh: { mode: "flight", to: "Dehradun (DED)", mins: 165 },
  havelock: { mode: "flight", to: "Port Blair (IXZ)", mins: 160 },
  krabi: { mode: "flight", to: "Krabi (KBV)", mins: 360 },
};

const ORIGIN: Record<TravelMode, string> = { flight: "Bengaluru (BLR)", train: "KSR Bengaluru", bus: "Shantinagar, Bengaluru" };

interface Fare {
  label: string;
  carrier: string;
  code: (n: number) => string;
  depart: string;
  backDepart: string;
  delta: number;
  refundable: boolean;
  gate: (n: number) => string;
}

const FARES: Record<TravelMode, Fare[]> = {
  flight: [
    { label: "IndiGo · early", carrier: "IndiGo", code: (n) => `6E ${5100 + (n % 700)}`, depart: "06:10", backDepart: "08:30", delta: -400, refundable: false, gate: () => "Terminal 1" },
    { label: "Air India Express", carrier: "Air India Express", code: (n) => `IX ${1200 + (n % 500)}`, depart: "09:40", backDepart: "13:15", delta: 0, refundable: true, gate: () => "Terminal 2" },
    { label: "Akasa Air · evening", carrier: "Akasa Air", code: (n) => `QP ${1300 + (n % 400)}`, depart: "17:55", backDepart: "19:40", delta: 900, refundable: true, gate: () => "Terminal 1" },
  ],
  train: [
    { label: "Sleeper", carrier: "Indian Railways", code: () => "", depart: "20:15", backDepart: "18:40", delta: -900, refundable: false, gate: (n) => `Platform ${1 + (n % 9)}` },
    { label: "3AC", carrier: "Indian Railways", code: () => "", depart: "20:15", backDepart: "18:40", delta: 0, refundable: true, gate: (n) => `Platform ${1 + (n % 9)}` },
    { label: "2AC", carrier: "Indian Railways", code: () => "", depart: "20:15", backDepart: "18:40", delta: 1100, refundable: true, gate: (n) => `Platform ${1 + (n % 9)}` },
  ],
  bus: [
    { label: "Rajahamsa · seater", carrier: "KSRTC", code: (n) => `KA-${300 + (n % 90)}`, depart: "21:30", backDepart: "21:00", delta: -500, refundable: false, gate: (n) => `Bay ${4 + (n % 20)}` },
    { label: "AC sleeper", carrier: "KSRTC Airavat", code: (n) => `KA-${500 + (n % 90)}`, depart: "22:00", backDepart: "21:30", delta: 0, refundable: true, gate: (n) => `Bay ${4 + (n % 20)}` },
    { label: "Volvo multi-axle sleeper", carrier: "KSRTC Ambaari", code: (n) => `KA-${700 + (n % 90)}`, depart: "22:45", backDepart: "22:15", delta: 600, refundable: true, gate: (n) => `Bay ${4 + (n % 20)}` },
  ],
};

function hash(s: string): number {
  let h = 7;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function addMins(hhmm: string, mins: number): string {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  const t = (h * 60 + m + mins) % (24 * 60);
  const next = h * 60 + m + mins >= 24 * 60 ? " +1" : "";
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}${next}`;
}

function length(mins: number): string {
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

/** Three ways to get there and back, cheapest first. Overnight trains and buses leave the evening before day 1. */
export function travelOptions(place: Place, days: readonly ISODate[]): BookingOption[] {
  const route = ROUTES[place.id] ?? { mode: "flight" as const, to: place.name, mins: 120 };
  const first = days[0] ?? "";
  const last = days[days.length - 1] ?? first;
  return FARES[route.mode].map((fare, i) => {
    const n = hash(`${place.id}-${i}`);
    const code = route.mode === "train" ? route.train ?? "Express" : fare.code(n);
    const leg = (from: string, to: string, date: ISODate, depart: string): TravelLeg => ({
      code,
      carrier: fare.carrier,
      from,
      to,
      date,
      depart,
      arrive: addMins(depart, route.mins),
      duration: length(route.mins),
      gate: fare.gate(n),
    });
    return {
      id: `${place.id}-travel-${i}`,
      label: fare.label,
      detail: fare.refundable ? "refundable" : "non-refundable",
      pricePerPerson: place.travelPerPerson + Money.fromRupees(fare.delta),
      refundable: fare.refundable,
      mode: route.mode,
      legs: {
        out: leg(ORIGIN[route.mode], route.to, first, fare.depart),
        back: leg(route.to, ORIGIN[route.mode], last, fare.backDepart),
      },
    };
  });
}

/** Three stays for a group of 6, price per person for the whole stay. */
export function stayOptions(place: Place, nights: number): BookingOption[] {
  const n = Math.max(1, nights);
  const per = (delta: number) => (place.stayPerNight + Money.fromRupees(delta)) * n;
  return [
    { id: `${place.id}-stay-0`, label: "Backpacker rooms", detail: "non-refundable", area: "6 km from centre", rating: 3.9, perks: ["3 rooms", "Breakfast"], pricePerPerson: per(-300), refundable: false },
    { id: `${place.id}-stay-1`, label: "Group villa", detail: "refundable", area: "Central", rating: 4.4, perks: ["Whole house", "Kitchen", "Pool"], pricePerPerson: per(0), refundable: true },
    { id: `${place.id}-stay-2`, label: "Boutique hotel", detail: "refundable", area: "Near the beach or old town", rating: 4.6, perks: ["3 rooms", "Breakfast", "Spa"], pricePerPerson: per(900), refundable: true },
  ];
}

/** Things you can book on the spot, once you're there. */
export interface OnTheGo {
  id: string;
  title: string;
  detail: string;
  /** Total for the whole group. */
  price: Paise;
}

export const ON_THE_GO: readonly OnTheGo[] = [
  { id: "otg-cab", title: "Cab for the day", detail: "7-seater, 8 hours, driver included", price: Money.fromRupees(3200) },
  { id: "otg-scooter", title: "Scooters × 3", detail: "One day, helmets included", price: Money.fromRupees(1500) },
  { id: "otg-table", title: "Dinner table for 6", detail: "Tonight, 8 pm, top-rated nearby", price: Money.fromRupees(0) },
];

/** "Live" prices at booking time: the stay has gone up a little. */
export const STAY_PRICE_RISE: Paise = Money.fromRupees(350);

export interface LocalContact {
  name: string;
  role: string;
  priceRange: string;
  languages: string;
  channel: string;
}

export const CONTACTS: Record<string, LocalContact> = {
  goa: { name: "Savio", role: "Local guide, North Goa", priceRange: "₹1,500–2,500 a day", languages: "English, Hindi, Konkani", channel: "WhatsApp" },
  pondicherry: { name: "Lakshmi", role: "Heritage walk guide", priceRange: "₹1,200–2,000 a day", languages: "English, Tamil, French", channel: "Phone call" },
  gokarna: { name: "Ganesh", role: "Boat and trek guide", priceRange: "₹1,000–1,800 a day", languages: "English, Kannada, Hindi", channel: "WhatsApp" },
  coorg: { name: "Bopanna", role: "Estate host", priceRange: "₹1,500–2,500 a day", languages: "English, Kodava, Kannada", channel: "Phone call" },
  hampi: { name: "Basava", role: "Ruins guide", priceRange: "₹1,000–1,800 a day", languages: "English, Kannada, Hindi", channel: "WhatsApp" },
  varkala: { name: "Anil", role: "Surf coach and local fixer", priceRange: "₹1,200–2,000 a day", languages: "English, Malayalam", channel: "WhatsApp" },
  munnar: { name: "Joseph", role: "Tea estate guide", priceRange: "₹1,200–2,000 a day", languages: "English, Malayalam, Tamil", channel: "Phone call" },
  wayanad: { name: "Shaji", role: "Trek and safari guide", priceRange: "₹1,200–2,200 a day", languages: "English, Malayalam", channel: "WhatsApp" },
  mysuru: { name: "Prakash", role: "Heritage guide", priceRange: "₹1,000–1,600 a day", languages: "English, Kannada, Hindi", channel: "Phone call" },
  udaipur: { name: "Kunal", role: "Old city guide", priceRange: "₹1,500–2,500 a day", languages: "English, Hindi, Mewari", channel: "WhatsApp" },
  rishikesh: { name: "Deepak", role: "Rafting and trek guide", priceRange: "₹1,200–2,200 a day", languages: "English, Hindi", channel: "WhatsApp" },
  havelock: { name: "Arun", role: "Dive and snorkel guide", priceRange: "₹2,000–3,500 a day", languages: "English, Hindi, Bengali", channel: "WhatsApp" },
  krabi: { name: "Nok", role: "Island-hopping guide", priceRange: "₹2,500–4,000 a day", languages: "English, Thai", channel: "LINE" },
};

export const SAFETY: Record<string, string[]> = {
  goa: ["Emergency: 112", "Swim only where lifeguard flags are up", "Share live location in the group chat when out late"],
  pondicherry: ["Emergency: 112", "Rocky Beach has strong currents; don't swim there", "Share live location in the group chat when out late"],
  gokarna: ["Emergency: 112", "Carry a torch for beach treks after dark", "Share live location in the group chat when out late"],
  coorg: ["Emergency: 112", "Leeches on wet trails; wear long socks", "Share live location in the group chat when out late"],
  hampi: ["Emergency: 112", "Carry water; shade is scarce between ruins", "Share live location in the group chat when out late"],
  varkala: ["Emergency: 112", "Swim only between the flags", "Share live location in the group chat when out late"],
  munnar: ["Emergency: 112", "Roads are foggy after dark; avoid night drives", "Share live location in the group chat when out late"],
  wayanad: ["Emergency: 112", "Stay with your guide on jungle trails", "Share live location in the group chat when out late"],
  mysuru: ["Emergency: 112", "Use prepaid autos from the station", "Share live location in the group chat when out late"],
  udaipur: ["Emergency: 112", "Stick to licensed boats on the lake", "Share live location in the group chat when out late"],
  rishikesh: ["Emergency: 112", "Raft only with licensed operators", "Share live location in the group chat when out late"],
  havelock: ["Emergency: 112", "Check ferry times; the last one is often delayed", "Share live location in the group chat when out late"],
  krabi: ["Tourist police: 1155", "Check tide times before boat trips", "Share live location in the group chat when out late"],
};

/** Expenses the group logged during the trip, on top of the Cleartrip booking. */
export function tripExpenses(members: readonly Member[], meId: MemberId): Expense[] {
  const ids = members.map((m) => m.id);
  const has = (id: string) => ids.includes(id);
  const out: Expense[] = [];
  if (has("m-meera")) out.push({ id: "e-dinner", title: "Group dinner", amount: Money.fromRupees(4200), paidBy: "m-meera", splitAmong: ids });
  if (has("m-kabir")) out.push({ id: "e-scooters", title: "Scooter rentals", amount: Money.fromRupees(1800), paidBy: "m-kabir", splitAmong: ids });
  out.push({ id: "e-snacks", title: "Snacks and water", amount: Money.fromRupees(600), paidBy: meId, splitAmong: ids });
  return out;
}
