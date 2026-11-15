import { MockAgent } from "@/agent/MockAgent";
import type { AgentService } from "@/agent/AgentService";
import { MockTripRepository } from "@/data/repositories/MockTripRepository";
import { sessionStore } from "@/data/sessionStore";
import type { TripRepository } from "@/data/repositories/TripRepository";
import { MockPlaceRepository } from "@/data/repositories/MockPlaceRepository";
import type { PlaceRepository } from "@/data/repositories/PlaceRepository";
import { MockJourneyRepository } from "@/data/repositories/MockJourneyRepository";
import type { JourneyRepository } from "@/data/repositories/JourneyRepository";
import {
  BookingPlanner,
  DestinationRanker,
  ExpenseSplitter,
  FairnessScorer,
  ItineraryBuilder,
  PriceRevalidator,
  ProposalEngine,
  VoteTally,
  GroupNeedsBuilder,
  LimitExplainer,
  NeedsFilter,
  OverlapFinder,
  ReadinessCheck,
  TripFrameValidator,
} from "@/domain";

/** Composition root: the one place implementations are chosen and wired. */
export interface Services {
  trips: TripRepository;
  agent: AgentService;
  frameValidator: TripFrameValidator;
  readiness: ReadinessCheck;
  overlaps: OverlapFinder;
  places: PlaceRepository;
  needsBuilder: GroupNeedsBuilder;
  needsFilter: NeedsFilter;
  limits: LimitExplainer;
  ranker: DestinationRanker;
  wait: (ms: number) => Promise<void>;
  journey: JourneyRepository;
  votes: VoteTally;
  itineraries: ItineraryBuilder;
  proposals: ProposalEngine;
  fairness: FairnessScorer;
  booking: BookingPlanner;
  revalidator: PriceRevalidator;
  splitter: ExpenseSplitter;
}

export function createServices(): Services {
  const needsFilter = new NeedsFilter();
  return {
    trips: new MockTripRepository(sessionStore),
    agent: new MockAgent(),
    frameValidator: new TripFrameValidator(),
    readiness: new ReadinessCheck(),
    overlaps: new OverlapFinder(),
    places: new MockPlaceRepository(),
    needsBuilder: new GroupNeedsBuilder(),
    needsFilter,
    limits: new LimitExplainer(needsFilter),
    ranker: new DestinationRanker(),
    wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    journey: new MockJourneyRepository(),
    votes: new VoteTally(),
    itineraries: new ItineraryBuilder(),
    proposals: new ProposalEngine(),
    fairness: new FairnessScorer(),
    booking: new BookingPlanner(),
    revalidator: new PriceRevalidator(),
    splitter: new ExpenseSplitter(),
  };
}

/** Shared instance for selectors and hooks (stateless services only). */
export const services = createServices();
