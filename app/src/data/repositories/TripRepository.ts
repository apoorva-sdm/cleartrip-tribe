import type { Avatar, Ballot, Member, PendingMember, Paise, PrivateConstraints, RankedPlace, Trip, TripFrame, TripId } from "@/domain";

export interface NewMember {
  name: string;
  role: Member["role"];
  avatar: Avatar;
}

/** Data access for a group trip. UI and thunks depend on this, never on an implementation. */
export interface TripRepository {
  createTrip(frame: TripFrame): Promise<Trip>;
  addMember(tripId: TripId, member: NewMember): Promise<Member>;
  listMembers(tripId: TripId): Promise<Member[]>;
  /** People who opened the link but haven't finished their avatar. */
  listPending(tripId: TripId): Promise<PendingMember[]>;
  /** Record a nudge: the whole chat, or one person when `memberId` is given. */
  recordNudge(tripId: TripId, memberId?: string): Promise<void>;
  /** The trip starter changes the group cap. */
  updateCap(tripId: TripId, capPerPerson: Paise): Promise<Trip>;
  /** Save one person's private constraints. Only the matcher reads them. */
  saveConstraints(tripId: TripId, constraints: PrivateConstraints): Promise<void>;
  /** Everyone's private constraints, for the needs filter only. */
  listConstraints(tripId: TripId): Promise<PrivateConstraints[]>;
  /** Cast your ballot; resolves with everyone's once the group has voted. */
  castBallot(tripId: TripId, ballot: Ballot, shortlist: readonly RankedPlace[]): Promise<Ballot[]>;
}
