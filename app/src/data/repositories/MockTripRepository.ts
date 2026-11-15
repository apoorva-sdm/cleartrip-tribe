import type { Ballot, Member, PendingMember, Paise, PrivateConstraints, RankedPlace, Trip, TripFrame, TripId } from "@/domain";
import { friendBallots } from "../fixtures/journey";
import { friendConstraints } from "../fixtures/constraints";
import { EARLY_JOINERS, GROUP_CHAT_SIZE, LATE_JOINERS, PICKS_SO_FAR } from "../fixtures/group";
import { memoryStore, type KeyValueStore } from "../sessionStore";
import type { NewMember, TripRepository } from "./TripRepository";

const STORE_KEY = "tribe.mock-trips";

const LATENCY_MS = 450;
/** After a nudge, each late joiner arrives this long after the previous one. */
const JOIN_GAP_MS = 3000;

interface TripRecord {
  trip: Trip;
  members: Member[];
  /** When the whole chat was nudged. */
  nudgedAt: number | null;
  /** When individual people were nudged, by member id. */
  nudgedOne?: Record<string, number>;
  /** The user's own private constraints (friends' come from fixtures). */
  constraints?: PrivateConstraints[];
}

/**
 * In-memory stand-in for the trip API. Simulates friends joining through the link:
 * some have joined already, the rest join a few seconds apart after the chat is nudged.
 */
export class MockTripRepository implements TripRepository {
  private readonly trips: Map<TripId, TripRecord>;

  constructor(
    private readonly store: KeyValueStore = memoryStore(),
    private readonly now: () => number = Date.now,
    private readonly wait: (ms: number) => Promise<void> = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms)),
  ) {
    this.trips = new Map(store.read<Array<[TripId, TripRecord]>>(STORE_KEY) ?? []);
  }

  /** Keeps the fake backend's data across reloads (e.g. after sharing on WhatsApp). */
  private persist(): void {
    this.store.write(STORE_KEY, [...this.trips.entries()]);
  }

  async createTrip(frame: TripFrame): Promise<Trip> {
    await this.wait(LATENCY_MS);
    const trip: Trip = {
      id: `t-${this.now().toString(36)}`,
      shareCode: this.makeShareCode(),
      frame,
      stage: "setup",
      expectedSize: GROUP_CHAT_SIZE,
    };
    this.trips.set(trip.id, { trip, members: [...EARLY_JOINERS], nudgedAt: null });
    this.persist();
    return trip;
  }

  async addMember(tripId: TripId, input: NewMember): Promise<Member> {
    await this.wait(LATENCY_MS);
    const record = this.require(tripId);
    const member: Member = { id: `m-${this.now().toString(36)}`, status: "joined", ...input };
    record.members = [member, ...record.members];
    this.persist();
    return member;
  }

  async listMembers(tripId: TripId): Promise<Member[]> {
    await this.wait(150);
    const record = this.require(tripId);
    return [...record.members, ...this.lateJoinersSoFar(record)];
  }

  async listPending(tripId: TripId): Promise<PendingMember[]> {
    await this.wait(150);
    const record = this.require(tripId);
    const arrived = new Set(this.lateJoinersSoFar(record).map((m) => m.id));
    return LATE_JOINERS.filter((m) => !arrived.has(m.id)).map((m) => ({ id: m.id, name: m.name, picksDone: PICKS_SO_FAR[m.id] ?? 0 }));
  }

  async recordNudge(tripId: TripId, memberId?: string): Promise<void> {
    await this.wait(LATENCY_MS);
    const record = this.require(tripId);
    if (memberId) record.nudgedOne = { ...record.nudgedOne, [memberId]: record.nudgedOne?.[memberId] ?? this.now() };
    else record.nudgedAt ??= this.now();
    this.persist();
  }

  async updateCap(tripId: TripId, capPerPerson: Paise): Promise<Trip> {
    await this.wait(LATENCY_MS);
    const record = this.require(tripId);
    record.trip = { ...record.trip, frame: { ...record.trip.frame, capPerPerson } };
    this.persist();
    return record.trip;
  }

  async saveConstraints(tripId: TripId, constraints: PrivateConstraints): Promise<void> {
    await this.wait(LATENCY_MS);
    const record = this.require(tripId);
    record.constraints = [...(record.constraints ?? []).filter((c) => c.memberId !== constraints.memberId), constraints];
    this.persist();
  }

  /** Friends who actually joined, plus whatever the user saved. People on defaults have none. */
  async listConstraints(tripId: TripId): Promise<PrivateConstraints[]> {
    await this.wait(150);
    const record = this.require(tripId);
    const joined = new Set([...record.members, ...this.lateJoinersSoFar(record)].map((m) => m.id));
    const friends = friendConstraints(record.trip.frame.window).filter((c) => joined.has(c.memberId));
    return [...friends, ...(record.constraints ?? [])];
  }

  /** Friends vote by their own picks (sample behaviour); the wait stands in for the group voting. */
  async castBallot(tripId: TripId, ballot: Ballot, shortlist: readonly RankedPlace[]): Promise<Ballot[]> {
    await this.wait(LATENCY_MS * 3);
    const record = this.require(tripId);
    const friends = [...record.members, ...this.lateJoinersSoFar(record)].filter((m) => m.role !== "initiator");
    return [...friendBallots(shortlist, friends), ballot];
  }

  /** A chat nudge brings people in one by one; a personal nudge brings that person in on their own. */
  private lateJoinersSoFar(record: TripRecord): Member[] {
    const now = this.now();
    return LATE_JOINERS.filter((m, i) => {
      const viaChat = record.nudgedAt !== null ? record.nudgedAt + JOIN_GAP_MS * (i + 1) : Infinity;
      const own = record.nudgedOne?.[m.id];
      const viaOwn = own !== undefined ? own + JOIN_GAP_MS : Infinity;
      return now >= Math.min(viaChat, viaOwn);
    });
  }

  private require(tripId: TripId): TripRecord {
    const record = this.trips.get(tripId);
    if (!record) throw new Error("Trip not found");
    return record;
  }

  private makeShareCode(): string {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  }
}
