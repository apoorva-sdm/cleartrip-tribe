import { Money, type Place } from "@/domain";

/**
 * SAMPLE DATA for the prototype, not real Cleartrip inventory or reviews.
 * Return travel per person from Bengaluru, and stay per person per night when 6 share
 * (villas, homestays or 3 rooms).
 */
const r = Money.fromRupees;

export const PLACES: readonly Place[] = [
  {
    id: "goa", name: "Goa", region: "North Goa", international: false,
    travelPerPerson: r(6500), stayPerNight: r(2200),
    serves: ["sunhat", "snorkel", "surfboard", "headphones", "apron", "shopping", "camera"],
    diets: ["veg", "jain", "halal"], stepFree: false, verifiedCount: 214,
    notes: [
      { kind: "verdict", text: "A villa beat hotel rooms for a group. Shacks at sunset were the highlight.", context: "Group of 6 friends · Dec 2025" },
      { kind: "skip", text: "Skip Baga on weekends. Too crowded to enjoy.", context: "Group of 4 friends · Jan 2026" },
    ],
  },
  {
    id: "pondicherry", name: "Pondicherry", region: "Tamil Nadu", international: false,
    travelPerPerson: r(3200), stayPerNight: r(2400),
    serves: ["sunhat", "apron", "camera", "yogamat", "book", "diya", "cycle", "surfboard"],
    diets: ["veg", "jain", "halal"], stepFree: true, verifiedCount: 132,
    notes: [
      { kind: "verdict", text: "White Town is walkable and the cafés suit a mixed group.", context: "Group of 5 friends · Nov 2025" },
      { kind: "skip", text: "Skip Paradise Beach after rain. The ferry stops running.", context: "Couple · Dec 2025" },
    ],
  },
  {
    id: "gokarna", name: "Gokarna", region: "Karnataka", international: false,
    travelPerPerson: r(2800), stayPerNight: r(1800),
    serves: ["sunhat", "snorkel", "boots", "yogamat", "tent", "diya"],
    diets: ["veg", "jain"], stepFree: false, verifiedCount: 88,
    notes: [
      { kind: "verdict", text: "The beach trek from Kudle to Om Beach was the best part.", context: "Group of 6 friends · Jan 2026" },
      { kind: "skip", text: "Skip staying near Main Beach. Busy and noisy.", context: "Group of 3 friends · Dec 2025" },
    ],
  },
  {
    id: "coorg", name: "Coorg", region: "Karnataka", international: false,
    travelPerPerson: r(2400), stayPerNight: r(2800),
    serves: ["boots", "apron", "camera", "yogamat", "binoculars", "book", "tent"],
    diets: ["veg", "halal"], stepFree: false, verifiedCount: 156,
    notes: [
      { kind: "verdict", text: "Estate homestays made for slow mornings and good food.", context: "Family with elders · Dec 2025" },
      { kind: "skip", text: "Skip Abbey Falls on weekends. Long queues.", context: "Group of 4 friends · Oct 2025" },
    ],
  },
  {
    id: "hampi", name: "Hampi", region: "Karnataka", international: false,
    travelPerPerson: r(2200), stayPerNight: r(1700),
    serves: ["diya", "camera", "cycle", "boots", "book"],
    diets: ["veg", "jain"], stepFree: false, verifiedCount: 109,
    notes: [
      { kind: "verdict", text: "Cycling between the ruins at sunrise felt unreal.", context: "Group of 5 friends · Jan 2026" },
      { kind: "skip", text: "Skip the midday heat. Everything's shut 1–4 pm anyway.", context: "Group of 4 friends · Dec 2025" },
    ],
  },
  {
    id: "varkala", name: "Varkala", region: "Kerala", international: false,
    travelPerPerson: r(5200), stayPerNight: r(2300),
    serves: ["sunhat", "surfboard", "yogamat", "book", "apron", "shopping"],
    diets: ["veg", "halal"], stepFree: false, verifiedCount: 94,
    notes: [
      { kind: "verdict", text: "Cliff-top cafés and a beginner surf lesson made the trip.", context: "Group of 6 friends · Feb 2026" },
      { kind: "skip", text: "Skip swimming at high tide. The currents are strong.", context: "Couple · Jan 2026" },
    ],
  },
  {
    id: "munnar", name: "Munnar", region: "Kerala", international: false,
    travelPerPerson: r(3600), stayPerNight: r(2600),
    serves: ["boots", "tent", "camera", "binoculars", "yogamat", "book"],
    diets: ["veg", "halal"], stepFree: false, verifiedCount: 121,
    notes: [
      { kind: "verdict", text: "Tea estate walks in the mist were the calmest days we've had.", context: "Group of 4 friends · Dec 2025" },
      { kind: "skip", text: "Skip Echo Point. It's a traffic jam with a view.", context: "Group of 5 friends · Jan 2026" },
    ],
  },
  {
    id: "wayanad", name: "Wayanad", region: "Kerala", international: false,
    travelPerPerson: r(2600), stayPerNight: r(2400),
    serves: ["boots", "tent", "binoculars", "camera", "cycle"],
    diets: ["veg", "halal"], stepFree: false, verifiedCount: 77,
    notes: [
      { kind: "verdict", text: "The Chembra trek and a jungle stay were worth every minute.", context: "Group of 6 friends · Nov 2025" },
      { kind: "skip", text: "Skip the safari on weekends. Jeeps sell out by 7 am.", context: "Group of 3 friends · Dec 2025" },
    ],
  },
  {
    id: "mysuru", name: "Mysuru", region: "Karnataka", international: false,
    travelPerPerson: r(1200), stayPerNight: r(1900),
    serves: ["diya", "shopping", "apron", "camera", "cycle"],
    diets: ["veg", "jain", "halal"], stepFree: true, verifiedCount: 143,
    notes: [
      { kind: "verdict", text: "The palace lit up on Sunday night was the highlight.", context: "Family with elders · Oct 2025" },
      { kind: "skip", text: "Skip Chamundi Hill by car on weekends. Walk the steps early.", context: "Group of 4 friends · Jan 2026" },
    ],
  },
  {
    id: "udaipur", name: "Udaipur", region: "Rajasthan", international: false,
    travelPerPerson: r(9800), stayPerNight: r(2600),
    serves: ["diya", "camera", "shopping", "apron", "book"],
    diets: ["veg", "jain", "halal"], stepFree: true, verifiedCount: 188,
    notes: [
      { kind: "verdict", text: "A rooftop dinner over Lake Pichola was unforgettable.", context: "Group of 6 friends · Feb 2026" },
      { kind: "skip", text: "Skip the boat ride at noon. Go for sunset.", context: "Couple · Jan 2026" },
    ],
  },
  {
    id: "rishikesh", name: "Rishikesh", region: "Uttarakhand", international: false,
    travelPerPerson: r(10500), stayPerNight: r(1600),
    serves: ["boots", "yogamat", "surfboard", "tent", "diya", "camera"],
    diets: ["veg", "jain"], stepFree: false, verifiedCount: 97,
    notes: [
      { kind: "verdict", text: "Rafting from Shivpuri worked well for first-timers.", context: "Group of 5 friends · Mar 2026" },
      { kind: "skip", text: "Skip the cafés by Laxman Jhula at sunset. Packed.", context: "Group of 4 friends · Feb 2026" },
    ],
  },
  {
    id: "havelock", name: "Havelock", region: "Andaman Islands", international: false,
    travelPerPerson: r(16000), stayPerNight: r(3800),
    serves: ["sunhat", "snorkel", "surfboard", "camera"],
    diets: ["veg"], stepFree: false, verifiedCount: 61,
    notes: [
      { kind: "verdict", text: "Snorkelling at Elephant Beach was worth the whole trip.", context: "Group of 4 friends · Jan 2026" },
      { kind: "skip", text: "Skip the last ferry of the day. Often delayed.", context: "Couple · Dec 2025" },
    ],
  },
  {
    id: "krabi", name: "Krabi", region: "Thailand", international: true,
    travelPerPerson: r(19500), stayPerNight: r(2800),
    serves: ["sunhat", "snorkel", "headphones", "apron", "shopping"],
    diets: ["veg", "halal"], stepFree: false, verifiedCount: 43,
    notes: [
      { kind: "verdict", text: "The island-hopping day trip was worth it.", context: "Group of 6 friends · Feb 2026" },
      { kind: "skip", text: "Skip eating at Ao Nang. The night market is better.", context: "Group of 3 friends · Jan 2026" },
    ],
  },
];
