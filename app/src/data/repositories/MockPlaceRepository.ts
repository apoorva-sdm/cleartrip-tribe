import type { Place } from "@/domain";
import { PLACES } from "../fixtures/places";
import type { PlaceRepository } from "./PlaceRepository";

export class MockPlaceRepository implements PlaceRepository {
  constructor(private readonly wait: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms))) {}

  async listPlaces(): Promise<Place[]> {
    await this.wait(300);
    return [...PLACES];
  }
}
